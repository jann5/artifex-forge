import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    projectName: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    material: v.string(),
    description: v.string(),
    contactInfo: v.optional(v.string()),
    images: v.array(v.string()),
    files3D: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orderId = await ctx.db.insert("customOrders", {
      userId: identity.subject as any,
      projectName: args.projectName,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      material: args.material,
      description: args.description,
      contactInfo: args.contactInfo,
      images: args.images,
      files3D: args.files3D,
      status: "pending",
    });

    await ctx.scheduler.runAfter(0, internal.notifications.sendCustomOrderNotification, {
      customOrderId: orderId,
    });

    return orderId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const orders = await ctx.db
      .query("customOrders")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
      .order("desc")
      .collect();

    return orders;
  },
});

export const listWithMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const orders = await ctx.db
      .query("customOrders")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
      .order("desc")
      .collect();

    const ordersWithMessages = await Promise.all(
      orders.map(async (order) => {
        const messages = await ctx.db
          .query("customOrderMessages")
          .withIndex("by_order", (q) => q.eq("customOrderId", order._id))
          .collect();
        return { ...order, messages };
      })
    );

    return ordersWithMessages;
  },
});

export const addMessage = mutation({
  args: {
    customOrderId: v.id("customOrders"),
    message: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.customOrderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.insert("customOrderMessages", {
      customOrderId: args.customOrderId,
      senderId: identity.subject as any,
      message: args.message,
      isAdmin: args.isAdmin,
      senderName: args.isAdmin ? "Admin" : identity.name || "Klient",
    });
  },
});

export const addMessageInternal = internalMutation({
  args: {
    customOrderId: v.id("customOrders"),
    message: v.string(),
    isAdmin: v.boolean(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("customOrderMessages", {
      customOrderId: args.customOrderId,
      senderId: "system" as any,
      message: args.message,
      isAdmin: args.isAdmin,
      senderName: args.senderName,
    });
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("customOrders"),
    status: v.string(),
    estimatedPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) throw new Error("Unauthorized");

    const updates: any = { status: args.status };
    if (args.estimatedPrice !== undefined) {
      updates.estimatedPrice = args.estimatedPrice;
    }
    await ctx.db.patch(args.orderId, updates);
  },
});

export const updateStatusInternal = internalMutation({
  args: {
    orderId: v.id("customOrders"),
    status: v.string(),
    estimatedPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };
    if (args.estimatedPrice !== undefined) {
      updates.estimatedPrice = args.estimatedPrice;
    }
    await ctx.db.patch(args.orderId, updates);
  },
});

export const updatePrice = mutation({
  args: {
    orderId: v.id("customOrders"),
    estimatedPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.orderId, {
      estimatedPrice: args.estimatedPrice,
      status: "quoted",
    });
  },
});

export const acceptQuote = mutation({
  args: {
    orderId: v.id("customOrders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.orderId, {
      status: "accepted",
    });
  },
});

export const createCheckoutSession = mutation({
  args: {
    customOrderId: v.id("customOrders"),
    addressId: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.customOrderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== identity.subject) throw new Error("Unauthorized");
    if (!order.estimatedPrice) throw new Error("No price set");

    return {
      customOrderId: args.customOrderId,
      addressId: args.addressId,
      userId: identity.subject,
      amount: order.estimatedPrice,
    };
  },
});

export const getById = query({
  args: { orderId: v.id("customOrders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    if (order.userId !== identity.subject) return null;

    return order;
  },
});

export const getByIdInternal = internalQuery({
  args: { orderId: v.id("customOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const listAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db
      .query("customOrders")
      .order("desc")
      .take(20);
    return orders;
  },
});

export const deleteOrderInternal = internalMutation({
  args: { orderId: v.id("customOrders") },
  handler: async (ctx, args) => {
    // Delete associated messages first
    const messages = await ctx.db
      .query("customOrderMessages")
      .withIndex("by_order", (q) => q.eq("customOrderId", args.orderId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Delete the order
    await ctx.db.delete(args.orderId);
  },
});