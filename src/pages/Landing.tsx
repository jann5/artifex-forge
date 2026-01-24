import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Box, Layers, Zap } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

export default function Landing() {
  const featuredProducts = useQuery(api.products.list, { featured: true });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              Minimalistyczny luksus spotyka <span className="text-primary/80">cyfrowe rzemiosło</span>.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-xl"
            >
              Odkryj wyselekcjonowaną kolekcję premium produktów drukowanych 3D. 
              Gdzie sztuka spotyka inżynierię w każdej warstwie.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-4"
            >
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/products">
                  Zobacz Kolekcję <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Nasza Historia
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border shadow-sm">
              <Box className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Materiały Premium</h3>
              <p className="text-muted-foreground">
                Używamy tylko najwyższej jakości filamentów i żywic dla trwałości i wykończenia.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background border shadow-sm">
              <Layers className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Precyzyjny Druk</h3>
              <p className="text-muted-foreground">
                Kalibrowane do mikrona. Każda warstwa jest sprawdzana pod kątem perfekcji.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-background border shadow-sm">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Szybka Wysyłka</h3>
              <p className="text-muted-foreground">
                Z naszej drukarni do Twoich drzwi w rekordowym czasie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Wyróżnione Produkty</h2>
              <p className="text-muted-foreground">Wyselekcjonowane wybory dla Twojej przestrzeni.</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products">Zobacz Wszystkie <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  image={product.images[0] || "https://placehold.co/400x500/f3f4f6/1f2937?text=Produkt"}
                  category={product.category}
                />
              ))
            ) : (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

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
                <li><Link to="/products" className="hover:text-foreground">Wszystkie Produkty</Link></li>
                <li><Link to="/products?category=art" className="hover:text-foreground">Sztuka</Link></li>
                <li><Link to="/products?category=decor" className="hover:text-foreground">Dekoracje</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">O Nas</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Kontakt</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Regulamin</Link></li>
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
                <Button size="sm">Zapisz się</Button>
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