import { mutation } from "./_generated/server";

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const products = [
      {
        name: "Waza Voronoi",
        description: "Oszałamiająca waza z kompleksowym wzorem voronoi, która bawi się światłem i cieniem. Wydrukowana w matowej białej PLA.",
        price: 45,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1581783342308-f792ca43d5bc?auto=format&fit=crop&q=80&w=1000"],
        inventory: 10,
        featured: true,
      },
      {
        name: "Geometryczna Doniczka",
        description: "Nowoczesna geometryczna doniczka idealna dla sukulentów. Posiada system samopodlewania.",
        price: 35,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1000"],
        inventory: 15,
        featured: true,
      },
      {
        name: "Abstrakcyjna Rzeźba Nr 5",
        description: "Limitowana edycja abstrakcyjnej rzeźby. Każdy egzemplarz jest unikalny.",
        price: 120,
        category: "art",
        images: ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000"],
        inventory: 5,
        featured: true,
      },
      {
        name: "Zegar Mechaniczny",
        description: "W pełni funkcjonalny drukowany 3D zegar mechaniczny. Cud inżynierii.",
        price: 250,
        category: "functional",
        images: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000"],
        inventory: 3,
        featured: true,
      },
      {
        name: "Lampa Stołowa Hexagon",
        description: "Designerska lampa z geometrycznym wzorem hexagonalnym. LED RGB z pilotem.",
        price: 89,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1000"],
        inventory: 12,
        featured: false,
      },
      {
        name: "Organizer na Biurko",
        description: "Modułowy organizer z miejscem na telefon, długopisy i akcesoria biurowe.",
        price: 28,
        category: "functional",
        images: ["https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000"],
        inventory: 25,
        featured: false,
      },
      {
        name: "Figurka Smoka",
        description: "Szczegółowa figurka smoka z ruchomymi skrzydłami. Idealna dla kolekcjonerów.",
        price: 65,
        category: "art",
        images: ["https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1000"],
        inventory: 8,
        featured: false,
      },
      {
        name: "Wieszak na Słuchawki",
        description: "Elegancki wieszak na słuchawki z podstawką na telefon. Oszczędza miejsce na biurku.",
        price: 22,
        category: "functional",
        images: ["https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=1000"],
        inventory: 30,
        featured: false,
      },
      {
        name: "Miska Dekoracyjna Spiral",
        description: "Artystyczna miska ze spiralnym wzorem. Doskonała jako ozdoba lub na drobiazgi.",
        price: 38,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000"],
        inventory: 18,
        featured: false,
      },
      {
        name: "Stojak na Rośliny",
        description: "Minimalistyczny stojak na rośliny z trzema poziomami. Idealny do małych przestrzeni.",
        price: 55,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=1000"],
        inventory: 14,
        featured: false,
      },
      {
        name: "Brelok Customowy",
        description: "Personalizowany brelok z możliwością grawerowania inicjałów.",
        price: 15,
        category: "accessories",
        images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=1000"],
        inventory: 50,
        featured: false,
      },
      {
        name: "Ramka na Zdjęcia 3D",
        description: "Unikalna ramka z trójwymiarowym efektem głębi. Format 10x15cm.",
        price: 32,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=1000"],
        inventory: 20,
        featured: false,
      },
      {
        name: "Uchwyt na Pada",
        description: "Stylowy uchwyt na kontroler do gier. Pasuje do większości modeli.",
        price: 25,
        category: "accessories",
        images: ["https://images.unsplash.com/photo-1600080972464-8e5f35f63d88?auto=format&fit=crop&q=80&w=1000"],
        inventory: 40,
        featured: false,
      },
      {
        name: "Wazon Low Poly",
        description: "Nowoczesny wazon w stylu low poly. Idealny do nowoczesnych wnętrz.",
        price: 42,
        category: "decor",
        images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1000"],
        inventory: 15,
        featured: false,
      },
      {
        name: "Podstawka pod Laptopa",
        description: "Ergonomiczna podstawka pod laptopa poprawiająca przepływ powietrza.",
        price: 45,
        category: "functional",
        images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000"],
        inventory: 25,
        featured: false,
      },
      {
        name: "Figurka Kota Geometryczna",
        description: "Minimalistyczna figurka kota. Świetny prezent dla miłośników zwierząt.",
        price: 29,
        category: "art",
        images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1000"],
        inventory: 30,
        featured: false,
      },
      {
        name: "Pudełko na Biżuterię",
        description: "Eleganckie pudełko na biżuterię z mechanizmem otwieranym.",
        price: 55,
        category: "accessories",
        images: ["https://images.unsplash.com/photo-1589128777090-7c294348fd81?auto=format&fit=crop&q=80&w=1000"],
        inventory: 10,
        featured: false,
      },
    ];

    for (const product of products) {
      // Check if product exists to avoid duplicates during re-seed
      const existing = await ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("name"), product.name))
        .first();
        
      if (!existing) {
        await ctx.db.insert("products", product);
      }
    }
  },
});