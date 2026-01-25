import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      items: args.items,
      totalAmount: args.totalAmount,
      status: "pending",
      shippingAddress: args.shippingAddress,
    });

    // Clear cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return orderId;
  },
});

export const createFromStripe = internalMutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    items: v.array(v.any()),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId as Id<"users">;
    const dbUser = await ctx.db.get(userId);

    if (!dbUser) throw new Error("User not found");

    await ctx.db.insert("orders", {
      userId: dbUser._id,
      items: args.items,
      totalAmount: args.totalAmount,
      status: "paid",
      stripeSessionId: args.sessionId,
      shippingAddress: undefined,
    });

    // Clear cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", dbUser._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
  },
});