import { mutation } from "./_generated/server";

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // First, seed categories
    const categoryData = [
      { name: "Plakaty i Grafiki", slug: "plakaty" },
      { name: "Figurki Kolekcjonerskie", slug: "figurki" },
      { name: "Odzież Patriotyczna", slug: "odziez" },
      { name: "Akcesoria Premium", slug: "akcesoria" },
      { name: "Limitowane Edycje", slug: "limitowane" },
    ];

    for (const cat of categoryData) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("categories", cat);
      }
    }

    const products = [
      // ─── PLAKATY I GRAFIKI ──────────────────────────────────
      {
        name: "Plakat Inauguracyjny — Nowa Era",
        description: "Oficjalny plakat upamiętniający inaugurację prezydenta Karola Nawrockiego. Wydrukowany na premium papierze archiwalnym 300g/m², z złotym tłoczeniem herbu RP. Limitowany nakład 2025 egzemplarzy, numerowany i certyfikowany.",
        price: 149,
        category: "plakaty",
        images: ["https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&q=80&w=1000"],
        inventory: 50,
        featured: true,
      },
      {
        name: "Portret Prezydencki — Edycja Galeryjna",
        description: "Oficjalny portret prezydencki w ramie dębowej z mosiężną tabliczką. Druk giclée na płótnie bawełnianym 100%. Wymiary 60x80cm. Certyfikat autentyczności w eleganckim etui.",
        price: 599,
        category: "plakaty",
        images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000"],
        inventory: 25,
        featured: true,
      },
      {
        name: "Grafika „Droga do Zwycięstwa”",
        description: "Artystyczna interpretacja kampanii prezydenckiej 2025. Autorski projekt polskiego artysty. Wydruk na papierze Hahnemühle Photo Rag 308g. Format A2.",
        price: 249,
        category: "plakaty",
        images: ["https://images.unsplash.com/photo-1541367777708-7905fe3296c0?auto=format&fit=crop&q=80&w=1000"],
        inventory: 40,
        featured: false,
      },
      {
        name: "Mapa Wyborcza Polski 2025",
        description: "Elegancka mapa wyników wyborów prezydenckich z detalicznym podziałem na powiaty. Kolorystyka: crimson i navy. Format 70x100cm na papierze satynowym.",
        price: 89,
        category: "plakaty",
        images: ["https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"],
        inventory: 100,
        featured: false,
      },
      {
        name: "Zestaw 5 Pocztówek Kolekcjonerskich",
        description: "Pięć ekskluzywnych pocztówek z kluczowymi momentami kampanii. Druk offsetowy na kartonie 350g z uszlachetnieniem UV. W ozdobnym etui z tłoczonym orłem.",
        price: 49,
        category: "plakaty",
        images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=1000"],
        inventory: 200,
        featured: false,
      },

      // ─── FIGURKI KOLEKCJONERSKIE ────────────────────────────
      {
        name: "Figurka Prezydencka — Brąz Limitowany",
        description: "Ręcznie odlewana figurka z brązu patynowanego, przedstawiająca prezydenta w pozie inauguracyjnej. Wysokość 25cm, waga 1.8kg. Każda sztuka numerowana, limitowana do 500 egzemplarzy.",
        price: 1299,
        category: "figurki",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=1000"],
        inventory: 15,
        featured: true,
      },
      {
        name: "Orzeł Biały — Rzeźba Kryształowa",
        description: "Kryształowa rzeźba Orła Białego z 24-karatowym złoceniem korony. Wykonana z czeskiego kryształu ołowiowego. Wysokość 18cm. Drewniana podstawa mahoniowa.",
        price: 899,
        category: "figurki",
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=1000"],
        inventory: 20,
        featured: true,
      },
      {
        name: "Miniatura Pałacu Prezydenckiego",
        description: "Szczegółowa replika Pałacu Prezydenckiego w skali 1:500. Wykonana z żywicy syntetycznej z ręcznym malowaniem. Podstawa z czarnego granitu. Wymiary: 30x15x12cm.",
        price: 449,
        category: "figurki",
        images: ["https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&q=80&w=1000"],
        inventory: 30,
        featured: false,
      },
      {
        name: "Popiersia Prezydentów RP — Komplet",
        description: "Kolekcja 6 miniaturowych popiersii prezydentów III RP, włącznie z Karolem Nawrockim. Żywica polimerowa o wysokiej rozdzielczości. Wysokość każdego: 8cm.",
        price: 699,
        category: "figurki",
        images: ["https://images.unsplash.com/photo-1544413164-5f1b361f5bfa?auto=format&fit=crop&q=80&w=1000"],
        inventory: 25,
        featured: false,
      },
      {
        name: "Medal Inauguracyjny 2025",
        description: "Srebrny medal pamiątkowy wybity z okazji inauguracji. Średnica 50mm, srebro próby 925. Awers: portret prezydenta. Rewers: orzeł i data inauguracji. W etui aksamitnym.",
        price: 349,
        category: "figurki",
        images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000"],
        inventory: 100,
        featured: false,
      },

      // ─── ODZIEŻ PATRIOTYCZNA ────────────────────────────────
      {
        name: "Polo Premium „Prezydent 2025”",
        description: "Eleganckie polo z haftowanym logo kampanii na piersi. 100% bawełna egipska Pima, gramatura 220g. Dostępne w kolorach: navy, biały, crimson. Rozmiary S-3XL.",
        price: 199,
        category: "odziez",
        images: ["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&q=80&w=1000"],
        inventory: 80,
        featured: true,
      },
      {
        name: "Koszulka „Obywatelski Prezydent”",
        description: "Koszulka z autorskim designem nawiązującym do hasła kampanii. Organiczna bawełna czesana 180g. Nadruk DTG najwyższej jakości, odporny na pranie. Unisex.",
        price: 99,
        category: "odziez",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000"],
        inventory: 150,
        featured: false,
      },
      {
        name: "Bluza Hoodie „Nawrocki 2025” — Navy",
        description: "Premium bluza z kapturem w kolorze granatowym. Haftowane logo na piersi i na plecach. 80% bawełna organiczna, 20% poliester. Szczotkowany polar wewnątrz.",
        price: 279,
        category: "odziez",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000"],
        inventory: 60,
        featured: false,
      },
      {
        name: "Szalik Patriotyczny — Biało-Czerwony",
        description: "Elegancki szalik w barwach narodowych z subtelnym wzorem orła. 100% wełna merino. Wymiary: 180x30cm. Wykończenie frędzlami. Zapakowany w ozdobne pudełko.",
        price: 169,
        category: "odziez",
        images: ["https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=1000"],
        inventory: 45,
        featured: false,
      },
      {
        name: "Czapka z Daszkiem „N2025” — Gold Edition",
        description: "Czapka baseballowa z haftowanym złotym monogramem N2025. Regulowany pasek skórzany z tyłu. Materiał: premium bawełna twill. Jeden rozmiar.",
        price: 129,
        category: "odziez",
        images: ["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?auto=format&fit=crop&q=80&w=1000"],
        inventory: 100,
        featured: false,
      },

      // ─── AKCESORIA PREMIUM ──────────────────────────────────
      {
        name: "Kubek Porcelanowy „Pałac Prezydencki”",
        description: "Elegancki kubek z porcelany kostnej z ilustracją Pałacu Prezydenckiego. Złocone brzegi 24K. Pojemność 350ml. Zmywalny w zmywarce. W ozdobnym opakowaniu.",
        price: 79,
        category: "akcesoria",
        images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=1000"],
        inventory: 120,
        featured: false,
      },
      {
        name: "Długopis Parker z Grawerem „N2025”",
        description: "Luksusowy długopis Parker Sonnet z osobistym grawerem N2025. Korpus: stal nierdzewna z palladowym wykończeniem. W eleganckim etui prezentowym.",
        price: 299,
        category: "akcesoria",
        images: ["https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=1000"],
        inventory: 50,
        featured: true,
      },
      {
        name: "Pin Patriotyczny — Zestaw 3 szt.",
        description: "Trzy eleganckie piny: flaga RP, orzeł w koronie, logo N2025. Metal pozłacany z emalią. Każdy pin 2cm. W aksamitnym woreczku.",
        price: 69,
        category: "akcesoria",
        images: ["https://images.unsplash.com/photo-1611923134239-b9be5b4d1b28?auto=format&fit=crop&q=80&w=1000"],
        inventory: 200,
        featured: false,
      },
      {
        name: "Brelok Skórzany z Herbem RP",
        description: "Brelok z naturalnej skóry licowej z tłoczonym herbem Rzeczypospolitej. Okucia ze stali nierdzewnej w kolorze złota. Wymiary: 4x7cm.",
        price: 59,
        category: "akcesoria",
        images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=1000"],
        inventory: 150,
        featured: false,
      },
      {
        name: "Notes Prezydencki A5 — Skóra",
        description: "Luksusowy notes w oprawie ze skóry naturalnej z tłoczonym orłem. 192 strony kremowego papieru 100g. Wstążka zakładka w kolorze złotym. Zamknięcie magnetyczne.",
        price: 149,
        category: "akcesoria",
        images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=1000"],
        inventory: 75,
        featured: false,
      },

      // ─── LIMITOWANE EDYCJE ──────────────────────────────────
      {
        name: "Kolekcja Inauguracyjna — Zestaw VIP",
        description: "Ekskluzywny zestaw zawierający: portret w ramie (40x50cm), medal srebrny, szalik wełniany, notes skórzany i certyfikat uczestnictwa w inauguracji. Limitowany do 100 zestawów. Pudełko mahoniowe z grawerem.",
        price: 1999,
        category: "limitowane",
        images: ["https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=1000"],
        inventory: 10,
        featured: true,
      },
      {
        name: "Zegarek Pamiątkowy „Inauguracja 2025”",
        description: "Elegancki zegarek automatyczny z tarczą przedstawiającą Pałac Prezydencki. Koperta ze stali nierdzewnej, szafirowe szkło, pasek ze skóry krokodyla. Numerowany, 1 z 2025 sztuk.",
        price: 1499,
        category: "limitowane",
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000"],
        inventory: 8,
        featured: true,
      },
      {
        name: "Moneta Kolekcjonerska — Złoto 999",
        description: "Kolekcjonerska moneta ze złota próby 999. Waga: 1 uncja (31.1g). Awers: portret prezydenta. Rewers: herb RP z datą inauguracji. Certyfikat NBP. Limitowana do 500 sztuk.",
        price: 8999,
        category: "limitowane",
        images: ["https://images.unsplash.com/photo-1621155346337-1d19476ba7d7?auto=format&fit=crop&q=80&w=1000"],
        inventory: 5,
        featured: false,
      },
      {
        name: "Album Fotograficzny „Droga Nawrockiego”",
        description: "192-stronicowy album w twardej oprawie dokumentujący drogę od kandydata do prezydenta. Fotografie najlepszych polskich fotoreporterów. Format 30x30cm. Papier kreda 200g.",
        price: 299,
        category: "limitowane",
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"],
        inventory: 35,
        featured: false,
      },
      {
        name: "Flaga Okolicznościowa z Autografem",
        description: "Oficjalna flaga okolicznościowa 150x90cm z oryginalnym autografem prezydenta Nawrockiego. Tkanina poliestrowa premium. Certyfikat autentyczności podpisu. W tubie ochronnej.",
        price: 999,
        category: "limitowane",
        images: ["https://images.unsplash.com/photo-1589994160839-163cd867cfe8?auto=format&fit=crop&q=80&w=1000"],
        inventory: 20,
        featured: false,
      },
    ];

    for (const product of products) {
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
