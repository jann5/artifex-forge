"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendTelegramNotification = internalAction({
  args: {
    orderId: v.string(),
    customerEmail: v.string(),
    totalAmount: v.number(),
    status: v.string(),
    shippingAddress: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram credentials not configured");
      return { success: false, message: "Telegram not configured" };
    }

    const addressInfo = args.shippingAddress ? `
📍 *Adres dostawy:*
👤 ${args.shippingAddress.fullName}
🏠 ${args.shippingAddress.street}
mj. ${args.shippingAddress.postalCode} ${args.shippingAddress.city}
📞 ${args.shippingAddress.phone}
` : "";

    console.log(`[sendTelegramNotification] Preparing notification for order ${args.orderId}`);
    console.log(`[sendTelegramNotification] Bot Token: ${botToken ? 'SET' : 'NOT SET'}`);
    console.log(`[sendTelegramNotification] Chat ID: ${chatId ? chatId : 'NOT SET'}`);
    console.log(`[sendTelegramNotification] Has address: ${!!args.shippingAddress}`);

    const message = `
🛍️ *Nowe Zamówienie / Aktualizacja*

📦 ID: \`${args.orderId}\`
👤 Klient: ${args.customerEmail}
💰 Kwota: ${args.totalAmount} PLN
📊 Status: *${args.status}*
${addressInfo}
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
      console.log(`[sendTelegramNotification] Sending message to Telegram...`);
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

      const result = await response.json();
      console.log(`[sendTelegramNotification] Telegram API response:`, JSON.stringify(result));

      if (!response.ok || !result.ok) {
        console.error(`[sendTelegramNotification] Telegram API error:`, result);
        throw new Error(`Telegram API error: ${result.description || response.statusText}`);
      }

      console.log(`[sendTelegramNotification] Notification sent successfully for order ${args.orderId}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[sendTelegramNotification] Failed to send notification:`, error);
      console.error(`[sendTelegramNotification] Error details:`, error.message);
      return { success: false, message: error.message };
    }
  },
});