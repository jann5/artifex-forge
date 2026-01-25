import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getSession = internalQuery({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telegramSessions")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();
  },
});

export const startSession = internalMutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("telegramSessions")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    await ctx.db.insert("telegramSessions", {
      chatId: args.chatId,
      step: "NAME",
      productData: {
        images: [],
      },
    });
  },
});

export const updateSession = internalMutation({
  args: {
    chatId: v.string(),
    step: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      price: v.optional(v.number()),
      inventory: v.optional(v.number()),
      image: v.optional(v.string()), // Single image to add to array
      images: v.optional(v.array(v.string())), // Array of images to set directly
      editingProductId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();

    if (!session) throw new Error("Session not found");

    const { image, images, editingProductId, ...otherUpdates } = args.updates;
    let currentImages = session.productData.images || [];

    if (images) {
      currentImages = images;
    } else if (image) {
      currentImages.push(image);
    }

    const patchData: any = {
      step: args.step,
      productData: {
        ...session.productData,
        ...otherUpdates,
        images: currentImages,
      },
    };

    if (editingProductId !== undefined) {
      patchData.editingProductId = editingProductId;
    }

    await ctx.db.patch(session._id, patchData);
  },
});

export const clearSession = internalMutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});