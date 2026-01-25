import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Box, Layers, Zap, Sparkles, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export default function Landing() {
  const featuredProducts = useQuery(api.products.list, { featured: true });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const ySpring = useSpring(y, springConfig);

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Hero Section with Parallax */}
      <section className="relative overflow-hidden py-20 lg:py-32 min-h-[90vh] flex items-center">
        <motion.div 
          style={{ y: ySpring, opacity, scale }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Premium 3D Printing</span>
              </motion.div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              Minimalistyczny luksus spotyka{" "}
              <motion.span 
                className="text-primary/80 inline-block"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  backgroundImage: "linear-gradient(90deg, currentColor 0%, hsl(var(--primary)) 50%, currentColor 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}
              >
                cyfrowe rzemiosło
              </motion.span>
              .
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              Odkryj wyselekcjonowaną kolekcję premium produktów drukowanych 3D. 
              Gdzie sztuka spotyka inżynierię w każdej warstwie.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link to="/products">
                    Zobacz Kolekcję <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2" asChild>
                  <Link to="/about">
                    Nasza Historia
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.08, 0.12, 0.08]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 right-40 w-72 h-72 bg-secondary rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              x: [0, 50, 0],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/2 right-1/4 w-80 h-80 bg-primary/50 rounded-full blur-3xl"
          />
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-muted/30 border-y"
      >
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
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3"
                >
                  <stat.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
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
                color: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Layers,
                title: "Precyzyjny Druk",
                description: "Kalibrowane do mikrona. Każda warstwa jest sprawdzana pod kątem perfekcji.",
                color: "from-purple-500/20 to-pink-500/20"
              },
              {
                icon: Zap,
                title: "Szybka Wysyłka",
                description: "Z naszej drukarni do Twoich drzwi w rekordowym czasie.",
                color: "from-orange-500/20 to-red-500/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="p-8 rounded-2xl bg-background border shadow-sm hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6"
                    >
                      <feature.icon className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">Wyróżnione Produkty</h2>
              <p className="text-xl text-muted-foreground">Wyselekcjonowane wybory dla Twojej przestrzeni.</p>
            </div>
            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="lg" asChild>
                <Link to="/products" className="text-lg">
                  Zobacz Wszystkie <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts ? (
              featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
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
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center"
                >
                  <span className="text-primary-foreground font-bold text-lg">A</span>
                </motion.div>
                <span className="font-display font-bold text-xl">Artifex</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Redefiniujemy cyfrową produkcję z nutą luksusu.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="font-bold mb-4 text-lg">Sklep</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/products" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">Wszystkie Produkty</Link></li>
                <li><Link to="/products?category=art" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">Sztuka</Link></li>
                <li><Link to="/products?category=decor" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">Dekoracje</Link></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-bold mb-4 text-lg">Firma</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">O Nas</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">Kontakt</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors hover:translate-x-1 inline-block">Regulamin</Link></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="font-bold mb-4 text-lg">Newsletter</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Wpisz swój email" 
                  className="flex-1 h-10 rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                />
                <Button size="sm" className="h-10">Zapisz się</Button>
              </div>
            </motion.div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground"
          >
            © {new Date().getFullYear()} Artifex Forge. Wszelkie prawa zastrzeżone.
          </motion.div>
        </div>
      </footer>
    </div>
  );
}