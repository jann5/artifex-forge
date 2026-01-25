import { Navbar } from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function FavoritesPage() {
  const favorites = useQuery(api.favorites.list);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Ulubione Produkty
          </h1>

          {favorites === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">Brak ulubionych produktów</h2>
              <p className="text-muted-foreground mb-6">
                Zapisz produkty, które Ci się podobają, aby wrócić do nich później.
              </p>
              <Button onClick={() => navigate("/products")}>
                Przeglądaj Sklep
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {favorites.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images[0] || "https://placehold.co/400x500"}
                  category={product.category}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
