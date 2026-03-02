import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RetroNavbar } from "@/components/retro/RetroNavbar";
import { TerminalWindow } from "@/components/retro/TerminalWindow";
import { TypeWriter } from "@/components/retro/TypeWriter";
import { BlinkingCursor } from "@/components/retro/BlinkingCursor";
import { GlitchText } from "@/components/retro/GlitchText";
import { LoadingBar } from "@/components/retro/LoadingBar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const PRODUCT_STYLES = [
  { accent: "#00ffff",  bg: "#000d0d", label: "C64 STYLE",    sublabel: "COMMODORE 64 — 1982" },
  { accent: "#ff00ff",  bg: "#0d000d", label: "ZX SPECTRUM",   sublabel: "SINCLAIR ZX — 1982" },
  { accent: "#ffb000",  bg: "#0d0900", label: "IBM PC MODE",   sublabel: "IBM PC 5150 — 1981" },
];

const FILE_TABS = [
  { id: "readme",  name: "README.TXT",  icon: "📄" },
  { id: "specs",   name: "SPECS.TXT",   icon: "📋" },
  { id: "price",   name: "PRICE.TXT",   icon: "💰" },
];

function getProductStyle(index: number) {
  return PRODUCT_STYLES[index % PRODUCT_STYLES.length];
}

function ProductNotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-phosphor font-terminal">
      <RetroNavbar />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <TerminalWindow title="ERROR.SYS — CRITICAL FAULT" accent="magenta">
          <pre className="ascii-art text-center text-[11px] my-4" style={{ color: "#ff0040" }}>
{`
  ██████╗  █████╗ ██████╗     ███████╗███████╗ ██████╗████████╗ ██████╗ ██████╗ 
  ██╔══██╗██╔══██╗██╔══██╗    ██╔════╝██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
  ██████╔╝███████║██║  ██║    ███████╗█████╗  ██║        ██║   ██║   ██║██████╔╝
  ██╔══██╗██╔══██║██║  ██║    ╚════██║██╔══╝  ██║        ██║   ██║   ██║██╔══██╗
  ██████╔╝██║  ██║██████╔╝    ███████║███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚══════╝╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
`}
          </pre>
          <div className="text-center font-pixel text-[10px] space-y-3 py-4">
            <div style={{ color: "#ff0040" }}>BAD SECTOR ON DISK</div>
            <div className="text-dim">FILE NOT FOUND — PRODUCT DOES NOT EXIST</div>
            <div className="text-dim text-[9px]">Error code: 0x00000404 — PRODUCT_NOT_FOUND</div>
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <button onClick={() => navigate("/")} className="btn-retro text-[9px] px-4 py-2">← C:\HOME</button>
            <button onClick={() => navigate("/products")} className="btn-retro text-[9px] px-4 py-2">DIR PRODUCTS</button>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = useQuery(api.products.get, { id: id as Id<"products"> });
  const addToCart = useMutation(api.cart.add);
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("readme");
  const [quantity, setQuantity]   = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding]       = useState(false);
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [showBuyAnim, setShowBuyAnim] = useState(false);

  // Pick a style based on product index (use name hash)
  const styleIndex = product ? (product.name.charCodeAt(0) % 3) : 0;
  const style = getProductStyle(styleIndex);

  async function handleAddToCart() {
    if (!isAuthenticated) { navigate("/auth"); return; }
    if (!product) return;
    setAdding(true);
    setShowBuyAnim(true);
    try {
      await addToCart({ productId: product._id, quantity });
      toast.success(`${quantity}x ${product.name} — COPIED TO FLOPPY!`);
    } catch (e: any) {
      toast.error(e.message ?? "ERROR: DISK FULL");
    } finally {
      setTimeout(() => { setAdding(false); setShowBuyAnim(false); }, 2000);
    }
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-black text-phosphor font-terminal">
        <RetroNavbar />
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <TerminalWindow title="LOADING PRODUCT FILE...">
            <div className="py-8">
              <LoadingBar label="READING DISK SECTORS..." duration={2500} />
            </div>
          </TerminalWindow>
        </div>
      </div>
    );
  }

  if (product === null) return <ProductNotFound />;

  const isOutOfStock = product.inventory === 0;
  const isLowStock   = product.inventory > 0 && product.inventory <= 5;
  const maxQty       = product.inventory;

  const readmeLines = [
    `> TYPE README.TXT`,
    ``,
    product.description,
    ``,
    `-- EOF --`,
  ];

  const specsLines = [
    `> TYPE SPECS.TXT`,
    ``,
    `PRODUCT......: ${product.name}`,
    `CATEGORY.....: ${product.category.toUpperCase()}`,
    `INVENTORY....: ${product.inventory} UNIT(S) AVAILABLE`,
    `STATUS.......: ${isOutOfStock ? "OUT OF STOCK" : isLowStock ? `LOW STOCK [${product.inventory}]` : "IN STOCK"}`,
    `CONDITION....: NEW / UNUSED`,
    `COMPATIBILITY: ALL SYSTEMS`,
    ``,
    `-- EOF --`,
  ];

  const priceLines = [
    `> TYPE PRICE.TXT`,
    ``,
    `PRICE: ${formatCurrency(product.price)}`,
    ``,
    `PAYMENT: STRIPE (SECURE)`,
    `DELIVERY: INPOST / KURIER`,
    `RETURNS: 14 DAYS`,
    ``,
    `-- EOF --`,
  ];

  const tabContent: Record<string, string[]> = {
    readme: readmeLines,
    specs:  specsLines,
    price:  priceLines,
  };

  return (
    <div className="min-h-screen font-terminal" style={{ background: style.bg }}>
      <RetroNavbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">

        {/* ── BREADCRUMB ── */}
        <div className="font-terminal text-[11px] text-dim mb-4 flex items-center gap-2">
          <button onClick={() => navigate("/")} className="hover:text-phosphor transition-colors">C:\HOME</button>
          <span>&gt;</span>
          <button onClick={() => navigate("/products")} className="hover:text-phosphor transition-colors">PRODUCTS</button>
          <span>&gt;</span>
          <span style={{ color: style.accent }}>{product.name.replace(/\s+/g, "_").toUpperCase()}</span>
          <BlinkingCursor char="_" className="text-[11px]" />
        </div>

        {/* ── PRODUCT TITLE ── */}
        <TerminalWindow
          title={`C:\\PRODUCTS\\${product.name.replace(/\s+/g, "_").toUpperCase().slice(0,12)}\\`}
          accent={styleIndex === 0 ? "cyan" : styleIndex === 1 ? "magenta" : "amber"}
          className="mb-6"
          titleRight={<span className="font-terminal text-[9px]">{style.sublabel}</span>}
        >
          <div className="flex items-start gap-3 flex-wrap">
            <div>
              <span
                className="font-pixel text-[9px] px-2 py-1 mb-3 inline-block"
                style={{ background: style.accent, color: "#000" }}
              >
                {style.label}
              </span>
              <GlitchText tag="h1" className="font-pixel text-sm sm:text-base leading-relaxed" style={{ color: style.accent } as React.CSSProperties}>
                {product.name}
              </GlitchText>
            </div>
          </div>
        </TerminalWindow>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── LEFT: IMAGE + GALLERY ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative overflow-hidden"
              style={{
                border: `2px solid ${style.accent}`,
                boxShadow: `0 0 20px ${style.accent}44`,
                aspectRatio: "4/3",
                background: "#000",
              }}
            >
              {product.images?.[activeImage] ? (
                <img
                  src={getStorageUrl(product.images[activeImage]) ?? ""}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{
                    filter: "grayscale(80%) contrast(1.3) brightness(0.9)",
                    imageRendering: "auto",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <pre className="ascii-art text-[11px]" style={{ color: style.accent }}>
{`  ┌────────────────┐
  │                │
  │   NO IMAGE     │
  │   AVAILABLE    │
  │                │
  │  INSERT DISK   │
  └────────────────┘`}
                  </pre>
                </div>
              )}
              {/* CRT overlay on image */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
                  mixBlendMode: "multiply",
                }}
              />
              {/* Corner decorations */}
              <div className="absolute top-1 left-1 text-[10px] font-pixel" style={{ color: style.accent, opacity: 0.6 }}>▶</div>
              <div className="absolute bottom-1 right-2 text-[10px] font-pixel" style={{ color: style.accent, opacity: 0.6 }}>
                {product.images?.[activeImage] ? `IMG_${activeImage + 1}.PCX` : "NO_SIGNAL"}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="font-terminal text-[9px] px-2 py-1"
                    style={{
                      border: `1px solid ${i === activeImage ? style.accent : style.accent + "44"}`,
                      color: i === activeImage ? "#000" : style.accent,
                      background: i === activeImage ? style.accent : "transparent",
                    }}
                  >
                    [{i === activeImage ? "●" : "○"}] IMG_{i+1}.PCX
                  </button>
                ))}
              </div>
            )}

            {/* Status chips */}
            <div className="flex gap-2 flex-wrap">
              {isOutOfStock && (
                <span className="font-pixel text-[9px] px-2 py-1 animate-blink" style={{ background: "#ff0000", color: "#000" }}>
                  ✗ OUT OF STOCK
                </span>
              )}
              {isLowStock && (
                <span className="font-pixel text-[9px] px-2 py-1 animate-blink" style={{ background: "#ffb000", color: "#000" }}>
                  ⚠ LOW STOCK: {product.inventory}
                </span>
              )}
              {!isOutOfStock && !isLowStock && (
                <span className="font-pixel text-[9px] px-2 py-1" style={{ background: "#00ff41", color: "#000" }}>
                  ✓ IN STOCK
                </span>
              )}
            </div>
          </div>

          {/* ── RIGHT: FILE VIEWER ── */}
          <div className="space-y-4">

            {/* Tab bar */}
            <div className="flex border-b" style={{ borderColor: `${style.accent}44` }}>
              {FILE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="font-pixel text-[9px] px-3 py-2 transition-colors"
                  style={{
                    borderBottom: activeTab === tab.id ? `2px solid ${style.accent}` : "2px solid transparent",
                    color: activeTab === tab.id ? style.accent : "#004d00",
                    background: activeTab === tab.id ? `${style.accent}11` : "transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </div>

            {/* File content with typewriter */}
            <TerminalWindow
              title={FILE_TABS.find(t => t.id === activeTab)?.name ?? "FILE.TXT"}
              accent={styleIndex === 0 ? "cyan" : styleIndex === 1 ? "magenta" : "amber"}
              className="min-h-[220px]"
            >
              <TypeWriter
                key={activeTab}
                lines={tabContent[activeTab]}
                speed={18}
                lineDelay={120}
                className="text-[12px] text-phosphor"
                onDone={() => setTypewriterDone(true)}
              />
            </TerminalWindow>

            {/* Price + CTA */}
            <div className="crt-window p-4" style={{ border: `2px solid ${style.accent}`, boxShadow: `0 0 16px ${style.accent}44` }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-dim text-[10px] mb-1">PRICE.TXT LOADED:</div>
                  <div className="font-pixel text-xl sm:text-2xl" style={{ color: "#ffb000", textShadow: "0 0 20px rgba(255,176,0,0.8)" }}>
                    {formatCurrency(product.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-dim text-[9px] mb-1">QTY:</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="btn-retro px-2 py-1 text-[11px]"
                      disabled={quantity <= 1}
                    >─</button>
                    <span className="font-pixel text-[11px] w-6 text-center" style={{ color: style.accent }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                      className="btn-retro px-2 py-1 text-[11px]"
                      disabled={quantity >= maxQty || isOutOfStock}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Buy animation overlay */}
              {showBuyAnim && (
                <div className="mb-4">
                  <LoadingBar
                    label="COPYING TO FLOPPY DISK..."
                    duration={1800}
                    color={style.accent}
                  />
                </div>
              )}

              {/* Main CTA */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className="w-full font-pixel text-[10px] py-3 px-4 uppercase tracking-wider transition-all"
                style={{
                  background: isOutOfStock ? "#1a0000" : adding ? style.accent + "88" : style.accent,
                  color: "#000",
                  border: `2px solid ${style.accent}`,
                  boxShadow: isOutOfStock ? "none" : `0 0 20px ${style.accent}66`,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  opacity: isOutOfStock ? 0.5 : 1,
                }}
              >
                {isOutOfStock ? "✗ DISK FULL — OUT OF STOCK"
                  : adding      ? "⟳ COPYING TO FLOPPY..."
                  : "💾 COPY TO FLOPPY — BUY NOW"}
              </button>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigate("/checkout")}
                  className="flex-1 btn-retro text-[9px] py-2"
                  style={{ borderColor: style.accent + "88", color: style.accent + "cc" }}
                >
                  ⚡ CHECKOUT NOW
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 btn-retro text-[9px] py-2"
                >
                  ← GO BACK
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "🔒", text: "SSL SECURE" },
                { icon: "📦", text: "FAST SHIP" },
                { icon: "↩", text: "14D RETURN" },
              ].map((b, i) => (
                <div key={i} className="p-2 border text-[10px] font-terminal" style={{ borderColor: `${style.accent}22`, color: "#004d00" }}>
                  <div className="text-base mb-1">{b.icon}</div>
                  <div>{b.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BACK BUTTON ── */}
        <div className="mt-8 flex gap-4 font-terminal text-xs text-dim">
          <span>&gt; cd ..</span>
          <button onClick={() => navigate("/")} className="hover:text-phosphor transition-colors">[C:\HOME]</button>
          <button onClick={() => navigate("/products")} className="hover:text-phosphor transition-colors">[PRODUCTS.DIR]</button>
          <BlinkingCursor char="_" />
        </div>
      </main>
    </div>
  );
}
