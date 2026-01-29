import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

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
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      throw new Error("Musisz być zalogowany aby dodać FAQ");
    }

    if (user.role !== "admin") {
      throw new Error("Tylko administrator może dodawać FAQ");
    }

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
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      throw new Error("Musisz być zalogowany aby edytować FAQ");
    }

    if (user.role !== "admin") {
      throw new Error("Tylko administrator może edytować FAQ");
    }

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
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      throw new Error("Musisz być zalogowany aby usunąć FAQ");
    }

    if (user.role !== "admin") {
      throw new Error("Tylko administrator może usuwać FAQ");
    }

    await ctx.db.delete(args.id);
  },
});