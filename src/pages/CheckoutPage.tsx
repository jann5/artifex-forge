import { Navbar } from "@/components/Navbar";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartItems = useQuery(api.cart.get);
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Zaloguj się, aby przejść do kasy</h1>
          <Button onClick={() => navigate("/auth")}>Zaloguj się</Button>
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Kasa</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Podsumowanie Zamówienia</h2>
              {cartItems?.length === 0 ? (
                <p className="text-muted-foreground">Twój koszyk jest pusty</p>
              ) : (
                <div className="space-y-4">
                  {cartItems?.map((item) => (
                    <div key={item._id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="h-20 w-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] && (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product?.name}</h3>
                        <p className="text-sm text-muted-foreground">Ilość: {item.quantity}</p>
                        <p className="font-semibold mt-1">
                          {formatCurrency((item.product?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-card border rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Szczegóły Płatności</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suma częściowa</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wysyłka</span>
                  <span>Darmowa</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Razem</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleCheckout}
                disabled={!cartItems?.length || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Przetwarzanie...
                  </>
                ) : (
                  "Przejdź do Płatności"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Bezpieczna płatność obsługiwana przez Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}