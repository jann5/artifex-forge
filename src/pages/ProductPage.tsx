import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag, X, ZoomIn, Clock, ChevronRight, Shield, Truck, RotateCcw, Award } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getStorageUrl } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Reviews } from "@/components/Reviews";
import { formatDeliveryDate } from "@/lib/delivery";
import { motion } from "framer-motion";
import { fadeInUp, fadeInLeft, fadeInRight } from "@/hooks/use-animations";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useQuery(api.products.get, { id: id as Id<"products"> });
  const addToCart = useMutation(api.cart.add);
  const recordView = useMutation(api.recent.record);
  const { isAuthenticated } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (product && isAuthenticated) {
      recordView({ productId: product._id });
    }
  }, [product, isAuthenticated, recordView]);

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="container mx-auto px-4 py-20 pt-28">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div className="aspect-[4/5] bg-[#1B2A49]/5 rounded-2xl skeleton-shimmer" />
            <div className="space-y-6 pt-8">
              <div className="h-4 bg-[#D4AF37]/20 rounded-full w-1/4" />
              <div className="h-10 bg-[#1B2A49]/10 rounded-lg w-3/4" />
              <div className="h-8 bg-[#C1272D]/10 rounded-lg w-1/3" />
              <div className="h-24 bg-[#1B2A49]/5 rounded-lg w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="container mx-auto px-4 py-20 pt-28 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-[#1B2A49]/5 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8 text-[#1B2A49]/20" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B2A49] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Produkt nie znaleziony
            </h1>
            <p className="text-[#1B2A49]/50 mb-6">Ten produkt może już nie być dostępny.</p>
            <Button asChild className="rounded-full bg-[#C1272D] hover:bg-[#9E1F24]">
              <Link to="/products">Wróć do Kolekcji</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.inventory === 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 5;
  const maxQuantity = product.inventory;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Zaloguj się, aby dodać produkty do koszyka");
      return;
    }

    if (isOutOfStock) {
      toast.error("Produkt jest niedostępny");
      return;
    }

    try {
      await addToCart({ 
        productId: product._id, 
        quantity 
      });
      toast.success("Dodano do kolekcji");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się dodać do koszyka");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20 pt-28">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm mb-8">
          <Link to="/" className="text-[#1B2A49]/50 hover:text-[#C1272D] transition-colors">
            Strona Główna
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#1B2A49]/30" />
          <Link to="/products" className="text-[#1B2A49]/50 hover:text-[#C1272D] transition-colors">
            Kolekcja
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#1B2A49]/30" />
          <span className="text-[#1B2A49] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Image Gallery */}
          <motion.div 
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div 
              className="aspect-[4/5] bg-white rounded-2xl overflow-hidden relative border border-[#1B2A49]/5 shadow-sm group cursor-pointer" 
              onClick={() => setIsImageModalOpen(true)}
            >
              <img 
                src={getStorageUrl(product.images[activeImage])} 
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "grayscale" : ""}`}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = 'https://placehold.co/600x750/1B2A49/D4AF37?text=Produkt';
                }}
              />
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-[#1B2A49]/60 flex items-center justify-center">
                  <span className="text-white font-bold text-xl uppercase tracking-[0.2em] border-2 border-white/80 px-6 py-2 rounded-full">Wyprzedane</span>
                </div>
              )}
              
              {isLowStock && !isOutOfStock && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-4 py-1.5 rounded-full bg-[#C1272D] text-white text-xs font-semibold tracking-wide">
                    Ostatnie {product.inventory} szt.
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                  <ZoomIn className="h-6 w-6 text-[#1B2A49]" />
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      activeImage === idx ? "border-[#C1272D] ring-2 ring-[#C1272D]/20" : "border-transparent"
                    }`}
                  >
                    <img 
                      src={getStorageUrl(img)} 
                      alt={`Widok ${idx + 1}`} 
                      className={`w-full h-full object-cover ${isOutOfStock ? "grayscale" : ""}`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/100x100/1B2A49/D4AF37';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div 
            variants={fadeInRight}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center"
          >
            <div className="mb-8">
              <span className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] font-semibold">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-5 text-[#1B2A49] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-[#C1272D]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {formatCurrency(product.price)}
                </p>
                {!isOutOfStock && (
                  <p className="text-sm text-[#1B2A49]/40">
                    Dostępne: {product.inventory} szt.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8 text-[#1B2A49]/70 leading-relaxed text-base">
              <p>{product.description}</p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="font-medium text-[#1B2A49] text-sm uppercase tracking-wider">Ilość</span>
                <div className="flex items-center gap-1 border border-[#1B2A49]/10 rounded-xl p-1 bg-white">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-lg hover:bg-[#1B2A49]/5"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg text-[#1B2A49]">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-lg hover:bg-[#1B2A49]/5"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity || isOutOfStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-base font-bold rounded-xl bg-[#C1272D] hover:bg-[#9E1F24] text-white shadow-lg hover:shadow-xl transition-all"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> 
                {isOutOfStock ? "Wyprzedane" : "Dodaj do Kolekcji"}
              </Button>
              
              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#1B2A49]/5">
                  <Shield className="h-5 w-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs text-[#1B2A49]/60">Bezpieczna płatność</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#1B2A49]/5">
                  <Truck className="h-5 w-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs text-[#1B2A49]/60">Darmowa wysyłka od 400 zł</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#1B2A49]/5">
                  <RotateCcw className="h-5 w-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs text-[#1B2A49]/60">30-dniowe zwroty</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#1B2A49]/5">
                  <Award className="h-5 w-5 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-xs text-[#1B2A49]/60">Certyfikat autentyczności</span>
                </div>
              </div>
              
              {/* Delivery estimate */}
              <div className="p-5 bg-white rounded-xl border border-[#1B2A49]/5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4.5 w-4.5 text-[#C1272D]" />
                  <h3 className="font-semibold text-[#1B2A49] text-sm">Szacowany czas dostawy</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#1B2A49]/50">📦 InPost Paczkomat</span>
                    <span className="font-medium text-[#1B2A49]">{formatDeliveryDate(1)} - {formatDeliveryDate(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1B2A49]/50">🚚 Kurier</span>
                    <span className="font-medium text-[#1B2A49]">{formatDeliveryDate(2)} - {formatDeliveryDate(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto border-t border-[#1B2A49]/10 pt-12"
        >
          <Reviews productId={product._id} />
        </motion.div>
      </main>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent 
          showCloseButton={false}
          className="!max-w-none !w-screen !h-screen !p-0 !m-0 !rounded-none !border-none bg-[#1B2A49]/95 !translate-x-0 !translate-y-0 !top-0 !left-0 flex items-center justify-center overflow-hidden"
        >
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={getStorageUrl(product.images[activeImage])}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = 'https://placehold.co/1200x1500/1B2A49/D4AF37?text=Produkt';
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-[#1B2A49]/80 backdrop-blur-sm p-2.5 rounded-xl">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? "border-[#D4AF37]" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getStorageUrl(img)}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}