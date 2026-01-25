import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const add = mutation({
  args: {
    fullName: v.string(),
    street: v.string(),
    city: v.string(),
    postalCode: v.string(),
    country: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // If this is the first address, make it default automatically
    const existing = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const isDefault = args.isDefault || !existing;

    if (isDefault && existing) {
      // Unset other defaults
      const defaults = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .collect();
      
      for (const addr of defaults) {
        await ctx.db.patch(addr._id, { isDefault: false });
      }
    }

    await ctx.db.insert("addresses", {
      userId: user._id,
      ...args,
      isDefault,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("addresses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const address = await ctx.db.get(args.id);
    if (!address || address.userId !== user._id) {
      throw new Error("Address not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const setDefault = mutation({
  args: { id: v.id("addresses") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const address = await ctx.db.get(args.id);
    if (!address || address.userId !== user._id) {
      throw new Error("Address not found or unauthorized");
    }

    // Unset other defaults
    const defaults = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .collect();
    
    for (const addr of defaults) {
      await ctx.db.patch(addr._id, { isDefault: false });
    }

    await ctx.db.patch(args.id, { isDefault: true });
  },
});
