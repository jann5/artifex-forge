import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("favorites", {
        userId: user._id,
        productId: args.productId,
      });
      return true; // Added
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const products = await Promise.all(
      favorites.map(async (fav) => {
        const product = await ctx.db.get(fav.productId);
        return product;
      })
    );

    return products.filter((p) => p !== null);
  },
});

export const isFavorite = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    return !!favorite;
  },
});
