import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/format";

const F = "'Press Start 2P', monospace";

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
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26,26,26,0.5)" }}
        onClick={onClose}
      />

      {/* Drawer — window-box style */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 51,
        width: "min(480px, calc(100vw - 40px))",
        maxHeight: "80vh",
        background: "var(--bg)",
        border: "3px solid var(--fg)",
        boxShadow: "6px 6px 0 var(--fg)",
        display: "flex", flexDirection: "column",
        fontFamily: F,
      }}>
        {/* Inner border */}
        <div style={{
          position: "absolute", inset: 5,
          border: "2px solid var(--fg)",
          pointerEvents: "none", zIndex: 1,
        }} />

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px",
          borderBottom: "3px solid var(--fg)",
          position: "relative", zIndex: 2,
        }}>
          <span style={{ fontSize: 11 }}>KOSZYK [{items.length}]</span>
          <button
            onClick={onClose}
            className="pixel-btn-outline"
            style={{ fontSize: 9, padding: "4px 12px" }}
          >ESC</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 2 }}>
          {items.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, marginBottom: 8 }}>PUSTY.</div>
              <div style={{ fontSize: 9, opacity: 0.4 }}>dodaj produkty do koszyka.</div>
            </div>
          ) : (
            items.map((item: any, idx: number) => (
              <div key={item._id} style={{
                borderBottom: "2px dashed var(--fg)",
                padding: "14px 20px",
                opacity: removing === item._id ? 0.2 : 1,
                transition: "opacity 0.15s",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, opacity: 0.3, marginBottom: 2 }}>{String(idx + 1).padStart(2, "0")}.</div>
                  <div style={{ fontSize: 10, lineHeight: 1.8 }}>{item.product?.name ?? "PRODUKT"}</div>
                  <div style={{ fontSize: 9, opacity: 0.4, marginTop: 2 }}>
                    {item.quantity}x {formatCurrency(item.product?.price ?? 0)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11 }}>{formatCurrency((item.product?.price ?? 0) * item.quantity)}</span>
                  <button
                    onClick={() => handleRemove(item._id)}
                    disabled={removing === item._id}
                    style={{
                      background: "none", border: "2px solid var(--accent)", color: "var(--accent)",
                      padding: "2px 8px", fontSize: 8, cursor: "pointer", fontFamily: F,
                    }}
                  >USUN</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total + Checkout */}
        {items.length > 0 && (
          <div style={{ borderTop: "3px solid var(--fg)", padding: "16px 20px", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span style={{ fontSize: 10 }}>RAZEM:</span>
              <span style={{ fontSize: 14 }}>{formatCurrency(total)}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              className="pixel-btn"
              style={{ width: "100%", textAlign: "center", fontSize: 10 }}
            >
              PRZEJDZ DO KASY
            </button>
          </div>
        )}
      </div>
    </>
  );
}
