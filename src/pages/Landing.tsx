import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { RetroNavbar } from "@/components/retro/RetroNavbar";
import { TerminalWindow } from "@/components/retro/TerminalWindow";
import { DirectoryListing, DirEntry } from "@/components/retro/DirectoryListing";
import { BlinkingCursor } from "@/components/retro/BlinkingCursor";
import { GlitchText } from "@/components/retro/GlitchText";
import { BootSequence } from "@/components/retro/LoadingBar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";

const PRODUCT_ARTS = [
  `  ╔══════════╗\n  ║  ▓▓▓▓▓▓ ║\n  ║  ▓ P1 ▓ ║\n  ║  ▓▓▓▓▓▓ ║\n  ╚══════════╝`,
  `  ╔══════════╗\n  ║  ████████║\n  ║  █ P2  █║\n  ║  ████████║\n  ╚══════════╝`,
  `  ╔══════════╗\n  ║  ░░░░░░ ║\n  ║  ░ P3 ░ ║\n  ║  ░░░░░░ ║\n  ╚══════════╝`,
];

const PRODUCT_ACCENTS = ["#00ffff", "#ff00ff", "#ffb000"] as const;

const today = new Date().toLocaleDateString("pl-PL", {
  day: "2-digit", month: "2-digit", year: "numeric",
});

function BootScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
      <TerminalWindow title="ARTIFEX.FORGE — STARTUP.EXE" className="w-full max-w-lg mx-4">
        <BootSequence onDone={onDone} />
      </TerminalWindow>
    </div>
  );
}

