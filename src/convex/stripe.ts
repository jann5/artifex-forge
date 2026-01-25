"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCheckoutSession = action({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.optional(v.string()),
      })
    ),
    shippingAddress: v.object({
      fullName: v.string(),
      street: v.string(),
      city: v.string(),
      postalCode: v.string(),
      phone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const domain = process.env.CONVEX_SITE_URL;
    if (!domain) {
      throw new Error("CONVEX_SITE_URL is missing. Please check your environment variables.");
    }

    // MOCK CHECKOUT MODE (If Stripe key is missing)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Stripe Secret Key is missing. Using mock checkout mode.");
      
      const totalAmount = args.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const mockSessionId = `mock_session_${crypto.randomUUID()}`;

      // Create order immediately for mock checkout
      await ctx.runMutation(internal.orders.createFromStripe, {
        sessionId: mockSessionId,
        userId,
        items: args.items,
        totalAmount,
        shippingAddress: args.shippingAddress,
      });

      return { sessionId: mockSessionId, url: `${domain}/?success=true` };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });

    const lineItems = args.items.map((item) => ({
      price_data: {
        currency: "pln",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "blik", "p24"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${domain}/?success=true`,
        cancel_url: `${domain}/checkout?canceled=true`,
        metadata: {
          userId: userId,
          items: JSON.stringify(args.items),
          shippingAddress: JSON.stringify(args.shippingAddress),
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (err: any) {
      console.error("Stripe error:", err);
      throw new Error(`Stripe error: ${err.message}`);
    }
  },
});

export const handleWebhook = action({
  args: {
    signature: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe Secret Key is missing");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
    
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Create order in database
      await ctx.runMutation(internal.orders.createFromStripe, {
        sessionId: session.id,
        userId: session.metadata?.userId!,
        items: JSON.parse(session.metadata?.items || "[]"),
        totalAmount: (session.amount_total || 0) / 100,
        shippingAddress: session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress) : undefined,
      });
    }

    return { received: true };
  },
});