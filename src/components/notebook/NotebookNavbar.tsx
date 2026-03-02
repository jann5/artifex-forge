import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { NotebookCartDrawer } from "./NotebookCartDrawer";
import { useNavigate } from "react-router";

const F = "'Press Start 2P', monospace";

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
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px clamp(20px, 5vw, 80px)",
        fontFamily: F,
        fontSize: 10,
      }}>
        {/* Left — pixel shirt icon + links */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none",
              fontFamily: F, fontSize: 14, cursor: "pointer",
              color: "var(--fg)", padding: 0,
            }}
            title="Home"
          >
            👕
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none",
              fontFamily: F, fontSize: 10, cursor: "pointer",
              color: "var(--fg)", padding: 0, textDecoration: "none",
            }}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/faq")}
            style={{
              background: "none", border: "none",
              fontFamily: F, fontSize: 10, cursor: "pointer",
              color: "var(--fg)", padding: 0, textDecoration: "none",
            }}
          >
            FAQ
          </button>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/orders")}
              style={{
                background: "none", border: "none",
                fontFamily: F, fontSize: 10, cursor: "pointer",
                color: "var(--fg)", padding: 0,
              }}
            >
              📋
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              style={{
                background: "none", border: "none",
                fontFamily: F, fontSize: 10, cursor: "pointer",
                color: "var(--fg)", padding: 0,
              }}
            >
              👤
            </button>
          )}

          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: "none", border: "none",
              fontFamily: F, fontSize: 10, cursor: "pointer",
              color: "var(--fg)", padding: 0,
              position: "relative",
            }}
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -8, right: -12,
                background: "var(--accent)", color: "#fff",
                fontFamily: F, fontSize: 8, padding: "1px 4px",
                minWidth: 14, textAlign: "center",
              }}>
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
