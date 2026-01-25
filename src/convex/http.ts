import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { Resend } from "resend";

const http = httpRouter();

auth.addHttpRoutes(http);

// Add endpoint for sending verification emails
http.route({
  path: "/sendVerificationEmail",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { to, code } = await req.json();
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const appName = process.env.VLY_APP_NAME || "Artifex Forge";
    
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "biuro@auralasu.pl",
        to,
        subject: `Twój kod weryfikacyjny - ${appName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: #ffffff;
                  border-radius: 8px;
                  padding: 40px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .logo {
                  font-size: 32px;
                  font-weight: bold;
                  color: #1E293B;
                  margin-bottom: 10px;
                }
                .code-container {
                  background: #F3F4F6;
                  border-radius: 8px;
                  padding: 30px;
                  text-align: center;
                  margin: 30px 0;
                }
                .code {
                  font-size: 36px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  color: #1E293B;
                  font-family: 'Courier New', monospace;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  font-size: 14px;
                  color: #6B7280;
                }
                .warning {
                  background: #FEF3C7;
                  border-left: 4px solid #F59E0B;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Artifex</div>
                  <p style="color: #6B7280; margin: 0;">Witaj w ${appName}</p>
                </div>
                
                <h2 style="color: #1E293B; margin-bottom: 20px;">Twój kod weryfikacyjny</h2>
                
                <p>Otrzymaliśmy prośbę o zalogowanie się do Twojego konta. Użyj poniższego kodu, aby dokończyć proces weryfikacji:</p>
                
                <div class="code-container">
                  <div class="code">${code}</div>
                </div>
                
                <p>Ten kod wygaśnie za <strong>15 minut</strong>.</p>
                
                <div class="warning">
                  <strong>⚠️ Uwaga:</strong> Jeśli nie próbowałeś się zalogować, zignoruj tę wiadomość. Twoje konto pozostaje bezpieczne.
                </div>
                
                <div class="footer">
                  <p>Pozdrawiamy,<br>Zespół ${appName}</p>
                  <p style="margin-top: 20px; font-size: 12px;">
                    Ta wiadomość została wysłana automatycznie. Prosimy nie odpowiadać na ten email.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;