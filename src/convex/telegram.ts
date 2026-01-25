import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const webhook = httpAction(async (ctx, request) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return new Response("Bot token not configured", { status: 500 });
  }

  try {
    const body = await request.json();
    
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
          // We keep the original text but update the status line
          const originalText = message.text || "";
          // Simple regex replace for the status line if it matches our format
          // Note: Telegram message.text doesn't have markdown formatting, it's plain text
          // We'll just append a confirmation line or try to update if possible.
          // Re-sending the same message structure with updated status is cleaner.
          
          const updatedText = originalText.replace(/Status: .*/, `Status: ${status}`);

          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: message.chat.id,
              message_id: message.message_id,
              text: updatedText,
              // Keep the keyboard so they can change it again if needed
              reply_markup: message.reply_markup
            })
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