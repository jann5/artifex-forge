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
          
          // Answer callback
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              callback_query_id: callbackQuery.id, 
              text: `Status zmieniony na ${status}` 
            })
          });

          // Update message
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
        await sendMessage(chatId, "🤖 *Artifex Bot*\n\nKomendy:\n/addproduct - Rozpocznij dodawanie produktu\n/cancel - Anuluj dodawanie\n/help - Pomoc");
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

      // CONVERSATION FLOW
      if (session) {
        // Handle Text Inputs
        if (text && !text.startsWith("/")) {
          switch (session.step) {
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
            } catch (e) {
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