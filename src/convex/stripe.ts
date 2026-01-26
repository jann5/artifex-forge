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

    console.log(`[createCheckoutSession] Starting checkout for user: ${userId}`);
    console.log(`[createCheckoutSession] Items count: ${args.items.length}`);
    console.log(`[createCheckoutSession] Shipping address:`, args.shippingAddress);

    // Use SITE_URL (which is already configured in vly)
    let domain = process.env.SITE_URL;
    if (!domain) {
      console.error("[createCheckoutSession] SITE_URL is missing!");
      throw new Error("SITE_URL is missing. Please check your environment variables in vly.");
    }
    
    // Remove trailing slash to prevent double slashes in URLs
    domain = domain.replace(/\/$/, '');
    console.log(`[createCheckoutSession] Using domain: ${domain}`);

    // MOCK CHECKOUT MODE (If Stripe key is missing)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("[createCheckoutSession] Stripe Secret Key is missing. Using mock checkout mode.");
      
      const totalAmount = args.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const mockSessionId = `mock_session_${crypto.randomUUID()}`;

      console.log(`[MOCK CHECKOUT] Creating order for user: ${userId}`);
      console.log(`[MOCK CHECKOUT] Total amount: ${totalAmount} PLN`);
      console.log(`[MOCK CHECKOUT] Items:`, JSON.stringify(args.items));
      console.log(`[MOCK CHECKOUT] Mock session ID: ${mockSessionId}`);

      // Create order immediately for mock checkout
      try {
        const orderId = await ctx.runMutation(internal.orders.createFromStripe, {
          sessionId: mockSessionId,
          userId,
          items: args.items,
          totalAmount,
          shippingAddress: args.shippingAddress,
        });
        console.log(`[MOCK CHECKOUT] ✅ Order created successfully: ${orderId}`);
      } catch (error) {
        console.error(`[MOCK CHECKOUT] ❌ Failed to create order:`, error);
        throw error;
      }

      return { sessionId: mockSessionId, url: `${domain}/payment-success` };
    }

    console.log("[createCheckoutSession] Using real Stripe checkout");
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

    console.log(`[createCheckoutSession] Creating Stripe session with ${lineItems.length} line items`);

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "blik"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${domain}/payment-success`,
        cancel_url: `${domain}/checkout?canceled=true`,
        metadata: {
          userId: userId,
          items: JSON.stringify(args.items),
          shippingAddress: JSON.stringify(args.shippingAddress),
        },
      });

      console.log(`[createCheckoutSession] ✅ Stripe session created: ${session.id}`);
      console.log(`[createCheckoutSession] Session URL: ${session.url}`);
      return { sessionId: session.id, url: session.url };
    } catch (err: any) {
      console.error("[createCheckoutSession] ❌ Stripe error:", err);
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
    console.log("[handleWebhook] Received Stripe webhook");
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[handleWebhook] Stripe Secret Key is missing");
      throw new Error("Stripe Secret Key is missing");
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("[handleWebhook] Stripe Webhook Secret is missing");
      throw new Error("Stripe Webhook Secret is missing");
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
      console.log(`[handleWebhook] ✅ Webhook verified. Event type: ${event.type}`);
    } catch (err) {
      console.error("[handleWebhook] ❌ Webhook signature verification failed:", err);
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`[STRIPE WEBHOOK] Checkout session completed: ${session.id}`);
      console.log(`[STRIPE WEBHOOK] User ID: ${session.metadata?.userId}`);
      console.log(`[STRIPE WEBHOOK] Amount: ${(session.amount_total || 0) / 100} PLN`);
      console.log(`[STRIPE WEBHOOK] Payment status: ${session.payment_status}`);
      
      // Create order in database
      try {
        const orderId = await ctx.runMutation(internal.orders.createFromStripe, {
          sessionId: session.id,
          userId: session.metadata?.userId!,
          items: JSON.parse(session.metadata?.items || "[]"),
          totalAmount: (session.amount_total || 0) / 100,
          shippingAddress: session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress) : undefined,
        });
        console.log(`[STRIPE WEBHOOK] ✅ Order created successfully: ${orderId}`);
      } catch (error) {
        console.error(`[STRIPE WEBHOOK] ❌ Failed to create order:`, error);
        throw error;
      }
    } else {
      console.log(`[handleWebhook] Ignoring event type: ${event.type}`);
    }

    return { received: true };
  },
});