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

export const getById = internalQuery({
  args: {
    orderId: v.id("customOrders"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});