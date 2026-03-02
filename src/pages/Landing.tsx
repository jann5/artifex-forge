import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";

const F = "'Press Start 2P', monospace";

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 40, startImmediately = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(startImmediately);

  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, started]);

  return { displayed, done, start: () => setStarted(true) };
}

/* ── Splash screen ── */
function Splash({ onDone }: { onDone: () => void }) {
  const { displayed, done } = useTypewriter("ARTIFEX FORGE.", 80);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setShowPrompt(true), 400);
      return () => clearTimeout(t);
    }
  }, [done]);

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        onDone();
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "var(--bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        fontFamily: F,
      }}
    >
      <h1 style={{ fontSize: "clamp(18px, 4vw, 32px)", letterSpacing: "0.05em", textAlign: "center" }}>
        {displayed}<span className="blink" style={{ color: "var(--fg)" }}>_</span>
      </h1>
      {showPrompt && (
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 10, lineHeight: 2.4 }}>
          <div>PRESS ↓ TO CONTINUE</div>
          <div className="bounce-arrow" style={{ fontSize: 14, marginTop: 8 }}>▼</div>
          <div style={{ marginTop: 8, opacity: 0.5 }}>[ENTER OR TAP]</div>
        </div>
      )}
    </div>
  );
}

/* ── Product card (window-box style) ── */
function ProductCard({ product, index, focused, onClick, onAddToCart }: {
  product: any; index: number; focused: boolean;
  onClick: () => void; onAddToCart: () => Promise<void>;
}) {
  const imgUrl = product.images?.[0] ? getStorageUrl(product.images[0]) : null;
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (adding || product.inventory === 0) return;
    setAdding(true);
    try { await onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 1800); } catch {}
    setAdding(false);
  }

  return (
    <div
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        background: "var(--bg)",
        border: focused ? "4px solid var(--fg)" : "3px solid var(--fg)",
        boxShadow: focused ? "8px 8px 0 var(--fg)" : "6px 6px 0 var(--fg)",
        padding: 0,
        position: "relative",
        cursor: "pointer",
        outline: "none",
        fontFamily: F,
        transition: "box-shadow 0.15s, border-width 0.15s",
      }}
    >
      {/* Inner border (blankshirt double-border) */}
      <div style={{
        position: "absolute", inset: 5,
        border: "2px solid var(--fg)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Image */}
      {imgUrl ? (
        <div style={{ padding: "16px 16px 0", position: "relative", zIndex: 2 }}>
          <div style={{ border: "2px solid var(--fg)", overflow: "hidden" }}>
            <img src={imgUrl} alt={product.name} loading="lazy" style={{
              width: "100%", aspectRatio: "1/1", objectFit: "cover",
              filter: "grayscale(30%) sepia(20%)",
              display: "block",
            }} />
          </div>
        </div>
      ) : (
        <div style={{
          margin: "16px 16px 0", border: "2px solid var(--fg)",
          aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, opacity: 0.4, position: "relative", zIndex: 2,
        }}>NO IMAGE</div>
      )}

      {/* Content */}
      <div style={{ padding: "14px 18px 18px", position: "relative", zIndex: 2 }}>
        <h3 style={{ fontSize: "clamp(11px, 1.5vw, 14px)", lineHeight: 1.8, marginBottom: 6, textTransform: "uppercase" }}>
          {product.name}
        </h3>

        {product.description && (
          <p style={{ fontSize: 9, opacity: 0.5, lineHeight: 2, margin: "0 0 10px" }}>
            {product.description.slice(0, 60)}{product.description.length > 60 ? "..." : ""}
          </p>
        )}

        <div style={{ fontSize: "clamp(14px, 2vw, 20px)", marginBottom: 12 }}>
          {formatCurrency(product.price)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <button
            onClick={handleAdd}
            disabled={adding || product.inventory === 0}
            className="pixel-btn"
            style={{ width: "100%", textAlign: "center", fontSize: 9 }}
          >
            {adding ? "..." : added ? "DODANO!" : product.inventory === 0 ? "BRAK" : "KUP"}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="pixel-btn-outline"
            style={{ width: "100%", textAlign: "center", fontSize: 9, borderTop: "none" }}
          >
            SZCZEGOLY
          </button>
        </div>

        {product.inventory > 0 && product.inventory <= 5 && (
          <div style={{ fontSize: 8, color: "var(--accent)", marginTop: 8, textAlign: "center" }}>
            OSTATNIE {product.inventory} SZT.
          </div>
        )}
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
  const [showSplash, setShowSplash] = useState(true);
  const [msg, setMsg] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);

  // Skip splash if returning
  useEffect(() => {
    if (sessionStorage.getItem("af_splash_done")) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("af_splash_done", "1");
  }, []);

  // Typewriter for the shop description
  const { displayed: desc, done: descDone } = useTypewriter(
    "reczna robota. zamow online.\n-> wybierz produkt -> dodaj do koszyka ->\ntwoje zamowienie bedzie gotowe w 1-2 dni.",
    25,
    !showSplash,
  );

  // Arrow key nav
  useEffect(() => {
    if (showSplash) return;
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
  }, [allProducts, activeIdx, navigate, showSplash]);

  // Random messages
  useEffect(() => {
    const msgs = [
      "nowy drop wkrotce...",
      "kazdy produkt jest unikalny.",
      "darmowa dostawa od 200 zl.",
      "recznie robione we wroclawiu.",
      "stripe. blik. karta. apple pay.",
    ];
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % msgs.length;
      setMsg(msgs[i]);
    }, 5000);
    setMsg(msgs[0]);
    return () => clearInterval(iv);
  }, []);

  if (showSplash) return <Splash onDone={handleSplashDone} />;

  return (
    <div ref={mainRef} style={{ minHeight: "100vh", fontFamily: F }}>
      <NotebookNavbar />

      {/* HERO — centered like blankshirt */}
      <section style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        minHeight: "50vh",
        padding: "60px 24px 40px",
      }}>
        <h1 style={{ fontSize: "clamp(16px, 3.5vw, 28px)", marginBottom: 32 }}>
          artifex forge.
        </h1>

        {/* Description in a window box */}
        <div className="window-box" style={{
          maxWidth: 560, width: "100%", textAlign: "left",
          fontSize: 11, lineHeight: 2.2,
        }}>
          <pre style={{
            fontFamily: F, fontSize: 11, margin: 0,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {desc}<span className="blink">■</span>
          </pre>
        </div>
      </section>

      {/* PRODUCTS */}
      {allProducts.length > 0 && (
        <section style={{ padding: "0 clamp(20px, 5vw, 80px) 60px" }}>
          {/* Section header */}
          <div className="window-box" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 20px",
            maxWidth: 900, margin: "0 auto 32px",
          }}>
            <span style={{ fontSize: 11 }}>PRODUKTY</span>
            <span style={{ fontSize: 9, opacity: 0.4 }}>{allProducts.length} ITEMS</span>
          </div>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 28,
            maxWidth: 900,
            margin: "0 auto",
          }}>
            {allProducts.map((p: any, i: number) => (
              <ProductCard
                key={p._id} product={p} index={i} focused={i === activeIdx}
                onClick={() => navigate(`/products/${p._id}`)}
                onAddToCart={() => addToCart({ productId: p._id, quantity: 1 })}
              />
            ))}
          </div>
        </section>
      )}

      {products === undefined && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{ fontSize: 11 }}>LOADING<span className="blink">...</span></div>
        </div>
      )}

      {products && allProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div className="window-box" style={{ display: "inline-block", maxWidth: 380 }}>
            <div style={{ fontSize: 12, marginBottom: 8 }}>BRAK PRODUKTOW</div>
            <div style={{ fontSize: 9, opacity: 0.5 }}>sklep w przygotowaniu.<br/>wroc wkrotce.</div>
          </div>
        </div>
      )}

      {/* INFO SECTION — blankshirt style boxes */}
      <section style={{
        padding: "40px clamp(20px, 5vw, 80px) 60px",
        maxWidth: 900, margin: "0 auto",
      }}>
        <div className="window-box" style={{
          padding: "16px 20px",
          fontSize: 10, lineHeight: 2.2,
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px 20px" }}>
            <span>📦 INPOST / KURIER DPD</span>
            <span>💳 STRIPE / BLIK / KARTA</span>
            <span>✋ RECZNA ROBOTA</span>
          </div>
        </div>

        {/* Rotating message */}
        <div style={{
          textAlign: "center", fontSize: 9, opacity: 0.4,
          lineHeight: 2, minHeight: 20,
        }}>
          {msg}<span className="blink">_</span>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{
        padding: "0 clamp(20px, 5vw, 80px) 60px",
        maxWidth: 900, margin: "0 auto",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {[
          { label: "TELEGRAM", value: "@artifexforge", href: "https://t.me/artifexforge" },
          { label: "EMAIL", value: "kontakt@artifexforge.pl", href: "mailto:kontakt@artifexforge.pl" },
        ].map((c, i) => (
          <div key={i} className="window-box" style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 10 }}>{c.label}</span>
            <a href={c.href} style={{ fontSize: 10, color: "var(--fg)" }}>{c.value}</a>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: "center",
        padding: "24px",
        fontSize: 9,
        opacity: 0.4,
        lineHeight: 2.4,
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 20px", marginBottom: 8 }}>
          {[["PRYWATNOSC", "/privacy"], ["FAQ", "/faq"], ["ZAMOWIENIA", "/orders"]].map(([l, h]) => (
            <a key={h} href={h} style={{ color: "var(--fg)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div>© {new Date().getFullYear()} ARTIFEX FORGE</div>
      </footer>
    </div>
  );
}
