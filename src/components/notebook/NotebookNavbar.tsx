import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { NotebookCartDrawer } from "./NotebookCartDrawer";
import { useNavigate } from "react-router";

export function NotebookNavbar() {
  const { isAuthenticated } = useAuth();
  const cart = useQuery(api.cart.get);
  const cartCount = cart?.reduce((n: number, i: any) => n + i.quantity, 0) ?? 0;
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--ink)",
          borderBottom: "4px solid var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          gap: 16,
          // little torn paper bottom edge
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "clamp(18px, 3vw, 26px)",
            color: "var(--paper)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Artifex Forge
        </button>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/orders")}
              style={{ fontFamily: "'Courier Prime', monospace", fontSize: 18, background: "transparent", border: "none", color: "var(--paper)", cursor: "pointer", textDecoration: "underline" }}
            >
              zamówienia
            </button>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/auth")}
              style={{ fontFamily: "'Courier Prime', monospace", fontSize: 18, background: "transparent", border: "none", color: "var(--paper)", cursor: "pointer", textDecoration: "underline" }}
            >
              zaloguj
            </button>
          )}

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 18,
              background: "var(--paper)",
              border: "2px solid var(--paper)",
              color: "var(--ink)",
              padding: "6px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "3px 3px 0 var(--ink-red)",
              transition: "all 0.1s",
            }}
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  background: "var(--ink-red)",
                  color: "#fff",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 14,
                  padding: "1px 7px",
                  borderRadius: 999,
                  minWidth: 22,
                  textAlign: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
      <NotebookCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
