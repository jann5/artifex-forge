import { Link } from "react-router";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getStorageUrl } from "@/lib/utils";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  price: number;
  image: string;
  category: string;
  inventory?: number;
}

export function ProductCard({ id, name, price, image, category, inventory }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const toggleFavorite = useMutation(api.favorites.toggle);
  const addToCart = useMutation(api.cart.add);
  const isFavorite = useQuery(api.favorites.isFavorite, { productId: id });

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Zaloguj się, aby dodać do ulubionych");
      return;
    }

    try {
      const added = await toggleFavorite({ productId: id });
      toast.success(added ? "Dodano do ulubionych" : "Usunięto z ulubionych");
    } catch (error) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Zaloguj się, aby dodać do koszyka");
      return;
    }

    try {
      await addToCart({ productId: id, quantity: 1 });
      toast.success("Dodano do kolekcji");
    } catch (error: any) {
      toast.error(error.message || "Nie udało się dodać");
    }
  };

  const imageUrl = getStorageUrl(image);
  const isOutOfStock = inventory !== undefined && inventory === 0;
  const isLowStock = inventory !== undefined && inventory > 0 && inventory <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <Link to={`/products/${id}`} className="block">
        {/* Image Container */}
        <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#F8F9FA] relative card-luxury">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "grayscale" : ""}`}
            onError={(e) => {
              const target = e.currentTarget;
              target.src = 'https://placehold.co/600x750/1B2A49/D4AF37?text=Produkt';
            }}
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A49]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[#1B2A49]/60 flex items-center justify-center z-10">
              <span className="text-white font-bold text-sm uppercase tracking-[0.2em] border-2 border-white/80 px-4 py-1.5 rounded-full">
                Wyprzedane
              </span>
            </div>
          )}

          {/* Low stock badge */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 rounded-full bg-[#C1272D] text-white text-xs font-semibold tracking-wide">
                Ostatnie {inventory} szt.
              </span>
            </div>
          )}
          
          {/* Favorite button */}
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="secondary"
              size="icon"
              className={`h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm transition-all ${
                isFavorite ? "text-[#C1272D]" : "text-[#1B2A49]/50"
              }`}
              onClick={handleFavorite}
              aria-label={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Quick actions on hover */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {!isOutOfStock && (
              <Button
                size="sm"
                className="flex-1 bg-[#C1272D] hover:bg-[#9E1F24] text-white rounded-full h-10 text-xs font-semibold tracking-wide shadow-lg"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Dodaj do Kolekcji
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex-shrink-0"
              aria-label="Podgląd"
            >
              <Eye className="h-4 w-4 text-[#1B2A49]" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-1.5">
          <p className="text-xs text-[#D4AF37] uppercase tracking-[0.15em] font-semibold">
            {category}
          </p>
          <h3 className="font-semibold text-[#1B2A49] text-base leading-tight group-hover:text-[#C1272D] transition-colors line-clamp-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {name}
          </h3>
          <p className="font-bold text-[#C1272D] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            {formatCurrency(price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}