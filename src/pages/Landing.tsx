import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ArrowRight,
  CheckCircle,
  Package,
  Shield,
  Truck,
  Award,
  Star,
  Heart,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";
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
import { useSmoothCounter } from "@/hooks/use-animations";

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

// ─── Trust & Social Proof Data ─────────────────────────────────
const TRUST_BADGES = [
  {
    icon: Shield,
    title: "100% Autentyczność",
    desc: "Certyfikat autentyczności z każdym zamówieniem",
  },
  {
    icon: Truck,
    title: "Darmowa Dostawa",
    desc: "Na zamówienia powyżej 150 zł w całej Polsce",
  },
  {
    icon: Lock,
    title: "Bezpieczne Płatności",
    desc: "Szyfrowane SSL · Stripe · BLIK · Przelewy24",
  },
  {
    icon: Award,
    title: "Gwarancja Jakości",
    desc: "30-dniowy zwrot bez pytań",
  },
];

const TESTIMONIALS = [
  {
    name: "Tomasz K.",
    location: "Warszawa",
    text: "Jakość wykonania jest niesamowita. Medal prezydencki wygląda jak dzieło sztuki — dumny, że mogę mieć kawałek historii.",
    rating: 5,
  },
  {
    name: "Anna M.",
    location: "Kraków",
    text: "Kupiłam koszulkę patriotyczną dla męża. Materiał premium, nadruk idealny. Na pewno wrócę po więcej!",
    rating: 5,
  },
  {
    name: "Piotr W.",
    location: "Gdańsk",
    text: "Plakat kolekcjonerski w ramce — piękna pamiątka historycznego momentu. Szybka wysyłka, eleganckie opakowanie.",
    rating: 5,
  },
];

const HERITAGE_MILESTONES = [
  { year: "966", event: "Chrzest Polski" },
  { year: "1410", event: "Bitwa pod Grunwaldem" },
  { year: "1791", event: "Konstytucja 3 Maja" },
  { year: "1918", event: "Odzyskanie Niepodległości" },
  { year: "1989", event: "Zwycięstwo Solidarności" },
  { year: "2025", event: "Nowy Rozdział" },
];

