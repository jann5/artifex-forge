"use node";
import { action } from "./_generated/server";

export const sendTest = action({
  args: {},
  handler: async (ctx) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const siteUrl = process.env.CONVEX_SITE_URL;

    if (!botToken || !chatId || !siteUrl) {
      const missingVars = [];
      if (!botToken) missingVars.push("TELEGRAM_BOT_TOKEN");
      if (!chatId) missingVars.push("TELEGRAM_CHAT_ID");
      if (!siteUrl) missingVars.push("CONVEX_SITE_URL");
      return `BŁĄD: Brakuje zmiennych środowiskowych: ${missingVars.join(", ")}`;
    }

    // Logowanie dla celów debugowania (ukrywamy środek tokena)
    const maskedToken = botToken.substring(0, 5) + "..." + botToken.substring(botToken.length - 5);
    console.log(`Próba wysłania z tokenem: ${maskedToken} (długość: ${botToken.length})`);
    console.log(`Na Chat ID: ${chatId}`);
    console.log(`Site URL: ${siteUrl}`);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🔔 *Test Powiadomień*\n\nTo jest wiadomość testowa z Twojego sklepu Artifex Forge. Integracja działa poprawnie! 🚀",
            parse_mode: "Markdown",
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        console.error("Błąd Telegram API:", result);
        return `BŁĄD API Telegrama: ${result.description || response.statusText} (Kod: ${response.status})`;
      }

      return "SUKCES: Wiadomość wysłana pomyślnie!";
    } catch (error: any) {
      return `WYJĄTEK: ${error.message}`;
    }
  },
});