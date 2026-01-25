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
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Koszyk <Badge variant="secondary">{cartItems?.length || 0}</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          {cartItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center space-y-4 mt-10">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">Twój koszyk jest pusty.</p>
              <SheetClose asChild>
                <Button variant="outline" onClick={() => navigate("/products")}>
                  Wróć do sklepu
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <div key={item._id} className="flex gap-4 py-2">
                  <div className="h-20 w-20 rounded-md bg-muted overflow-hidden flex-shrink-0 border">
                    {item.product?.images?.[0] && (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-2">{item.product?.name}</h4>
                      <button 
                        onClick={() => remove({ id: item._id })}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{item.product?.category}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded-md p-0.5">
                        <button 
                          className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-sm"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <button 
                          className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-sm"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-semibold text-sm">
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
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Suma</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Przejdź do kasy <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}