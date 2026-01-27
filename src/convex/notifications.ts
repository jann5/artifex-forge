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
    customOrderId: v.id("customOrders"),
  },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram not configured");
      return;
    }

    const order = await ctx.runQuery(internal.customOrders.getByIdInternal, {
      orderId: args.customOrderId,
    });

    if (!order) {
      console.error("Custom order not found");
      return;
    }

    const date = new Date(order._creationTime).toLocaleDateString("pl-PL");
    const contactInfo = order.contactInfo ? `\n📞 Kontakt: ${order.contactInfo}` : "";
    
    const msg = `🎨 *NOWE ZAMÓWIENIE NIESTANDARDOWE* (${date})\n\n` +
                `📦 *Projekt:* ${order.projectName}\n` +
                `👤 *Klient:* ${order.customerName}\n` +
                `📧 *Email:* ${order.customerEmail}\n` +
                `🧱 *Materiał:* ${order.material}\n` +
                `📝 *Opis:*\n${order.description}${contactInfo}\n\n` +
                `📸 *Załączniki:* ${order.images.length} zdjęć\n` +
                `📊 *Status:* ${order.status}\n\n` +
                `🆔 \`${order._id}\``;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "💰 Wyceniono", callback_data: `custom_quote:${order._id}` }
        ],
        [
          { text: "✅ Zaakceptowano", callback_data: `custom_status:${order._id}:accepted` },
          { text: "🔨 W produkcji", callback_data: `custom_status:${order._id}:in_production` }
        ],
        [
          { text: "✔️ Ukończono", callback_data: `custom_status:${order._id}:completed` },
          { text: "❌ Anulowano", callback_data: `custom_status:${order._id}:cancelled` }
        ],
        [
          { text: "🗑️ Usuń", callback_data: `delete_custom_order:${order._id}` }
        ]
      ]
    };

    // Send main message
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }),
    });

    // Send images as documents (files) for better organization
    for (const imageId of order.images) {
      const imageUrl = await ctx.storage.getUrl(imageId);
      if (imageUrl) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            document: imageUrl,
            caption: `📎 Załącznik projektu: ${order.projectName}`,
          }),
        });
      }
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