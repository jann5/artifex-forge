import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";

/* ─── Paper sound ─── */
function playPaper() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const secs = 0.07;
    const buf = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.3));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + secs);
    src.connect(g); g.connect(ctx.destination);
    src.start(); src.onended = () => ctx.close();
  } catch {}
}

function playClick() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "triangle"; o.frequency.setValueAtTime(700, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.07);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    o.start(); o.stop(ctx.currentTime + 0.07); o.onended = () => ctx.close();
  } catch {}
}

const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Courier Prime', monospace";

/* ─── Product card ─── */
function ProductCard({ product, index, focused, soundEnabled, onClick, onAddToCart }: {
  product: any; index: number; focused: boolean; soundEnabled: boolean;
  onClick: () => void; onAddToCart: () => Promise<void>;
}) {
  const imgUrl = product.images?.[0] ? getStorageUrl(product.images[0]) : null;
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const rots = ["-1deg", "0.8deg", "-0.5deg"];

  async function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (adding || product.inventory === 0) return;
    if (soundEnabled) playClick();
    setAdding(true);
    try { await onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 2200); } catch {}
    setAdding(false);
  }

  return (
    <div
      role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        background: "var(--paper)",
        border: focused ? "4px solid var(--ink-red)" : "3px solid var(--ink)",
        boxShadow: focused ? "8px 8px 0 var(--ink-red)" : "5px 5px 0 var(--ink)",
        transform: focused ? `rotate(${rots[index%3]}) translate(-3px,-3px)` : `rotate(${rots[index%3]})`,
        transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer", display: "flex", flexDirection: "column",
        outline: "none", position: "relative",
        backgroundImage: "linear-gradient(transparent calc(100% - 1px), var(--line) 1px)",
        backgroundSize: "100% 36px",
      }}
    >
      {focused && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          width: 18, height: 18, borderRadius: "50%",
          background: "var(--ink-red)", border: "3px solid var(--ink)", zIndex: 2,
        }} />
      )}

      {/* Image */}
      <div style={{ height: 200, overflow: "hidden", borderBottom: "3px solid var(--ink)", flexShrink: 0, position: "relative" }}>
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: focused ? "none" : "grayscale(20%)", transition: "filter 0.3s" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--paper-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 16, color: "var(--muted-foreground)" }}>
            brak zdjęcia
          </div>
        )}
        {product.inventory === 0 && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: "var(--ink-red)", border: "3px solid var(--ink-red)", padding: "6px 14px", transform: "rotate(-12deg)", display: "inline-block" }}>BRAK</span>
          </div>
        )}
        {product.inventory > 0 && product.inventory <= 5 && (
          <div style={{ position: "absolute", top: 8, right: 8, fontFamily: MONO, fontWeight: 700, fontSize: 11, color: "var(--ink-red)", border: "2px solid var(--ink-red)", padding: "3px 8px", background: "var(--paper)" }}>
            OSTATNIE {product.inventory}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.3, margin: 0 }}>
          {product.name}
        </h2>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>
          {product.description?.slice(0, 90)}{product.description?.length > 90 ? "…" : ""}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 10, borderTop: "2px dashed var(--line)" }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22 }}>{formatCurrency(product.price)}</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: product.inventory > 0 ? "var(--stamp-green)" : "var(--ink-red)", border: `2px solid ${product.inventory > 0 ? "var(--stamp-green)" : "var(--ink-red)"}`, padding: "2px 8px", textTransform: "uppercase" }}>
            {product.inventory > 0 ? "dostępny" : "brak"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || product.inventory === 0}
          style={{
            width: "100%", textAlign: "center",
            fontFamily: MONO, fontWeight: 700, fontSize: 14,
            background: added ? "var(--ink)" : "var(--ink)",
            color: "var(--paper)",
            border: "3px solid var(--ink)",
            padding: "10px 0",
            boxShadow: added ? "none" : "4px 4px 0 var(--ink-red)",
            cursor: product.inventory === 0 ? "not-allowed" : "pointer",
            opacity: product.inventory === 0 ? 0.4 : 1,
            transition: "all 0.1s",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {adding ? "DODAWANIE..." : added ? "✓ DODANO DO KOSZYKA" : "DODAJ DO KOSZYKA"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          style={{
            width: "100%", textAlign: "center",
            fontFamily: MONO, fontWeight: 600, fontSize: 13,
            background: "transparent", color: "var(--ink)",
            border: "3px solid var(--ink)",
            padding: "8px 0",
            boxShadow: "4px 4px 0 var(--ink)",
            cursor: "pointer",
            transition: "all 0.1s",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          SZCZEGÓŁY →
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function Landing() {
  const products = useQuery(api.products.list, {});
  const addToCart = useMutation(api.cart.add);
  const navigate = useNavigate();
  const displayProducts = products?.slice(0, 3) ?? [];
  const [activeIdx, setActiveIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<"sklep" | "kontakt">("sklep");

  useEffect(() => {
    const on = () => setSoundEnabled(true);
    window.addEventListener("click", on, { once: true });
    window.addEventListener("keydown", on, { once: true });
    return () => { window.removeEventListener("click", on); window.removeEventListener("keydown", on); };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const len = displayProducts.length;
      if (!len) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault(); if (soundEnabled) playPaper();
        setActiveIdx(i => Math.min(len - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); if (soundEnabled) playPaper();
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === "Enter" && activeTab === "sklep") {
        const p = displayProducts[activeIdx]; if (p) navigate(`/products/${p._id}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [displayProducts, activeIdx, soundEnabled, activeTab, navigate]);

  return (
    <div style={{ minHeight: "100vh", fontFamily: SERIF }}>
      {/* Spiral binding */}
      <div aria-hidden style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 30,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-start", paddingTop: 68, gap: 26, zIndex: 30, pointerEvents: "none",
      }}>
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} style={{ width: 15, height: 15, borderRadius: "50%", border: "2.5px solid var(--ink)", background: "var(--paper)", flexShrink: 0 }} />
        ))}
      </div>

      <NotebookNavbar />

      <main style={{ paddingLeft: "clamp(38px,6vw,90px)", paddingRight: "clamp(16px,4vw,48px)", maxWidth: 1100, margin: "0 auto", paddingTop: 36, paddingBottom: 72 }}>

        {/* HERO */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            — sklep internetowy —
          </div>
          <h1 style={{ fontFamily: MONO, fontWeight: 700, fontSize: "clamp(32px,7vw,68px)", lineHeight: 1.1, margin: "0 0 16px", position: "relative", display: "inline-block" }}>
            Artifex Forge
            <svg viewBox="0 0 300 12" style={{ position: "absolute", bottom: -8, left: 0, width: "100%", overflow: "visible" }} aria-hidden>
              <path d="M0,8 C50,2 100,12 150,6 C200,0 250,10 300,5" stroke="var(--ink-red)" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 18, color: "var(--muted-foreground)", maxWidth: 500, marginTop: 20, marginBottom: 0, lineHeight: 1.7 }}>
            Ręcznie robione produkty wysokiej jakości.<br />
            Zamów online &mdash; dostawa <span style={{ background: "var(--highlight)", padding: "0 4px" }}>1–2 dni robocze</span>.
          </p>

          {/* keyboard hint */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginTop: 20,
            fontFamily: MONO, fontSize: 13, color: "var(--muted-foreground)",
            border: "2px solid var(--line)", padding: "6px 14px", background: "var(--paper-dark)",
          }}>
            {["←", "→"].map(k => (
              <span key={k} style={{ fontFamily: MONO, fontSize: 13, border: "2px solid var(--ink)", padding: "1px 7px", background: "var(--paper)" }}>{k}</span>
            ))}
            <span>nawiguj strzałkami</span>
            <span style={{ fontFamily: MONO, fontSize: 12, border: "2px solid var(--ink)", padding: "1px 7px", background: "var(--paper)" }}>ENTER</span>
            <span>otwórz</span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 0, borderBottom: "3px solid var(--ink)" }}>
          {(["sklep", "kontakt"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (soundEnabled) playPaper(); }}
              style={{
                fontFamily: MONO, fontWeight: 700, fontSize: 14,
                letterSpacing: "0.08em", textTransform: "uppercase",
                background: activeTab === tab ? "var(--paper)" : "var(--paper-dark)",
                border: "3px solid var(--ink)", borderBottom: activeTab === tab ? "3px solid var(--paper)" : "3px solid var(--ink)",
                padding: "8px 22px", cursor: "pointer", position: "relative", bottom: "-3px",
                transition: "background 0.1s",
              }}
            >
              {tab === "sklep" ? "SKLEP" : "KONTAKT"}
            </button>
          ))}
          <div style={{ flex: 1, borderBottom: "3px solid var(--ink)", marginBottom: 0 }} />
        </div>

        {/* SKLEP */}
        {activeTab === "sklep" && (
          <div style={{ paddingTop: 28 }}>
            {/* Arrow nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <button
                onClick={() => { if (soundEnabled) playPaper(); setActiveIdx(i => Math.max(0, i - 1)); }}
                disabled={activeIdx === 0}
                style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, background: "transparent", border: "3px solid var(--ink)", padding: "5px 16px", cursor: "pointer", opacity: activeIdx === 0 ? 0.25 : 1, boxShadow: "3px 3px 0 var(--ink)", transition: "all 0.1s", width: 56 }}
              >←</button>
              <span style={{ fontFamily: MONO, fontSize: 14, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
                PRODUKT {activeIdx + 1} / {displayProducts.length || "…"}
              </span>
              <button
                onClick={() => { if (soundEnabled) playPaper(); setActiveIdx(i => Math.min((displayProducts.length || 1) - 1, i + 1)); }}
                disabled={activeIdx >= (displayProducts.length || 1) - 1}
                style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, background: "transparent", border: "3px solid var(--ink)", padding: "5px 16px", cursor: "pointer", opacity: activeIdx >= (displayProducts.length || 1) - 1 ? 0.25 : 1, boxShadow: "3px 3px 0 var(--ink)", transition: "all 0.1s", width: 56 }}
              >→</button>
            </div>

            {products === undefined ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 28 }}>
                {[0,1,2].map(i => <div key={i} style={{ height: 440, background: "var(--paper-dark)", border: "3px solid var(--line)", boxShadow: "5px 5px 0 var(--line)" }} />)}
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ maxWidth: 360, margin: "40px auto", textAlign: "center", background: "var(--highlight)", border: "3px solid var(--ink)", padding: 28, boxShadow: "5px 5px 0 var(--ink)" }}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Brak produktów</div>
                <div style={{ fontFamily: SERIF, fontSize: 17 }}>Sklep jest w przygotowaniu. Wróć wkrótce!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 28 }}>
                {displayProducts.map((p: any, i: number) => (
                  <ProductCard
                    key={p._id} product={p} index={i} focused={i === activeIdx}
                    soundEnabled={soundEnabled}
                    onClick={() => navigate(`/products/${p._id}`)}
                    onAddToCart={() => addToCart({ productId: p._id, quantity: 1 })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* KONTAKT */}
        {activeTab === "kontakt" && (
          <div style={{ paddingTop: 28, maxWidth: 580 }}>
            <div style={{ background: "var(--highlight)", border: "3px solid var(--ink)", padding: "20px 24px", boxShadow: "5px 5px 0 var(--ink)", marginBottom: 28 }}>
              <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, margin: "0 0 10px" }}>Kontakt</h2>
              <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.7, margin: 0, color: "var(--muted-foreground)" }}>
                Masz pytanie? Chcesz coś specjalnego? Odpisujemy szybko!
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: "💬", label: "TELEGRAM", val: "@artifexforge", url: "https://t.me/artifexforge" },
                { icon: "📧", label: "EMAIL",    val: "kontakt@artifexforge.pl", url: "mailto:kontakt@artifexforge.pl" },
              ].map((row, i) => (
                <div key={i} style={{ background: "var(--paper)", border: "3px solid var(--ink)", padding: "16px 20px", boxShadow: "4px 4px 0 var(--ink)", display: "flex", alignItems: "center", gap: 16, transform: i === 0 ? "rotate(-0.5deg)" : "rotate(0.5deg)" }}>
                  <span style={{ fontSize: 30, flexShrink: 0 }}>{row.icon}</span>
                  <div>
                    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", marginBottom: 4 }}>{row.label}</div>
                    <a href={row.url} style={{ fontFamily: SERIF, fontSize: 17, color: "var(--ink-blue)" }}>{row.val}</a>
                  </div>
                </div>
              ))}
              <div style={{ background: "var(--paper)", border: "3px solid var(--ink)", padding: "16px 24px", boxShadow: "4px 4px 0 var(--ink)" }}>
                <h3 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: "0 0 12px", letterSpacing: "0.08em" }}>📦 DOSTAWA</h3>
                <ul style={{ fontFamily: SERIF, fontSize: 17, margin: 0, padding: "0 0 0 18px", lineHeight: 2.2, color: "var(--muted-foreground)" }}>
                  <li>InPost Paczkomat — <span style={{ background: "var(--highlight)", padding: "0 4px" }}>1–2 dni</span></li>
                  <li>Kurier DPD — 1 dzień roboczy</li>
                  <li>Stripe — BLIK, karta, przelew, Apple Pay</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* INFO ROW */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 48, paddingTop: 24, borderTop: "3px solid var(--line)" }}>
          {[
            "📦  InPost / Kurier DPD",
            "🔒  Bezpieczna płatność Stripe",
            "⭐  Ręcznie robione",
          ].map((t, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 13, fontWeight: i === 1 ? 600 : 400, border: "2px solid var(--ink)", padding: "7px 16px", background: i === 1 ? "var(--highlight)" : "transparent", letterSpacing: "0.03em" }}>
              {t}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 40, textAlign: "center", fontFamily: MONO, fontSize: 12, color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 24px", marginBottom: 8 }}>
            {[["POLITYKA PRYWATNOŚCI","/privacy"],["FAQ","/faq"],["ZAMÓWIENIA","/orders"],["LOGOWANIE","/auth"]].map(([l,h]) => (
              <a key={h} href={h} style={{ color: "var(--ink-blue)", textTransform: "uppercase", fontSize: 11 }}>{l}</a>
            ))}
          </div>
          <div>ARTIFEX FORGE &copy; {new Date().getFullYear()}</div>
        </div>
      </main>
    </div>
  );
}
