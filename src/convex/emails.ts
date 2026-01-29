"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendCustomOrderQuoteEmail = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    projectName: v.string(),
    estimatedPrice: v.number(),
    orderId: v.id("customOrders"),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return;
    }

    const siteUrl = process.env.CONVEX_SITE_URL || "https://essentia.vercel.app";

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ESSENTIA <noreply@essentia.com>",
          to: args.customerEmail,
          subject: `Wycena gotowa: ${args.projectName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E293B;">Wycena Twojego Projektu</h2>
              <p>Cześć ${args.customerName},</p>
              <p>Przygotowaliśmy wycenę dla Twojego projektu <strong>${args.projectName}</strong>.</p>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1E293B;">Szacowana Cena</h3>
                <p style="font-size: 32px; font-weight: bold; color: #F59E0B; margin: 10px 0;">${args.estimatedPrice} PLN</p>
              </div>
              
              <p>Możesz teraz zaakceptować wycenę i przejść do płatności, odwiedzając stronę swojego zamówienia:</p>
              
              <a href="${siteUrl}/orders" style="display: inline-block; background-color: #1E293B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Zobacz Zamówienie
              </a>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Jeśli masz pytania, skontaktuj się z nami odpowiadając na tego maila.
              </p>
              
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
              
              <p style="color: #9CA3AF; font-size: 12px;">
                ESSENTIA - Profesjonalny Druk 3D<br>
                © ${new Date().getFullYear()} Wszelkie prawa zastrzeżone
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send email via Resend API:", error);
        return;
      }

      const result = await response.json();
      console.log(`Quote email sent to ${args.customerEmail} for order ${args.orderId}`, result);
    } catch (error) {
      console.error("Failed to send quote email:", error);
    }
  },
});

export const sendOrderStatusEmail = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    orderId: v.string(),
    status: v.string(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return;
    }

    const siteUrl = process.env.CONVEX_SITE_URL || "https://essentia.vercel.app";

    const statusMessages: Record<string, { title: string; message: string; emoji: string }> = {
      pending: {
        title: "Zamówienie oczekuje na płatność",
        message: "Twoje zamówienie zostało utworzone i oczekuje na płatność.",
        emoji: "⏳"
      },
      paid: {
        title: "Płatność potwierdzona",
        message: "Otrzymaliśmy Twoją płatność. Rozpoczynamy realizację zamówienia.",
        emoji: "✅"
      },
      shipped: {
        title: "Zamówienie wysłane",
        message: "Twoje zamówienie zostało wysłane i jest w drodze do Ciebie.",
        emoji: "🚚"
      },
      delivered: {
        title: "Zamówienie dostarczone",
        message: "Twoje zamówienie zostało dostarczone. Dziękujemy za zakupy!",
        emoji: "📦"
      },
      cancelled: {
        title: "Zamówienie anulowane",
        message: "Twoje zamówienie zostało anulowane.",
        emoji: "❌"
      }
    };

    const statusInfo = statusMessages[args.status] || statusMessages.pending;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ESSENTIA <noreply@essentia.com>",
          to: args.customerEmail,
          subject: `${statusInfo.emoji} ${statusInfo.title} - Zamówienie #${args.orderId.slice(-8)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E293B;">${statusInfo.emoji} ${statusInfo.title}</h2>
              <p>Cześć ${args.customerName},</p>
              <p>${statusInfo.message}</p>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1E293B;">Szczegóły Zamówienia</h3>
                <p style="margin: 5px 0;"><strong>Numer zamówienia:</strong> #${args.orderId.slice(-8)}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${statusInfo.title}</p>
                <p style="margin: 5px 0;"><strong>Wartość:</strong> ${args.totalAmount} PLN</p>
              </div>
              
              <p>Możesz sprawdzić szczegóły swojego zamówienia w panelu klienta:</p>
              
              <a href="${siteUrl}/orders" style="display: inline-block; background-color: #1E293B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Zobacz Zamówienie
              </a>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
                Jeśli masz pytania, skontaktuj się z nami odpowiadając na tego maila.
              </p>
              
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
              
              <p style="color: #9CA3AF; font-size: 12px;">
                ESSENTIA - Profesjonalny Druk 3D<br>
                © ${new Date().getFullYear()} Wszelkie prawa zastrzeżone
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send status email via Resend API:", error);
        return;
      }

      const result = await response.json();
      console.log(`Status email sent to ${args.customerEmail} for order ${args.orderId}`, result);
    } catch (error) {
      console.error("Failed to send status email:", error);
    }
  },
});