import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/format";

const M = "'IBM Plex Mono', monospace";

interface Props { open: boolean; onClose: () => void; }

export function NotebookCartDrawer({ open, onClose }: Props) {
  const cart = useQuery(api.cart.get);
  const removeFromCart = useMutation(api.cart.remove);
  const navigate = useNavigate();
  const [removing, setRemoving] = useState<string | null>(null);

  const items = cart ?? [];
  const total = items.reduce((s: number, i: any) => s + (i.product?.price ?? 0) * i.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleRemove(id: string) {
    setRemoving(id);
    try { await removeFromCart({ id: id as Id<"cartItems"> }); } catch {}
    setRemoving(null);
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 51,
        width: "min(440px, 100vw)",
        background: "#000", color: "#fff",
        borderLeft: "4px solid #000",
        display: "flex", flexDirection: "column",
        fontFamily: M,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 24px", height: 56, flexShrink: 0,
          borderBottom: "4px solid #333",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em" }}>
            KOSZYK [{items.length}]
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "4px solid #fff", color: "#fff",
              padding: "4px 14px", fontSize: 12, cursor: "pointer",
              fontFamily: M, fontWeight: 700, letterSpacing: "0.1em",
              transition: "all 0.12s",
            }}
          >ESC</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>PUSTY</div>
              <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: "0.1em" }}>DODAJ PRODUKTY DO KOSZYKA</div>
            </div>
          ) : (
            items.map((item: any, idx: number) => (
              <div key={item._id} style={{
                borderBottom: "1px solid #333",
                padding: "18px 24px",
                opacity: removing === item._id ? 0.2 : 1,
                transition: "opacity 0.15s",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, opacity: 0.3, letterSpacing: "0.15em", marginBottom: 4, fontWeight: 700 }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, textTransform: "uppercase" }}>
                    {item.product?.name ?? "PRODUKT"}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4 }}>
                    {item.quantity}x {formatCurrency(item.product?.price ?? 0)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>
                    {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                  </span>
                  <button
                    onClick={() => handleRemove(item._id)}
                    disabled={removing === item._id}
                    style={{
                      background: "none", border: "1px solid #ff0000", color: "#ff0000",
                      padding: "2px 10px", fontSize: 10, cursor: "pointer",
                      fontFamily: M, fontWeight: 700, letterSpacing: "0.1em",
                      transition: "all 0.12s",
                    }}
                  >USUN</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total + Checkout */}
        {items.length > 0 && (
          <div style={{ borderTop: "4px solid #333", padding: 24, flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.15em", fontWeight: 700 }}>RAZEM</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: "#ff0000" }}>{formatCurrency(total)}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              style={{
                width: "100%", padding: "14px 0",
                background: "#fff", color: "#000",
                border: "4px solid #fff",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", cursor: "pointer",
                fontFamily: M,
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget;
                t.style.background = "#ff0000";
                t.style.color = "#fff";
                t.style.borderColor = "#ff0000";
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget;
                t.style.background = "#fff";
                t.style.color = "#000";
                t.style.borderColor = "#fff";
              }}
            >
              PRZEJDZ DO KASY
            </button>
          </div>
        )}
      </div>
    </>
  );
}
