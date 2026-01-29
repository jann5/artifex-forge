import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export default defineSchema({
  ...authTables,
  
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  }).index("email", ["email"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    images: v.array(v.string()),
    inventory: v.number(),
    featured: v.optional(v.boolean()),
    model3d: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["category"],
    }),

  customOrders: defineTable({
    userId: v.string(), // Temporarily changed to allow cleanup of corrupted data
    projectName: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    material: v.string(),
    description: v.string(),
    contactInfo: v.optional(v.string()),
    status: v.string(),
    estimatedPrice: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    files3D: v.optional(v.array(v.string())),
    files3DMetadata: v.optional(v.array(v.object({
      storageId: v.string(),
      fileName: v.string(),
    }))),
  }).index("by_user", ["userId"]),

  customOrderMessages: defineTable({
    customOrderId: v.id("customOrders"),
    senderId: v.id("users"),
    message: v.string(),
    isAdmin: v.boolean(),
    senderName: v.string(),
  }).index("by_order", ["customOrderId"]),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.optional(v.id("products")),
    customOrderId: v.optional(v.id("customOrders")),
    quantity: v.number(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.optional(v.id("products")),
        customOrderId: v.optional(v.id("customOrders")),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
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
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    shippingAddress: v.optional(v.any()),
    stripeSessionId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  favorites: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
    approved: v.optional(v.boolean()),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_approved", ["approved"]),

  addresses: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    street: v.string(),
    city: v.string(),
    postalCode: v.string(),
    country: v.string(),
    phone: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  recentlyViewed: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    viewedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"])
    .index("by_user_and_viewed", ["userId", "viewedAt"]),

  telegramSessions: defineTable({
    chatId: v.string(),
    step: v.string(),
    data: v.optional(v.any()),
  }).index("by_chat", ["chatId"]),
});