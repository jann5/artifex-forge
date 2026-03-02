import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { RetroNavbar } from "@/components/retro/RetroNavbar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";

const ACCENTS = ["#00ffff", "#ff00ff", "#ffb000"] as const;

/* ─── Web Audio blip ─── */
function playBlip(freq = 880, type: OscillatorType = "square", vol = 0.08, dur = 0.045) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
    osc.onended = () => ctx.close();
  } catch {}
}

/* ─── Single product card ─── */
function ProductCard({ product, index, accent, onSoundHover }: {
  product: any; index: number; accent: string; onSoundHover: () => void;
}) {
  const navigate = useNavigate();
  const addToCart = useMutation(api.cart.add);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const imgUrl = product.images?.[0] ? getStorageUrl(product.images[0]) : null;

  async function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (adding || product.inventory === 0) return;
    setAdding(true);
    playBlip(1200, "sine", 0.1, 0.06);
    try {
      await addToCart({ productId: product._id, quantity: 1 });
      setAdded(true);
      playBlip(1600, "sine", 0.08, 0.08);
      setTimeout(() => setAdded(false), 2000);
    } catch {}
    setAdding(false);
  }

  return (
    <div
      className="crt-window cursor-pointer flex flex-col"
      style={{
        border: `2px solid ${accent}`,
        boxShadow: hovered
          ? `0 0 28px ${accent}66, 0 0 56px ${accent}22, inset 0 0 16px ${accent}08`
          : `0 0 8px ${accent}33`,
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.25s cubic-bezier(0.25,0.1,0.25,1)",
        background: "#000",
      }}
      onMouseEnter={() => { setHovered(true); onSoundHover(); }}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products/${product._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/products/${product._id}`)}
    >
      {/* title bar */}
      <div className="dos-titlebar text-[9px]" style={{ background: accent, color: "#000" }}>
        <span className="font-pixel">{product.name.toUpperCase().slice(0, 20)}</span>
        <span className="opacity-50">[{String(index + 1).padStart(2, "0")}]</span>
      </div>

      {/* image */}
      <div className="relative overflow-hidden" style={{ height: 220, background: "#0a0a0a", flexShrink: 0 }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{
              filter: hovered
                ? `grayscale(20%) contrast(1.1) saturate(1.2)`
                : `grayscale(60%) contrast(1.3)`,
              transition: "filter 0.4s",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transformOrigin: "center",
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-pixel text-[10px]" style={{ color: accent }}>
            NO IMAGE
          </div>
        )}
        {/* scanline overlay on image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)" }}
        />
        {product.inventory === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
            <span className="font-pixel text-[11px]" style={{ color: "#ff0040", textShadow: "0 0 12px #ff0040" }}>OUT OF STOCK</span>
          </div>
        )}
        {product.inventory > 0 && product.inventory <= 5 && (
          <div className="absolute top-2 right-2 font-pixel text-[8px] px-2 py-1" style={{ background: "#000", border: "1px solid #ff0040", color: "#ff0040" }}>
            LAST {product.inventory}
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 flex flex-col p-4 gap-3 z-10 relative">
        <div>
          <h2 className="font-pixel text-[11px] leading-relaxed mb-1" style={{ color: accent, textShadow: `0 0 10px ${accent}80` }}>
            {product.name}
          </h2>
          <p className="font-terminal text-[12px] leading-relaxed" style={{ color: "#00cc33" }}>
            {product.description?.slice(0, 100)}{product.description?.length > 100 ? "…" : ""}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: `1px solid ${accent}30` }}>
          <span className="font-pixel text-[13px]" style={{ color: "#ffb000", textShadow: "0 0 10px rgba(255,176,0,0.7)" }}>
            {formatCurrency(product.price)}
          </span>
          <span className="font-terminal text-[10px]" style={{ color: product.inventory > 0 ? "#00ff41" : "#444" }}>
            {product.inventory > 0 ? `IN STOCK: ${product.inventory}` : "UNAVAILABLE"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || product.inventory === 0}
          className="w-full font-pixel text-[9px] py-3 mt-1"
          style={{
            background: added ? accent : "transparent",
            border: `2px solid ${accent}`,
            color: added ? "#000" : accent,
            cursor: product.inventory === 0 ? "not-allowed" : "pointer",
            opacity: product.inventory === 0 ? 0.4 : 1,
            transition: "all 0.15s",
            textShadow: added ? "none" : `0 0 8px ${accent}80`,
            boxShadow: hovered && product.inventory > 0 ? `0 0 16px ${accent}44` : "none",
          }}
        >
          {adding ? "ADDING…" : added ? "✓ ADDED TO CART" : "💾 ADD TO CART"}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
          className="w-full font-terminal text-[11px] py-2"
          style={{ border: `1px solid ${accent}44`, color: "#00cc33", background: "transparent", cursor: "pointer" }}
        >
          → VIEW DETAILS
        </button>
      </div>
    </div>
  );
}

/* ─── Scroll-sound hook ─── */
function useScrollSound(elements: React.RefObject<HTMLElement | null>[], freq: number, soundEnabled: boolean) {
  const seen = useRef(new Set<Element>());
  useEffect(() => {
    if (!soundEnabled) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.current.has(entry.target)) {
            seen.current.add(entry.target);
            playBlip(freq + Math.random() * 200, "sine", 0.06, 0.05);
          }
        });
      },
      { threshold: 0.25 }
    );
    elements.forEach((r) => { if (r.current) obs.observe(r.current); });
    return () => obs.disconnect();
  }, [elements, freq, soundEnabled]);
}

/* ─── Ticker ─── */
function Ticker() {
  const msg = "★ ARTIFEX FORGE — AUTORSKIE PRODUKTY ★   •   DOSTAWA INPOST / KURIER   •   BEZPIECZNA PŁATNOŚĆ STRIPE   •   KONTAKT TELEGRAM   •   ";
  return (
    <div className="overflow-hidden font-pixel text-[8px] py-1.5 border-b" style={{ borderColor: "#00ff4140", color: "#00ff41", background: "#00040040", textShadow: "0 0 6px rgba(0,255,65,0.5)" }}>
      <div className="whitespace-nowrap" style={{ display: "inline-block", animation: "title-scroll 35s linear infinite" }}>
        {msg}{msg}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function Landing() {
  const products = useQuery(api.products.list, {});
  const navigate = useNavigate();
  const displayProducts = products?.slice(0, 3) ?? [];
  const [soundEnabled, setSoundEnabled] = useState(false);

  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // enable sound after first interaction
  useEffect(() => {
    const enable = () => setSoundEnabled(true);
    window.addEventListener("click", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });
    window.addEventListener("scroll", enable, { once: true });
    return () => { window.removeEventListener("click", enable); window.removeEventListener("keydown", enable); window.removeEventListener("scroll", enable); };
  }, []);

  useScrollSound(cardRefs, 660, soundEnabled);

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#00ff41" }}>
      <RetroNavbar />
      <Ticker />

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* ── HERO ── */}
        <div className="text-center mb-12">
          <div className="font-terminal text-[11px] mb-3" style={{ color: "#00cc33" }}>
            <span className="animate-blink">▶</span>&nbsp;ARTIFEX.FORGE ONLINE STORE — SYSTEM READY
          </div>
          <h1 className="font-pixel mb-4" style={{ fontSize: "clamp(16px, 3.5vw, 32px)", color: "#00ff41", textShadow: "0 0 20px rgba(0,255,65,0.8), 0 0 40px rgba(0,255,65,0.4)", lineHeight: 1.6 }}>
            ARTIFEX<br />FORGE
          </h1>
          <p className="font-terminal text-base max-w-xl mx-auto" style={{ color: "#00cc33" }}>
            Ręcznie robione produkty wysokiej jakości.<br />
            Zamów online — dostawa w 1–2 dni robocze.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="font-terminal text-[12px] px-3 py-1" style={{ border: "1px solid #00ffff44", color: "#00ffff" }}>📦 INPOST / KURIER</span>
            <span className="font-terminal text-[12px] px-3 py-1" style={{ border: "1px solid #ff00ff44", color: "#ff00ff" }}>🔒 STRIPE SECURE</span>
            <span className="font-terminal text-[12px] px-3 py-1" style={{ border: "1px solid #ffb00044", color: "#ffb000" }}>⭐ SZYBKA WYSYŁKA</span>
          </div>
        </div>

        {/* ── PRODUCTS ── */}
        <div className="mb-4 flex items-center gap-3">
          <div className="font-pixel text-[10px]" style={{ color: "#00ff41" }}>PRODUKTY</div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,#00ff4160,transparent)" }} />
          <div className="font-terminal text-[11px]" style={{ color: "#00cc33" }}>
            {displayProducts.length > 0 ? `${displayProducts.length} dostępne` : ""}
          </div>
        </div>

        {products === undefined ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-shimmer" style={{ height: 480, border: `2px solid ${ACCENTS[i]}22` }} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 font-terminal" style={{ color: "#00cc33" }}>
            <div className="font-pixel text-[10px] mb-2" style={{ color: "#ff00ff" }}>BRAK PRODUKTÓW</div>
            <div>Sklep jest w przygotowaniu. Wróć wkrótce.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayProducts.map((p: any, i: number) => (
              <div key={p._id} ref={cardRefs[i]}>
                <ProductCard
                  product={p}
                  index={i}
                  accent={ACCENTS[i % 3]}
                  onSoundHover={() => soundEnabled && playBlip(800 + i * 120, "sine", 0.05, 0.04)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── INFO STRIP ── */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { icon: "📦", label: "Dostawa", val: "INPOST Paczkomat lub Kurier DPD — 1-2 dni", a: "#00ffff" },
            { icon: "🔒", label: "Płatność", val: "Stripe — karty, BLIK, przelewy, Apple Pay", a: "#ff00ff" },
            { icon: "💬", label: "Kontakt", val: "Telegram — odpowiedź w ciągu 24h", a: "#ffb000" },
          ].map((item, i) => (
            <div key={i} className="p-5 text-center" style={{ border: `1px solid ${item.a}33`, background: `${item.a}06` }}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-pixel text-[9px] mb-2" style={{ color: item.a }}>{item.label}</div>
              <div className="font-terminal text-[12px]" style={{ color: "#00cc33" }}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div className="mt-12 pt-6 text-center" style={{ borderTop: "1px solid #00ff4120" }}>
          <div className="font-terminal text-[11px] flex flex-wrap justify-center gap-x-6 gap-y-2" style={{ color: "#005500" }}>
            {[["Polityka prywatności","/privacy"],["Kontakt","/contact"],["FAQ","/faq"],["Moje zamówienia","/orders"],["Logowanie","/auth"]].map(([l,h]) => (
              <a key={h} href={h} className="hover:text-phosphor transition-colors">{l}</a>
            ))}
          </div>
          <div className="font-terminal text-[10px] mt-3 opacity-30">ARTIFEX FORGE © {new Date().getFullYear()}</div>
        </div>

      </main>
    </div>
  );
}
