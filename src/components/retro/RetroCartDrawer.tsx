import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/format";
import { TerminalWindow } from "./TerminalWindow";
import { BlinkingCursor } from "./BlinkingCursor";
import { LoadingBar } from "./LoadingBar";

interface RetroCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function RetroCartDrawer({ open, onClose }: RetroCartDrawerProps) {
  const cart = useQuery(api.cart.get);
  const removeFromCart = useMutation(api.cart.remove);
  const navigate = useNavigate();
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const items = cart?.filter((item: any) => !removed.has(item._id)) ?? [];
  const total = items.reduce(
    (sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  function handleRemove(id: string) {
    setCopyingId(id);
    setTimeout(async () => {
      await removeFromCart({ id: id as Id<"cartItems"> });
      setRemoved((prev) => new Set([...prev, id]));
      setCopyingId(null);
    }, 1000);
  }

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] overflow-y-auto retro-scroll"
        style={{
          background: "#000",
          borderLeft: "2px solid #00ff41",
          boxShadow: "-4px 0 30px rgba(0,255,65,0.3)",
        }}
      >
        <TerminalWindow
          title="FLOPPY DISK — C:\CART\"
          className="min-h-full"
          titleRight={
            <button
              onClick={onClose}
              className="font-pixel text-[10px] px-2 py-1"
              style={{ background: "transparent", border: "none", color: "#000", cursor: "pointer" }}
            >
              ✕ CLOSE
            </button>
          }
        >
          {/* Floppy art */}
          <div className="text-center text-xs text-dim mb-4 font-terminal">
            <pre className="ascii-art text-[10px]" style={{ color: "#00ff41" }}>{`
 ___________
|  _______  |
| | FILES | |
| |_______| |  ${items.length} FILE(S) ON DISK
|___[___]___|  ${formatCurrency(total)} TOTAL
`}</pre>
          </div>

          {/* Files list */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-dim">
              <div className="text-2xl mb-3">💾</div>
              <div className="font-pixel text-[9px] mb-2">DISK EMPTY</div>
              <div className="text-xs">NO FILES ON FLOPPY</div>
              <BlinkingCursor />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] text-dim pb-1 border-b font-pixel"
                style={{ borderColor: "rgba(0,255,65,0.2)" }}>
                <span>FILENAME</span>
                <span>QTY</span>
                <span>SIZE</span>
              </div>

              {items.map((item: any) => {
                const name = item.product?.name ?? "UNKNOWN.OBJ";
                const price = item.product?.price ?? 0;

                return (
                  <div key={item._id}>
                    {copyingId === item._id ? (
                      <div className="py-2">
                        <LoadingBar label="DELETING FILE..." duration={900} color="#ff0040" />
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-[1fr_auto_auto] gap-2 items-center py-1.5 border-b text-xs font-terminal hover:bg-green-950/20 transition-colors group"
                        style={{ borderColor: "rgba(0,255,65,0.1)" }}
                      >
                        <div>
                          <div className="text-phosphor truncate uppercase text-[11px]">
                            {name.replace(/\s+/g, "_").toUpperCase().slice(0, 18) + ".OBJ"}
                          </div>
                          <div className="text-dim text-[10px]">
                            {Math.floor(price * 137)} bytes
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="font-pixel text-amber text-[10px]">×{item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-phosphor font-pixel text-[10px]">
                            {formatCurrency(price * item.quantity)}
                          </div>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="text-[10px] text-destructive hover:opacity-80 transition-opacity mt-1"
                          >
                            [DEL]
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {items.length > 0 && (
            <div className="mt-6 space-y-3">
              {/* Total */}
              <div
                className="flex justify-between items-center py-2 border-t border-b font-pixel text-[11px]"
                style={{ borderColor: "#00ff41" }}
              >
                <span className="text-dim">TOTAL BYTES:</span>
                <span className="text-amber">{formatCurrency(total)}</span>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                className="btn-retro-inverted w-full font-pixel text-[10px] py-3 uppercase tracking-wider"
              >
                💾 SAVE TO FLOPPY → CHECKOUT
              </button>

              <button
                onClick={onClose}
                className="btn-retro w-full font-pixel text-[10px] py-2 uppercase"
              >
                ← CONTINUE BROWSING
              </button>
            </div>
          )}
        </TerminalWindow>
      </div>
    </>
  );
}
