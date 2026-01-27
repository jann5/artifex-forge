import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const itemsWithProduct = await Promise.all(
      cartItems.map(async (item) => {
        if (item.customOrderId) {
          const customOrder = await ctx.db.get(item.customOrderId);
          return { 
            ...item, 
            product: customOrder ? {
              _id: customOrder._id,
              name: customOrder.projectName,
              price: customOrder.estimatedPrice || 0,
              images: customOrder.images,
              inventory: 1,
              isCustomOrder: true,
            } : null
          };
        }
        
        const product = item.productId ? await ctx.db.get(item.productId) : null;
        return { ...item, product };
      })
    );

    return itemsWithProduct;
  },
});

export const add = mutation({
  args: {
    productId: v.optional(v.id("products")),
    customOrderId: v.optional(v.id("customOrders")),
    variantId: v.optional(v.string()),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Handle custom orders
    if (args.customOrderId) {
      const customOrder = await ctx.db.get(args.customOrderId);
      if (!customOrder) throw new Error("Custom order not found");
      if (customOrder.userId !== user._id) throw new Error("Unauthorized");
      if (customOrder.status !== "accepted") throw new Error("Custom order not accepted yet");

      // Check if already in cart
      const existing = await ctx.db
        .query("cartItems")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("customOrderId"), args.customOrderId))
        .first();

      if (existing) {
        throw new Error("To zamówienie niestandardowe jest już w koszyku");
      }

      await ctx.db.insert("cartItems", {
        userId: user._id,
        customOrderId: args.customOrderId,
        quantity: 1,
      });
      return;
    }

    // Handle regular products
    if (!args.productId) throw new Error("Product ID required");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("productId"), args.productId),
          q.eq(q.field("variantId"), args.variantId)
        )
      )
      .first();

    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + args.quantity;

    if (newQuantity > product.inventory) {
      throw new Error(`Niewystarczająca ilość produktu. Dostępne: ${product.inventory}`);
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
    } else {
      await ctx.db.insert("cartItems", {
        userId: user._id,
        productId: args.productId,
        variantId: args.variantId,
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