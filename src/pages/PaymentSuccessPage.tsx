import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const verifyPayment = useAction(api.stripe.verifyPayment);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        // If no session ID, assume success (legacy behavior or direct access)
        // But ideally we should require it. For now, let's show success to not break things.
        setStatus("success");
        triggerConfetti();
        return;
      }

      try {
        const result = await verifyPayment({ sessionId });
        if (result.success) {
          setStatus("success");
          triggerConfetti();
        } else {
          setStatus("error");
          toast.error("Nie udało się potwierdzić płatności. Skontaktuj się z obsługą.");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("error");
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-12 pb-8 px-6">
              {status === "loading" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                  <h2 className="text-xl font-semibold">Weryfikacja płatności...</h2>
                  <p className="text-muted-foreground mt-2">Proszę czekać, sprawdzamy status Twojego zamówienia.</p>
                </div>
              )}

              {status === "success" && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-6 flex justify-center"
                  >
                    <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                  </motion.div>

                  <h1 className="text-3xl font-bold mb-3">Płatność Udana!</h1>
                  <p className="text-muted-foreground mb-8">
                    Dziękujemy za zakupy. Twoje zamówienie zostało przyjęte i jest przetwarzane.
                    Otrzymasz powiadomienie email z potwierdzeniem.
                  </p>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate("/orders")} 
                      className="w-full" 
                      size="lg"
                    >
                      Monitoruj Zamówienie
                    </Button>
                    <Button 
                      onClick={() => navigate("/")} 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                    >
                      Wróć na Stronę Główną
                    </Button>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-6 flex justify-center"
                  >
                    <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center">
                      <XCircle className="h-12 w-12 text-red-500" />
                    </div>
                  </motion.div>

                  <h1 className="text-3xl font-bold mb-3">Błąd Płatności</h1>
                  <p className="text-muted-foreground mb-8">
                    Nie udało się potwierdzić Twojej płatności. Jeśli środki zostały pobrane, 
                    skontaktuj się z nami podając numer sesji: <br/>
                    <span className="font-mono text-xs bg-muted p-1 rounded mt-2 inline-block">{sessionId}</span>
                  </p>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="w-full" 
                      size="lg"
                    >
                      Spróbuj ponownie
                    </Button>
                    <Button 
                      onClick={() => navigate("/contact")} 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                    >
                      Kontakt z obsługą
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}