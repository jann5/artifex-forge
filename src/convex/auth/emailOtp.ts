import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { internal } from "../_generated/api";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    return generateRandomString(random, "0123456789", 6);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendVerificationRequest: (async (params: any, ctx: any) => {
    const { identifier: email, token } = params;

    console.log(`\n========== KOD OTP ==========\nEmail: ${email}\nKod: ${token}\n=============================\n`);

    try {
      await ctx.runMutation(internal.dev.saveDevOtp, { email, code: token });
    } catch (e) {
      console.log("Could not save dev OTP:", e);
    }

    const appName = "Artifex Forge";
    const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2>${appName}</h2>
      <p>Twój kod weryfikacyjny:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:10px;background:#f5f5f5;padding:24px;text-align:center;border-radius:8px;margin:24px 0">${token}</div>
      <p style="color:#888;font-size:13px">Kod wygaśnie za 15 minut.</p>
    </div>`;

    // 1. Brevo (primary — no domain needed, free 300/day)
    const brevoKey = process.env.BREVO_API_KEY;
    const brevoFrom = process.env.BREVO_FROM_EMAIL;
    if (brevoKey && brevoFrom) {
      try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: appName, email: brevoFrom },
            to: [{ email }],
            subject: `Kod weryfikacyjny - ${appName}`,
            htmlContent: html,
          }),
        });
        if (res.ok) { console.log("Email sent via Brevo"); return; }
        console.error("Brevo error:", await res.text());
      } catch (e) { console.error("Brevo fetch failed:", e); }
    }

    // 2. Resend (fallback)
    const resendKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: resendFrom, to: email, subject: `Kod weryfikacyjny - ${appName}`, html }),
        });
        if (res.ok) { console.log("Email sent via Resend"); return; }
        console.error("Resend error:", await res.text());
      } catch (e) { console.error("Resend fetch failed:", e); }
    }

    console.log("Brak skonfigurowanego providera email — sprawdz OTP w logach Convex powyzej.");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any,
});
