import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Box, Layers, Zap, CheckCircle, Package } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Landing() {
  const featuredProducts = useQuery(api.products.list, { featured: true });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success === "true") {
      toast.success("Płatność zakończona sukcesem!");
    }
    if (canceled === "true") {
      toast.error("Płatność została anulowana");
      setSearchParams({});
    }
  }, [success, canceled, setSearchParams]);

  const handleCloseSuccessDialog = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Success Dialog */}
      <Dialog open={success === "true"} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-2xl">Płatność Zakończona Sukcesem!</DialogTitle>
            <DialogDescription className="text-center">
              Twoje zamówienie zostało przyjęte i jest przetwarzane. Możesz śledzić status zamówienia w panelu zamówień.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => {
                handleCloseSuccessDialog();
                navigate("/orders");
              }}
            >
              <Package className="mr-2 h-5 w-5" />
              Śledź Zamówienie
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                handleCloseSuccessDialog();
                navigate("/products");
              }}
            >
              Kontynuuj Zakupy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          {/* Animated blue organic shape */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative w-[800px] h-[800px]">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.3) 30%, rgba(29, 78, 216, 0.2) 50%, transparent 70%)",
                  filter: "blur(60px)",
                }}
                animate={{
                  scale: [1, 1.2, 0.9, 1],
                  x: [0, 50, -50, 0],
                  y: [0, -30, 30, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)",
                  filter: "blur(80px)",
                }}
                animate={{
                  scale: [1, 0.8, 1.3, 1],
                  x: [0, -40, 40, 0],
                  y: [0, 40, -40, 0],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
          </motion.div>

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>

        <motion.div 
          style={{ opacity, y }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6 text-white"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.05em"
              }}
            >
              ARTIFEX FORGE
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-blue-200/80 mb-12 font-light tracking-wide"
            >
              a full cycle agency for all digital and creatives
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="h-14 px-12 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0" 
                asChild
              >
                <Link to="/products">
                  Zobacz Kolekcję <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-12 text-lg border-blue-400/30 text-blue-100 hover:bg-blue-950/50 hover:text-white" 
                asChild
              >
                <Link to="/about">
                  Poznaj Nas
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2 text-blue-200/60">
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-blue-400/30 rounded-full flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid - Clean & Minimal */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Dlaczego My?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Łączymy najnowszą technologię z rzemieślniczą precyzją
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Box,
                title: "Materiały Premium",
                description: "Używamy tylko najwyższej jakości filamentów i żywic dla trwałości i wykończenia.",
              },
              {
                icon: Layers,
                title: "Precyzyjny Druk",
                description: "Kalibrowane do mikrona. Każda warstwa jest sprawdzana pod kątem perfekcji.",
              },
              {
                icon: Zap,
                title: "Szybka Wysyłka",
                description: "Z naszej drukarni do Twoich drzwi w rekordowym czasie.",
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Equipment Section - NEW */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Profesjonalny Sprzęt</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Stratasys F170
              </h2>
              
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Wykorzystujemy profesjonalną drukarkę przemysłową <span className="font-semibold text-foreground">Stratasys F170</span> – 
                standard w produkcji komercyjnej i prototypowaniu.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Precyzja Przemysłowa</h4>
                    <p className="text-sm text-muted-foreground">
                      Technologia FDM z dokładnością warstwy do 0.127mm zapewnia wyjątkową jakość wykończenia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Materiały Inżynieryjne</h4>
                    <p className="text-sm text-muted-foreground">
                      Obsługa zaawansowanych materiałów jak ABS-M30, ASA, PC-ABS dla maksymalnej wytrzymałości
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Niezawodność 24/7</h4>
                    <p className="text-sm text-muted-foreground">
                      System zamkniętej komory i automatyczna kalibracja gwarantują powtarzalność produkcji
                    </p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">
                  Dowiedz się więcej <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://harmless-tapir-303.convex.cloud/api/storage/66c47355-3562-4bd0-ba2c-e6fda75ab2b1"
                  alt="Stratasys F170 Professional 3D Printer"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-semibold text-lg">Stratasys F170</p>
                  <p className="text-white/80 text-sm">Profesjonalna drukarka przemysłowa FDM</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-3">Wyróżnione Produkty</h2>
              <p className="text-xl text-muted-foreground">Wyselekcjonowane wybory dla Twojej przestrzeni.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Button variant="ghost" size="lg" asChild>
                <Link to="/products" className="text-lg">
                  Zobacz Wszystkie <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts ? (
              featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0] || "https://placehold.co/400x500/f3f4f6/1f2937?text=Produkt"}
                    category={product.category}
                    inventory={product.inventory}
                  />
                </motion.div>
              ))
            ) : (
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Gotowy na Coś Wyjątkowego?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Dołącz do tysięcy zadowolonych klientów, którzy już odkryli magię druku 3D.
            </p>
            <Button size="lg" className="h-16 px-12 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
              <Link to="/products">
                Rozpocznij Zakupy <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">A</span>
                </div>
                <span className="font-display font-bold text-xl">Artifex</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Redefiniujemy cyfrową produkcję z nutą luksusu.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Sklep</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/products" className="hover:text-foreground transition-colors">Wszystkie Produkty</Link></li>
                <li><Link to="/products?category=art" className="hover:text-foreground transition-colors">Sztuka</Link></li>
                <li><Link to="/products?category=decor" className="hover:text-foreground transition-colors">Dekoracje</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Firma</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">O Nas</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Kontakt</Link></li>
                <li><Link to="/contact#faq-section" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Regulamin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Newsletter</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Wpisz swój email" 
                  className="flex-1 h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                />
                <Button size="sm" className="h-10">Zapisz się</Button>
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