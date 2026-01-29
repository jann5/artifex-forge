import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(50);

    // Filter to show only approved reviews, unless it's the user's own review
    // Treat reviews without approved field as approved (legacy data)
    const filteredReviews = reviews.filter(review => 
      review.approved !== false || (currentUser && review.userId === currentUser._id)
    );

    return Promise.all(
      filteredReviews.map(async (review) => {
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

export const canReview = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { canReview: false, reason: "Musisz być zalogowany" };
    }

    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existingReview) {
      return { canReview: false, reason: "Już wystawiłeś opinię dla tego produktu" };
    }

    // Check if user has purchased this product
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const hasPurchased = orders.some((order) => 
      (order.status === "paid" || order.status === "shipped" || order.status === "delivered") &&
      order.items.some((item) => item.productId === args.productId)
    );

    if (!hasPurchased) {
      return { canReview: false, reason: "Możesz wystawić opinię tylko dla zakupionych produktów" };
    }

    return { canReview: true };
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
      throw new Error("Już wystawiłeś opinię dla tego produktu");
    }

    // Check if user has purchased this product
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const hasPurchased = orders.some((order) => 
      (order.status === "paid" || order.status === "shipped" || order.status === "delivered") &&
      order.items.some((item) => item.productId === args.productId)
    );

    if (!hasPurchased) {
      throw new Error("Możesz wystawić opinię tylko dla zakupionych produktów");
    }

    await ctx.db.insert("reviews", {
      userId: user._id,
      productId: args.productId,
      rating: args.rating,
      comment: args.comment,
      approved: false,
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

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_approved", (q) => q.eq("approved", false))
      .order("desc")
      .take(100);

    return Promise.all(
      reviews.map(async (review) => {
        const reviewUser = await ctx.db.get(review.userId);
        const product = await ctx.db.get(review.productId);
        return {
          ...review,
          userName: reviewUser?.name || "Anonimowy",
          userImage: reviewUser?.image,
          productName: product?.name || "Nieznany produkt",
          productImage: product?.images[0],
        };
      })
    );
  },
});

export const approveReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");

    await ctx.db.patch(args.id, { approved: true });
  },
});

export const rejectReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");

    await ctx.db.delete(args.id);
  },
});