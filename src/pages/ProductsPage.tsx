import { Navbar } from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const allProducts = useQuery(api.products.list, {});
  const filteredProducts = useQuery(
    api.products.list,
    selectedCategory !== "all" ? { category: selectedCategory } : {}
  );

  const products = selectedCategory !== "all" ? filteredProducts : allProducts;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Nasza Kolekcja</h1>
              <p className="text-muted-foreground text-lg">
                Odkryj naszą wyselekcjonowaną kolekcję premium produktów drukowanych 3D
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filtruj:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Wszystkie Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie Kategorie</SelectItem>
                  <SelectItem value="art">Sztuka</SelectItem>
                  <SelectItem value="decor">Dekoracje</SelectItem>
                  <SelectItem value="functional">Funkcjonalne</SelectItem>
                  <SelectItem value="accessories">Akcesoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {products === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Brak produktów w tej kategorii.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images[0] || "https://placehold.co/400x500/f3f4f6/1f2937?text=Produkt"}
                  category={product.category}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">A</span>
                </div>
                <span className="font-display font-bold">Artifex</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redefiniujemy cyfrową produkcję z nutą luksusu.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Sklep</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setSelectedCategory("all")} className="hover:text-foreground">Wszystkie Produkty</button></li>
                <li><button onClick={() => setSelectedCategory("art")} className="hover:text-foreground">Sztuka</button></li>
                <li><button onClick={() => setSelectedCategory("decor")} className="hover:text-foreground">Dekoracje</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">O Nas</a></li>
                <li><a href="/contact" className="hover:text-foreground">Kontakt</a></li>
                <li><a href="/terms" className="hover:text-foreground">Regulamin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Wpisz swój email" 
                  className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
                />
                <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                  Zapisz się
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Artifex Forge. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}