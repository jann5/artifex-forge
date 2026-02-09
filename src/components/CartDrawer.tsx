import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { getStorageUrl } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 400;

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

  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

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
        <SheetContent className="border-l-[#1B2A49]/10">
          <SheetHeader>
            <SheetTitle className="text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Twoja Kolekcja</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="h-20 w-20 rounded-full bg-[#1B2A49]/5 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-[#1B2A49]/20" />
            </div>
            <p className="text-[#1B2A49]/50">
              Zaloguj się, aby rozpocząć kolekcjonowanie.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full rounded-xl bg-[#C1272D] hover:bg-[#9E1F24]">
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
            <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-[#C1272D] text-[10px] font-bold text-white flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg border-l-[#1B2A49]/10">
        <SheetHeader className="pb-4 border-b border-[#1B2A49]/10">
          <SheetTitle className="flex items-center justify-between text-xl">
            <span className="flex items-center gap-3 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>
              <div className="h-10 w-10 rounded-xl bg-[#C1272D]/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[#C1272D]" />
              </div>
              Twoja Kolekcja
            </span>
            <Badge className="bg-[#1B2A49] text-white text-sm px-3 py-1 rounded-full">
              {cartItems?.length || 0}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Free Shipping Progress Bar */}
        {cartItems && cartItems.length > 0 && (
          <div className="py-3 px-1">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-[#D4AF37]" />
              {remainingForFreeShipping > 0 ? (
                <p className="text-xs text-[#1B2A49]/60">
                  Dodaj produkty za <span className="font-bold text-[#C1272D]">{formatCurrency(remainingForFreeShipping)}</span> więcej do darmowej wysyłki
                </p>
              ) : (
                <p className="text-xs font-semibold text-emerald-600">
                  🎉 Darmowa wysyłka odblokowana!
                </p>
              )}
            </div>
            <div className="w-full h-1.5 bg-[#1B2A49]/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${shippingProgress}%`,
                  background: shippingProgress >= 100 
                    ? 'linear-gradient(90deg, #10B981, #059669)' 
                    : 'linear-gradient(90deg, #C1272D, #D4AF37)'
                }}
              />
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          {cartItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-6 mt-10">
              <div className="h-20 w-20 rounded-full bg-[#1B2A49]/5 flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-[#1B2A49]/15" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Twoja kolekcja jest pusta</p>
                <p className="text-sm text-[#1B2A49]/40">Odkryj unikalne pamiątki prezydenckie</p>
              </div>
              <SheetClose asChild>
                <Button size="lg" onClick={() => navigate("/products")} className="mt-4 rounded-xl bg-[#C1272D] hover:bg-[#9E1F24]">
                  Przeglądaj Kolekcję
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 rounded-xl bg-white border border-[#1B2A49]/5 hover:border-[#1B2A49]/10 transition-colors">
                  <div className="h-24 w-24 rounded-xl bg-[#F8F9FA] overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] && (
                      <img 
                        src={getStorageUrl(item.product.images[0])} 
                        alt={'name' in item.product ? item.product.name : item.product.projectName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-[#1B2A49] line-clamp-2 mb-0.5">
                          {item.product && 'name' in item.product 
                            ? item.product.name 
                            : item.product && 'projectName' in item.product 
                              ? item.product.projectName 
                              : 'Unknown'}
                        </h4>
                        <p className="text-xs text-[#D4AF37] uppercase tracking-wider font-medium">
                          {item.product && 'category' in item.product
                            ? item.product.category
                            : 'Zamówienie specjalne'}
                        </p>
                      </div>
                      <button 
                        onClick={() => remove({ id: item._id })}
                        className="h-8 w-8 rounded-full hover:bg-[#C1272D]/10 flex items-center justify-center text-[#1B2A49]/30 hover:text-[#C1272D] transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-[#1B2A49]/10 rounded-lg p-0.5">
                        <button 
                          className="h-7 w-7 flex items-center justify-center hover:bg-[#1B2A49]/5 rounded-md transition-colors"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-[#1B2A49]">{item.quantity}</span>
                        <button 
                          className="h-7 w-7 flex items-center justify-center hover:bg-[#1B2A49]/5 rounded-md transition-colors"
                          onClick={() => updateQuantity({ id: item._id, quantity: item.quantity + 1 })}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-bold text-[#C1272D]" style={{ fontFamily: "'Playfair Display', serif" }}>
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
          <div className="space-y-5 pt-5 border-t border-[#1B2A49]/10">
            <div className="space-y-3 p-4 rounded-xl bg-[#F8F9FA]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1B2A49]/50">Produkty</span>
                <span className="font-medium text-[#1B2A49]">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1B2A49]/50">Dostawa</span>
                <span className={`font-medium text-sm ${total >= FREE_SHIPPING_THRESHOLD ? "text-emerald-600" : "text-[#1B2A49]"}`}>
                  {total >= FREE_SHIPPING_THRESHOLD ? "Darmowa ✓" : formatCurrency(15)}
                </span>
              </div>
              <Separator className="bg-[#1B2A49]/10" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1B2A49]">Suma</span>
                <span className="text-2xl font-bold text-[#C1272D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {formatCurrency(total >= FREE_SHIPPING_THRESHOLD ? total : total + 15)}
                </span>
              </div>
            </div>
            <Button 
              className="w-full h-14 text-base font-bold rounded-xl bg-[#C1272D] hover:bg-[#9E1F24] text-white shadow-lg hover:shadow-xl transition-all"
              size="lg" 
              onClick={handleCheckout}
            >
              Przejdź do Kasy <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs text-center text-[#1B2A49]/30 flex items-center justify-center gap-2">
              <span className="px-1.5 py-0.5 bg-[#1B2A49]/5 rounded text-[10px]">VISA</span>
              <span className="px-1.5 py-0.5 bg-[#1B2A49]/5 rounded text-[10px]">MC</span>
              <span className="px-1.5 py-0.5 bg-[#1B2A49]/5 rounded text-[10px]">BLIK</span>
              <span className="px-1.5 py-0.5 bg-[#1B2A49]/5 rounded text-[10px]">P24</span>
              Bezpieczne płatności
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}