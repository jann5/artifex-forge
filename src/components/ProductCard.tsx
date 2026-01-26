import { Link } from "react-router";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
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

  const imageUrl = getStorageUrl(image);
  const isOutOfStock = inventory !== undefined && inventory === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link to={`/products/${id}`} className="block">
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-muted relative">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale" : ""}`}
            onError={(e) => {
              const target = e.currentTarget;
              console.error('Image failed to load:', target.src);
              target.src = 'https://placehold.co/600x750/f3f4f6/1f2937?text=Błąd+ładowania';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white font-bold text-sm uppercase tracking-widest border-2 border-white px-3 py-1">Wyprzedane</span>
            </div>
          )}
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors ${
                isFavorite ? "text-red-500" : "text-muted-foreground"
              }`}
              onClick={handleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {category}
          </p>
          <h3 className="font-medium text-lg leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="font-bold text-primary">
            {formatCurrency(price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}