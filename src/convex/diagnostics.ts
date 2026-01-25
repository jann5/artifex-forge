import { internalQuery } from "./_generated/server";
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