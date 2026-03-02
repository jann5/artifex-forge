import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useNavigate, useSearchParams } from "react-router";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { TerminalWindow } from "@/components/retro/TerminalWindow";
import { TypeWriter } from "@/components/retro/TypeWriter";
import { LoadingBar } from "@/components/retro/LoadingBar";
import { BlinkingCursor } from "@/components/retro/BlinkingCursor";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const confetti = (() => { try { return require("canvas-confetti"); } catch { return null; } })()?.default ?? null;

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const verifyPayment = useAction(api.stripe.verifyPayment);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setStatus("error");
        setErrorMessage("Brak identyfikatora sesji płatności");
        toast.error("Nieprawidłowy link potwierdzenia płatności");
        return;
      }

      try {
        const result = await verifyPayment({ sessionId });
        if (result.success) {
          setStatus("success");
          triggerConfetti();
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Nie udało się potwierdzić płatności");
          toast.error("Nie udało się potwierdzić płatności. Skontaktuj się z obsługą.");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("error");
        setErrorMessage("Wystąpił błąd podczas weryfikacji płatności");
        toast.error("Wystąpił błąd podczas weryfikacji płatności.");
      }
    };

    verify();
  }, [sessionId, verifyPayment]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen bg-black font-terminal flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {status === "loading" && (
            <TerminalWindow title="STRIPE.EXE — VERIFYING PAYMENT">
              <div className="py-6">
                <LoadingBar label="VERIFYING PAYMENT SESSION..." duration={4000} />
              </div>
            </TerminalWindow>
          )}

          {status === "success" && (
            <TerminalWindow title="PAYMENT.EXE — TRANSACTION COMPLETE" accent="green">
              <TypeWriter
                lines={[
                  "STRIPE PAYMENT GATEWAY v3.2",
                  "",
                  "TRANSACTION ID: " + (sessionId?.slice(0, 20) ?? "N/A") + "...",
                  "STATUS: APPROVED",
                  "AMOUNT: CHARGED SUCCESSFULLY",
                  "",
                  ">>> DOWNLOAD COMPLETE <<<",
                  "",
                  "Dziękujemy za zakupy!",
                  "Twoje zamówienie zostało przyjęte.",
                  "Powiadomienie email wkrótce.",
                  "",
                  "THANK YOU FOR SHOPPING WITH US.",
                ]}
                speed={25}
                lineDelay={100}
                className="text-[13px] text-phosphor"
              />
              <div className="flex gap-3 mt-6 flex-wrap">
                <button onClick={() => navigate("/orders")} className="btn-retro-inverted text-[9px] py-2 px-4">
                  📦 MY_ORDERS.DAT
                </button>
                <button onClick={() => navigate("/")} className="btn-retro text-[9px] py-2 px-4">
                  ← C:\HOME
                </button>
              </div>
            </TerminalWindow>
          )}

          {status === "error" && (
            <TerminalWindow title="ERROR.SYS — PAYMENT FAILED" accent="magenta">
              <TypeWriter
                lines={[
                  "*** STRIPE PAYMENT ERROR ***",
                  "",
                  "TRANSACTION FAILED",
                  errorMessage || "PAYMENT COULD NOT BE VERIFIED",
                  "",
                  sessionId ? `SESSION: ${sessionId.slice(0, 30)}...` : "",
                  "",
                  "If charged, contact support with session ID.",
                ]}
                speed={25}
                lineDelay={100}
                className="text-[13px]"
                style={{ color: "#ff0040" } as React.CSSProperties}
              />
              <div className="flex gap-3 mt-6 flex-wrap">
                <button onClick={() => window.location.reload()} className="btn-retro text-[9px] py-2 px-4" style={{ borderColor: "#ff0040", color: "#ff0040" }}>
                  ↺ RETRY
                </button>
                <button onClick={() => navigate("/contact")} className="btn-retro text-[9px] py-2 px-4">
                  CONTACT.SYS
                </button>
              </div>
            </TerminalWindow>
          )}
        </div>
      </main>
    </div>
  );
}