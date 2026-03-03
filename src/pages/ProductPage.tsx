import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const F = "'Press Start 2P', monospace";
const BG = "#ede8d0";
const FG = "#1a1a1a";
const ACCENT = "#cc0000";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = useQuery(api.products.get, { id: id as Id<"products"> });
  const addToCart = useMutation(api.cart.add);
  const { isAuthenticated } = useAuth();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    if (!isAuthenticated) { navigate("/auth"); return; }
    if (!product) return;
    setAdding(true);
    try {
      await addToCart({ productId: product._id, quantity });
      toast.success("Dodano do koszyka");
    } catch (e: any) {
      toast.error(e.message ?? "Blad");
    } finally {
      setAdding(false);
    }
  }

  if (product === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: F }}>
        <NotebookNavbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontSize: 10 }}>
          WCZYTYWANIE<span className="blink">_</span>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: F }}>
        <NotebookNavbar />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
          <div style={{ fontSize: 11, color: ACCENT }}>NIE ZNALEZIONO</div>
          <button onClick={() => navigate("/products")} className="pixel-btn" style={{ fontSize: 9 }}>WRÓĆ DO SKLEPU</button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.inventory === 0;
  const isLowStock = product.inventory > 0 && product.inventory <= 5;
  const maxQty = product.inventory;

  const box: React.CSSProperties = {
    border: `3px solid ${FG}`,
    boxShadow: `6px 6px 0 ${FG}`,
    background: BG,
    padding: "20px 24px",
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: F }}>
      <NotebookNavbar />

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 20px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 8, marginBottom: 20, display: "flex", gap: 8, alignItems: "center", opacity: 0.6 }}>
          <button onClick={() => navigate("/")} style={{ fontFamily: F, background: "none", border: "none", cursor: "pointer", fontSize: 8, textDecoration: "underline" }}>Glowna</button>
          <span>›</span>
          <button onClick={() => navigate("/products")} style={{ fontFamily: F, background: "none", border: "none", cursor: "pointer", fontSize: 8, textDecoration: "underline" }}>Sklep</button>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="product-page-grid">

          {/* LEFT: Images */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...box, padding: 0, overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
              {product.images?.[activeImage] ? (
                <img
                  src={getStorageUrl(product.images[activeImage]) ?? ""}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", imageRendering: "auto", display: "block" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, opacity: 0.5 }}>BRAK ZDJECIA</div>
              )}
              {isOutOfStock && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: F, fontSize: 10, color: "#fff", border: "2px solid #fff", padding: "6px 12px" }}>WYPRZEDANE</span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 70, height: 70, padding: 0,
                      border: i === activeImage ? `3px solid ${ACCENT}` : `2px solid ${FG}`,
                      cursor: "pointer", overflow: "hidden", background: "#d8d4bc", flexShrink: 0,
                    }}
                  >
                    <img
                      src={getStorageUrl(img) ?? ""}
                      alt={`zdjecie ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", imageRendering: "auto" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={box}>
              {isLowStock && !isOutOfStock && (
                <div style={{ fontSize: 7, color: ACCENT, marginBottom: 8 }}>⚠ OSTATNIE {product.inventory} SZT.</div>
              )}
              {!isOutOfStock && !isLowStock && (
                <div style={{ fontSize: 7, color: "#228822", marginBottom: 8 }}>✓ DOSTEPNE</div>
              )}
              <h1 style={{ fontSize: 12, lineHeight: 1.9, margin: "0 0 10px" }}>{product.name}</h1>
              <div style={{ fontSize: 7, opacity: 0.45, marginBottom: 14 }}>{product.category?.toUpperCase()}</div>
              <div style={{ fontSize: 22, color: ACCENT }}>{formatCurrency(product.price)}</div>
            </div>

            <div style={box}>
              <div style={{ fontSize: 8, opacity: 0.5, marginBottom: 10 }}>OPIS</div>
              <p style={{ fontSize: 9, lineHeight: 2.1, margin: 0 }}>{product.description}</p>
            </div>

            <div style={box}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 8, opacity: 0.5 }}>ILOSC:</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                    style={{ fontFamily: F, fontSize: 14, width: 30, height: 30, border: `2px solid ${FG}`, background: BG, cursor: "pointer" }}>−</button>
                  <span style={{ fontSize: 11, minWidth: 26, textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty || isOutOfStock}
                    style={{ fontFamily: F, fontSize: 14, width: 30, height: 30, border: `2px solid ${FG}`, background: BG, cursor: "pointer" }}>+</button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                style={{
                  width: "100%", fontFamily: F, fontSize: 10, padding: "13px 16px",
                  background: isOutOfStock ? "#999" : FG, color: BG, border: "none",
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  boxShadow: isOutOfStock ? "none" : `4px 4px 0 ${ACCENT}`,
                  marginBottom: 12,
                }}
              >
                {isOutOfStock ? "WYPRZEDANE" : adding ? "DODAWANIE..." : "DODAJ DO KOSZYKA"}
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => navigate("/checkout")} className="pixel-btn-outline" style={{ fontSize: 8, padding: "8px 10px" }}>ZAMOW TERAZ</button>
                <button onClick={() => navigate(-1)} className="pixel-btn-outline" style={{ fontSize: 8, padding: "8px 10px" }}>← WSTECZ</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[["DOSTAWA","InPost/Kurier"],["ZWROT","14 dni"],["PLATNOSC","Stripe SSL"]].map(([l,v]) => (
                <div key={l} style={{ border: `2px solid ${FG}`, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 7, marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 7, opacity: 0.5 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`.product-page-grid { } @media(max-width:640px){.product-page-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
