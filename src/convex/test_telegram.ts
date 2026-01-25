"use node";
import { action } from "./_generated/server";

export const sendTest = action({
  args: {},
  handler: async (ctx) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log("Testing Telegram with:", { 
      hasToken: !!botToken, 
      hasChatId: !!chatId 
    });

    if (!botToken || !chatId) {
      return "BŁĄD: Brakuje zmiennych środowiskowych TELEGRAM_BOT_TOKEN lub TELEGRAM_CHAT_ID.";
    }

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
        return `BŁĄD API Telegrama: ${result.description || response.statusText}`;
      }

      return "SUKCES: Wiadomość wysłana pomyślnie!";
    } catch (error: any) {
      return `WYJĄTEK: ${error.message}`;
    }
  },
});
