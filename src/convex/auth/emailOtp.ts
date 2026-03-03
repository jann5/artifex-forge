import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // Always log to Convex dashboard for debugging
    console.log(`\n========== KOD OTP ==========\nEmail: ${email}\nKod: ${token}\n=============================\n`);

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return;
    }

    const appName = process.env.VLY_APP_NAME || "ESSENTIA";
    
    try {
      // Use fetch directly instead of the Resend SDK to avoid bundling issues
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "biuro@auralasu.pl",
          to: email,
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
                    <div class="logo">ESSENTIA</div>
                    <p style="color: #6B7280; margin: 0;">Witaj w ${appName}</p>
                  </div>
                  
                  <h2 style="color: #1E293B; margin-bottom: 20px;">Twój kod weryfikacyjny</h2>
                  
                  <p>Otrzymaliśmy prośbę o zalogowanie się do Twojego konta. Użyj poniższego kodu, aby dokończyć proces weryfikacji:</p>
                  
                  <div class="code-container">
                    <div class="code">${token}</div>
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
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send verification email via Resend API:", error);
        return;
      }

      const result = await response.json();
      console.log(`Verification email sent to ${email}`, result);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  },
});