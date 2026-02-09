import { Navbar } from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { staggerContainer, staggerItem } from "@/hooks/use-animations";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  
  const products = useQuery(api.products.list, { 
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    sort: sortBy !== "default" ? sortBy : undefined
  });
  const categories = useQuery(api.categories.list, {});

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 pt-28">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm mb-8">
          <Link to="/" className="text-[#1B2A49]/50 hover:text-[#C1272D] transition-colors">
            Strona Główna
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#1B2A49]/30" />
          <span className="text-[#1B2A49] font-medium">Kolekcja</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col gap-8 mb-12">
            <div className="text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-0.5 bg-[#D4AF37] mx-auto mb-6"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-[#1B2A49] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Kolekcja Prezydencka
              </h1>
              <p className="text-[#1B2A49]/60 text-lg">
                Ekskluzywne pamiątki upamiętniające historyczny moment polskiej demokracji
              </p>
            </div>

            {/* Custom Order Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B2A49] to-[#2A3F6F] p-6 md:p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Zamówienie Specjalne
                  </h3>
                  <p className="text-white/70">
                    Stwórz unikalny, spersonalizowany produkt kolekcjonerski
                  </p>
                </div>
                <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#1B2A49] font-bold rounded-full px-8">
                  <Link to="/custom-order">Zaprojektuj Własny</Link>
                </Button>
              </div>
            </div>
            
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 md:p-5 rounded-2xl border border-[#1B2A49]/5 shadow-sm">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B2A49]/40" />
                <Input 
                  placeholder="Szukaj w kolekcji..." 
                  className="pl-10 border-[#1B2A49]/10 focus:border-[#C1272D] focus:ring-[#C1272D]/20 rounded-xl h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] border-[#1B2A49]/10 rounded-xl h-11">
                      <SelectValue placeholder="Kategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie Kategorie</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat._id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px] border-[#1B2A49]/10 rounded-xl h-11">
                      <SelectValue placeholder="Sortowanie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Polecane</SelectItem>
                      <SelectItem value="price_asc">Cena: Rosnąco</SelectItem>
                      <SelectItem value="price_desc">Cena: Malejąco</SelectItem>
                      <SelectItem value="name_asc">Nazwa: A-Z</SelectItem>
                      <SelectItem value="name_desc">Nazwa: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results count */}
            {products && (
              <p className="text-sm text-[#1B2A49]/50">
                Wyświetlanie <span className="font-semibold text-[#1B2A49]">{products.length}</span> {products.length === 1 ? 'produktu' : 'produktów'}
                {selectedCategory !== "all" && categories && (
                  <span> w kategorii <span className="text-[#C1272D] font-medium">{categories.find(c => c.slug === selectedCategory)?.name}</span></span>
                )}
              </p>
            )}
          </div>

          {/* Product Grid */}
          {products === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-[#1B2A49]/5 rounded-2xl skeleton-shimmer" />
                  <div className="h-3 bg-[#D4AF37]/20 rounded-full w-1/4" />
                  <div className="h-4 bg-[#1B2A49]/10 rounded-full w-2/3" />
                  <div className="h-5 bg-[#C1272D]/10 rounded-full w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#1B2A49]/10 rounded-2xl bg-white">
              <div className="h-20 w-20 rounded-full bg-[#1B2A49]/5 flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-[#1B2A49]/20" />
              </div>
              <h2 className="text-xl font-semibold text-[#1B2A49] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Nie znaleziono produktów
              </h2>
              <p className="text-[#1B2A49]/50 max-w-sm mx-auto">
                Spróbuj zmienić kryteria wyszukiwania lub wybierz inną kategorię.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full border-[#C1272D] text-[#C1272D] hover:bg-[#C1272D] hover:text-white"
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
              >
                Pokaż Wszystko
              </Button>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {products.map((product) => (
                <motion.div key={product._id} variants={staggerItem}>
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0] || "https://placehold.co/400x500/1B2A49/D4AF37?text=Produkt"}
                    category={product.category}
                    inventory={product.inventory}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-16 bg-[#1B2A49] mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 bg-[#C1272D] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>N</span>
                </div>
                <span className="text-white font-bold tracking-[0.15em] text-sm">NAWROCKI <span className="text-[#D4AF37]">2025</span></span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Oficjalny sklep z kolekcjonerskimi pamiątkami prezydenckimi.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Kolekcja</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><button onClick={() => {setSelectedCategory("all"); setSearchQuery("");}} className="hover:text-[#D4AF37] transition-colors">Wszystkie Produkty</button></li>
                {categories?.slice(0, 3).map((cat) => (
                  <li key={cat._id}>
                    <button onClick={() => setSelectedCategory(cat.slug)} className="hover:text-[#D4AF37] transition-colors">
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Informacje</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="/about" className="hover:text-[#D4AF37] transition-colors">O Nas</a></li>
                <li><a href="/contact" className="hover:text-[#D4AF37] transition-colors">Kontakt</a></li>
                <li><a href="/faq" className="hover:text-[#D4AF37] transition-colors">FAQ</a></li>
                <li><a href="/privacy" className="hover:text-[#D4AF37] transition-colors">Polityka Prywatności</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Kontakt</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li>sklep@nawrocki2025.pl</li>
                <li>+48 800 200 300</li>
                <li className="pt-2 flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-white/10 rounded">VISA</span>
                  <span className="px-2 py-1 bg-white/10 rounded">MC</span>
                  <span className="px-2 py-1 bg-white/10 rounded">BLIK</span>
                  <span className="px-2 py-1 bg-white/10 rounded">P24</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/30">
            © {new Date().getFullYear()} Nawrocki 2025. Wszelkie prawa zastrzeżone. Made with 🇵🇱 in Polska.
          </div>
        </div>
      </footer>
    </div>
  );
}