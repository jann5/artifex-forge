import { v } from "convex/values";
import { mutation, query, internalMutation, action } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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

    // Send Telegram notification
    // @ts-expect-error - Convex API types will regenerate on next deployment
    await ctx.scheduler.runAfter(0, internal.notifications.sendTelegramNotification, {
      orderId: orderId,
      customerEmail: user.email || "Unknown",
      totalAmount: args.totalAmount,
      status: "pending",
    });

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

    const orderId = await ctx.db.insert("orders", {
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

    // Send Telegram notification
    // @ts-expect-error - Convex API types will regenerate on next deployment
    await ctx.scheduler.runAfter(0, internal.notifications.sendTelegramNotification, {
      orderId: orderId,
      customerEmail: dbUser.email || "Unknown",
      totalAmount: args.totalAmount,
      status: "paid",
    });
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, {
      status: args.status,
    });

    // Get customer info for notification
    const customer = await ctx.db.get(order.userId);
    
    // Send Telegram notification (scheduled to run after mutation completes)
    // @ts-expect-error - Convex API types will regenerate on next deployment
    await ctx.scheduler.runAfter(0, internal.notifications.sendTelegramNotification, {
      orderId: args.orderId,
      customerEmail: customer?.email || "Unknown",
      totalAmount: order.totalAmount,
      status: args.status,
    });

    return { success: true };
  },
});

export const updateStatusInternal = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, {
      status: args.status,
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .take(100);

    // Get customer info for each order
    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        const customer = await ctx.db.get(order.userId);
        return {
          ...order,
          customerEmail: customer?.email || "Unknown",
          customerName: customer?.name || "Unknown",
        };
      })
    );

    return ordersWithCustomers;
  },
});