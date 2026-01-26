import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(20);

    return Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonimowy",
          userImage: user?.image,
        };
      })
    );
  },
});

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    return Promise.all(
      reviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        return {
          ...review,
          productName: product?.name || "Nieznany produkt",
          productImage: product?.images[0],
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Musisz być zalogowany, aby dodać opinię");

    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existingReview) {
      throw new Error("Już dodałeś opinię do tego produktu");
    }

    await ctx.db.insert("reviews", {
      userId: user._id,
      productId: args.productId,
      rating: args.rating,
      comment: args.comment,
    });
  },
});

export const deleteReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");

    if (review.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
