import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const record = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;

    const existing = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        viewedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("recentlyViewed", {
        userId: user._id,
        productId: args.productId,
        viewedAt: Date.now(),
      });
    }

    // Cleanup old entries (keep last 50)
    const allViewed = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user_and_viewed", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (allViewed.length > 50) {
      const toDelete = allViewed.slice(50);
      for (const item of toDelete) {
        await ctx.db.delete(item._id);
      }
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const recentItems = await ctx.db
      .query("recentlyViewed")
      .withIndex("by_user_and_viewed", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);

    const products = await Promise.all(
      recentItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return product ? { ...product, viewedAt: item.viewedAt } : null;
      })
    );

    return products.filter((p) => p !== null);
  },
});
