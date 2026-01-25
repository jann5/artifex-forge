import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function RecentPage() {
  const recentProducts = useQuery(api.recent.list);
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
            <Clock className="h-8 w-8" />
            Ostatnio Oglądane
          </h1>
          
          {recentProducts === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/10">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">Historia przeglądania jest pusta</h2>
              <p className="text-muted-foreground mb-6">
                Przeglądaj produkty, a pojawią się one tutaj.
              </p>
              <Button onClick={() => navigate("/products")}>
                Przeglądaj Sklep
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentProducts.map((product) => (
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