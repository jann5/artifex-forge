import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

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
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
