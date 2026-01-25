"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { vly } from "../lib/vly-integrations";

export const generateProductDescription = internalAction({
  args: {
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await vly.ai.completion({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Jesteś ekspertem od marketingu e-commerce. Twoim zadaniem jest stworzenie atrakcyjnego, krótkiego opisu produktu na podstawie jego nazwy i zdjęcia. Opis powinien być po polsku, zachęcający do zakupu, i podkreślać cechy widoczne na zdjęciu. Nie zmyślaj cech, których nie widać. Opis powinien mieć około 2-3 zdania.",
          },
          {
            role: "user",
            content: `Nazwa produktu: ${args.name}. Opisz ten produkt na podstawie zdjęcia: ${args.imageUrl}`,
          },
        ],
        maxTokens: 500,
      });

      if (result.success && result.data) {
        return result.data.choices[0]?.message?.content || "Nie udało się wygenerować opisu.";
      }
      return result.error || "Błąd generowania opisu przez AI.";
    } catch (e) {
      console.error("AI Error:", e);
      return "Wystąpił błąd podczas generowania opisu.";
    }
  },
});