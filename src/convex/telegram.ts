import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const webhook = httpAction(async (ctx, request) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return new Response("Bot token not configured", { status: 500 });
  }

  const sendMessage = async (chatId: string | number, text: string, keyboard?: any) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }),
    });
  };

  // Helper to send Telegram messages
  const sendTelegramMessage = async (chatId: number | string, text: string) => {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });
  };

  async function handleOrderCommand(chatId: number, ctx: any) {
    try {
      // Fetch both standard and custom orders
      const standardOrders = await ctx.runQuery(internal.orders.getRecent);
      const customOrders = await ctx.runQuery(internal.customOrders.listAllInternal);
      
      if (standardOrders.length === 0 && customOrders.length === 0) {
        await sendTelegramMessage(chatId, "📦 Brak zamówień w systemie.");
        return;
      }

      // Send standard orders
      if (standardOrders.length > 0) {
        for (const order of standardOrders) {
          const date = new Date(order._creationTime).toLocaleDateString("pl-PL");
          const statusEmoji = order.status === "paid" ? "✅" : order.status === "shipped" ? "🚚" : order.status === "delivered" ? "📦" : "⏳";
          
          const msg = `${statusEmoji} *Zamówienie standardowe* (${date})\n\n` +
                      `📋 *ID:* \`${order._id}\`\n` +
                      `👤 *Klient:* ${order.customerName}\n` +
                      `💰 *Kwota:* ${order.totalAmount} PLN\n` +
                      `📊 *Status:* ${order.status}`;
          
          const keyboard = {
            inline_keyboard: [
              [
                { text: "💰 Opłacone", callback_data: `update_status:${order._id}:paid` },
                { text: "🚚 Wysłane", callback_data: `update_status:${order._id}:shipped` }
              ],
              [
                { text: "✅ Dostarczone", callback_data: `update_status:${order._id}:delivered` },
                { text: "❌ Anulowane", callback_data: `update_status:${order._id}:cancelled` }
              ],
              [
                { text: "ℹ️ Szczegóły", callback_data: `order_info:${order._id}` },
                { text: "🗑️ Usuń", callback_data: `delete_order:${order._id}` }
              ]
            ]
          };
          
          await sendMessage(chatId, msg, keyboard);
        }
      }
      
      // Send custom orders
      if (customOrders.length > 0) {
        for (const order of customOrders) {
          const date = new Date(order._creationTime).toLocaleDateString("pl-PL");
          const statusEmoji = order.status === "pending" ? "⏳" : order.status === "quoted" ? "💰" : order.status === "accepted" ? "✅" : order.status === "in_production" ? "🔨" : order.status === "completed" ? "✔️" : "📋";
          
          let orderMessage = `${statusEmoji} *ZAMÓWIENIE NIESTANDARDOWE* (${date})\n\n`;
          orderMessage += `🎨 *Projekt:* ${order.projectName}\n`;
          orderMessage += `👤 *Klient:* ${order.customerName}\n`;
          orderMessage += `📧 *Email:* ${order.customerEmail}\n`;
          orderMessage += `🧱 *Materiał:* ${order.material}\n`;
          orderMessage += `📊 *Status:* ${order.status}\n`;
          if (order.estimatedPrice) {
            orderMessage += `💰 *Wycena:* ${order.estimatedPrice} PLN\n`;
          }
          orderMessage += `\n🆔 \`${order._id}\``;
          
          const customKeyboard = {
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
                { text: "❌ Anulowane", callback_data: `custom_status:${order._id}:cancelled` }
              ],
              [
                { text: "🗑️ Usuń", callback_data: `delete_custom_order:${order._id}` }
              ]
            ]
          };
          
          await sendMessage(chatId, orderMessage, customKeyboard);
        }
      }
    
    } catch (error) {
      console.error("Error in handleOrderCommand:", error);
      await sendTelegramMessage(chatId, "❌ Błąd podczas pobierania zamówień.");
    }
  }

  async function handleDeleteCommand(ctx: any, chatId: number, orderId: string) {
    try {
      const isCustomOrder = orderId.startsWith("custom_");
      const actualOrderId = isCustomOrder ? orderId.replace("custom_", "") : orderId;
      
      if (isCustomOrder) {
        await ctx.runMutation(internal.customOrders.deleteOrderInternal, { 
          orderId: actualOrderId as any 
        });
        await sendTelegramMessage(chatId, `✅ Zamówienie niestandardowe #${actualOrderId.slice(-6)} zostało usunięte.`);
      } else {
        await ctx.runMutation(internal.orders.deleteOrder, { 
          orderId: actualOrderId as any 
        });
        await sendTelegramMessage(chatId, `✅ Zamówienie #${actualOrderId.slice(-6)} zostało usunięte.`);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      await sendTelegramMessage(chatId, "❌ Błąd podczas usuwania zamówienia.");
    }
  }

  try {
    const body = await request.json() as any;
    
    // Handle Callback Queries (Buttons)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const message = callbackQuery.message;
      const chatId = String(message.chat.id);
      const messageId = message.message_id;
      const callbackQueryId = callbackQuery.id;
      
      // ALWAYS answer callback query first to stop loading animation
      const answerCallback = async (text?: string) => {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            callback_query_id: callbackQueryId, 
            text: text || "" 
          })
        });
      };
      
      // Format: update_status:ORDER_ID:STATUS
      if (data && data.startsWith("update_status:")) {
        const parts = data.split(":");
        if (parts.length === 3) {
          const orderId = parts[1] as Id<"orders">;
          const status = parts[2];
          
          await ctx.runMutation(internal.orders.updateStatusInternal, {
            orderId: orderId,
            status: status as "pending" | "paid" | "shipped" | "delivered" | "cancelled",
          });
          
          await answerCallback(`Status zmieniony na ${status}`);

          const originalText = message.text || "";
          const updatedText = originalText.replace(/Status: .*/, `Status: ${status}`);

          const keyboard = {
            inline_keyboard: [
                [
                    { text: "💰 Opłacone", callback_data: `update_status:${orderId}:paid` },
                    { text: "🚚 Wysłane", callback_data: `update_status:${orderId}:shipped` }
                ],
                [
                    { text: "✅ Dostarczone", callback_data: `update_status:${orderId}:delivered` },
                    { text: "❌ Anulowane", callback_data: `update_status:${orderId}:cancelled` }
                ],
                [
                     { text: "ℹ️ Szczegóły", callback_data: `order_info:${orderId}` },
                     { text: "🗑️ Usuń z czatu", callback_data: `order_delete:${orderId}` }
                ]
            ]
          };

          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              text: updatedText,
              reply_markup: keyboard
            })
          });
        }
        return new Response("OK", { status: 200 });
      }

      // Handle Custom Order Status Update
      if (data && data.startsWith("custom_status:")) {
        const parts = data.split(":");
        if (parts.length === 3) {
          const orderId = parts[1] as Id<"customOrders">;
          const status = parts[2];
          
          await ctx.runMutation(internal.customOrders.updateStatusInternal, {
            orderId: orderId,
            status: status,
          });

          await answerCallback(`Status zmieniony na ${status}`);

          const originalText = message.text || "";
          const updatedText = originalText.replace(/Status: .*/, `Status: ${status}`);

          // Re-add the inline keyboard buttons after status update
          const keyboard = {
            inline_keyboard: [
              [
                { text: "💰 Wyceniono", callback_data: `custom_quote:${orderId}` }
              ],
              [
                { text: "✅ Zaakceptowano", callback_data: `custom_status:${orderId}:accepted` },
                { text: "🔨 W produkcji", callback_data: `custom_status:${orderId}:in_production` }
              ],
              [
                { text: "✔️ Ukończono", callback_data: `custom_status:${orderId}:completed` },
                { text: "❌ Anulowano", callback_data: `custom_status:${orderId}:cancelled` }
              ],
              [
                { text: "🗑️ Usuń", callback_data: `delete_custom_order:${orderId}` }
              ]
            ]
          };

          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              text: updatedText,
              parse_mode: "Markdown",
              reply_markup: keyboard
            })
          });
        }
        return new Response("OK", { status: 200 });
      }

      // Handle Product Selection for Edit
      if (data && data.startsWith("edit_select:")) {
        const productId = data.split(":")[1];
        
        await ctx.runMutation(internal.telegram_db.updateSession, {
          chatId,
          step: "EDIT_CHOOSE_FIELD",
          updates: { editingProductId: productId }
        });

        const product = await ctx.runQuery(api.products.get, { id: productId as Id<"products"> });
        
        const editKeyboard = {
          keyboard: [
            [{ text: "Nazwa" }, { text: "Opis" }],
            [{ text: "Cena" }, { text: "Ilość" }],
            [{ text: "Kategoria" }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        };

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✏️ Edytujesz: *${product?.name}*\nCo chcesz zmienić?`,
              parse_mode: "Markdown",
              reply_markup: editKeyboard,
            }),
        });

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle Product Selection for Delete
      if (data && data.startsWith("delete_select:")) {
        const productId = data.split(":")[1];
        const product = await ctx.runQuery(api.products.get, { id: productId as Id<"products"> });

        if (product) {
            await ctx.runMutation(api.products.remove, { id: productId as Id<"products"> });
            await ctx.runMutation(internal.telegram_db.clearSession, { chatId });
            
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `✅ Usunięto produkt: *${product.name}*`,
                  parse_mode: "Markdown",
                }),
            });
        }

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle Delete Pagination
      if (data && data.startsWith("delete_page:")) {
        const page = parseInt(data.split(":")[1]);
        const allProducts = await ctx.runQuery(api.products.list, {});
        
        const pageSize = 10;
        const startIdx = page * pageSize;
        const endIdx = Math.min(startIdx + pageSize, allProducts.length);
        const productsPage = allProducts.slice(startIdx, endIdx);
        
        const buttons = productsPage.map((p: any) => ([
          { text: `${p.name} (${p.stock} szt.)`, callback_data: `delete_product_${p._id}` }
        ]));
        
        const navButtons = [];
        if (page > 0) {
          navButtons.push({ text: "⬅️ Poprzednia", callback_data: `delete_page:${page - 1}` });
        }
        if (endIdx < allProducts.length) {
          navButtons.push({ text: "➡️ Następna", callback_data: `delete_page:${page + 1}` });
        }
        if (navButtons.length > 0) {
          buttons.push(navButtons);
        }
        
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.message_id,
            text: `🗑️ *Usuwanie Produktu* (${startIdx + 1}-${endIdx} z ${allProducts.length})\n\nWybierz produkt do usunięcia:`,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: buttons }
          })
        });

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle Edit Pagination
      if (data && data.startsWith("edit_page:")) {
        const page = parseInt(data.split(":")[1]);
        const allProducts = await ctx.runQuery(api.products.list, {});
        
        const pageSize = 10;
        const startIdx = page * pageSize;
        const endIdx = Math.min(startIdx + pageSize, allProducts.length);
        const productsPage = allProducts.slice(startIdx, endIdx);
        
        const buttons = productsPage.map((p: any) => ([
          { text: `${p.name} (${p.stock} szt.)`, callback_data: `edit_product_${p._id}` }
        ]));
        
        const navButtons = [];
        if (page > 0) {
          navButtons.push({ text: "⬅️ Poprzednia", callback_data: `edit_page:${page - 1}` });
        }
        if (endIdx < allProducts.length) {
          navButtons.push({ text: "➡️ Następna", callback_data: `edit_page:${page + 1}` });
        }
        if (navButtons.length > 0) {
          buttons.push(navButtons);
        }
        
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.message_id,
            text: `✏️ *Edycja Produktu* (${startIdx + 1}-${endIdx} z ${allProducts.length})\n\nWybierz produkt do edycji:`,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: buttons }
          })
        });

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle Order Info
      if (data && data.startsWith("order_info:")) {
        const orderId = data.split(":")[1] as Id<"orders">;
        const order = await ctx.runQuery(internal.orders.getById, { orderId });
        
        if (order) {
          const date = new Date(order._creationTime).toLocaleDateString("pl-PL");
          const items = order.items.map((item: any) => `  • ${item.name} x${item.quantity} - ${item.price} PLN`).join("\n");
          const address = order.shippingAddress 
            ? `\n\n📍 *Adres dostawy:*\n${order.shippingAddress.fullName}\n${order.shippingAddress.street}\n${order.shippingAddress.postalCode} ${order.shippingAddress.city}\n${order.shippingAddress.country}`
            : "\n\n📍 Brak adresu dostawy";
          
          const msg = `📦 *Szczegóły zamówienia* (${date})\n\n` +
                      `👤 Klient: ${order.customerName}\n` +
                      `💰 Kwota: ${order.totalAmount} PLN\n` +
                      `📊 Status: ${order.status}\n\n` +
                      `*Produkty:*\n${items}${address}`;
          
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: msg,
              parse_mode: "Markdown",
            }),
          });
        }

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle Order Delete
      if (data && data.startsWith("order_delete:")) {
        const orderId = data.split(":")[1] as Id<"orders">;
        
        const confirmKeyboard = {
          inline_keyboard: [
            [
              { text: "✅ Tak, usuń z czatu", callback_data: `order_delete_confirm:${orderId}` },
              { text: "❌ Anuluj", callback_data: `order_delete_cancel:${orderId}` }
            ]
          ]
        };
        
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.message_id,
            text: "⚠️ Czy na pewno chcesz usunąć to powiadomienie z czatu? (Zamówienie pozostanie w systemie)",
            reply_markup: confirmKeyboard,
          }),
        });

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle Order Delete Confirmation
      if (data && data.startsWith("order_delete_confirm:")) {
        await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.message_id,
          }),
        });

        await answerCallback("Usunięto wiadomość");
        return new Response("OK", { status: 200 });
      }

      // Handle Order Delete Cancel
      if (data && data.startsWith("order_delete_cancel:")) {
        const orderId = data.split(":")[1] as Id<"orders">;
        const order = await ctx.runQuery(internal.orders.getById, { orderId });
        
        if (order) {
            const date = new Date(order._creationTime).toLocaleDateString("pl-PL");
            const items = order.items.map((item: any) => `  • ${item.name} x${item.quantity} - ${item.price} PLN`).join("\n");
            const address = order.shippingAddress 
                ? `\n\n📍 *Adres dostawy:*\n${order.shippingAddress.fullName}\n${order.shippingAddress.street}\n${order.shippingAddress.postalCode} ${order.shippingAddress.city}\n${order.shippingAddress.country}`
                : "\n\n📍 Brak adresu dostawy";
              
            const msg = `📦 *Szczegóły zamówienia* (${date})\n\n` +
                          `👤 Klient: ${order.customerName}\n` +
                          `💰 Kwota: ${order.totalAmount} PLN\n` +
                          `📊 Status: ${order.status}\n\n` +
                          `*Produkty:*\n${items}${address}`;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: "💰 Opłacone", callback_data: `update_status:${order._id}:paid` },
                        { text: "🚚 Wysłane", callback_data: `update_status:${order._id}:shipped` }
                    ],
                    [
                        { text: "✅ Dostarczone", callback_data: `update_status:${order._id}:delivered` },
                        { text: "❌ Anulowane", callback_data: `update_status:${order._id}:cancelled` }
                    ],
                    [
                         { text: "ℹ️ Szczegóły", callback_data: `order_info:${order._id}` },
                         { text: "🗑️ Usuń z czatu", callback_data: `order_delete:${order._id}` }
                    ]
                ]
            };

            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: message.message_id,
                    text: msg,
                    parse_mode: "Markdown",
                    reply_markup: keyboard
                }),
            });
        } else {
             await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: message.message_id,
                    text: "❌ Nie znaleziono zamówienia.",
                }),
            });
        }

        await answerCallback();
        return new Response("OK", { status: 200 });
      }

      // Handle delete order callback
      if (data && data.startsWith("delete_order:")) {
        await answerCallback();
        const orderId = data.split(":")[1];
        try {
          await ctx.runMutation(internal.orders.deleteOrder, { 
            orderId: orderId as Id<"orders"> 
          });
          await sendTelegramMessage(chatId, `✅ Zamówienie ${orderId} zostało usunięte z bazy danych.`);
        } catch (error) {
          console.error("Error deleting order:", error);
          await sendTelegramMessage(chatId, "❌ Błąd podczas usuwania zamówienia.");
        }
        return new Response("OK");
      }

      // Handle delete custom order callback
      if (data && data.startsWith("delete_custom_order:")) {
        await answerCallback("Usuwanie...");
        const orderId = data.split(":")[1];
        try {
          await ctx.runMutation(internal.customOrders.deleteOrderInternal, { 
            orderId: orderId as Id<"customOrders"> 
          });
          
          // Delete the message from chat
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
            }),
          });
          
          await sendTelegramMessage(chatId, `✅ Zamówienie niestandardowe zostało usunięte.`);
        } catch (error) {
          console.error("Error deleting custom order:", error);
          await sendTelegramMessage(chatId, "❌ Błąd podczas usuwania zamówienia niestandardowego.");
        }
        return new Response("OK");
      }

      // Custom order quote with price input
      if (data.startsWith("custom_quote:")) {
        const orderId = data.split(":")[1] as Id<"customOrders">;
        await answerCallback("💰 Wprowadź cenę");
        
        await ctx.runMutation(internal.telegram_db.updateSession, {
          chatId: chatId.toString(),
          step: "CUSTOM_QUOTE_PRICE",
          updates: { customOrderId: orderId },
        });

        await sendTelegramMessage(chatId, "💰 *Podaj cenę wyceny*\n\nWpisz tylko liczbę (np. 150 dla 150 PLN):");

        return new Response("OK", { status: 200 });
      }

      // Custom order status update (duplicate removed, already handled above)

      // If no handler matched, answer callback anyway
      await answerCallback();
      return new Response("OK", { status: 200 });
    }

    // Handle Messages
    if (body.message) {
      const message = body.message;
      const chatId = String(message.chat.id);
      const text = message.text || message.caption || "";

      // Check for active session
      const session = await ctx.runQuery(internal.telegram_db.getSession, { chatId });

      // COMMANDS
      if (text === "/start" || text === "/help") {
        await sendMessage(chatId, "🤖 *Artifex Bot*\n\nKomendy:\n/orders - Ostatnie zamówienia\n/stats - Statystyki sklepu\n/lowstock - Niskie stany magazynowe\n/addproduct - Dodaj produkt\n/editproduct - Edytuj produkt\n/deleteproduct - Usuń produkt\n/cancel - Anuluj\n\n🛠️ *Developer:*\n/dev_ping - Status serwera\n/dev_info - Twoje ID\n/dev_db - Statystyki bazy\n/dev_reset - Reset sesji\n/help - Pomoc");
        return new Response("OK", { status: 200 });
      }

      if (text === "/dev_ping") {
        const start = Date.now();
        const stats = await ctx.runQuery(internal.dev.getSystemStats, {});
        const latency = Date.now() - start;
        
        const msg = `🏓 *Pong!*\n\n` +
                    `⏱️ Latency: ${latency}ms\n` +
                    `🕒 Server Time: ${new Date(stats.serverTime).toISOString()}\n` +
                    `🔗 URL: ${stats.convexSiteUrl || "Not set"}`;
        
        await sendMessage(chatId, msg);
        return new Response("OK", { status: 200 });
      }

      if (text === "/dev_info") {
        const msg = `🕵️ *Developer Info*\n\n` +
                    `🆔 Chat ID: \`${chatId}\`\n` +
                    `👤 User: ${message.from?.first_name} ${message.from?.last_name || ""} (@${message.from?.username || "none"})\n` +
                    `📝 Message ID: ${message.message_id}`;
        
        await sendMessage(chatId, msg);
        return new Response("OK", { status: 200 });
      }

      if (text === "/dev_db") {
        const stats = await ctx.runQuery(internal.dev.getSystemStats, {});
        
        const msg = `💾 *Database Stats*\n\n` +
                    `👥 Users: ${stats.users}\n` +
                    `🛍️ Products: ${stats.products}\n` +
                    `📦 Orders: ${stats.orders}\n` +
                    `⭐ Reviews: ${stats.reviews}`;
        
        await sendMessage(chatId, msg);
        return new Response("OK", { status: 200 });
      }

      if (text === "/dev_reset") {
        const result = await ctx.runMutation(internal.dev.debugClearSession, { chatId });
        await sendMessage(chatId, result ? "✅ Session cleared (Hard Reset)." : "ℹ️ No active session found.");
        return new Response("OK", { status: 200 });
      }

      if (text === "/stats") {
        const stats = await ctx.runQuery(internal.orders.getStats);
        const productStats = await ctx.runQuery(internal.products.getStats);
        
        const msg = `📊 *Statystyki Sklepu*\n\n` +
                    `📦 Zamówienia: ${stats.totalOrders}\n` +
                    `💰 Przychód: ${stats.totalRevenue.toFixed(2)} PLN\n` +
                    `⏳ Oczekujące: ${stats.pendingOrders}\n` +
                    `✅ Opłacone: ${stats.paidOrders}\n\n` +
                    `🛍️ Produkty: ${productStats.totalProducts}\n` +
                    `⚠️ Niski stan: ${productStats.lowStockCount}`;
        
        await sendMessage(chatId, msg);
        return new Response("OK", { status: 200 });
      }

      if (text === "/orders") {
        const orders = await ctx.runQuery(internal.orders.getRecent);
        if (orders.length === 0) {
            await sendMessage(chatId, "Brak ostatnich zamówień.");
        } else {
            for (const order of orders) {
                const date = new Date(order._creationTime).toLocaleDateString("pl-PL");
                const msg = `📦 *Zamówienie* (${date})\n` +
                            `👤 ${order.customerName}\n` +
                            `💰 ${order.totalAmount} PLN\n` +
                            `Status: ${order.status}`;
                
                // Add status buttons + info + delete
                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: "Oczekuje", callback_data: `update_status:${order._id}:pending` },
                            { text: "Opłacone", callback_data: `update_status:${order._id}:paid` }
                        ],
                        [
                            { text: "Wysłane", callback_data: `update_status:${order._id}:shipped` },
                            { text: "Dostarczone", callback_data: `update_status:${order._id}:delivered` }
                        ],
                        [
                            { text: "ℹ️ Szczegóły", callback_data: `order_info:${order._id}` },
                            { text: "🗑️ Usuń", callback_data: `order_delete:${order._id}` }
                        ]
                    ]
                };
                await sendMessage(chatId, msg, keyboard);
            }
        }
        return new Response("OK", { status: 200 });
      }

      if (text === "/lowstock") {
        const stats = await ctx.runQuery(internal.products.getStats);
        if (stats.lowStockCount === 0) {
            await sendMessage(chatId, "✅ Wszystkie produkty mają odpowiedni stan magazynowy.");
        } else {
            const list = stats.lowStockNames.map((n: string) => `- ${n}`).join("\n");
            await sendMessage(chatId, `⚠️ *Niski stan magazynowy (<5):\n\n${list}`);
        }
        return new Response("OK", { status: 200 });
      }

      if (text === "/cancel") {
        if (session) {
          await ctx.runMutation(internal.telegram_db.clearSession, { chatId });
          await sendMessage(chatId, "❌ Anulowano dodawanie produktu.", { remove_keyboard: true });
        } else {
          await sendMessage(chatId, "Nie ma aktywnej operacji do anulowania.");
        }
        return new Response("OK", { status: 200 });
      }

      if (text === "/addproduct") {
        // Verify admin (optional, simple check)
        const adminChatId = process.env.TELEGRAM_CHAT_ID;
        if (adminChatId && chatId !== String(adminChatId)) {
           await sendMessage(chatId, "⛔ Brak uprawnień.");
           return new Response("OK", { status: 200 });
        }

        await ctx.runMutation(internal.telegram_db.startSession, { chatId });
        await sendMessage(chatId, "📦 *Nowy Produkt*\n\nPodaj nazwę produktu:");
        return new Response("OK", { status: 200 });
      }

      if (text === "/deleteproduct") {
        const adminChatId = process.env.TELEGRAM_CHAT_ID;
        if (adminChatId && chatId !== String(adminChatId)) {
           await sendMessage(chatId, "⛔ Brak uprawnień.");
           return new Response("OK", { status: 200 });
        }
        
        // Get all products and show selection list with pagination
        const allProducts = await ctx.runQuery(api.products.list, {});
        
        if (allProducts.length === 0) {
          await sendMessage(chatId, "❌ Brak produktów w sklepie.");
          return new Response("OK", { status: 200 });
        }
        
        // Show first page (0-9)
        const pageSize = 10;
        const page = 0;
        const startIdx = page * pageSize;
        const endIdx = Math.min(startIdx + pageSize, allProducts.length);
        const productsPage = allProducts.slice(startIdx, endIdx);
        
        const buttons = productsPage.map((p: any) => ([
          { text: `${p.name} (${p.stock} szt.)`, callback_data: `delete_product_${p._id}` }
        ]));
        
        // Add navigation buttons if needed
        const navButtons = [];
        if (endIdx < allProducts.length) {
          navButtons.push({ text: "➡️ Następna strona", callback_data: `delete_page:${page + 1}` });
        }
        if (navButtons.length > 0) {
          buttons.push(navButtons);
        }
        
        await sendMessage(chatId, `🗑️ *Usuwanie Produktu* (${startIdx + 1}-${endIdx} z ${allProducts.length})\n\nWybierz produkt do usunięcia:`, { inline_keyboard: buttons });
        return new Response("OK", { status: 200 });
      }

      if (text === "/editproduct") {
        const adminChatId = process.env.TELEGRAM_CHAT_ID;
        if (adminChatId && chatId !== String(adminChatId)) {
           await sendMessage(chatId, "⛔ Brak uprawnień.");
           return new Response("OK", { status: 200 });
        }
        
        // Get all products and show selection list with pagination
        const allProducts = await ctx.runQuery(api.products.list, {});
        
        if (allProducts.length === 0) {
          await sendMessage(chatId, "❌ Brak produktów w sklepie.");
          return new Response("OK", { status: 200 });
        }
        
        // Show first page (0-9)
        const pageSize = 10;
        const page = 0;
        const startIdx = page * pageSize;
        const endIdx = Math.min(startIdx + pageSize, allProducts.length);
        const productsPage = allProducts.slice(startIdx, endIdx);
        
        const buttons = productsPage.map((p: any) => ([
          { text: `${p.name} (${p.stock} szt.)`, callback_data: `edit_product_${p._id}` }
        ]));
        
        // Add navigation buttons if needed
        const navButtons = [];
        if (endIdx < allProducts.length) {
          navButtons.push({ text: "➡️ Następna strona", callback_data: `edit_page:${page + 1}` });
        }
        if (navButtons.length > 0) {
          buttons.push(navButtons);
        }
        
        await sendMessage(chatId, `✏️ *Edycja Produktu* (${startIdx + 1}-${endIdx} z ${allProducts.length})\n\nWybierz produkt do edycji:`, { inline_keyboard: buttons });
        return new Response("OK", { status: 200 });
      }

      // Handle text messages with sessions
      if (message?.text) {
        const text = message.text;
        const chatId = message.chat.id;

        // Check for active session
        const session = await ctx.runQuery(internal.telegram_db.getSession, {
          chatId: chatId.toString(),
        });

        // Handle custom quote price input
        if (session?.step === "CUSTOM_QUOTE_PRICE") {
          const price = parseFloat(text);
          
          if (isNaN(price) || price <= 0) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "❌ Nieprawidłowa cena. Podaj liczbę większą od 0:",
              }),
            });
            return new Response("OK");
          }

          const orderId = session.customOrderId as Id<"customOrders">;
          
        await ctx.runMutation(internal.customOrders.updateStatusInternal, {
          orderId,
          status: "quoted",
          estimatedPrice: price,
        });

          await ctx.runMutation(internal.telegram_db.clearSession, {
            chatId: chatId.toString(),
          });

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ *Wycena zapisana pomyślnie!*\n\n💰 Cena: *${price} PLN*\n\n📧 Klient otrzymał powiadomienie email i może teraz zaakceptować wycenę na stronie zamówienia.`,
              parse_mode: "Markdown",
            }),
          });

          return new Response("OK");
        }

        // Clear session
        await ctx.runMutation(internal.telegram_db.clearSession, {
          chatId: chatId.toString(),
        });
        
        // Send confirmation
        await sendTelegramMessage(chatId, "✅ *Wiadomość wysłana*\\n\\nKlient zobaczy ją na stronie zamówienia.");
        return new Response("OK");
      }

      // CONVERSATION FLOW
      if (session) {
        // Handle Text Inputs
        if (text && !text.startsWith("/")) {
          switch (session.step) {
            case "EDIT_CHOOSE_FIELD":
              let nextStep = "EDIT_VALUE";
              let prompt = "";
              
              switch(text) {
                case "Nazwa": prompt = "Podaj nową nazwę:"; break;
                case "Opis": prompt = "Podaj nowy opis:"; break;
                case "Cena": prompt = "Podaj nową cenę (PLN):"; break;
                case "Ilość": prompt = "Podaj nową ilość:"; break;
                case "Kategoria": prompt = "Podaj nową kategorię:"; break;
                default: 
                  await sendMessage(chatId, "❌ Nieznane pole. Wybierz z klawiatury.");
                  return new Response("OK", { status: 200 });
              }

              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: `EDIT_VALUE_${text.toUpperCase()}`, // e.g. EDIT_VALUE_CENA
                updates: {}
              });
              await sendMessage(chatId, prompt, { remove_keyboard: true });
              break;

            case "EDIT_VALUE_NAZWA":
            case "EDIT_VALUE_OPIS":
            case "EDIT_VALUE_CENA":
            case "EDIT_VALUE_ILOŚĆ": // Handle polish chars in step name if needed, but better to map
            case "EDIT_VALUE_ILOSC":
            case "EDIT_VALUE_KATEGORIA":
              // We need to map the step back to the field
              const fieldMap: Record<string, string> = {
                "EDIT_VALUE_NAZWA": "name",
                "EDIT_VALUE_OPIS": "description",
                "EDIT_VALUE_CENA": "price",
                "EDIT_VALUE_ILOŚĆ": "inventory",
                "EDIT_VALUE_ILOSC": "inventory",
                "EDIT_VALUE_KATEGORIA": "category"
              };
              
              const field = fieldMap[session.step];
              if (!field || !session.editingProductId) {
                 await sendMessage(chatId, "❌ Błąd sesji. Wpisz /cancel");
                 return new Response("OK", { status: 200 });
              }

              const updates: Record<string, any> = {};
              if (field === "price") {
                const val = parseFloat(text.replace(",", "."));
                if (isNaN(val)) {
                  await sendMessage(chatId, "❌ Cena musi być liczbą.");
                  return new Response("OK", { status: 200 });
                }
                updates.price = val;
              } else if (field === "inventory") {
                const val = parseInt(text);
                if (isNaN(val)) {
                  await sendMessage(chatId, "❌ Ilość musi być liczbą.");
                  return new Response("OK", { status: 200 });
                }
                updates.inventory = val;
              } else {
                updates[field] = text;
              }

              // Apply update
              await ctx.runMutation(api.products.update, {
                id: session.editingProductId as Id<"products">,
                updates: updates
              });

              await ctx.runMutation(internal.telegram_db.clearSession, { chatId });
              await sendMessage(chatId, "✅ Zaktualizowano produkt!");
              break;

            case "NAME":
              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: "CHOOSE_DESCRIPTION_TYPE",
                updates: { name: text }
              });
              
              const descKeyboard = {
                keyboard: [
                  [{ text: "✍️ Ręcznie" }, { text: "✨ AI (ulepsz opis)" }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
              };
              
              await sendMessage(chatId, "📝 Jak chcesz dodać opis?", descKeyboard);
              break;

            case "CHOOSE_DESCRIPTION_TYPE":
               if (text === "✨ AI (ulepsz opis)") {
                  await ctx.runMutation(internal.telegram_db.updateSession, {
                    chatId,
                    step: "DESCRIPTION_FOR_AI",
                    updates: {}
                  });
                  await sendMessage(chatId, "📝 Wpisz podstawowy opis produktu, a AI go ulepszy i rozbuduje:", { remove_keyboard: true });
               } else {
                  // Default to manual
                  await ctx.runMutation(internal.telegram_db.updateSession, {
                    chatId,
                    step: "DESCRIPTION",
                    updates: {}
                  });
                  await sendMessage(chatId, "📝 Podaj opis produktu:", { remove_keyboard: true });
               }
               break;

            case "DESCRIPTION_FOR_AI":
              await sendMessage(chatId, "🤖 Ulepszam opis... Proszę czekać.");
              
              // Call AI Action to improve description
              // @ts-ignore
              const improvedDescription = await ctx.runAction(internal.ai.generateProductDescription, {
                name: session.productData.name || "Produkt",
                imageUrl: text // Using text as the base description to improve
              });

              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: "CATEGORY",
                updates: { 
                  description: improvedDescription
                }
              });

              const categoryKeyboardAI = {
                keyboard: [
                  [{ text: "art" }, { text: "decor" }],
                  [{ text: "functional" }, { text: "gadgets" }],
                  [{ text: "other" }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
              };

              await sendMessage(chatId, `✨ *Ulepszony opis:*\n${improvedDescription}\n\n📂 Wybierz kategorię:`, categoryKeyboardAI);
              break;

            case "DESCRIPTION":
              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: "CATEGORY",
                updates: { description: text }
              });
              
              const categoryKeyboardManual = {
                keyboard: [
                  [{ text: "art" }, { text: "decor" }],
                  [{ text: "functional" }, { text: "gadgets" }],
                  [{ text: "other" }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
              };
              
              await sendMessage(chatId, "📂 Wybierz kategorię:", categoryKeyboardManual);
              break;

            case "CATEGORY":
              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: "PRICE",
                updates: { category: text.toLowerCase() }
              });
              
              // Remove keyboard by sending a new one or removing it
              const removeKeyboard = { remove_keyboard: true };
              await sendMessage(chatId, "💰 Podaj cenę (PLN):", removeKeyboard);
              break;

            case "PRICE":
              const price = parseFloat(text.replace(",", "."));
              if (isNaN(price)) {
                await sendMessage(chatId, "❌ Cena musi być liczbą. Spróbuj ponownie:");
                return new Response("OK", { status: 200 });
              }
              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: "INVENTORY",
                updates: { price }
              });
              await sendMessage(chatId, "🔢 Podaj ilość sztuk w magazynie:");
              break;

            case "INVENTORY":
              const inventory = parseInt(text);
              if (isNaN(inventory)) {
                await sendMessage(chatId, "❌ Ilość musi być liczbą całkowitą. Spróbuj ponownie:");
                return new Response("OK", { status: 200 });
              }
              await ctx.runMutation(internal.telegram_db.updateSession, {
                chatId,
                step: "IMAGES",
                updates: { inventory }
              });
              await sendMessage(chatId, "📸 Wyślij zdjęcie produktu (możesz wysłać kilka pojedynczo).\n\nKiedy skończysz, wpisz /done");
              break;
              
            case "IMAGES":
              await sendMessage(chatId, "📸 Wyślij zdjęcie lub wpisz /done aby zakończyć.");
              break;
          }
        }

        // Handle Image Inputs
        if (message.photo) {
          if (session.step === "IMAGES" || session.step === "DESCRIPTION_AI_WAIT_IMAGE") {
            try {
              const photo = message.photo[message.photo.length - 1];
              const fileId = photo.file_id;

              const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileData = await fileRes.json();
              
              if (fileData.ok) {
                const filePath = fileData.result.file_path;
                const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
                
                const imageRes = await fetch(fileUrl);
                const imageBlob = await imageRes.blob();
                
                // Ensure we have a content type
                let blobToStore = imageBlob;
                if (!imageBlob.type || imageBlob.type === 'application/octet-stream') {
                   // Try to guess from file path extension
                   const ext = filePath.split('.').pop()?.toLowerCase();
                   let type = 'image/jpeg';
                   if (ext === 'png') type = 'image/png';
                   if (ext === 'webp') type = 'image/webp';
                   if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
                   
                   blobToStore = new Blob([await imageBlob.arrayBuffer()], { type });
                }

                const storageId = await ctx.storage.store(blobToStore);

                if (session.step === "DESCRIPTION_AI_WAIT_IMAGE") {
                  // AI Generation Flow
                  await sendMessage(chatId, "🤖 Generuję opis na podstawie zdjęcia... Proszę czekać.");
                  
                  // Call AI Action
                  // @ts-ignore
                  const description = await ctx.runAction(internal.ai.generateProductDescription, {
                    name: session.productData.name || "Produkt",
                    imageUrl: fileUrl
                  });

                  await ctx.runMutation(internal.telegram_db.updateSession, {
                    chatId,
                    step: "CATEGORY",
                    updates: { 
                      description: description,
                      images: [storageId] // Add this image as the first image
                    }
                  });

                  const categoryKeyboard = {
                    keyboard: [
                      [{ text: "art" }, { text: "decor" }],
                      [{ text: "functional" }, { text: "gadgets" }],
                      [{ text: "other" }]
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                  };

                  await sendMessage(chatId, `✨ *Wygenerowany opis:*\n${description}\n\n📂 Wybierz kategorię:`, categoryKeyboard);

                } else {
                  // Standard Image Upload Flow
                  await ctx.runMutation(internal.telegram_db.updateSession, {
                    chatId,
                    step: "IMAGES",
                    updates: { image: storageId }
                  });
                  await sendMessage(chatId, "✅ Zdjęcie dodane. Wyślij kolejne lub wpisz /done");
                }
              }
            } catch (e: any) {
              console.error(e);
              await sendMessage(chatId, "❌ Błąd podczas pobierania zdjęcia.");
            }
          }
        }

        // Handle Finish
        if (text === "/done" && session.step === "IMAGES") {
          const finalSession = await ctx.runQuery(internal.telegram_db.getSession, { chatId });
          if (!finalSession || !finalSession.productData.images || finalSession.productData.images.length === 0) {
            await sendMessage(chatId, "⚠️ Musisz dodać przynajmniej jedno zdjęcie!");
            return new Response("OK", { status: 200 });
          }

          const p = finalSession.productData;
          
          await ctx.runMutation(api.products.create, {
            name: p.name!,
            description: p.description!,
            category: p.category!,
            price: p.price!,
            inventory: p.inventory!,
            images: p.images!,
            featured: false,
          });

          await ctx.runMutation(internal.telegram_db.clearSession, { chatId });
          await sendMessage(chatId, `✅ *Produkt utworzony pomyślnie!*\n\n${p.name}\n${p.price} PLN`);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
});

export const setWebhook = httpAction(async (ctx, request) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.CONVEX_SITE_URL;

  if (!botToken || !siteUrl) {
    return new Response("Missing TELEGRAM_BOT_TOKEN or CONVEX_SITE_URL", { status: 500 });
  }

  const webhookUrl = `${siteUrl}/telegram/webhook`;
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
  const result = await response.json();

  return new Response(JSON.stringify(result), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});