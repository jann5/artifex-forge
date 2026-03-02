import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { NotebookCartDrawer } from "./NotebookCartDrawer";
import { useNavigate } from "react-router";

const F = "'Press Start 2P', monospace";

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

function NavLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", fontFamily: F, fontSize: 10,
      cursor: "pointer", color: "var(--fg)", padding: 0, lineHeight: 1,
    }}>
      {children}
    </button>
  );
}

function IconBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: "none", border: "none", cursor: "pointer", color: "var(--fg)",
      padding: 4, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0,
    }}>
      {children}
    </button>
  );
}

/* ─── ACCOUNT DROPDOWN ─── */
function AccountDropdown({ isAuthenticated, onClose }: { isAuthenticated: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function go(path: string) { navigate(path); onClose(); }

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      background: "var(--bg)", border: "3px solid var(--fg)",
      boxShadow: "6px 6px 0 var(--fg)", fontFamily: F,
      minWidth: 220, zIndex: 200,
      padding: "16px 20px 20px",
    }}>
      {/* inner double border */}
      <div style={{ position: "absolute", inset: 5, border: "2px solid var(--fg)", pointerEvents: "none" }} />

      <div style={{ fontSize: 12, marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid var(--fg)" }}>
        Account
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={() => go("/auth")}
          style={{
            width: "100%", padding: "10px 14px",
            background: "var(--fg)", color: "var(--bg)",
            border: "none", fontFamily: F, fontSize: 9,
            cursor: "pointer", textAlign: "left", lineHeight: 1.8,
          }}
        >
          Other sign in options
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
          <button
            onClick={() => go(isAuthenticated ? "/orders" : "/auth")}
            style={{
              padding: "10px 10px", background: "none",
              border: "3px solid var(--fg)", fontFamily: F, fontSize: 9,
              cursor: "pointer", color: "var(--fg)",
              display: "flex", alignItems: "center", gap: 6, lineHeight: 1.6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="14" height="14" rx="0"/>
              <line x1="7" y1="8" x2="13" y2="8"/>
              <line x1="7" y1="12" x2="11" y2="12"/>
            </svg>
            Orders
          </button>

          <button
            onClick={() => go(isAuthenticated ? "/settings" : "/auth")}
            style={{
              padding: "10px 10px", background: "none",
              border: "3px solid var(--fg)", fontFamily: F, fontSize: 9,
              cursor: "pointer", color: "var(--fg)",
              display: "flex", alignItems: "center", gap: 6, lineHeight: 1.6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="10" cy="6" r="4"/>
              <path d="M2 19 C2 14.5 5 12 10 12 C15 12 18 14.5 18 19"/>
            </svg>
            Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── NAVBAR ─── */
export function NotebookNavbar() {
  const { isAuthenticated } = useAuth();
  const cart = useQuery(api.cart.get);
  const cartCount = cart?.reduce((n: number, i: any) => n + i.quantity, 0) ?? 0;
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--bg)", borderBottom: "2px solid var(--fg)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px clamp(20px, 4vw, 60px)", fontFamily: F,
      }}>
        {/* LEFT — logo + text links */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <button onClick={() => navigate("/")} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", lineHeight: 0,
          }}>
            <img src="/logo.svg" alt="Artifex Forge" width={34} height={34}
              style={{ display: "block", imageRendering: "auto" }} />
          </button>
          <NavLink onClick={() => navigate("/")}>Home</NavLink>
          <NavLink onClick={() => navigate("/contact")}>Contact</NavLink>
          <NavLink onClick={() => navigate("/secret")}>[secret menu]</NavLink>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconBtn onClick={() => navigate("/products")} title="Szukaj">
            <SearchIcon />
          </IconBtn>

          {/* Account icon + dropdown */}
          <div style={{ position: "relative" }}>
            <IconBtn onClick={() => setAccountOpen(o => !o)} title="Account">
              <PersonIcon />
            </IconBtn>
            {accountOpen && (
              <AccountDropdown
                isAuthenticated={isAuthenticated}
                onClose={() => setAccountOpen(false)}
              />
            )}
          </div>

          <IconBtn onClick={() => setCartOpen(true)} title="Koszyk">
            <BagIcon count={cartCount} />
          </IconBtn>
        </div>
      </nav>
      <NotebookCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
