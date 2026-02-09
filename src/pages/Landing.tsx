import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRight, CheckCircle, Package } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CookieConsent } from "@/components/CookieConsent";

// ─── Premium Animation Config ─────────────────────────────────
// Luxury easing: slow start, smooth finish — no spring, no bounce
const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease, delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const lineGrow = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1, ease },
  },
};

// ─── Data ──────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Plakaty i Grafiki",
    slug: "plakaty",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
  },
  {
    name: "Odzież Patriotyczna",
    slug: "odziez",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  },
  {
    name: "Limitowane Edycje",
    slug: "limitowane",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
];

// ═══════════════════════════════════════════════════════════════
// Landing — Museum-gallery aesthetic, $50k luxury feel
// Philosophy: Maximum impact with minimum elements.
// White space is a luxury good. Every element justifies itself.
// ═══════════════════════════════════════════════════════════════
export default function Landing() {
  const featuredProducts = useQuery(api.products.list, { featured: true });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -60]);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const subscribeToNewsletter = useMutation(api.newsletter.subscribe);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success === "true") toast.success("Płatność zakończona sukcesem!");
    if (canceled === "true") {
      toast.error("Płatność została anulowana");
      setSearchParams({});
    }
  }, [success, canceled, setSearchParams]);

  const handleCloseSuccessDialog = () => setSearchParams({});

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error("Proszę wpisać adres email");
      return;
    }
    try {
      const result = await subscribeToNewsletter({ email: newsletterEmail });
      toast.success(result.message);
      setNewsletterEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <CookieConsent />

      {/* Payment Success Dialog */}
      <Dialog
        open={success === "true"}
        onOpenChange={handleCloseSuccessDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Płatność Zakończona Sukcesem!
            </DialogTitle>
            <DialogDescription className="text-center">
              Twoje zamówienie zostało przyjęte i jest przetwarzane.
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

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO — Cinematic typographic entrance                  */}
      {/* Dark, atmospheric, text-driven. No images, no noise.   */}
      {/* The name IS the brand. Let it dominate.                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-end overflow-hidden"
      >
        {/* Background: layered depth without imagery */}
        <div className="absolute inset-0 bg-[#0F1A30]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A49] via-[#0F1A30]/95 to-[#0A1020]" />
          {/* Warm ambient glow — barely visible, adds depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 75% 20%, rgba(193,39,45,0.07) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.04) 0%, transparent 50%)",
            }}
          />
          {/* Film grain — the hallmark of premium digital design */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="container mx-auto px-6 md:px-8 relative z-10 pb-20 md:pb-28"
        >
          <div className="max-w-4xl">
            {/* Gold accent line — draws attention, signals luxury */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.2,
              }}
              className="w-16 h-px bg-[#D4AF37] mb-8 origin-left"
            />

            {/* Kicker — small, restrained, gold */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-[#D4AF37] text-[11px] tracking-[0.35em] uppercase font-medium mb-6"
            >
              Oficjalna Kolekcja Prezydencka · 2025
            </motion.p>

            {/* Title — MASSIVE, the entire brand in one word */}
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.3,
              }}
              className="text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[7vw] font-bold text-white leading-[0.92] tracking-[-0.03em] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nawrocki
            </motion.h1>

            {/* Subtitle — light, understated */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.7,
              }}
              className="text-white/40 text-base md:text-lg font-light tracking-wide max-w-md leading-relaxed"
            >
              Limitowana kolekcja pamiątek upamiętniających
              historyczną prezydencję
            </motion.p>

            {/* CTA — text link, not a button. Premium restraint. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-14"
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-all duration-500 group"
              >
                <span className="text-[11px] tracking-[0.25em] uppercase font-medium">
                  Odkryj Kolekcję
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-500" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator — vertical text + animated gold pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-3"
        >
          <span
            className="text-white/20 text-[10px] tracking-[0.2em] uppercase font-medium"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <div className="w-px h-12 bg-white/10 overflow-hidden">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full bg-[#D4AF37]/60"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MANIFESTO — One powerful quote, nothing more            */}
      {/* The emptiness around the text IS the design.            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-[#FAFAF8]">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={lineGrow}
              className="w-12 h-px bg-[#D4AF37] mx-auto mb-14 origin-center"
            />
            <motion.blockquote
              custom={0.1}
              variants={reveal}
              className="text-[1.6rem] md:text-[2rem] lg:text-[2.35rem] text-[#1B2A49] leading-[1.55] font-light tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              „Służba Polsce i prawdzie historycznej to nie
              przywilej&nbsp;— to obowiązek każdego obywatela."
            </motion.blockquote>
            <motion.div custom={0.35} variants={reveal} className="mt-12">
              <p className="text-[#1B2A49]/35 text-xs tracking-[0.2em] uppercase font-medium">
                Karol Nawrocki
              </p>
              <p className="text-[#1B2A49]/20 text-[11px] tracking-[0.1em] mt-1.5">
                Prezydent Rzeczypospolitej Polskiej
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* COLLECTION — Curated products, gallery aesthetic        */}
      {/* 4 items only. Large images. Name + price. That's it.    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#FAFAF8]">
        <div className="container mx-auto px-6 md:px-8">
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-end justify-between mb-14 md:mb-16"
          >
            <div>
              <motion.div
                variants={lineGrow}
                className="w-8 h-px bg-[#D4AF37] mb-6 origin-left"
              />
              <motion.h2
                custom={0.1}
                variants={reveal}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1B2A49] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Wybrana Kolekcja
              </motion.h2>
            </div>
            <motion.div custom={0.2} variants={reveal}>
              <Link
                to="/products"
                className="hidden md:inline-flex items-center gap-2 text-[#1B2A49]/30 hover:text-[#1B2A49] transition-colors duration-500 text-sm tracking-wide"
              >
                Wszystkie Produkty
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Product grid — museum gallery layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8"
          >
            {featuredProducts
              ? featuredProducts.slice(0, 4).map((product) => (
                  <motion.div key={product._id} variants={reveal}>
                    <Link
                      to={`/products/${product._id}`}
                      className="group block"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEEEB] mb-4">
                        <img
                          src={
                            product.images[0] ||
                            "https://placehold.co/600x800/EFEEEB/1B2A49?text="
                          }
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[#1B2A49]/0 group-hover:bg-[#1B2A49]/5 transition-colors duration-500" />
                      </div>
                      <h3 className="text-[13px] font-medium text-[#1B2A49] tracking-wide leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[13px] text-[#1B2A49]/35 mt-1.5">
                        {product.price.toLocaleString("pl-PL")} zł
                      </p>
                    </Link>
                  </motion.div>
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[#EFEEEB] mb-4" />
                    <div className="h-3.5 bg-[#EFEEEB] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#EFEEEB] rounded w-1/4" />
                  </div>
                ))}
          </motion.div>

          {/* Mobile "view all" link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center md:hidden"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[#1B2A49]/40 text-sm tracking-wide"
            >
              Wszystkie Produkty <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CATEGORIES — Three clean portals, nothing extra         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-4 md:gap-5"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.slug} variants={reveal}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block relative aspect-[4/5] md:aspect-[3/4] overflow-hidden"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#1B2A49]/40 group-hover:bg-[#1B2A49]/55 transition-colors duration-700" />
                  <div className="absolute inset-0 flex items-end p-6 md:p-8">
                    <div>
                      <h3
                        className="text-white text-lg md:text-xl font-medium tracking-wide"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2.5 text-white/40 group-hover:text-white/70 transition-colors duration-500">
                        <span className="text-[10px] tracking-[0.25em] uppercase font-medium">
                          Przeglądaj
                        </span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FOOTER — Newsletter + minimal links                    */}
      {/* Dark bookend mirrors the hero. Newsletter integrated.  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0F1A30] text-white mt-auto">
        {/* Newsletter strip */}
        <div className="border-b border-white/[0.06]">
          <div className="container mx-auto px-6 md:px-8 py-16 md:py-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <motion.p
                custom={0}
                variants={reveal}
                className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase font-medium mb-4"
              >
                Newsletter
              </motion.p>
              <motion.h3
                custom={0.1}
                variants={reveal}
                className="text-xl md:text-2xl font-light text-white/80 mb-8 leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bądź pierwszy, który odkryje
                <br className="hidden sm:block" />
                nowe limitowane edycje
              </motion.h3>
              <motion.form
                custom={0.2}
                variants={reveal}
                onSubmit={handleNewsletterSubmit}
                className="flex gap-4 max-w-sm"
              >
                <input
                  type="email"
                  placeholder="Adres email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 h-11 bg-transparent border-b border-white/15 focus:border-[#D4AF37] px-0 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors duration-500"
                />
                <button
                  type="submit"
                  className="text-white/30 hover:text-white transition-colors duration-500"
                  aria-label="Zapisz się"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </motion.form>
            </motion.div>
          </div>
        </div>

        {/* Links & brand */}
        <div className="container mx-auto px-6 md:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Brand mark */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 rounded-[3px] bg-[#C1272D] flex items-center justify-center">
                <span
                  className="text-white font-bold text-xs"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  N
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white/70 text-xs font-medium tracking-[0.2em] uppercase">
                  Nawrocki
                </span>
                <span className="text-[#D4AF37]/50 text-[9px] font-medium">
                  2025
                </span>
              </div>
            </Link>

            {/* Navigation columns */}
            <div className="flex gap-16 text-[13px]">
              <div>
                <h4 className="text-white/15 text-[10px] tracking-[0.25em] uppercase mb-4 font-medium">
                  Sklep
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      to="/products"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      Kolekcja
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products?category=plakaty"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      Plakaty
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products?category=odziez"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      Odzież
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products?category=limitowane"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      Limitowane
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white/15 text-[10px] tracking-[0.25em] uppercase mb-4 font-medium">
                  Info
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      to="/about"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      O Kolekcji
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      Kontakt
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/privacy"
                      className="text-white/35 hover:text-white/70 transition-colors duration-300"
                    >
                      Prywatność
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[11px] text-white/15 tracking-wide">
              © {new Date().getFullYear()} Nawrocki 2025. Wszelkie prawa
              zastrzeżone.
            </p>
            <p className="text-[11px] text-white/15 tracking-wide flex items-center gap-1.5">
              Made in Poland{" "}
              <span className="text-sm leading-none">🇵🇱</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
