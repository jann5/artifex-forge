import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const webhook = httpAction(async (ctx, request) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return new Response("Bot token not configured", { status: 500 });
  }

  try {
    const body = await request.json();
    
    // Handle Callback Queries (Buttons)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data;
      const message = callbackQuery.message;
      
      // Format: update_status:ORDER_ID:STATUS
      if (data && data.startsWith("update_status:")) {
        const parts = data.split(":");
        if (parts.length === 3) {
          const orderId = parts[1] as Id<"orders">;
          const status = parts[2];
          
          // Update in Convex
          await ctx.runMutation(internal.orders.updateStatusInternal, {
            orderId: orderId,
            status: status as any,
          });
          
          // Answer callback (stop loading animation)
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              callback_query_id: callbackQuery.id, 
              text: `Status zmieniony na ${status}` 
            })
          });

          // Update the message text to reflect the new status
          const originalText = message.text || "";
          const updatedText = originalText.replace(/Status: .*/, `Status: ${status}`);

          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              text: updatedText,
              reply_markup: message.reply_markup
            })
          });
        }
      }
    }

    // Handle Messages (Commands)
    if (body.message) {
      const message = body.message;
      const chatId = message.chat.id;
      const text = message.text || message.caption || "";

      // Help / Start command
      if (text.startsWith("/start") || text.startsWith("/help")) {
         await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "🤖 *Artifex Bot*\n\nMożesz zarządzać zamówieniami i dodawać produkty.\n\n*Dodawanie produktu:*\nWyślij zdjęcie z podpisem:\n`/addproduct Nazwa; Cena; Kategoria; Opis`\n\nPrzykład:\n`/addproduct Wazon; 150; decor; Piękny wazon`",
              parse_mode: "Markdown"
            }),
          });
      }

      // Add Product Command
      if (text.startsWith("/addproduct")) {
        // Verify if user is admin (simple check against env var if set, or allow all for now as requested)
        // Ideally we should check if chatId matches TELEGRAM_CHAT_ID
        const adminChatId = process.env.TELEGRAM_CHAT_ID;
        if (adminChatId && String(chatId) !== String(adminChatId)) {
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "⛔ Brak uprawnień. Tylko administrator może dodawać produkty.",
                }),
              });
              return new Response("OK", { status: 200 });
        }

        if (!message.photo || message.photo.length === 0) {
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "❌ Proszę dołączyć zdjęcie do produktu (wyślij jako zdjęcie, nie plik).",
                }),
              });
              return new Response("OK", { status: 200 });
        }

        // Parse details
        const content = text.replace("/addproduct", "").trim();
        const parts = content.split(";").map((p: string) => p.trim());
        
        if (parts.length < 2) {
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "❌ Nieprawidłowy format.\nUżyj: `/addproduct Nazwa; Cena; Kategoria; Opis`",
                  parse_mode: "Markdown"
                }),
              });
              return new Response("OK", { status: 200 });
        }

        const name = parts[0];
        const price = parseFloat(parts[1]);
        const category = parts[2] || "decor";
        const description = parts[3] || "Dodano przez Telegram";

        if (isNaN(price)) {
             await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "❌ Cena musi być liczbą.",
                }),
              });
              return new Response("OK", { status: 200 });
        }

        try {
            // Get the largest photo
            const photo = message.photo[message.photo.length - 1];
            const fileId = photo.file_id;

            // Get file path
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
            const fileData = await fileRes.json();
            
            if (!fileData.ok) {
                throw new Error("Failed to get file path from Telegram");
            }

            const filePath = fileData.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

            // Download file
            const imageRes = await fetch(fileUrl);
            const imageBlob = await imageRes.blob();

            // Store in Convex
            const storageId = await ctx.storage.store(imageBlob);

            // Create product
            await ctx.runMutation(api.products.create, {
                name,
                price,
                category,
                description,
                images: [storageId],
                inventory: 10,
                featured: false,
            });

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `✅ *Produkt dodany pomyślnie!*\n\n📦 ${name}\n💰 ${price} PLN\n📂 ${category}`,
                  parse_mode: "Markdown"
                }),
            });
        } catch (error: any) {
            console.error("Error adding product via Telegram:", error);
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `❌ Błąd podczas dodawania produktu: ${error.message}`,
                }),
            });
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
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