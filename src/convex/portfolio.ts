import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const portfolio = await ctx.db
      .query("portfolio")
      .order("desc")
      .take(100);
    return portfolio;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    return await ctx.db.insert("portfolio", {
      title: args.title,
      description: args.description,
      images: args.images,
      category: args.category,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("portfolio"),
    title: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      images: args.images,
      category: args.category,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("portfolio") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized - Admin only");
    }

    await ctx.db.delete(args.id);
  },
});
