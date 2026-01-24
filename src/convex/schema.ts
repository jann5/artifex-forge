import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      stripeCustomerId: v.optional(v.string()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    products: defineTable({
      name: v.string(),
      description: v.string(),
      price: v.number(),
      category: v.string(),
      images: v.array(v.string()), // Array of storage IDs or URLs
      inventory: v.number(),
      featured: v.boolean(),
      isBestSeller: v.optional(v.boolean()),
      variants: v.optional(
        v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            price: v.optional(v.number()), // Override price if needed
            inventory: v.number(),
          })
        )
      ),
    })
      .index("by_category", ["category"])
      .index("by_featured", ["featured"]),

    cartItems: defineTable({
      userId: v.id("users"),
      productId: v.id("products"),
      variantId: v.optional(v.string()),
      quantity: v.number(),
    }).index("by_user", ["userId"]),

    orders: defineTable({
      userId: v.id("users"),
      items: v.array(
        v.object({
          productId: v.id("products"),
          variantId: v.optional(v.string()),
          quantity: v.number(),
          price: v.number(),
          name: v.string(),
          image: v.optional(v.string()),
        })
      ),
      totalAmount: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled")
      ),
      stripeSessionId: v.optional(v.string()),
      shippingAddress: v.optional(v.any()), // Store as JSON object for flexibility
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;