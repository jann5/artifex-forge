import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return Promise.all(
      items.map(async (item) => {
        if (item.productId) {
          const product = await ctx.db.get(item.productId);
          return { ...item, product };
        } else if (item.customOrderId) {
          const customOrder = await ctx.db.get(item.customOrderId);
          return { ...item, product: customOrder };
        }
        return { ...item, product: null };
      })
    );
  },
});

export const add = mutation({
  args: {
    productId: v.optional(v.id("products")),
    customOrderId: v.optional(v.id("customOrders")),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Validate that either productId or customOrderId is provided
    if (!args.productId && !args.customOrderId) {
      throw new Error("Musisz podać productId lub customOrderId");
    }

    // Validate product exists and has enough inventory
    if (args.productId) {
      const product = await ctx.db.get(args.productId);
      if (!product) {
        throw new Error("Produkt nie istnieje");
      }
      if (product.inventory < args.quantity) {
        throw new Error(`Niewystarczająca ilość w magazynie. Dostępne: ${product.inventory}`);
      }
    }

    // Validate custom order exists and is accepted
    if (args.customOrderId) {
      const customOrder = await ctx.db.get(args.customOrderId);
      if (!customOrder) {
        throw new Error("Zamówienie niestandardowe nie istnieje");
      }
      if (customOrder.status !== "accepted") {
        throw new Error("Zamówienie niestandardowe musi być zaakceptowane przed dodaniem do koszyka");
      }
    }

    // Check if item already exists in cart
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => {
        if (args.productId) {
          return q.eq(q.field("productId"), args.productId);
        } else {
          return q.eq(q.field("customOrderId"), args.customOrderId);
        }
      })
      .first();

    if (existing) {
      const newQuantity = existing.quantity + args.quantity;
      
      // Check inventory again for the new total quantity
      if (args.productId) {
        const product = await ctx.db.get(args.productId);
        if (product && product.inventory < newQuantity) {
          throw new Error(`Niewystarczająca ilość w magazynie. Dostępne: ${product.inventory}, w koszyku: ${existing.quantity}`);
        }
      }
      
      await ctx.db.patch(existing._id, {
        quantity: newQuantity,
      });
    } else {
      await ctx.db.insert("cartItems", {
        userId: user._id,
        productId: args.productId,
        customOrderId: args.customOrderId,
        quantity: args.quantity,
      });
    }
  },
});

export const updateQuantity = mutation({
  args: {
    id: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const cartItem = await ctx.db.get(args.id);
    if (!cartItem) throw new Error("Cart item not found");

    // Custom orders can't have quantity changed (always 1)
    if (cartItem.customOrderId) {
      if (args.quantity <= 0) {
        await ctx.db.delete(args.id);
      }
      return;
    }

    // Handle regular products
    if (!cartItem.productId) throw new Error("Invalid cart item");
    
    const product = await ctx.db.get(cartItem.productId);
    if (!product) throw new Error("Product not found");

    if (args.quantity > product.inventory) {
      throw new Error(`Niewystarczająca ilość produktu. Dostępne: ${product.inventory}`);
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.patch(args.id, { quantity: args.quantity });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("cartItems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const clearInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
  },
});