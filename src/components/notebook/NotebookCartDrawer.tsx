import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/format";

interface Props { open: boolean; onClose: () => void; }

export function NotebookCartDrawer({ open, onClose }: Props) {
  const cart = useQuery(api.cart.get);
  const removeFromCart = useMutation(api.cart.remove);
  const navigate = useNavigate();
  const [removing, setRemoving] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const items = cart?.filter((i: any) => !removed.has(i._id)) ?? [];
  const total = items.reduce((s: number, i: any) => s + (i.product?.price ?? 0) * i.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleRemove(id: string) {
    setRemoving(id);
    await removeFromCart({ id: id as Id<"cartItems"> });
    setRemoved(p => new Set([...p, id]));
    setRemoving(null);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: "rgba(28,28,28,0.5)" }} onClick={onClose} />

      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-96 overflow-y-auto"
        style={{ background: "var(--paper)", borderLeft: "4px solid var(--ink)", boxShadow: "-6px 0 0 var(--ink)" }}
      >
        {/* Header */}
        <div style={{ background: "var(--ink)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "var(--paper)", fontSize: 22 }}>
            🛒 KOSZYK
          </span>
          <button onClick={onClose} style={{ fontFamily: "'IBM Plex Mono', monospace", background: "transparent", border: "2px solid var(--paper)", color: "var(--paper)", padding: "4px 12px", cursor: "pointer", fontSize: 16 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* notebook paper lines in background */}
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: "var(--muted-foreground)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            — lista zakupów —
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, marginBottom: 8 }}>Koszyk pusty</div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 18, color: "var(--muted-foreground)" }}>
                Wróć do sklepu i wybierz coś dla siebie.
              </div>
            </div>
          ) : (
            <div>
              {items.map((item: any, idx: number) => (
                <div
                  key={item._id}
                  style={{
                    borderBottom: "2px solid var(--line)",
                    paddingBottom: 14,
                    marginBottom: 14,
                    opacity: removing === item._id ? 0.4 : 1,
                    transition: "opacity 0.2s",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  {/* numbering */}
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: "var(--muted-foreground)", minWidth: 28 }}>
                    {idx + 1}.
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, lineHeight: 1.3 }}>
                      {item.product?.name ?? "Produkt"}
                    </div>
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, color: "var(--muted-foreground)" }}>
                      szt: {item.quantity} &nbsp;·&nbsp; {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item._id)}
                    disabled={removing === item._id}
                    style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, background: "transparent", border: "2px solid var(--ink-red)", color: "var(--ink-red)", padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}
                  >
                    usuń
                  </button>
                </div>
              ))}

              {/* Total */}
              <div style={{ borderTop: "3px solid var(--ink)", paddingTop: 16, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 20, textDecoration: "underline double" }}>Razem:</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26 }}>{formatCurrency(total)}</span>
                </div>
                <button
                  className="btn-ink"
                  style={{ width: "100%", textAlign: "center", fontSize: 20 }}
                  onClick={() => { onClose(); navigate("/checkout"); }}
                >
                  → Przejdź do kasy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
