import { Navbar } from "@/components/Navbar";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CreditCard, Truck, ArrowLeft, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartItems = useQuery(api.cart.get);
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-6">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Wymagane logowanie</h1>
            <p className="text-muted-foreground mb-6">
              Zaloguj się, aby bezpiecznie dokończyć zakupy i śledzić swoje zamówienie.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
              Zaloguj się
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const total = cartItems?.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Twój koszyk jest pusty");
      return;
    }

    setIsProcessing(true);
    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        name: item.product?.name || "Produkt",
        price: item.product?.price || 0,
        quantity: item.quantity,
        image: item.product?.images?.[0],
      }));

      const result = await createCheckout({ items });
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Nie udało się utworzyć sesji płatności");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Błąd płatności:", error);
      toast.error("Nie udało się przetworzyć płatności");
      setIsProcessing(false);
    }
  };

  if (cartItems === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded-xl" />
              </div>
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold font-display">Podsumowanie Zamówienia</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Order Items */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Produkty w koszyku ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {cartItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Twój koszyk jest pusty.
                      <Button variant="link" onClick={() => navigate("/products")}>Wróć do sklepu</Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cartItems.map((item) => (
                        <div key={item._id} className="p-6 flex gap-4 sm:gap-6 items-center">
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
                            {item.product?.images?.[0] && (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-lg truncate">{item.product?.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize mb-1">{item.product?.category}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary" className="font-normal">
                                Ilość: {item.quantity}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatCurrency((item.product?.price || 0) * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(item.product?.price || 0)} / szt.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Wszystkie transakcje są szyfrowane i bezpieczne. Gwarantujemy 100% satysfakcji lub zwrot pieniędzy.
                </p>
              </div>
            </div>

            {/* Right Column - Summary & Payment */}
            <div className="relative">
              <div className="sticky top-24 space-y-6">
                <Card className="border-2 border-primary/10 shadow-lg">
                  <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                    <CardTitle className="text-xl">Do zapłaty</CardTitle>
                    <CardDescription>Podsumowanie kosztów</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Wartość produktów</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Wysyłka</span>
                        <span className="text-green-600 font-medium">Darmowa</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Podatek VAT (23%)</span>
                        <span>wliczony</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg">Razem</span>
                      <span className="font-bold text-3xl text-primary">{formatCurrency(total)}</span>
                    </div>

                    <div className="pt-4">
                      <Button 
                        className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" 
                        size="lg" 
                        onClick={handleCheckout}
                        disabled={!cartItems?.length || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Przetwarzanie...
                          </>
                        ) : (
                          <>
                            Zapłać teraz <CreditCard className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 border-t p-4">
                    <div className="w-full flex justify-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                      {/* Payment Icons Placeholders - Text for now or SVGs if available */}
                      <span className="text-xs font-bold border px-2 py-1 rounded bg-background">VISA</span>
                      <span className="text-xs font-bold border px-2 py-1 rounded bg-background">Mastercard</span>
                      <span className="text-xs font-bold border px-2 py-1 rounded bg-background">BLIK</span>
                      <span className="text-xs font-bold border px-2 py-1 rounded bg-background">Przelewy24</span>
                    </div>
                  </CardFooter>
                </Card>
                
                <p className="text-xs text-center text-muted-foreground px-4">
                  Klikając "Zapłać teraz", zostaniesz przekierowany do bezpiecznej bramki płatności Stripe.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}