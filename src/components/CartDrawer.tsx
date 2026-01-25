import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { getStorageUrl } from "@/lib/utils";

export function CartDrawer() {
  const { isAuthenticated } = useAuth();
  const cartItems = useQuery(api.cart.get);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const remove = useMutation(api.cart.remove);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const total = cartItems?.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  if (!isAuthenticated) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Twój Koszyk</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Zaloguj się, aby robić zakupy.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Zaloguj się
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems && cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center justify-between text-2xl">
            <span className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              Twój Koszyk
            </span>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {cartItems?.length || 0}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6 my-6">
          {cartItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-6 mt-10">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Twój koszyk jest pusty</p>
                <p className="text-sm text-muted-foreground">Dodaj produkty, aby rozpocząć zakupy</p>
              </div>
              <SheetClose asChild>
                <Button size="lg" onClick={() => navigate("/products")} className="mt-4">
                  Przeglądaj Produkty
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems?.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="h-24 w-24 rounded-lg bg-background overflow-hidden flex-shrink-0 border shadow-sm">
                    {item.product?.images?.[0] && (
                      <img 
                        src={getStorageUrl(item.product.images[0])} 
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base line-clamp-2 mb-1">{item.product?.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{item.product?.category}</p>
                      </div>
                      <button 
                        onClick={() => remove({ id: item._id })}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-background border rounded-lg p-1">
                        <button 
                          className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button 
                          className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-bold text-lg text-primary">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems && cartItems.length > 0 && (
          <div className="space-y-6 pt-6 border-t">
            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Produkty</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dostawa</span>
                <span className="font-medium text-green-600">Darmowa</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Suma</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <Button className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all" size="lg" onClick={handleCheckout}>
              Przejdź do kasy <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Bezpieczne płatności przez Stripe
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}