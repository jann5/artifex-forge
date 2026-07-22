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
import { getStorageUrl } from "@/lib/utils";

export function CartDrawer() {
  const { isAuthenticated } = useAuth();
  const cartItems = useQuery(api.cart.get);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const remove = useMutation(api.cart.remove);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const total = cartItems?.reduce((acc, item) => {
    const price = item.product && 'price' in item.product 
      ? item.product.price 
      : item.product && 'estimatedPrice' in item.product 
        ? (item.product.estimatedPrice || 0)
        : 0;
    return acc + price * item.quantity;
  }, 0) || 0;
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

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
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-16">
          <SheetTitle className="flex items-center gap-3 text-xl tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </span>
            Twój koszyk
            <span className="ml-auto whitespace-nowrap text-sm font-medium text-muted-foreground">
              {cartCount} {cartCount === 1 ? "produkt" : "produkty"}
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="max-h-[48vh] px-6 py-5">
          {cartItems?.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center space-y-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Koszyk jest pusty</p>
                <p className="text-sm text-muted-foreground">Wybierz coś z kolekcji.</p>
              </div>
              <SheetClose asChild>
                <Button onClick={() => navigate("/products")}>
                  Zobacz produkty
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <div key={item._id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-border/70 pb-4 last:border-0 last:pb-0">
                  <div className="h-[88px] w-[88px] overflow-hidden rounded-md bg-muted">
                    {item.product?.images?.[0] && (
                      <img 
                        src={getStorageUrl(item.product.images[0])} 
                        alt={'name' in item.product ? item.product.name : item.product.projectName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="mb-1 line-clamp-2 text-[15px] font-semibold leading-snug">
                          {item.product && 'name' in item.product 
                            ? item.product.name 
                            : item.product && 'projectName' in item.product 
                              ? item.product.projectName 
                              : 'Unknown'}
                        </h4>
                        <p className="text-xs capitalize text-muted-foreground">
                          {item.product && 'category' in item.product
                            ? item.product.category
                            : 'Zamówienie niestandardowe'}
                        </p>
                      </div>
                      <button 
                        onClick={() => remove({ id: item._id })}
                        aria-label="Usuń z koszyka"
                        className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-end justify-between gap-4 pt-3">
                      <div className="flex h-9 items-center rounded-md border bg-background">
                        <button 
                          aria-label="Zmniejsz ilość"
                          className="flex h-full w-9 items-center justify-center rounded-l-md transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button 
                          aria-label="Zwiększ ilość"
                          className="flex h-full w-9 items-center justify-center rounded-r-md transition-colors hover:bg-muted"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="whitespace-nowrap text-base font-semibold text-foreground">
                        {formatCurrency(
                          (item.product && 'price' in item.product 
                            ? item.product.price 
                            : item.product && 'estimatedPrice' in item.product 
                              ? (item.product.estimatedPrice || 0)
                              : 0) * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems && cartItems.length > 0 && (
          <div className="space-y-5 border-t bg-muted/20 px-6 py-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Produkty</span>
                <span className="text-sm font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dostawa</span>
                <span className="text-sm font-medium text-emerald-600">Darmowa</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Suma</span>
                <span className="text-xl font-bold text-foreground">{formatCurrency(total)}</span>
              </div>
            </div>
            <Button className="h-12 w-full text-base" size="lg" onClick={handleCheckout}>
              Przejdź do kasy <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Bezpieczne płatności przez Stripe
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
