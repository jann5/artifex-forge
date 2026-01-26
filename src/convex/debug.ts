import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getAnyUser = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").first();
    }
});

export const getAnyProduct = internalQuery({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").first();
    }
});

export const testOrderFlow = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting debug test flow...");
    
    // 1. Check Env Vars
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const siteUrl = process.env.SITE_URL;

    const envStatus = {
        STRIPE_SECRET_KEY: stripeKey ? "Set (starts with " + stripeKey.substring(0, 8) + ")" : "MISSING",
        STRIPE_WEBHOOK_SECRET: webhookSecret ? "Set" : "MISSING",
        TELEGRAM_BOT_TOKEN: botToken ? "Set" : "MISSING",
        TELEGRAM_CHAT_ID: chatId ? "Set" : "MISSING",
        SITE_URL: siteUrl ? "Set" : "MISSING"
    };
    console.log("Environment Check:", envStatus);

    // 2. Get a user
    const user = await ctx.runQuery(internal.debug.getAnyUser);
    if (!user) return { success: false, message: "No users found in database. Please sign up/login first.", envStatus };

    // 3. Get a product
    const product = await ctx.runQuery(internal.debug.getAnyProduct);
    if (!product) return { success: false, message: "No products found in database.", envStatus };

    console.log("Testing with user:", user._id);
    console.log("Testing with product:", product._id);

    const sessionId = "test_session_" + Date.now();
    
    try {
        const orderId = await ctx.runMutation(internal.orders.createFromStripe, {
            sessionId: sessionId,
            userId: user._id,
            items: [{
                productId: product._id,
                quantity: 1,
                price: product.price,
                name: product.name,
                image: product.images[0]
            }],
            totalAmount: product.price,
            shippingAddress: {
                fullName: "Test User",
                street: "123 Test St",
                city: "Test City",
                postalCode: "00-000",
                phone: "123456789"
            }
        });
        return { success: true, message: `Order created: ${orderId}. Check Telegram for notification.`, envStatus };
    } catch (e: any) {
        console.error("Error creating order:", e);
        return { success: false, message: `Error: ${e.message}`, envStatus };
    }
  }
});