// ═══════════════════════════════════════════════════════════════
// StatCounter — animated number for social proof
// ═══════════════════════════════════════════════════════════════
function StatCounter({ end, suffix = "", prefix = "", label, decimals }: { end: number; suffix?: string; prefix?: string; label: string; decimals?: number }) {
  const { ref, formatted } = useSmoothCounter(end, 2500, { prefix, suffix, decimals });
  return (
    <div ref={ref} className="text-center">
      <p
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {formatted}
      </p>
      <p className="text-white/30 text-xs md:text-sm tracking-[0.15em] uppercase mt-3 font-medium">
        {label}
      </p>
    </div>
  );
}

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

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);

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
              Oficjalna Kolekcja Prezydencka · Polska 2025
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
              historyczną prezydencję — bo Polska zasługuje na wielkość
            </motion.p>

            {/* Polish flag micro-accent under subtitle */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.9 }}
              className="flex mt-6 origin-left"
            >
              <div className="h-[2px] w-8 bg-white/40" />
              <div className="h-[2px] w-8 bg-[#C1272D]/60" />
            </motion.div>

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
              przywilej&nbsp;— to obowiązek każdego obywatela.
              Nasza siła leży w jedności i dumie z tego, kim jesteśmy."
            </motion.blockquote>
            <motion.div custom={0.35} variants={reveal} className="mt-12">
              <p className="text-[#1B2A49]/35 text-xs tracking-[0.2em] uppercase font-medium">
                Karol Nawrocki
              </p>
              <p className="text-[#1B2A49]/20 text-[11px] tracking-[0.1em] mt-1.5">
                Prezydent Rzeczypospolitej Polskiej
              </p>
              {/* Polish flag micro-stripe */}
              <div className="flex justify-center mt-6">
                <div className="h-[2px] w-6 bg-[#FAFAF8] border border-[#1B2A49]/10" />
                <div className="h-[2px] w-6 bg-[#C1272D]" />
              </div>
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
      {/* SOCIAL PROOF — Animated stats, dark cinematic strip    */}
      {/* Numbers build trust. Dark bg = visual break = drama.   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 bg-[#0F1A30] overflow-hidden">
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <motion.p
              variants={reveal}
              custom={0}
              className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase font-medium mb-4"
            >
              Zaufanie Tysięcy Polaków
            </motion.p>
            <motion.h2
              variants={reveal}
              custom={0.1}
              className="text-2xl md:text-3xl font-light text-white/80"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Liczby mówią same za siebie
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCounter end={12847} label="Zadowolonych Klientów" />
            <StatCounter end={28} suffix="k+" label="Sprzedanych Produktów" />
            <StatCounter end={4.9} suffix="/5" label="Średnia Ocen" decimals={1} />
            <StatCounter end={99} suffix="%" label="Polecałoby Dalej" />
          </div>

          {/* Polish flag line — a subtle patriotic accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
            className="mt-16 mx-auto max-w-xs h-[2px] origin-center"
            style={{
              background: "linear-gradient(90deg, transparent, #FFF 20%, #FFF 50%, #C1272D 50%, #C1272D 80%, transparent)",
            }}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TRUST BADGES — Security, quality, Polish pride         */}
      {/* The premium buyer needs reassurance at every touchpoint */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={i}
                variants={reveal}
                className="group text-center p-6 md:p-8 rounded-2xl border border-[#1B2A49]/[0.04] hover:border-[#D4AF37]/20 bg-white hover:shadow-xl hover:shadow-[#C1272D]/[0.03] transition-all duration-500"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#C1272D]/[0.06] group-hover:bg-[#C1272D]/10 transition-colors duration-500 mb-5">
                  <badge.icon className="h-6 w-6 text-[#C1272D]" />
                </div>
                <h4
                  className="text-[15px] font-semibold text-[#1B2A49] mb-2 tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {badge.title}
                </h4>
                <p className="text-[13px] text-[#1B2A49]/40 leading-relaxed">
                  {badge.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERITAGE — "Dumni z Polski" patriotic timeline          */}
      {/* The emotional core. Polish pride is a luxury.           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Full-bleed atmospheric background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A49] via-[#0F1A30] to-[#0A1020]" />

        {/* Polish eagle watermark — barely visible, deeply patriotic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
          <span className="text-[400px] select-none">🦅</span>
        </div>

        {/* Ambient patriotic glow */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(193,39,45,0.08) 0%, transparent 60%)"
        }} />

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            {/* Section badge */}
            <motion.div variants={reveal} custom={0} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/[0.05] mb-6">
                <span className="text-lg">🇵🇱</span>
                <span className="text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase font-semibold">
                  Dumni z Polski
                </span>
              </div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tysiąc Lat Dumy
                <br />
                <span className="text-[#D4AF37]">Jeden Naród</span>
              </h2>
            </motion.div>

            {/* Heritage timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent hidden md:block" />

              <div className="space-y-6 md:space-y-8">
                {HERITAGE_MILESTONES.map((milestone, i) => (
                  <div
                    key={milestone.year}
                    className={`flex items-center gap-6 md:gap-0 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                      <span
                        className="text-3xl md:text-4xl font-bold text-[#D4AF37]/80 tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {milestone.year}
                      </span>
                      <p className="text-white/50 text-sm md:text-base mt-1 font-light">
                        {milestone.event}
                      </p>
                    </div>
                    {/* Center dot */}
                    <div className="hidden md:flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#D4AF37]/40 bg-[#0F1A30] z-10 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>

            {/* Patriotic manifesto */}
            <div className="mt-20 text-center">
              <div className="w-12 h-px bg-[#C1272D] mx-auto mb-8" />
              <p
                className="text-base md:text-lg text-white/50 font-light leading-relaxed max-w-2xl mx-auto"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Od Chrztu Polski po dzień dzisiejszy — każde pokolenie pisało swoją kartę
                w historii. Nasza kolekcja to hołd dla tych, którzy budowali Polskę.
              </p>
              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors duration-300 text-sm"
                >
                  <span className="text-[11px] tracking-[0.2em] uppercase font-medium">
                    Poznaj Naszą Historię
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS — Social proof from real Poles              */}
      {/* Names, locations, stars. The human touch.               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#FAFAF8]">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-14"
          >
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
              Co Mówią Nasi Klienci
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6 md:gap-8"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={reveal}
                className="group p-8 bg-white rounded-2xl border border-[#1B2A49]/[0.04] hover:border-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#C1272D]/[0.03] transition-all duration-500"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 text-[#D4AF37] fill-[#D4AF37]"
                    />
                  ))}
                </div>
                <p
                  className="text-[#1B2A49]/60 text-[15px] leading-relaxed mb-6"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  „{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-[#1B2A49]/[0.04]">
                  <div className="w-9 h-9 rounded-full bg-[#C1272D]/[0.08] flex items-center justify-center">
                    <span className="text-[#C1272D] font-bold text-xs">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1B2A49]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[#1B2A49]/30 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" /> {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 text-[#1B2A49]/30 hover:text-[#1B2A49] text-sm tracking-wide transition-colors duration-500"
            >
              Wszystkie Opinie <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CUSTOM ORDER CTA — High-ticket conversion driver        */}
      {/* For the premium buyer who wants something bespoke.      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[#EFEEEB]">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="h-7 w-7 text-[#D4AF37] mx-auto mb-5" />
            <h2
              className="text-2xl md:text-3xl font-bold text-[#1B2A49] tracking-[-0.02em] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Zamówienie Na Specjalne Życzenie
            </h2>
            <p className="text-[#1B2A49]/50 text-base mb-8 max-w-lg mx-auto leading-relaxed">
              Potrzebujesz spersonalizowanego produktu? Grawerunek, dedykacja,
              limitowana seria — zrealizujemy każde zamówienie.
            </p>
            <Link to="/custom-order">
              <Button
                size="lg"
                className="bg-[#1B2A49] hover:bg-[#0F1A30] text-white px-8 py-5 text-sm tracking-[0.1em] uppercase font-medium rounded-full"
              >
                Zapytaj o Wycenę
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
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
            <div className="flex items-center gap-4">
              <p className="text-[11px] text-white/15 tracking-wide flex items-center gap-1.5">
                Made with <Heart className="h-3 w-3 text-[#C1272D]/40" /> in Poland{" "}
                <span className="text-sm leading-none">🇵🇱</span>
              </p>
              {/* Polish flag micro-stripe in footer */}
              <div className="flex">
                <div className="h-3 w-6 bg-white/20 rounded-l-sm" />
                <div className="h-3 w-6 bg-[#C1272D]/40 rounded-r-sm" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
