import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const faqs = await ctx.db
      .query("faq")
      .collect();
    
    // Sort by order, treating undefined as high value (end of list)
    return faqs.sort((a, b) => {
      const orderA = a.order ?? 999999;
      const orderB = b.order ?? 999999;
      return orderA - orderB;
    });
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

    // Get the highest order number and add 1
    const allFaqs = await ctx.db.query("faq").collect();
    const maxOrder = allFaqs.length > 0 
      ? Math.max(...allFaqs.map(f => f.order || 0))
      : -1;

    return await ctx.db.insert("faq", {
      question: args.question,
      answer: args.answer,
      order: maxOrder + 1,
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

export const reorder = mutation({
  args: {
    updates: v.array(v.object({
      id: v.id("faq"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      throw new Error("Musisz być zalogowany aby zmienić kolejność FAQ");
    }

    if (user.role !== "admin") {
      throw new Error("Tylko administrator może zmieniać kolejność FAQ");
    }

    // Update all FAQ items with new order
    for (const update of args.updates) {
      await ctx.db.patch(update.id, {
        order: update.order,
      });
    }
  },
});