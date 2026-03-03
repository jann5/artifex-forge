import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { getStorageUrl } from "@/lib/utils";

const F = "'Press Start 2P', monospace";
const BG = "#ede8d0";
const FG = "#1a1a1a";
const ACCENT = "#cc0000";

type Tab = "add" | "list";

type ProductDraft = {
  name: string;
  description: string;
  price: number | "";
  inventory: number | "";
  images: string[];
  featured: boolean;
};

const emptyDraft = (): ProductDraft => ({
  name: "",
  description: "",
  price: "",
  inventory: "",
  images: [],
  featured: false,
});

function PixelInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  textarea = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const shared: React.CSSProperties = {
    fontFamily: F,
    fontSize: 9,
    background: BG,
    color: FG,
    border: `2px solid ${FG}`,
    padding: "6px 8px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    marginTop: 4,
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: F, fontSize: 9, display: "block" }}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ ...shared, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={shared}
        />
      )}
    </div>
  );
}

function ImageUploadArea({
  images,
  onUpload,
  onRemove,
  isUploading,
}: {
  images: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
  isUploading: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: F, fontSize: 9, display: "block", marginBottom: 6 }}>
        ZDJECIA ({images.length})
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {images.map((id, idx) => (
          <div key={id} style={{ position: "relative", width: 70, height: 70 }}>
            <img
              src={getStorageUrl(id) ?? undefined}
              alt=""
              style={{ width: 70, height: 70, objectFit: "cover", border: `2px solid ${FG}` }}
            />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              style={{
                position: "absolute", top: -6, right: -6,
                background: ACCENT, color: "#fff",
                border: "none", borderRadius: "50%",
                width: 18, height: 18, fontSize: 10,
                cursor: "pointer", fontFamily: F, lineHeight: "18px", padding: 0,
              }}
            >×</button>
          </div>
        ))}
      </div>
      <label
        style={{
          fontFamily: F, fontSize: 9, cursor: "pointer",
          border: `2px solid ${FG}`, padding: "6px 14px",
          background: isUploading ? "#aaa" : BG,
          display: "inline-block",
        }}
      >
        {isUploading ? "WGRYWAM..." : "+ DODAJ ZDJECIA"}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onUpload}
          disabled={isUploading}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("af_admin") === "1");
  const [pwInput, setPwInput] = useState("");
  const [pwWrong, setPwWrong] = useState(false);
  const [tab, setTab] = useState<Tab>("add");
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft());
  const [isUploading, setIsUploading] = useState(false);
  const [addUploading, setAddUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(emptyDraft());

  // Password gate
  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <NotebookNavbar />
        <div className="window-box" style={{ maxWidth: 340, width: "calc(100% - 40px)", textAlign: "center", padding: "28px 28px", marginTop: 60, animation: pwWrong ? "shake 0.3s" : "none" }}>
          <div style={{ fontSize: 11, marginBottom: 20, lineHeight: 1.8 }}>HASLO DOSTEPU</div>
          <input
            type="password"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (pwInput.trim().toLowerCase() === "essentia") {
                  sessionStorage.setItem("af_admin", "1");
                  setUnlocked(true);
                } else {
                  setPwWrong(true);
                  setPwInput("");
                  setTimeout(() => setPwWrong(false), 800);
                }
              }
            }}
            autoFocus
            style={{ fontFamily: F, fontSize: 10, background: BG, color: FG, border: `2px solid ${FG}`, padding: "8px 12px", width: "100%", boxSizing: "border-box", marginBottom: 14, textAlign: "center", outline: "none" }}
            placeholder="••••••••"
          />
          <button
            onClick={() => {
              if (pwInput.trim().toLowerCase() === "essentia") {
                sessionStorage.setItem("af_admin", "1");
                setUnlocked(true);
              } else {
                setPwWrong(true);
                setPwInput("");
                setTimeout(() => setPwWrong(false), 800);
              }
            }}
            style={{ fontFamily: F, fontSize: 9, padding: "8px 20px", background: FG, color: BG, border: "none", cursor: "pointer" }}
          >WEJDZ</button>
          {pwWrong && <div style={{ color: ACCENT, fontSize: 9, marginTop: 12 }}>ZLE HASLO</div>}
        </div>
      </div>
    );
  }

  if (isLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: F, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <NotebookNavbar />
        <p style={{ fontSize: 11, marginTop: 80, color: ACCENT }}>BRAK DOSTEPU</p>
        <p style={{ fontSize: 9, opacity: 0.6, textAlign: "center" }}>Wymagane uprawnienia administratora.</p>
      </div>
    );
  }

  async function uploadImages(files: FileList, isEdit: boolean) {
    if (isEdit) setIsUploading(true); else setAddUploading(true);
    try {
      const ids: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const postUrl = await generateUploadUrl();
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        ids.push(storageId);
      }
      if (isEdit) {
        setEditDraft(d => ({ ...d, images: [...d.images, ...ids] }));
      } else {
        setDraft(d => ({ ...d, images: [...d.images, ...ids] }));
      }
      toast.success("Zdjecia wgrane");
    } catch {
      toast.error("Blad wgrywania");
    } finally {
      if (isEdit) setIsUploading(false); else setAddUploading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name || !draft.description || draft.price === "" || draft.inventory === "") {
      toast.error("Wypelnij wszystkie pola");
      return;
    }
    try {
      await createProduct({
        name: draft.name,
        description: draft.description,
        price: Number(draft.price),
        category: "inne",
        inventory: Number(draft.inventory),
        images: draft.images,
        featured: draft.featured,
      });
      toast.success("Produkt utworzony!");
      setDraft(emptyDraft());
    } catch {
      toast.error("Blad tworzenia produktu");
    }
  }

  function startEdit(product: any) {
    setEditingProduct(product);
    setEditDraft({
      name: product.name,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      images: product.images ?? [],
      featured: product.featured ?? false,
    });
    setTab("list");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct({
        id: editingProduct._id as Id<"products">,
        updates: {
          name: editDraft.name,
          description: editDraft.description,
          price: Number(editDraft.price),
          category: editingProduct.category ?? "inne",
          inventory: Number(editDraft.inventory),
          images: editDraft.images,
          featured: editDraft.featured,
        },
      });
      toast.success("Produkt zaktualizowany!");
      setEditingProduct(null);
    } catch {
      toast.error("Blad aktualizacji");
    }
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        fontFamily: F, fontSize: 9, padding: "8px 16px",
        background: tab === t ? FG : BG,
        color: tab === t ? BG : FG,
        border: `2px solid ${FG}`,
        cursor: "pointer",
        marginRight: 4,
      }}
    >{label}</button>
  );

  const sectionBox: React.CSSProperties = {
    border: `3px solid ${FG}`,
    boxShadow: `6px 6px 0 ${FG}`,
    padding: "20px 24px",
    marginBottom: 24,
    background: BG,
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: F }}>
      <NotebookNavbar />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "80px 20px 40px" }}>
        <h1 style={{ fontSize: 14, marginBottom: 24, letterSpacing: "0.04em" }}>PANEL ADMINA</h1>

        <div style={{ marginBottom: 24 }}>
          {tabBtn("add", "DODAJ PRODUKT")}
          {tabBtn("list", "LISTA PRODUKTOW")}
        </div>

        {/* ADD PRODUCT */}
        {tab === "add" && (
          <div style={sectionBox}>
            <h2 style={{ fontSize: 11, marginBottom: 20 }}>NOWY PRODUKT</h2>
            <form onSubmit={handleCreate}>
              <PixelInput
                label="NAZWA"
                value={draft.name}
                onChange={v => setDraft(d => ({ ...d, name: v }))}
                placeholder="Nazwa produktu"
              />
              <PixelInput
                label="OPIS"
                value={draft.description}
                onChange={v => setDraft(d => ({ ...d, description: v }))}
                placeholder="Opis produktu..."
                textarea
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <PixelInput
                  label="CENA (PLN)"
                  value={draft.price}
                  onChange={v => setDraft(d => ({ ...d, price: v === "" ? "" : Number(v) }))}
                  type="number"
                  placeholder="0.00"
                />
                <PixelInput
                  label="STAN MAG."
                  value={draft.inventory}
                  onChange={v => setDraft(d => ({ ...d, inventory: v === "" ? "" : Number(v) }))}
                  type="number"
                  placeholder="1"
                />
              </div>
              <ImageUploadArea
                images={draft.images}
                onUpload={e => { if (e.target.files) uploadImages(e.target.files, false); }}
                onRemove={idx => setDraft(d => ({ ...d, images: d.images.filter((_, i) => i !== idx) }))}
                isUploading={addUploading}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  id="featured-add"
                  checked={draft.featured}
                  onChange={e => setDraft(d => ({ ...d, featured: e.target.checked }))}
                />
                <label htmlFor="featured-add" style={{ fontFamily: F, fontSize: 9 }}>WYROZNIONY</label>
              </div>
              <button
                type="submit"
                style={{
                  fontFamily: F, fontSize: 10, padding: "10px 24px",
                  background: FG, color: BG,
                  border: "none", cursor: "pointer",
                  boxShadow: `4px 4px 0 ${ACCENT}`,
                }}
              >UTWORZ PRODUKT</button>
            </form>
          </div>
        )}

        {/* PRODUCTS LIST */}
        {tab === "list" && (
          <div>
            {editingProduct && (
              <div style={{ ...sectionBox, borderColor: ACCENT, boxShadow: `6px 6px 0 ${ACCENT}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 10 }}>EDYTUJ: {editingProduct.name}</h2>
                  <button
                    onClick={() => setEditingProduct(null)}
                    style={{ fontFamily: F, fontSize: 9, background: "none", border: `2px solid ${FG}`, cursor: "pointer", padding: "4px 10px" }}
                  >ANULUJ</button>
                </div>
                <form onSubmit={handleUpdate}>
                  <PixelInput label="NAZWA" value={editDraft.name} onChange={v => setEditDraft(d => ({ ...d, name: v }))} />
                  <PixelInput label="OPIS" value={editDraft.description} onChange={v => setEditDraft(d => ({ ...d, description: v }))} textarea />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <PixelInput label="CENA (PLN)" value={editDraft.price} onChange={v => setEditDraft(d => ({ ...d, price: v === "" ? "" : Number(v) }))} type="number" />
                    <PixelInput label="STAN MAG." value={editDraft.inventory} onChange={v => setEditDraft(d => ({ ...d, inventory: v === "" ? "" : Number(v) }))} type="number" />
                  </div>
                  <ImageUploadArea
                    images={editDraft.images}
                    onUpload={e => { if (e.target.files) uploadImages(e.target.files, true); }}
                    onRemove={idx => setEditDraft(d => ({ ...d, images: d.images.filter((_, i) => i !== idx) }))}
                    isUploading={isUploading}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <input type="checkbox" id="featured-edit" checked={editDraft.featured} onChange={e => setEditDraft(d => ({ ...d, featured: e.target.checked }))} />
                    <label htmlFor="featured-edit" style={{ fontFamily: F, fontSize: 9 }}>WYROZNIONY</label>
                  </div>
                  <button type="submit" style={{ fontFamily: F, fontSize: 10, padding: "10px 24px", background: ACCENT, color: "#fff", border: "none", cursor: "pointer", boxShadow: `4px 4px 0 ${FG}` }}>
                    ZAPISZ ZMIANY
                  </button>
                </form>
              </div>
            )}

            <div style={sectionBox}>
              <h2 style={{ fontSize: 11, marginBottom: 16 }}>PRODUKTY ({products?.length ?? 0})</h2>
              {!products || products.length === 0 ? (
                <p style={{ fontSize: 9, opacity: 0.6 }}>Brak produktow.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: 8 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${FG}` }}>
                        <th style={{ textAlign: "left", padding: "6px 8px" }}>ZDJECIE</th>
                        <th style={{ textAlign: "left", padding: "6px 8px" }}>NAZWA</th>
                        <th style={{ textAlign: "right", padding: "6px 8px" }}>CENA</th>
                        <th style={{ textAlign: "right", padding: "6px 8px" }}>STAN</th>
                        <th style={{ padding: "6px 8px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p: any) => (
                        <tr key={p._id} style={{ borderBottom: `1px solid #ccc`, background: editingProduct?._id === p._id ? "#e0dcc8" : "transparent" }}>
                          <td style={{ padding: "6px 8px" }}>
                            {p.images?.[0] ? (
                              <img src={getStorageUrl(p.images[0]) ?? undefined} alt="" style={{ width: 40, height: 40, objectFit: "cover", border: `1px solid ${FG}` }} />
                            ) : (
                              <div style={{ width: 40, height: 40, border: `1px solid #aaa`, background: "#d8d0b8" }} />
                            )}
                          </td>
                          <td style={{ padding: "6px 8px", maxWidth: 200 }}>
                            <div style={{ fontWeight: "bold" }}>{p.name}</div>
                            {p.featured && <div style={{ color: ACCENT, fontSize: 7, marginTop: 2 }}>WYROZNIONY</div>}
                          </td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>{p.price} PLN</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", color: (p.inventory ?? p.stock ?? 0) < 3 ? ACCENT : FG }}>
                            {p.inventory ?? p.stock ?? 0}
                          </td>
                          <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                            <button onClick={() => startEdit(p)} style={{ fontFamily: F, fontSize: 7, padding: "4px 8px", background: BG, border: `2px solid ${FG}`, cursor: "pointer", marginRight: 4 }}>EDYTUJ</button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Usunac "${p.name}"?`)) return;
                                await removeProduct({ id: p._id });
                                toast.success("Produkt usuniety");
                                if (editingProduct?._id === p._id) setEditingProduct(null);
                              }}
                              style={{ fontFamily: F, fontSize: 7, padding: "4px 8px", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}
                            >USUN</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
