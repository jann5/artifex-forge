import { Navbar } from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { getStorageUrl } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PortfolioPage() {
  const portfolio = useQuery(api.portfolio.list);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) => 
        prev === selectedItem.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Nasze <span className="text-primary">Realizacje</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Zobacz projekty, które stworzyliśmy dla naszych klientów
              </p>
            </motion.div>

            {portfolio === undefined ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Wkrótce pojawią się tutaj nasze realizacje
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setCurrentImageIndex(0);
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={getStorageUrl(item.images[0])}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        {item.category && (
                          <p className="text-xs text-primary font-medium mb-2">
                            {item.category}
                          </p>
                        )}
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-3">
                          {item.images.length} zdjęć
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Image Gallery Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-5xl p-0">
          {selectedItem && (
            <div className="relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="relative aspect-video bg-black">
                <img
                  src={getStorageUrl(selectedItem.images[currentImageIndex])}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
                
                {selectedItem.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                      {currentImageIndex + 1} / {selectedItem.images.length}
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6">
                {selectedItem.category && (
                  <p className="text-sm text-primary font-medium mb-2">
                    {selectedItem.category}
                  </p>
                )}
                <h2 className="text-2xl font-bold mb-3">{selectedItem.title}</h2>
                <p className="text-muted-foreground">{selectedItem.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">E</span>
                </div>
                <span className="font-bold" style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif", letterSpacing: '0.1em' }}>ESSENTIA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redefiniujemy cyfrową produkcję z nutą luksusu.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Sklep</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/products" className="hover:text-foreground">Wszystkie Produkty</a></li>
                <li><a href="/portfolio" className="hover:text-foreground">Realizacje</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">O Nas</a></li>
                <li><a href="/contact" className="hover:text-foreground">Kontakt</a></li>
                <li><a href="/faq" className="hover:text-foreground">FAQ</a></li>
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
            © {new Date().getFullYear()} ESSENTIA. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}
