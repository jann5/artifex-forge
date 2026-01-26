import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    projectName: v.string(),
    description: v.string(),
    material: v.string(),
    images: v.array(v.string()), // Storage IDs
    contactInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Musisz być zalogowany");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("Użytkownik nie znaleziony");
    }

    const customOrderId = await ctx.db.insert("customOrders", {
      userId: user._id,
      projectName: args.projectName,
      description: args.description,
      material: args.material,
      images: args.images,
      contactInfo: args.contactInfo,
      status: "pending",
      customerName: user.name || user.email || "Nieznany",
      customerEmail: user.email || "",
    });

    // Send notification to Telegram
    await ctx.scheduler.runAfter(0, internal.notifications.sendCustomOrderNotification, {
      customOrderId,
    });

    return customOrderId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      return [];
    }

    const orders = await ctx.db
      .query("customOrders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      return [];
    }

    const orders = await ctx.db
      .query("customOrders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Musisz być zalogowany");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("Użytkownik nie znaleziony");
    }

    await ctx.db.insert("customOrderMessages", {
      customOrderId: args.customOrderId,
      senderId: user._id,
      senderName: user.name || user.email || "Użytkownik",
      message: args.message,
      isAdmin: false,
    });
  },
});

export const acceptQuote = mutation({
  args: {
    customOrderId: v.id("customOrders"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Musisz być zalogowany");
    }

    const order = await ctx.db.get(args.customOrderId);
    if (!order) {
      throw new Error("Zamówienie nie znalezione");
    }

    if (order.status !== "quoted") {
      throw new Error("Zamówienie nie jest w stanie wycenione");
    }

    if (!order.estimatedPrice) {
      throw new Error("Brak ceny");
    }

    await ctx.db.patch(args.customOrderId, {
      status: "accepted",
    });

    return { orderId: args.customOrderId, amount: order.estimatedPrice };
  },
});

export const createCheckoutSession = mutation({
  args: {
    customOrderId: v.id("customOrders"),
    addressId: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Musisz być zalogowany");
    }

    const customOrder = await ctx.db.get(args.customOrderId);
    if (!customOrder) {
      throw new Error("Zamówienie nie znalezione");
    }

    if (customOrder.status !== "accepted") {
      throw new Error("Zamówienie nie jest zaakceptowane");
    }

    if (!customOrder.estimatedPrice) {
      throw new Error("Brak ceny");
    }

    const address = await ctx.db.get(args.addressId);
    if (!address) {
      throw new Error("Adres nie znaleziony");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user) {
      throw new Error("Użytkownik nie znaleziony");
    }

    // Return the data needed for checkout - the action will be called from frontend
    return { 
      customOrderId: args.customOrderId,
      addressId: args.addressId,
      userId: user._id,
      amount: customOrder.estimatedPrice
    };
  },
});

export const updateStatus = internalMutation({
  args: {
    orderId: v.id("customOrders"),
    status: v.string(),
    estimatedPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      estimatedPrice: args.estimatedPrice,
      adminNotes: args.notes,
    });
  },
});

export const getById = query({
  args: { orderId: v.id("customOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getByIdInternal = internalQuery({
  args: { orderId: v.id("customOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});