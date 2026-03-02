import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { NotebookCartDrawer } from "./NotebookCartDrawer";
import { useNavigate } from "react-router";

const F = "'Press Start 2P', monospace";

/* ─── SVG ICONS ─── */
function ShirtIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M1 5 L6 1 L8 3 C8.5 5 13.5 5 14 3 L16 1 L21 5 L18 8 L16 6 L16 19 L6 19 L6 6 L4 8 Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <line x1="13" y1="13" x2="19" y2="19" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="6" r="4" />
      <path d="M2 19 C2 14.5 5 12 10 12 C15 12 18 14.5 18 19" />
    </svg>
  );
}

function BagIcon({ count }: { count: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="14" rx="0" />
        <path d="M6 7 C6 4 8 2 10 2 C12 2 14 4 14 7" />
      </svg>
      {count > 0 && (
        <span style={{
          position: "absolute", top: -6, right: -8,
          background: "var(--accent)", color: "#fff",
          fontFamily: F, fontSize: 7, padding: "1px 4px",
          minWidth: 14, textAlign: "center", lineHeight: "14px",
        }}>
          {count}
        </span>
      )}
    </span>
  );
}

/* ─── NAV LINK BUTTON ─── */
function NavLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none",
        fontFamily: F, fontSize: 10, cursor: "pointer",
        color: "var(--fg)", padding: 0,
        textDecoration: "none", lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

/* ─── ICON BUTTON ─── */
function IconBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none", border: "none",
        cursor: "pointer", color: "var(--fg)", padding: 4,
        display: "flex", alignItems: "center", justifyContent: "center",
        lineHeight: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ─── NAVBAR ─── */
export function NotebookNavbar() {
  const { isAuthenticated } = useAuth();
  const cart = useQuery(api.cart.get);
  const cartCount = cart?.reduce((n: number, i: any) => n + i.quantity, 0) ?? 0;
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--bg)",
        borderBottom: "2px solid var(--fg)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px clamp(20px, 4vw, 60px)",
        fontFamily: F,
      }}>
        {/* LEFT — shirt icon + text links */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <IconBtn onClick={() => navigate("/")} title="Home">
            <ShirtIcon />
          </IconBtn>
          <NavLink onClick={() => navigate("/")}>Home</NavLink>
          <NavLink onClick={() => navigate("/contact")}>[secret menu]</NavLink>
        </div>

        {/* RIGHT — icon buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconBtn onClick={() => navigate("/products")} title="Szukaj">
            <SearchIcon />
          </IconBtn>

          <IconBtn
            onClick={() => isAuthenticated ? navigate("/orders") : navigate("/auth")}
            title={isAuthenticated ? "Zamówienia" : "Zaloguj"}
          >
            <PersonIcon />
          </IconBtn>

          <IconBtn onClick={() => setCartOpen(true)} title="Koszyk">
            <BagIcon count={cartCount} />
          </IconBtn>
        </div>
      </nav>
      <NotebookCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
