import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Pencil, Trash2, Upload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "decor",
    inventory: 0,
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingProduct, setEditingProduct] = useState<{
    id: Id<"products">;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    inventory: number;
  } | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!isAuthenticated) {
    return <div className="p-8">Please log in</div>;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = isEdit ? editingProduct?.images || [] : uploadedImages;
    
    if (currentImages.length + files.length > 6) {
      toast.error("Maksymalnie 6 zdjęć na produkt");
      return;
    }

    setIsUploading(true);
    try {
      const newImageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Get upload URL
        const uploadUrl = await generateUploadUrl();
        
        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await result.json();
        newImageUrls.push(storageId);
      }

      if (isEdit && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [...editingProduct.images, ...newImageUrls],
        });
      } else {
        setUploadedImages([...uploadedImages, ...newImageUrls]);
      }

      toast.success(`Dodano ${newImageUrls.length} zdjęć`);
    } catch (error) {
      toast.error("Błąd podczas uploadu zdjęć");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number, isEdit = false) => {
    if (isEdit && editingProduct) {
      const newImages = [...editingProduct.images];
      newImages.splice(index, 1);
      setEditingProduct({ ...editingProduct, images: newImages });
    } else {
      const newImages = [...uploadedImages];
      newImages.splice(index, 1);
      setUploadedImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedImages.length === 0) {
      toast.error("Dodaj przynajmniej jedno zdjęcie");
      return;
    }

    try {
      await createProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        category: newProduct.category,
        images: uploadedImages,
        inventory: Number(newProduct.inventory),
        featured: false,
      });
      toast.success("Produkt utworzony");
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "decor",
        inventory: 0,
      });
      setUploadedImages([]);
    } catch (error) {
      toast.error("Błąd podczas tworzenia produktu");
      console.error(error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.images.length === 0) {
      toast.error("Produkt musi mieć przynajmniej jedno zdjęcie");
      return;
    }

    try {
      await updateProduct({
        id: editingProduct.id,
        updates: {
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          category: editingProduct.category,
          images: editingProduct.images,
          inventory: Number(editingProduct.inventory),
        },
      });
      toast.success("Produkt zaktualizowany");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error("Błąd podczas aktualizacji produktu");
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) return;

    try {
      await deleteProduct({ id });
      toast.success("Produkt usunięty");
    } catch (error) {
      toast.error("Błąd podczas usuwania produktu");
      console.error(error);
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [],
      inventory: product.inventory,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Panel Admina</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold mb-4">Dodaj Nowy Produkt</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa</label>
                <Input 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis</label>
                <Textarea 
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cena (PLN)</label>
                  <Input 
                    type="number"
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zapas</label>
                  <Input 
                    type="number"
                    value={newProduct.inventory} 
                    onChange={e => setNewProduct({...newProduct, inventory: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategoria</label>
                <Input 
                  value={newProduct.category} 
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Zdjęcia ({uploadedImages.length}/6)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {uploadedImages.map((imageId, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                      <img 
                        src={`${import.meta.env.VITE_CONVEX_URL}/api/storage/${imageId}`}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {uploadedImages.length < 6 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e)}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Dodaj Zdjęcia
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isUploading || uploadedImages.length === 0}>
                Utwórz Produkt
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Istniejące Produkty</h2>
            <div className="space-y-4">
              {products?.map(product => (
                <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.images[0] ? `${import.meta.env.VITE_CONVEX_URL}/api/storage/${product.images[0]}` : "https://placehold.co/100"} 
                      alt="" 
                      className="h-10 w-10 rounded object-cover" 
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.price} PLN</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj Produkt</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa</label>
                <Input 
                  value={editingProduct.name} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis</label>
                <Textarea 
                  value={editingProduct.description} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cena (PLN)</label>
                  <Input 
                    type="number"
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zapas</label>
                  <Input 
                    type="number"
                    value={editingProduct.inventory} 
                    onChange={e => setEditingProduct({...editingProduct, inventory: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategoria</label>
                <Input 
                  value={editingProduct.category} 
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Zdjęcia ({editingProduct.images.length}/6)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {editingProduct.images.map((imageId, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                      <img 
                        src={`${import.meta.env.VITE_CONVEX_URL}/api/storage/${imageId}`}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx, true)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {editingProduct.images.length < 6 && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('edit-image-upload')?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Dodaj Więcej Zdjęć
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isUploading}>Zaktualizuj Produkt</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Anuluj
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}