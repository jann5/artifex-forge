import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/format";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getStorageUrl } from "@/lib/utils";

const F = "'Press Start 2P', monospace";
const BG = "#ede8d0";
const FG = "#1a1a1a";
const ACCENT = "#cc0000";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  price: number;
  image: string;
  category: string;
  inventory?: number;
}

export function ProductCard({ id, name, price, image, category, inventory }: ProductCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addToCart = useMutation(api.cart.add);

  const imageUrl = getStorageUrl(image);
  const isOutOfStock = inventory !== undefined && inventory === 0;
  const isLowStock = inventory !== undefined && inventory > 0 && inventory <= 5;

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/auth"); return; }
    try {
      await addToCart({ productId: id, quantity: 1 });
      toast.success("Dodano do koszyka");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Blad");
    }
  }

  return (
    <div
      onClick={() => navigate(`/products/${id}`)}
      style={{
        cursor: "pointer",
        border: `3px solid ${FG}`,
        boxShadow: `5px 5px 0 ${FG}`,
        background: BG,
        fontFamily: F,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.1s, transform 0.1s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `3px 3px 0 ${FG}`;
        (e.currentTarget as HTMLDivElement).style.transform = "translate(2px,2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `5px 5px 0 ${FG}`;
        (e.currentTarget as HTMLDivElement).style.transform = "none";
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#d8d4bc", overflow: "hidden", borderBottom: `2px solid ${FG}` }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              imageRendering: "auto",
              display: "block",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#888", fontFamily: F }}>
            BRAK<br/>ZDJECIA
          </div>
        )}

        {isOutOfStock && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: F, fontSize: 9, color: "#fff", border: "2px solid #fff", padding: "4px 8px" }}>WYPRZEDANE</span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: ACCENT, color: "#fff",
            fontFamily: F, fontSize: 7, padding: "3px 6px",
          }}>
            OSTATNIE {inventory} SZT.
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 7, color: "#888" }}>{(category || "").toUpperCase()}</div>
        <div style={{ fontSize: 9, lineHeight: 1.7, flex: 1 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 8 }}>
          <span style={{ fontSize: 10, color: ACCENT }}>{formatCurrency(price)}</span>
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              style={{
                fontFamily: F, fontSize: 7, padding: "5px 10px",
                background: FG, color: BG,
                border: "none", cursor: "pointer",
                flexShrink: 0,
              }}
            >+ KOSZYK</button>
          )}
        </div>
      </div>
    </div>
  );
}
