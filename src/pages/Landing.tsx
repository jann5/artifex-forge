import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";

const M = "'IBM Plex Mono', monospace";

function playClick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "square";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    o.start(); o.stop(ctx.currentTime + 0.04); o.onended = () => ctx.close();
  } catch {}
}

/* ── Product Card ── */
function ProductCard({ product, index, focused, onClick, onAddToCart }: {
  product: any; index: number; focused: boolean;
  onClick: () => void; onAddToCart: () => Promise<void>;
}) {
  const imgUrl = product.images?.[0] ? getStorageUrl(product.images[0]) : null;
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (adding || product.inventory === 0) return;
    playClick();
    setAdding(true);
    try { await onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 1400); } catch {}
    setAdding(false);
  }

  const inv = hovered || focused;

  return (
    <div
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: inv ? "#000" : "#fff",
        color: inv ? "#fff" : "#000",
        padding: 24,
        display: "flex", flexDirection: "column", gap: 16,
        cursor: "pointer", outline: "none",
        transition: "all 0.2s",
        position: "relative",
        minHeight: 420,
        fontFamily: M,
      }}
    >
      {/* Index + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", opacity: 0.4, fontWeight: 700 }}>
          {String(index + 1).padStart(3, "0")}
        </span>
        <span style={{
          fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
          color: product.inventory > 0 ? (inv ? "#0f0" : "#000") : "#ff0000",
          border: "2px solid",
          borderColor: product.inventory > 0 ? (inv ? "#0f0" : "#000") : "#ff0000",
          padding: "2px 8px",
        }}>
          {product.inventory > 0 ? "IN STOCK" : "SOLD OUT"}
        </span>
      </div>

      {/* Image */}
      {imgUrl ? (
        <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", border: inv ? "4px solid #fff" : "4px solid #000" }}>
          <img src={imgUrl} alt={product.name} loading="lazy" style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: inv ? "none" : "grayscale(100%) contrast(1.1)",
            transition: "filter 0.3s",
          }} />
        </div>
      ) : (
        <div style={{
          width: "100%", aspectRatio: "4/3",
          border: inv ? "4px solid #fff" : "4px solid #000",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, letterSpacing: "0.15em", opacity: 0.3, fontWeight: 700,
        }}>NO IMAGE</div>
      )}

      {/* Name + Desc */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ fontSize: "clamp(16px, 2.2vw, 24px)", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          {product.name}
        </h3>
        {product.description && (
          <p style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5, margin: 0 }}>
            {product.description.slice(0, 80)}{product.description.length > 80 ? "..." : ""}
          </p>
        )}
      </div>

      {/* Price */}
      <div style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}>
        {formatCurrency(product.price)}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <button
          onClick={handleAdd}
          disabled={adding || product.inventory === 0}
          style={{
            width: "100%", padding: "14px 0",
            background: added ? "#ff0000" : (inv ? "#fff" : "#000"),
            color: added ? "#fff" : (inv ? "#000" : "#fff"),
            border: "4px solid",
            borderColor: inv ? "#fff" : "#000",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase",
            cursor: product.inventory === 0 ? "not-allowed" : "pointer",
            opacity: product.inventory === 0 ? 0.3 : 1,
            transition: "all 0.12s",
            fontFamily: M,
          }}
        >
          {adding ? "..." : added ? "DODANO" : "DODAJ DO KOSZYKA"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          style={{
            width: "100%", padding: "10px 0",
            background: "transparent",
            color: inv ? "#fff" : "#000",
            border: "4px solid",
            borderColor: inv ? "#fff" : "#000",
            borderTop: "none",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.12s",
            fontFamily: M,
          }}
        >
          SZCZEGOLY
        </button>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Landing() {
  const products = useQuery(api.products.list, {});
  const addToCart = useMutation(api.cart.add);
  const navigate = useNavigate();
  const allProducts = products ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Arrow key nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const len = allProducts.length;
      if (!len) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx(i => Math.min(len - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const p = allProducts[activeIdx];
        if (p) navigate(`/products/${p._id}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allProducts, activeIdx, navigate]);

  const marqueeText = "ARTIFEX FORGE \u2014 RECZNA ROBOTA \u2014 SKLEP INTERNETOWY \u2014 ZAMOW TERAZ \u2014 ";

  return (
    <div style={{ minHeight: "100vh", fontFamily: M }}>
      <NotebookNavbar />

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span>{marqueeText.repeat(10)}</span>
        </div>
      </div>

      {/* HERO */}
      <section style={{
        padding: "clamp(48px, 12vh, 140px) clamp(20px, 5vw, 80px)",
        borderBottom: "4px solid #000",
      }}>
        <h1 style={{
          fontSize: "clamp(52px, 15vw, 220px)",
          lineHeight: 0.88,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "-0.05em",
          margin: 0,
        }}>
          ARTIFEX<br/>FORGE<span className="cursor-blink" style={{ color: "#ff0000" }}>_</span>
        </h1>
        <div style={{
          marginTop: "clamp(24px, 4vh, 48px)",
          display: "flex", flexWrap: "wrap", gap: "6px 20px",
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          opacity: 0.4, fontWeight: 500,
        }}>
          <span>HANDMADE GOODS</span>
          <span>/</span>
          <span>WROCLAW, PL</span>
          <span>/</span>
          <span>51.1079N 17.0385E</span>
          <span>/</span>
          <span>{time.toLocaleTimeString("pl-PL", { hour12: false })}</span>
        </div>
      </section>

      {/* PRODUCTS SECTION HEADER */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px clamp(20px, 5vw, 80px)",
        borderBottom: "4px solid #000",
        fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
      }}>
        <span>01 — PRODUKTY</span>
        <span style={{ opacity: 0.4, fontWeight: 500 }}>{allProducts.length} ITEMS</span>
      </div>

      {/* PRODUCTS GRID */}
      {products === undefined ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 4, background: "#000" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ background: "#f0f0f0", height: 500 }}>
              <div style={{ padding: 24, fontSize: 11, letterSpacing: "0.15em", opacity: 0.3 }}>LOADING...</div>
            </div>
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div style={{ padding: "100px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.03em" }}>BRAK PRODUKTOW</div>
          <div style={{ fontSize: 13, opacity: 0.4, letterSpacing: "0.1em" }}>SKLEP W PRZYGOTOWANIU</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 4,
          background: "#000",
        }}>
          {allProducts.map((p: any, i: number) => (
            <ProductCard
              key={p._id} product={p} index={i} focused={i === activeIdx}
              onClick={() => navigate(`/products/${p._id}`)}
              onAddToCart={() => addToCart({ productId: p._id, quantity: 1 })}
            />
          ))}
        </div>
      )}

      {/* INFO BAR — inverted */}
      <section style={{
        background: "#000", color: "#fff",
        padding: "clamp(28px, 5vh, 56px) clamp(20px, 5vw, 80px)",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28,
        borderTop: "4px solid #000",
      }}>
        {[
          ["INPOST PACZKOMAT", "Dostawa 1-2 dni"],
          ["STRIPE PAYMENTS", "BLIK / Karta / Apple Pay"],
          ["RECZNA ROBOTA", "Kazdy produkt unikalny"],
          ["DARMOWY ZWROT", "14 dni na zwrot"],
        ].map(([title, desc], i) => (
          <div key={i}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 11, opacity: 0.4 }}>{desc}</div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "4px solid #000",
        padding: "20px clamp(20px, 5vw, 80px)",
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
        gap: "8px 40px",
        fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <span style={{ fontWeight: 700 }}>&copy; {new Date().getFullYear()} ARTIFEX FORGE</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
          {[
            ["PRYWATNOSC", "/privacy"],
            ["FAQ", "/faq"],
            ["ZAMOWIENIA", "/orders"],
            ["KONTAKT", "/contact"],
          ].map(([label, href]) => (
            <a key={href} href={href} style={{ color: "#000", textDecoration: "none", fontWeight: 500 }}>{label}</a>
          ))}
        </div>
        <span style={{ opacity: 0.3 }}>V3.0</span>
      </footer>
    </div>
  );
}
