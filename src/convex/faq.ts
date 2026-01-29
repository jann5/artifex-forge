import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("faq").collect();
  },
});

export const create = mutation({
  args: {
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (user?.role !== "admin") throw new Error("Admin access required");

    return await ctx.db.insert("faq", {
      question: args.question,
      answer: args.answer,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("faq"),
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (user?.role !== "admin") throw new Error("Admin access required");

    await ctx.db.patch(args.id, {
      question: args.question,
      answer: args.answer,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("faq"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (user?.role !== "admin") throw new Error("Admin access required");

    await ctx.db.delete(args.id);
  },
});
