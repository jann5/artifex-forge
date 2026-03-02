import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { NotebookCartDrawer } from "./NotebookCartDrawer";
import { useNavigate } from "react-router";

const M = "'IBM Plex Mono', monospace";

export function NotebookNavbar() {
  const { isAuthenticated } = useAuth();
  const cart = useQuery(api.cart.get);
  const cartCount = cart?.reduce((n: number, i: any) => n + i.quantity, 0) ?? 0;
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const linkStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    borderLeft: "4px solid #000",
    height: 56,
    padding: "0 20px",
    fontFamily: M,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    color: "#000",
    transition: "all 0.12s",
  };

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff",
        borderBottom: "4px solid #000",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 80px)",
        height: 56,
        fontFamily: M,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none", border: "none",
            fontFamily: M, fontSize: 16, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer", color: "#000",
          }}
        >
          ARTIFEX FORGE
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 0, height: 56 }}>
          {isAuthenticated ? (
            <button onClick={() => navigate("/orders")} style={linkStyle}>
              ZAMOWIENIA
            </button>
          ) : (
            <button onClick={() => navigate("/auth")} style={linkStyle}>
              ZALOGUJ
            </button>
          )}

          <button
            onClick={() => setCartOpen(true)}
            style={{
              ...linkStyle,
              background: cartCount > 0 ? "#000" : "transparent",
              color: cartCount > 0 ? "#fff" : "#000",
            }}
          >
            KOSZYK
            {cartCount > 0 && (
              <span style={{ color: "#ff0000", marginLeft: 6 }}>[{cartCount}]</span>
            )}
          </button>
        </div>
      </nav>
      <NotebookCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
