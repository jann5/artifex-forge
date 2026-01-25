import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    search: v.optional(v.string()),
    sort: v.optional(v.string()), // "price_asc", "price_desc", "name_asc", "name_desc"
  },
  handler: async (ctx, args) => {
    let products;

    if (args.search) {
      const searchTerm = args.search;
      products = await ctx.db
        .query("products")
        .withSearchIndex("search_name", (q) => 
          q.search("name", searchTerm)
        )
        .collect();
    } else if (args.category && args.category !== "all") {
      const category = args.category;
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    } else if (args.featured) {
      products = await ctx.db
        .query("products")
        .withIndex("by_featured", (q) => q.eq("featured", true))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    // Filter by category if search was used (since search index filter is strict equality, we can do it here for flexibility or if mixed)
    if (args.search && args.category && args.category !== "all") {
        products = products.filter(p => p.category === args.category);
    }

    // Sorting
    if (args.sort) {
      switch (args.sort) {
        case "price_asc":
          products.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          products.sort((a, b) => b.price - a.price);
          break;
        case "name_asc":
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
      }
    }

    return products;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    images: v.array(v.string()),
    inventory: v.number(),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      category: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
      inventory: v.optional(v.number()),
      featured: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const lowStock = products.filter(p => p.inventory < 5);
    return { 
        totalProducts: products.length, 
        lowStockCount: lowStock.length,
        lowStockNames: lowStock.map(p => p.name).slice(0, 10)
    };
  }
});