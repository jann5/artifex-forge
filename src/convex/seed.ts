import { mutation } from "./_generated/server";

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const products = [
      {
        name: "Voronoi Vase",
        description: "A stunning vase featuring a complex voronoi pattern that plays with light and shadow. Printed in matte white PLA.",
        price: 45,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1581783342308-f792ca43d5bc?auto=format&fit=crop&q=80&w=1000"],
        inventory: 10,
        featured: true,
      },
      {
        name: "Geometric Planter",
        description: "Modern geometric planter perfect for succulents. Features a self-watering design.",
        price: 35,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1000"],
        inventory: 15,
        featured: true,
      },
      {
        name: "Abstract Sculpture No. 5",
        description: "A limited edition abstract sculpture. Each piece is unique.",
        price: 120,
        category: "art",
        images: ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000"],
        inventory: 5,
        featured: true,
      },
      {
        name: "Mechanical Clock",
        description: "Fully functional 3D printed mechanical clock. A marvel of engineering.",
        price: 250,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000"],
        inventory: 3,
        featured: true,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }
  },
});
