import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Check if category already exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Kategoria o tym identyfikatorze już istnieje");
    }

    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Check if slug is taken by another category
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing && existing._id !== args.id) {
      throw new Error("Kategoria o tym identyfikatorze już istnieje");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      slug: args.slug,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Check if any products use this category
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Kategoria nie znaleziona");
    }

    const productsWithCategory = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", category.slug))
      .first();

    if (productsWithCategory) {
      throw new Error("Nie można usunąć kategorii używanej przez produkty");
    }

    await ctx.db.delete(args.id);
  },
});
