import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { BlinkingCursor } from "./BlinkingCursor";
import { GlitchText } from "./GlitchText";
import { RetroCartDrawer } from "./RetroCartDrawer";

export function RetroNavbar() {
  const { isAuthenticated } = useAuth();
  const cart = useQuery(api.cart.get);
  const cartCount = cart?.reduce((n: number, item: any) => n + item.quantity, 0) ?? 0;
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 font-terminal text-sm"
        style={{
          background: "#000",
          borderBottom: "2px solid #00ff41",
          boxShadow: "0 0 16px rgba(0,255,65,0.3)",
        }}
      >
        {/* Top status bar */}
        <div
          className="text-dim text-[10px] px-4 py-0.5 flex justify-between items-center overflow-hidden"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.2)", background: "#010d01" }}
        >
          <span>ARTIFEX FORGE v1.0 — SYSTEM ONLINE</span>
          <span className="hidden sm:block">{new Date().toLocaleString("pl-PL")}</span>
        </div>

        {/* Main bar */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <GlitchText className="font-pixel text-phosphor text-[10px] sm:text-xs tracking-wider">
              ARTIFEX.FORGE
            </GlitchText>
            <BlinkingCursor char="▮" className="text-[10px]" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-dim text-xs">
            <Link to="/" className="hover:text-phosphor transition-colors uppercase">
              C:\HOME
            </Link>
            <Link to="/products" className="hover:text-phosphor transition-colors uppercase">
              C:\PRODUCTS
            </Link>
            <Link to="/portfolio" className="hover:text-phosphor transition-colors uppercase">
              PORTFOLIO.DIR
            </Link>
            <Link to="/faq" className="hover:text-phosphor transition-colors uppercase">
              README.TXT
            </Link>
            <Link to="/contact" className="hover:text-phosphor transition-colors uppercase">
              CONTACT.SYS
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="btn-retro text-[9px] px-3 py-1.5 flex items-center gap-2"
              aria-label="Koszyk"
            >
              <span>💾</span>
              <span className="hidden sm:inline">FLOPPY</span>
              {cartCount > 0 && (
                <span
                  className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-pixel"
                  style={{ background: "#ff00ff", color: "#000" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <Link to="/settings" className="btn-retro text-[9px] px-3 py-1.5">
                USR
              </Link>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="btn-retro text-[9px] px-3 py-1.5"
              >
                LOGIN
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-phosphor text-lg"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t font-terminal text-xs"
            style={{ borderColor: "rgba(0,255,65,0.3)", background: "#010d01" }}
          >
            {[
              { label: "C:\\HOME", to: "/" },
              { label: "C:\\PRODUCTS", to: "/products" },
              { label: "PORTFOLIO.DIR", to: "/portfolio" },
              { label: "README.TXT", to: "/faq" },
              { label: "CONTACT.SYS", to: "/contact" },
              { label: "MY ORDERS", to: "/orders" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-4 py-3 text-dim hover:text-phosphor hover:bg-black border-b uppercase"
                style={{ borderColor: "rgba(0,255,65,0.1)" }}
                onClick={() => setMenuOpen(false)}
              >
                &gt; {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-[72px]" />

      {/* Cart drawer */}
      <RetroCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
