import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";

export const list = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(50);
    }

    if (args.featured) {
      return await ctx.db
        .query("products")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured!))
        .order("desc")
        .take(50);
    }

    return await ctx.db.query("products").order("desc").take(50);
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
    isBestSeller: v.optional(v.boolean()),
    variants: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          price: v.optional(v.number()),
          inventory: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    // In a real app, check for admin role here
    // const dbUser = await ctx.db.query("users").withIndex("email", q => q.eq("email", user.email!)).unique();
    // if (dbUser?.role !== ROLES.ADMIN) throw new Error("Unauthorized");

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
      isBestSeller: v.optional(v.boolean()),
      variants: v.optional(
        v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            price: v.optional(v.number()),
            inventory: v.number(),
          })
        )
      ),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    // Check admin role
    
    await ctx.db.patch(args.id, args.updates);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    // Check admin role

    await ctx.db.delete(args.id);
  },
});