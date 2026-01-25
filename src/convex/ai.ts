"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const generateProductDescription = internalAction({
  args: {
    name: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not set");
      return "Błąd: Brak klucza API Groq. Ustaw GROQ_API_KEY w zmiennych środowiskowych.";
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Jesteś ekspertem od marketingu e-commerce. Twoim zadaniem jest stworzenie atrakcyjnego, krótkiego opisu produktu na podstawie jego nazwy. Opis powinien być po polsku, zachęcający do zakupu, i podkreślać potencjalne cechy produktu. Opis powinien mieć około 2-3 zdania.",
            },
            {
              role: "user",
              content: `Nazwa produktu: ${args.name}. Stwórz krótki, atrakcyjny opis tego produktu.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API error:", response.status, errorText);
        return `Błąd API Groq: ${response.status}`;
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Nie udało się wygenerować opisu.";
    } catch (e) {
      console.error("AI Error:", e);
      return "Wystąpił błąd podczas generowania opisu.";
    }
  },
});