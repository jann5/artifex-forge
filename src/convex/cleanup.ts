import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const fixCorruptedCustomOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allCustomOrders = await ctx.db.query("customOrders").collect();
    
    let fixed = 0;
    let deleted = 0;
    
    for (const order of allCustomOrders) {
      // Check if userId contains a pipe character (corrupted)
      if (order.userId.includes("|")) {
        // Try to extract the first valid ID
        const parts = order.userId.split("|");
        const firstId = parts[0];
        
        // Check if the first part is a valid user ID
        try {
          const user = await ctx.db.get(firstId as any);
          if (user) {
            // Fix the userId
            await ctx.db.patch(order._id, { userId: firstId as any });
            fixed++;
            continue;
          }
        } catch (e) {
          // Invalid ID, will delete
        }
        
        // If we can't fix it, delete the corrupted order
        await ctx.db.delete(order._id);
        deleted++;
      }
    }
    
    return {
      message: `Cleanup complete: ${fixed} orders fixed, ${deleted} orders deleted`,
      fixed,
      deleted
    };
  },
});