function ProductTerminalCard({ product, index, onClick }: { product: any; index: number; onClick: () => void }) {
  const accent = PRODUCT_ACCENTS[index % 3];
  const art = PRODUCT_ARTS[index % 3];
  const [hovered, setHovered] = useState(false);
  const dirName = product.name.replace(/\s+/g, "_").toUpperCase().slice(0, 14);

  return (
    <div
      className="crt-window cursor-pointer"
      style={{
        border: `2px solid ${accent}`,
        boxShadow: hovered ? `0 0 30px ${accent}88, 0 0 60px ${accent}44` : `0 0 10px ${accent}44`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="dos-titlebar text-[9px]" style={{ background: accent, color: "#000" }}>
        <span>C:\PRODUCTS\{dirName}\</span>
        <span className="opacity-60">[{index + 1}/3]</span>
      </div>

      <div className="p-4 z-10 relative">
        <div className="flex gap-4 mb-4">
          <div className="flex-shrink-0">
            {product.images?.[0] ? (
              <div style={{ width: 80, height: 80, border: `1px solid ${accent}`, overflow: "hidden", filter: "grayscale(100%) contrast(1.4)", imageRendering: "pixelated" as const }}>
                <img src={getStorageUrl(product.images[0]) ?? ""} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <pre className="ascii-art text-[9px]" style={{ color: accent, textShadow: `0 0 6px ${accent}80` }}>{art}</pre>
            )}
          </div>
          <div className="flex-1 font-terminal text-xs space-y-1">
            <div style={{ color: accent, textShadow: `0 0 8px ${accent}80` }}>
              <span className="font-pixel text-[9px]">{product.name}</span>
            </div>
            <div className="text-dim text-[10px] line-clamp-2">{product.description.slice(0, 80)}{product.description.length > 80 ? "..." : ""}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-pixel text-[10px]" style={{ color: "#ffb000" }}>{formatCurrency(product.price)}</span>
              {product.inventory <= 5 && product.inventory > 0 && <span className="text-[9px] font-pixel" style={{ color: "#ff0040" }}>LOW: {product.inventory}</span>}
              {product.inventory === 0 && <span className="text-[9px] font-pixel" style={{ color: "#ff0000" }}>OUT OF STOCK</span>}
            </div>
          </div>
        </div>

        <div className="border-t pt-3 font-terminal text-[11px]" style={{ borderColor: `${accent}30` }}>
          {[
            { name: "README.TXT", type: "FILE" as const, size: `${Math.floor(product.description.length * 1.5)} bytes` },
            { name: "SPECS.TXT",  type: "FILE" as const, size: "512 bytes" },
            { name: "PRICE.TXT",  type: "FILE" as const, size: "42 bytes" },
            { name: "BUY.NOW",    type: "EXE"  as const, size: "1 byte" },
          ].map((entry, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 py-0.5 ${entry.type === "EXE" ? "cursor-pointer hover:bg-green-900/20" : ""}`}
              onClick={entry.type === "EXE" ? (e) => { e.stopPropagation(); onClick(); } : undefined}
            >
              <span className="w-10 text-[10px]" style={{ color: entry.type === "EXE" ? "#ff00ff" : accent }}>
                {entry.type === "EXE" ? "[EXE]" : "     "}
              </span>
              <span className="uppercase font-pixel text-[9px] flex-1" style={{ color: entry.type === "EXE" ? "#ff00ff" : "#00ff41", textShadow: entry.type === "EXE" ? "0 0 8px rgba(255,0,255,0.6)" : "0 0 6px rgba(0,255,65,0.4)" }}>
                {entry.name}
              </span>
              <span className="text-dim text-[10px]">{entry.size}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1 text-[11px]" style={{ color: accent }}>
          <span>C:\PRODUCTS\{dirName}&gt;</span>
          {hovered && <BlinkingCursor char="▮" />}
        </div>
      </div>
    </div>
  );
}

function RetroTicker() {
  const msg = "*** ARTIFEX FORGE — SKLEP ONLINE ***  >>> DOSTAWA KURIEREM / INPOST <<<  *** BEZPIECZNA PŁATNOŚĆ STRIPE ***  >>> PRESS ANY KEY TO CONTINUE... <<<  *** NO CARRIER ***  >>> DIAL-UP SPEED: 56K <<<";
  return (
    <div className="overflow-hidden font-pixel text-[9px] py-1.5 border-y" style={{ background: "#000", borderColor: "#00ff41", color: "#00ff41", textShadow: "0 0 6px rgba(0,255,65,0.6)" }}>
      <div className="whitespace-nowrap" style={{ display: "inline-block", animation: "title-scroll 30s linear infinite" }}>
        {msg}&nbsp;&nbsp;&nbsp;{msg}
      </div>
    </div>
  );
}

function SystemStats({ count }: { count: number }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <div className="font-terminal text-[10px] text-dim flex flex-wrap gap-x-6 gap-y-1 px-1">
      <span>SYS: ARTIFEX v1.0</span>
      <span>MEM: 640K</span>
      <span>FILES: {count}</span>
      <span>TIME: {time.toLocaleTimeString("pl-PL")}</span>
      <span>STATUS: <span className="text-phosphor animate-blink">ONLINE ■</span></span>
    </div>
  );
}

export default function Landing() {
  const products = useQuery(api.products.list, {});
  const navigate = useNavigate();
  const [booted, setBooted] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);
  const displayProducts = products?.slice(0, 3) ?? [];

  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;

  return (
    <div className="min-h-screen bg-black text-phosphor font-terminal">
      <RetroNavbar />
      <RetroTicker />

      <main className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ── HEADER ── */}
        <TerminalWindow title="ARTIFEX.FORGE — MAIN.MENU" className="mb-6">
          <div className="text-center py-4">
            <pre className="ascii-art inline-block text-left mb-4" style={{ color: "#00ff41", fontSize: "clamp(6px, 1.2vw, 11px)" }}>
{`  ▄▄▄    ▄▄▄  ▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄  ▄▄   ▄▄
 █   █  █   █    █      █      █         █         █  █ █  █
 █▄▄▄█  █▄▄▄█    █      █▄▄▄   ▀▀▀▀█    ▀▀▀▀█      █  █▄█  █
 █   █  █   █    █      █         █         █      █       █
 █   █  █   █    █      █▄▄▄▄▄▄   █    ▄▄▄▄▄▄      █       █
  ▀▀▀    ▀▀▀     ▀       ▀▀▀▀▀▀▀  ▀▀▀  ▀▀▀▀▀▀▀      ▀▀▀▀▀▀▀

 ▄▄▄▄▄▄▄  ▄▄▄▄▄▄   ▄▄▄▄▄▄   ▄▄▄▄▄▄  ▄▄▄▄▄▄▄
 █       █       █ █      █ █      █ █
 █▄▄▄▄▄  █   ▄   █ █▄▄▄▄▄▀  █  ▄▄▄  █▄▄▄▄▄
 █       █   █   █ █   █  █ █  █  █ █
 █       █   █   █ █   █  ▄ █  █▄▄█ █
 █▄▄▄▄▄▄▄ ▀▄▄▄▄▄▀  ▀▄▄▄▄▄▀   ▀▄▄▄▄▄▀ █`}
            </pre>
            <div className="font-pixel text-[9px] text-dim mb-1">v1.0 — SYSTEM ONLINE — {today}</div>
            <div className="font-terminal text-xs text-dim">Sklep z produktami | {displayProducts.length} Products | Fast Shipping</div>
          </div>
        </TerminalWindow>

        {/* ── DOS DIRECTORY ── */}
        <TerminalWindow title={`DIR C:\\PRODUCTS\\ [${displayProducts.length} ITEM(S)]`} className="mb-6">
          <SystemStats count={displayProducts.length} />
          <div className="mt-3">
            {products === undefined ? (
              <div className="font-terminal text-xs text-dim py-4">
                <div className="flex items-center gap-2"><span>&gt; READING DISK...</span><BlinkingCursor /></div>
                <div className="loading-bar-track mt-3"><div className="loading-bar-fill" /></div>
              </div>
            ) : (
              <DirectoryListing
                path="C:\PRODUCTS"
                promptPath="C:\PRODUCTS"
                entries={[
                  { name: "<PARENT>", type: "DIR", date: "01-01-1985", time: "00:00" },
                  ...displayProducts.map((p: any, i: number) => ({
                    name: p.name.replace(/\s+/g, "_").toUpperCase().slice(0, 14),
                    type: "DIR" as const,
                    date: today,
                    time: `00:0${i + 1}`,
                    accent: PRODUCT_ACCENTS[i % 3],
                    onClick: () => navigate(`/products/${p._id}`),
                  })),
                ]}
              />
            )}
          </div>
        </TerminalWindow>

        {/* ── PRODUCT CARDS ── */}
        <div ref={productRef} className="mb-6">
          <div className="font-pixel text-[9px] text-dim mb-3 flex items-center gap-2">
            <span>&gt; LOADING PRODUCT FILES...</span>
            <BlinkingCursor char="_" />
          </div>
          {products === undefined ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[0,1,2].map(i => <div key={i} className="skeleton-shimmer" style={{ border: `2px solid ${PRODUCT_ACCENTS[i]}33`, height: 320 }} />)}
            </div>
          ) : displayProducts.length === 0 ? (
            <TerminalWindow title="ERROR 404" accent="magenta">
              <div className="font-terminal text-center py-8">
                <div className="font-pixel text-[10px] text-magenta mb-2">DISK EMPTY — NO FILES</div>
                <div className="text-xs text-dim">Produkty nie zostały jeszcze dodane przez administratora.</div>
              </div>
            </TerminalWindow>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {displayProducts.map((p: any, i: number) => (
                <ProductTerminalCard key={p._id} product={p} index={i} onClick={() => navigate(`/products/${p._id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ROW ── */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: "📦", title: "DELIVERY.SYS", l1: "INPOST PACZKOMAT", l2: "KURIER 1-2 DNI", a: "#00ffff" },
            { icon: "🔒", title: "SECURE.DLL",  l1: "STRIPE PAYMENTS", l2: "256-BIT SSL",     a: "#ff00ff" },
            { icon: "⭐", title: "SUPPORT.EXE", l1: "TELEGRAM BOT",    l2: "RESPONSE <24H",   a: "#ffb000" },
          ].map((item, i) => (
            <div key={i} className="crt-window p-4 text-center" style={{ border: `1px solid ${item.a}44` }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-pixel text-[9px] mb-2" style={{ color: item.a }}>{item.title}</div>
              <div className="font-terminal text-xs text-dim">{item.l1}<br />{item.l2}</div>
            </div>
          ))}
        </div>

        {/* ── FAKE REVIEWS ── */}
        <TerminalWindow title="REVIEWS.LOG — USER FEEDBACK" className="mb-6" accent="amber">
          <div className="space-y-3">
            {[
              { user: "user_4829",       stars: 5, text: "PRODUKT DZIAŁA PERFEKCYJNIE. POLECAM!", date: "2025-11-12" },
              { user: "sys_admin_7742",  stars: 5, text: "JAKOŚĆ 10/10, DOSTAWA EKSPRESOWA.",      date: "2025-12-01" },
              { user: "ghost_byte_91",   stars: 4, text: "BARDZO DOBRY TOWAR. 3 RAZY ZAMAWIAŁEM.", date: "2026-01-15" },
            ].map((r, i) => (
              <div key={i} className="border-b py-2 font-terminal text-xs" style={{ borderColor: "rgba(255,176,0,0.15)" }}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-amber text-[10px]">&gt; {r.user}</span>
                  <span className="text-[10px]" style={{ color: "#ff00ff" }}>{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</span>
                  <span className="text-dim text-[10px]">{r.date}</span>
                </div>
                <div className="text-dim pl-4">{r.text}</div>
              </div>
            ))}
          </div>
        </TerminalWindow>

        {/* ── FOOTER ── */}
        <TerminalWindow title="SYSTEM.INI — README" accent="cyan">
          <div className="font-terminal text-[11px] text-dim text-center space-y-2">
            <div className="font-pixel text-[8px] text-cyan mb-3">ARTIFEX FORGE &copy; 1985-{new Date().getFullYear()}. ALL RIGHTS RESERVED.</div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[10px]">
              {[["PP.TXT","/privacy"],["CONTACT.SYS","/contact"],["README.FAQ","/faq"],["MY_ORDERS","/orders"],["LOGIN.EXE","/auth"]].map(([l,h]) => (
                <a key={h} href={h} className="hover:text-phosphor transition-colors">{l}</a>
              ))}
            </div>
            <div className="text-[9px] mt-2 opacity-40">POWERED BY CONVEX &amp; STRIPE · 640K OUGHT TO BE ENOUGH</div>
          </div>
        </TerminalWindow>

      </main>
    </div>
  );
}
