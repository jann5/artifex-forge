"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
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
    console.log(`[sendTelegramNotification] ========== START ==========`);
    console.log(`[sendTelegramNotification] Order ID: ${args.orderId}`);
    console.log(`[sendTelegramNotification] Customer: ${args.customerEmail}`);
    console.log(`[sendTelegramNotification] Amount: ${args.totalAmount} PLN`);
    console.log(`[sendTelegramNotification] Status: ${args.status}`);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log(`[sendTelegramNotification] Bot Token: ${botToken ? 'SET (' + botToken.substring(0, 10) + '...)' : 'NOT SET'}`);
    console.log(`[sendTelegramNotification] Chat ID: ${chatId ? chatId : 'NOT SET'}`);

    if (!botToken || !chatId) {
      console.warn("[sendTelegramNotification] ⚠️ Telegram credentials not configured");
      console.warn("[sendTelegramNotification] Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in API Keys");
      return { success: false, message: "Telegram not configured" };
    }

    const addressInfo = args.shippingAddress ? `
📍 *Adres dostawy:*
👤 ${args.shippingAddress.fullName}
🏠 ${args.shippingAddress.street}
mj. ${args.shippingAddress.postalCode} ${args.shippingAddress.city}
📞 ${args.shippingAddress.phone}
` : "";

    console.log(`[sendTelegramNotification] Has shipping address: ${!!args.shippingAddress}`);

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
        ],
        [
          { text: "ℹ️ Szczegóły", callback_data: `order_info:${args.orderId}` },
          { text: "🗑️ Usuń z czatu", callback_data: `order_delete:${args.orderId}` }
        ]
      ]
    };

    try {
      console.log(`[sendTelegramNotification] Sending message to Telegram API...`);
      console.log(`[sendTelegramNotification] URL: https://api.telegram.org/bot${botToken.substring(0, 10)}...`);
      
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
      console.log(`[sendTelegramNotification] Telegram API response status: ${response.status}`);
      console.log(`[sendTelegramNotification] Telegram API response:`, JSON.stringify(result, null, 2));

      if (!response.ok || !result.ok) {
        console.error(`[sendTelegramNotification] ❌ Telegram API error:`, result);
        throw new Error(`Telegram API error: ${result.description || response.statusText}`);
      }

      console.log(`[sendTelegramNotification] ✅ Notification sent successfully`);
      console.log(`[sendTelegramNotification] ========== END ==========`);
      return { success: true };
    } catch (error: any) {
      console.error(`[sendTelegramNotification] ❌ Failed to send notification:`, error);
      console.error(`[sendTelegramNotification] Error message:`, error.message);
      console.error(`[sendTelegramNotification] Error stack:`, error.stack);
      console.log(`[sendTelegramNotification] ========== END (ERROR) ==========`);
      return { success: false, message: error.message };
    }
  },
});

export const sendCustomOrderNotification = internalAction({
  args: {
    orderId: v.id("customOrders"),
    projectName: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    material: v.string(),
    description: v.string(),
    images: v.optional(v.array(v.string())),
    files3D: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const siteUrl = process.env.CONVEX_SITE_URL;

    if (botToken && chatId) {
      let message = `🎨 *NOWE ZAMÓWIENIE NIESTANDARDOWE*\n\n` +
                    `👤 *Klient:* ${args.customerName}\n` +
                    `📧 *Email:* ${args.customerEmail}\n` +
                    `🏗️ *Projekt:* ${args.projectName}\n` +
                    `🧱 *Materiał:* ${args.material}\n` +
                    `📝 *Opis:* ${args.description}\n`;

      if (args.images && args.images.length > 0) {
        message += `\n📸 *Zdjęcia:* ${args.images.length} plik(ów)\n`;
        for (let i = 0; i < args.images.length; i++) {
          const imageUrl = `${siteUrl}/api/storage/${args.images[i]}`;
          message += `  [Zdjęcie ${i + 1}](${imageUrl})\n`;
        }
      }

      if (args.files3D && args.files3D.length > 0) {
        message += `\n📦 *Pliki 3D:* ${args.files3D.length} plik(ów)\n`;
        for (let i = 0; i < args.files3D.length; i++) {
          const fileUrl = `${siteUrl}/api/storage/${args.files3D[i]}`;
          message += `  [Model 3D ${i + 1}](${fileUrl})\n`;
        }
      }

      message += `\n🆔 \`${args.orderId}\`\n\n🔗 [Zarządzaj w panelu admina](${siteUrl}/admin/orders)`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    }
  },
});

export const sendCustomOrderUpdate = internalAction({
  args: {
    customOrderId: v.id("customOrders"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) return;

    const order = await ctx.runQuery(internal.customOrders.getByIdInternal, {
      orderId: args.customOrderId,
    });

    if (!order) return;

    const msg = `📬 *Aktualizacja zamówienia niestandardowego*\n\n` +
                `📦 Projekt: ${order.projectName}\n` +
                `👤 Klient: ${order.customerEmail}\n` +
                `💬 Wiadomość: ${args.message}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "Markdown",
      }),
    });
  },
});

export const sendLowStockNotification = internalAction({
  args: {
    productId: v.string(),
    productName: v.string(),
    currentInventory: v.number(),
  },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) return;

    const message = `⚠️ *Niski stan magazynowy*\n\n📦 Produkt: ${args.productName}\n🔢 Pozostało: ${args.currentInventory} szt.`;

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    } catch (error) {
      console.error("Failed to send low stock notification", error);
    }
  },
});