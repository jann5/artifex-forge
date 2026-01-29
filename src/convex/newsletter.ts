import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Subscribe to newsletter
export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Nieprawidłowy format email");
    }

    // Check if email already exists
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      if (existing.active) {
        throw new Error("Ten email jest już zapisany do newslettera");
      } else {
        // Reactivate subscription
        await ctx.db.patch(existing._id, {
          active: true,
          subscribedAt: Date.now(),
        });
        return { success: true, message: "Ponownie zapisano do newslettera" };
      }
    }

    // Create new subscription
    await ctx.db.insert("newsletter", {
      email: args.email,
      subscribedAt: Date.now(),
      active: true,
    });

    return { success: true, message: "Dziękujemy za zapisanie się do newslettera!" };
  },
});

// Unsubscribe from newsletter
export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscription) {
      throw new Error("Ten email nie jest zapisany do newslettera");
    }

    await ctx.db.patch(subscription._id, {
      active: false,
    });

    return { success: true, message: "Pomyślnie wypisano z newslettera" };
  },
});

// Get all active subscribers (admin only)
export const listSubscribers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Musisz być zalogowany");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Brak uprawnień");
    }

    const subscribers = await ctx.db
      .query("newsletter")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    return subscribers;
  },
});

// Get subscriber count
export const getSubscriberCount = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletter")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    return subscribers.length;
  },
});
