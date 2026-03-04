import { internalQuery, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveDevOtp = internalMutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, { email, code }) => {
    const existing = await ctx.db.query("devOtps").withIndex("by_email", q => q.eq("email", email)).unique();
    if (existing) await ctx.db.patch(existing._id, { code });
    else await ctx.db.insert("devOtps", { email, code });
  },
});

export const getDevOtp = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const row = await ctx.db.query("devOtps").withIndex("by_email", q => q.eq("email", email)).unique();
    return row?.code ?? null;
  },
});

export const getSystemStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const usersCount = (await ctx.db.query("users").take(1)).length > 0 ? (await ctx.db.query("users").collect()).length : 0;
    const productsCount = (await ctx.db.query("products").take(1)).length > 0 ? (await ctx.db.query("products").collect()).length : 0;
    const ordersCount = (await ctx.db.query("orders").take(1)).length > 0 ? (await ctx.db.query("orders").collect()).length : 0;
    
    // Check if reviews table exists/has data safely
    let reviewsCount = 0;
    try {
        reviewsCount = (await ctx.db.query("reviews").collect()).length;
    } catch (e) {
        // Table might not exist yet or other error
    }
    
    return {
      users: usersCount,
      products: productsCount,
      orders: ordersCount,
      reviews: reviewsCount,
      serverTime: Date.now(),
      convexSiteUrl: process.env.CONVEX_SITE_URL,
    };
  },
});

export const debugClearSession = internalMutation({
    args: { chatId: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("telegramSessions")
            .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
            .unique();
        
        if (session) {
            await ctx.db.delete(session._id);
            return true;
        }
        return false;
    }
});

export const resetAllStats = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Delete all orders
        const orders = await ctx.db.query("orders").collect();
        for (const order of orders) {
            await ctx.db.delete(order._id);
        }

        // Delete all custom orders
        const customOrders = await ctx.db.query("customOrders").collect();
        for (const customOrder of customOrders) {
            await ctx.db.delete(customOrder._id);
        }

        // Delete all cart items
        const cartItems = await ctx.db.query("cartItems").collect();
        for (const cartItem of cartItems) {
            await ctx.db.delete(cartItem._id);
        }

        // Delete all reviews
        const reviews = await ctx.db.query("reviews").collect();
        for (const review of reviews) {
            await ctx.db.delete(review._id);
        }

        return {
            message: `Usunięto:\n📦 ${orders.length} zamówień\n🎨 ${customOrders.length} zamówień niestandardowych\n🛒 ${cartItems.length} pozycji w koszykach\n⭐ ${reviews.length} recenzji`
        };
    }
});
