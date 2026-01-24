import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return [];

    const dbUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", user.email!))
      .unique();

    if (!dbUser) return [];

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", dbUser._id))
      .collect();

    const itemsWithProduct = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    return itemsWithProduct;
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    variantId: v.optional(v.string()),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", user.email!))
      .unique();

    if (!dbUser) throw new Error("User not found");

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", dbUser._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("productId"), args.productId),
          q.eq(q.field("variantId"), args.variantId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
    } else {
      await ctx.db.insert("cartItems", {
        userId: dbUser._id,
        productId: args.productId,
        variantId: args.variantId,
        quantity: args.quantity,
      });
    }
  },
});

export const updateQuantity = mutation({
  args: {
    id: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.patch(args.id, { quantity: args.quantity });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("cartItems") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
