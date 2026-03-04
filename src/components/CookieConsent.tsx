import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="bg-card border-2 border-border rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Cookie className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Używamy plików cookie</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ta strona używa plików cookie, aby zapewnić najlepsze doświadczenie użytkownika. 
                    Kontynuując przeglądanie, zgadzasz się na ich użycie. 
                    <Link to="/privacy" className="text-primary hover:underline ml-1">
                      Dowiedz się więcej
                    </Link>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button
                    onClick={acceptCookies}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Akceptuję
                  </Button>
                  <Button
                    onClick={declineCookies}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Odrzuć
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
