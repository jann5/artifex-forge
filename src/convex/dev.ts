import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

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
            .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
            .unique();
        
        if (session) {
            await ctx.db.delete(session._id);
            return true;
        }
        return false;
    }
});
