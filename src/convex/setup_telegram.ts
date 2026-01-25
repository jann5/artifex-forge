"use node";
import { action } from "./_generated/server";

export const registerWebhook = action({
  args: {},
  handler: async (ctx) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const siteUrl = process.env.CONVEX_SITE_URL;

    if (!botToken) return "BŁĄD: Brak TELEGRAM_BOT_TOKEN";
    if (!siteUrl) return "BŁĄD: Brak CONVEX_SITE_URL";

    const webhookUrl = `${siteUrl}/telegram/webhook`;
    console.log(`Ustawianie webhooka na: ${webhookUrl}`);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
      const result = await response.json();
      return result;
    } catch (error: any) {
      return `Błąd: ${error.message}`;
    }
  },
});
