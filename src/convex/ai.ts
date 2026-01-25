"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const generateProductDescription = internalAction({
  args: {
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Dynamic import to avoid build-time resolution issues
      const VlyPkg = await import("@vly-ai/integrations") as any;
      const VlyClass = VlyPkg.Vly || VlyPkg.default?.Vly || VlyPkg.default;
      
      if (!VlyClass) {
        console.warn("Vly integration library not found");
        return "AI generation unavailable (library missing)";
      }

      const vly = new VlyClass({
        apiKey: process.env.VLY_INTEGRATION_KEY!,
      });

      const result = await vly.ai.completion({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Jesteś ekspertem od marketingu e-commerce. Twoim zadaniem jest stworzenie atrakcyjnego, krótkiego opisu produktu na podstawie jego nazwy i zdjęcia. Opis powinien być po polsku, zachęcający do zakupu, i podkreślać cechy widoczne na zdjęciu. Nie zmyślaj cech, których nie widać. Opis powinien mieć około 2-3 zdania.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Nazwa produktu: ${args.name}. Opisz ten produkt na podstawie zdjęcia.` },
              { type: "image_url", image_url: { url: args.imageUrl } },
            ] as any,
          },
        ],
      }) as any; // Cast to any to avoid type errors

      if (result.success && result.data) {
        return result.data.choices[0]?.message?.content || "Nie udało się wygenerować opisu.";
      }
      return "Błąd generowania opisu przez AI.";
    } catch (e) {
      console.error("AI Error:", e);
      return "Wystąpił błąd podczas generowania opisu.";
    }
  },
});