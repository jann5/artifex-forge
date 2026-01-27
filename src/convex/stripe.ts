"use node";
import { action, mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCheckoutSession = action({
  args: {
    items: v.array(
      v.object({
        productId: v.optional(v.id("products")),
        customOrderId: v.optional(v.id("customOrders")),
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

      return { sessionId: mockSessionId, url: `${domain}/payment-success?session_id=${mockSessionId}` };
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
        success_url: `${domain}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}/checkout?canceled=true`,
        metadata: {
          userId: userId,
          items: JSON.stringify(args.items.map(item => ({
            productId: item.productId,
            customOrderId: item.customOrderId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }))),
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

export const verifyPayment = action({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    console.log(`[verifyPayment] Verifying session: ${args.sessionId}`);

    if (args.sessionId.startsWith("mock_session_")) {
      console.log("[verifyPayment] Mock session detected, assuming success");
      return { success: true };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe Secret Key is missing");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });

    try {
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);
      
      if (session.payment_status === "paid") {
        console.log(`[verifyPayment] Session ${args.sessionId} is paid. Ensuring order exists.`);
        
        const userId = session.metadata?.userId;
        if (!userId) {
          console.error("[verifyPayment] Missing userId in session metadata");
          return { success: false, error: "Missing userId" };
        }

        await ctx.runMutation(internal.orders.createFromStripe, {
          sessionId: session.id,
          userId: userId,
          items: JSON.parse(session.metadata?.items || "[]"),
          totalAmount: (session.amount_total || 0) / 100,
          shippingAddress: session.metadata?.shippingAddress ? JSON.parse(session.metadata.shippingAddress) : undefined,
        });
        
        return { success: true };
      } else {
        console.log(`[verifyPayment] Session ${args.sessionId} is not paid. Status: ${session.payment_status}`);
        return { success: false, error: "Payment not completed" };
      }
    } catch (error: any) {
      console.error(`[verifyPayment] Error verifying payment:`, error);
      return { success: false, error: error.message };
    }
  },
});

export const createCustomOrderCheckoutSession = action({
  args: {
    customOrderId: v.id("customOrders"),
    addressId: v.optional(v.id("addresses")),
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args): Promise<{ url: string; sessionId: string }> => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("Stripe not configured");
    }

    const customOrder = await ctx.runQuery(api.customOrders.getById, {
      orderId: args.customOrderId,
    });

    if (!customOrder) {
      throw new Error("Custom order not found");
    }

    const address = args.addressId ? await ctx.runQuery(api.addresses.getById, {
      addressId: args.addressId,
    }) : null;

    const siteUrl = process.env.SITE_URL || process.env.CONVEX_SITE_URL;

    const params: Record<string, string> = {
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "pln",
      "line_items[0][price_data][product_data][name]": `Zamówienie niestandardowe: ${customOrder.projectName}`,
      "line_items[0][price_data][product_data][description]": customOrder.description,
      "line_items[0][price_data][unit_amount]": String(Math.round(args.amount * 100)),
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&custom_order=${args.customOrderId}`,
      cancel_url: `${siteUrl}/checkout?customOrder=${args.customOrderId}`,
      "metadata[customOrderId]": args.customOrderId,
      "metadata[userId]": args.userId,
    };

    if (args.addressId) {
      params["metadata[addressId]"] = args.addressId;
    }

    const response: Response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });

    const session: any = await response.json();

    if (!response.ok) {
      throw new Error(session.error?.message || "Failed to create checkout session");
    }

    return { url: session.url, sessionId: session.id };
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
      console.error("[handleWebhook] CRITICAL: Stripe Webhook Secret is missing in env variables");
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
      console.error(`[handleWebhook] ❌ Webhook signature verification failed. 
        1. Check if STRIPE_WEBHOOK_SECRET in Convex matches the one in Stripe Dashboard.
        2. Ensure you are using the correct Webhook URL.
        Error:`, err);
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`[STRIPE WEBHOOK] Checkout session completed: ${session.id}`);
      
      const userId = session.metadata?.userId;
      if (!userId) {
        console.error("[STRIPE WEBHOOK] ❌ Missing userId in session metadata");
        return { success: false, error: "Missing userId" };
      }

      console.log(`[STRIPE WEBHOOK] User ID: ${userId}`);
      console.log(`[STRIPE WEBHOOK] Amount: ${(session.amount_total || 0) / 100} PLN`);
      
      // Create order in database
      try {
        const orderId = await ctx.runMutation(internal.orders.createFromStripe, {
          sessionId: session.id,
          userId: userId,
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