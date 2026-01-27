"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

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

    const resend = new Resend(resendApiKey);
    const siteUrl = process.env.CONVEX_SITE_URL || "https://artifex-forge.vercel.app";

    try {
      await resend.emails.send({
        from: "Artifex Forge <noreply@artifexforge.com>",
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
              Artifex Forge - Profesjonalny Druk 3D<br>
              © ${new Date().getFullYear()} Wszelkie prawa zastrzeżone
            </p>
          </div>
        `,
      });

      console.log(`Quote email sent to ${args.customerEmail} for order ${args.orderId}`);
    } catch (error) {
      console.error("Failed to send quote email:", error);
    }
  },
});