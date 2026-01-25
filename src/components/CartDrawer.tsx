import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
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
          <Button variant="ghost" size="icon" className="relative hover:bg-secondary/20 transition-colors">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-2xl font-display">Twój Koszyk</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center p-6">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Zaloguj się, aby robić zakupy</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Aby dodać produkty do koszyka i sfinalizować zamówienie, musisz posiadać konto.
              </p>
            </div>
            <Button onClick={() => navigate("/auth")} className="w-full max-w-xs" size="lg">
              Zaloguj się / Zarejestruj
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-secondary/20 transition-colors">
          <ShoppingCart className="h-5 w-5" />
          {cartItems && cartItems.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-bold text-primary-foreground flex items-center justify-center border-2 border-background"
            >
              {cartItems.length}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 gap-0">
        <SheetHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-display flex items-center gap-2">
              Koszyk <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">{cartItems?.length || 0}</Badge>
            </SheetTitle>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6">
          {cartItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
              <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Twój koszyk jest pusty</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Wygląda na to, że nie dodałeś jeszcze żadnych produktów.
                </p>
              </div>
              <SheetClose asChild>
                <Button variant="outline" onClick={() => navigate("/products")}>
                  Wróć do sklepu
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <AnimatePresence mode="popLayout">
                {cartItems?.map((item) => (
                  <motion.div 
                    key={item._id} 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 group"
                  >
                    <div className="h-24 w-24 rounded-xl bg-muted overflow-hidden flex-shrink-0 border shadow-sm">
                      {item.product?.images?.[0] && (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-medium leading-tight line-clamp-2">{item.product?.name}</h4>
                          <button 
                            onClick={() => remove({ id: item._id })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{item.product?.category}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-1 border">
                          <button 
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-50"
                            onClick={() => updateQuantity({ id: item._id, quantity: item.quantity - 1 })}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                            onClick={() => updateQuantity({ id: item._id, quantity: item.quantity + 1 })}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatCurrency((item.product?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {cartItems && cartItems.length > 0 && (
          <div className="p-6 bg-muted/10 border-t space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Suma częściowa</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Wysyłka</span>
                <span className="text-green-600 font-medium">Darmowa</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Razem</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Button className="w-full h-12 text-base" size="lg" onClick={handleCheckout}>
              Przejdź do kasy <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}