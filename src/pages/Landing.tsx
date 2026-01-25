import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Box, Layers, Zap, Sparkles, TrendingUp, Award, Star, Shield, Truck } from "lucide-react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Landing() {
  const featuredProducts = useQuery(api.products.list, { featured: true });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Hero Section - Full Screen with Rich Content */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem'
          }} />
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto px-4 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Premium Druk 3D w Polsce</span>
            </motion.div>

            {/* Main Heading with Gradient */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient">
                Artifex Forge
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-3xl text-muted-foreground mb-6 font-light">
              Twórz. Inspiruj. Wyróżnij się.
            </p>

            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Odkryj świat unikalnych produktów drukowanych w technologii 3D. 
              Łączymy precyzję inżynieryjną z artystyczną wizją, aby dostarczać przedmioty, 
              które inspirują i zachwycają.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" className="h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/products">
                  Zobacz Kolekcję <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg" asChild>
                <Link to="/about">
                  Poznaj Nas
                </Link>
              </Button>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Darmowa Wysyłka</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>30 Dni Zwrotu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Gwarancja Jakości</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-wider">Przewiń w dół</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-8 w-5 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Award, label: "Produktów Premium", value: "500+" },
              { icon: TrendingUp, label: "Zadowolonych Klientów", value: "10K+" },
              { icon: Sparkles, label: "Lat Doświadczenia", value: "5+" },
              { icon: Box, label: "Wysyłek Miesięcznie", value: "1K+" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="text-3xl font-bold mb-1"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Dlaczego My?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Łączymy najnowszą technologię z rzemieślniczą precyzją
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="p-8 rounded-2xl bg-background border shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
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
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-3">Wyróżnione Produkty</h2>
              <p className="text-xl text-muted-foreground">Wyselekcjonowane wybory dla Twojej przestrzeni.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0] || "https://placehold.co/400x500/f3f4f6/1f2937?text=Produkt"}
                    category={product.category}
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Gotowy na Coś Wyjątkowego?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Dołącz do tysięcy zadowolonych klientów, którzy już odkryli magię druku 3D.
            </p>
            <Button size="lg" className="h-16 px-12 text-lg shadow-2xl hover:shadow-3xl transition-all" asChild>
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