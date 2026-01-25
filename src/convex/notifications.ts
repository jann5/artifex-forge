"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendTelegramNotification = action({
  args: {
    orderId: v.string(),
    customerEmail: v.string(),
    totalAmount: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram credentials not configured");
      return { success: false, message: "Telegram not configured" };
    }

    const message = `
🛍️ *Nowe Zamówienie / Aktualizacja*

📦 ID: \`${args.orderId}\`
👤 Klient: ${args.customerEmail}
💰 Kwota: ${args.totalAmount} PLN
📊 Status: *${args.status}*

Zarządzaj statusem poniżej:
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          { text: "💰 Opłacone", callback_data: `update_status:${args.orderId}:paid` },
          { text: "🚚 Wysłane", callback_data: `update_status:${args.orderId}:shipped` }
        ],
        [
          { text: "✅ Dostarczone", callback_data: `update_status:${args.orderId}:delivered` },
          { text: "❌ Anulowane", callback_data: `update_status:${args.orderId}:cancelled` }
        ]
      ]
    };

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
            reply_markup: keyboard,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      console.log(`Telegram notification sent for order ${args.orderId}`);
      return { success: true };
    } catch (error: any) {
      console.error("Failed to send Telegram notification:", error);
      return { success: false, message: error.message };
    }
  },
});