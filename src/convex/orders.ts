import { v } from "convex/values";
import { mutation, query, internalMutation, action, internalQuery } from "./_generated/server";
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

    // Send Telegram notification - schedule immediately
    await ctx.scheduler.runAfter(0, internal.notifications.sendTelegramNotification, {
      orderId: orderId,
      customerEmail: user.email || "Unknown",
      totalAmount: args.totalAmount,
      status: "pending",
      shippingAddress: args.shippingAddress,
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
    shippingAddress: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    console.log(`[createFromStripe] ========== START ==========`);
    console.log(`[createFromStripe] Session ID: ${args.sessionId}`);
    console.log(`[createFromStripe] User ID: ${args.userId}`);
    console.log(`[createFromStripe] Total Amount: ${args.totalAmount} PLN`);
    console.log(`[createFromStripe] Items count: ${args.items.length}`);
    
    const userId = args.userId as Id<"users">;
    const dbUser = await ctx.db.get(userId);

    if (!dbUser) {
      console.error(`[createFromStripe] ❌ User not found: ${userId}`);
      throw new Error("User not found");
    }

    console.log(`[createFromStripe] User found: ${dbUser.email}`);

    // Check if order already exists for this session
    const existingOrder = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("stripeSessionId"), args.sessionId))
      .first();

    if (existingOrder) {
      console.log(`[createFromStripe] ⚠️ Order already exists for session ${args.sessionId}: ${existingOrder._id}`);
      return existingOrder._id;
    }

    console.log(`[createFromStripe] Creating new order...`);

    const orderId = await ctx.db.insert("orders", {
      userId: dbUser._id,
      items: args.items,
      totalAmount: args.totalAmount,
      status: "paid",
      stripeSessionId: args.sessionId,
      shippingAddress: args.shippingAddress,
    });

    console.log(`[createFromStripe] ✅ Order created: ${orderId}`);

    // Clear cart
    console.log(`[createFromStripe] Clearing cart for user...`);
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", dbUser._id))
      .collect();

    console.log(`[createFromStripe] Found ${cartItems.length} cart items to delete`);
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    console.log(`[createFromStripe] ✅ Cart cleared`);

    // Send Telegram notification - schedule immediately
    console.log(`[createFromStripe] Scheduling Telegram notification...`);
    await ctx.scheduler.runAfter(0, internal.notifications.sendTelegramNotification, {
      orderId: orderId,
      customerEmail: dbUser.email || "Unknown",
      totalAmount: args.totalAmount,
      status: "paid",
      shippingAddress: args.shippingAddress,
    });

    console.log(`[createFromStripe] ✅ Telegram notification scheduled`);
    console.log(`[createFromStripe] ========== END ==========`);

    return orderId;
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
    await ctx.scheduler.runAfter(0, internal.notifications.sendTelegramNotification, {
      orderId: args.orderId,
      customerEmail: customer?.email || "Unknown",
      totalAmount: order.totalAmount,
      status: args.status,
      shippingAddress: order.shippingAddress,
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

export const getStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const paidOrders = orders.filter(o => o.status === "paid").length;
    return { totalOrders: orders.length, totalRevenue, pendingOrders, paidOrders };
  }
});

export const getRecent = internalQuery({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").take(5);
    return await Promise.all(orders.map(async (o) => {
        const user = await ctx.db.get(o.userId);
        return { ...o, customerName: user?.name || user?.email || "Unknown" };
    }));
  }
});

export const getById = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    
    const user = await ctx.db.get(order.userId);
    return { ...order, customerName: user?.name || user?.email || "Unknown" };
  }
});

export const deleteOrder = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.orderId);
  }
});