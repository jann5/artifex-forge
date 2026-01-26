import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const checkImages = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const results = [];

    for (const product of products) {
      const imageStatuses = [];
      for (const imageId of product.images) {
        if (imageId.startsWith("http")) {
          imageStatuses.push({ id: imageId, status: "external_url" });
          continue;
        }

        // Check if it exists in storage system table
        // We can't query _storage directly easily in all runtimes, but we can try to get metadata
        // Note: ctx.db.system.get is the way to check system tables
        try {
            // @ts-expect-error - system table access
            const metadata = await ctx.db.system.get(imageId) as any;
            imageStatuses.push({
                id: imageId,
                status: metadata ? "found" : "missing_in_db",
                contentType: metadata?.contentType,
                size: metadata?.size
            });
        } catch (e: any) {
            imageStatuses.push({ id: imageId, status: "error_checking", error: e.message });
        }
      }
      results.push({
        productName: product.name,
        images: imageStatuses
      });
    }

    return results;
  },
});

export const checkStripeConfig = query({
  args: {},
  handler: async (ctx) => {
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
    const siteUrl = process.env.SITE_URL;

    return {
      hasStripeKey,
      hasWebhookSecret,
      siteUrl,
      webhookUrl: siteUrl ? `${siteUrl.replace(/\/$/, '')}/stripe/webhook` : 'SITE_URL not configured',
      message: !hasStripeKey
        ? "Stripe Secret Key is missing - using mock checkout mode"
        : !hasWebhookSecret
        ? "Stripe Webhook Secret is missing - webhooks won't work!"
        : "Stripe is configured correctly"
    };
  },
});

export const checkOrders = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("orders").order("desc").take(10);
    const ordersWithUsers = await Promise.all(
      allOrders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          orderId: order._id,
          userEmail: user?.email || "Unknown",
          totalAmount: order.totalAmount,
          status: order.status,
          stripeSessionId: order.stripeSessionId,
          createdAt: new Date(order._creationTime).toISOString(),
          itemsCount: order.items.length,
        };
      })
    );

    return {
      totalOrders: allOrders.length,
      orders: ordersWithUsers,
    };
  },
});