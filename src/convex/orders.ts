import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return [];

    const dbUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", user.email!))
      .unique();

    if (!dbUser) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", dbUser._id))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantId: v.optional(v.string()),
        quantity: v.number(),
        price: v.number(),
        name: v.string(),
        image: v.optional(v.string()),
      })
    ),
    totalAmount: v.number(),
    shippingAddress: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", user.email!))
      .unique();

    if (!dbUser) throw new Error("User not found");

    const orderId = await ctx.db.insert("orders", {
      userId: dbUser._id,
      items: args.items,
      totalAmount: args.totalAmount,
      status: "pending",
      shippingAddress: args.shippingAddress,
    });

    // Clear cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", dbUser._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return orderId;
  },
});
