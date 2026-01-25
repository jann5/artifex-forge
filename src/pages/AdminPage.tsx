import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Id } from "@/convex/_generated/dataModel";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductList } from "@/components/admin/ProductList";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "decor",
    inventory: 0,
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
        const uploadUrl = await generateUploadUrl();
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Panel Admina</h1>
          <Button asChild size="lg" className="shadow-sm">
            <Link to="/admin/orders">
              <Package className="mr-2 h-5 w-5" />
              Zarządzaj Zamówieniami
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold mb-4">Dodaj Nowy Produkt</h2>
            <ProductForm
              product={newProduct}
              images={uploadedImages}
              isUploading={isUploading}
              onProductChange={(updates) => setNewProduct({ ...newProduct, ...updates })}
              onImageUpload={(e) => handleImageUpload(e, false)}
              onImageRemove={(index) => removeImage(index, false)}
              onSubmit={handleSubmit}
              submitLabel="Utwórz Produkt"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Istniejące Produkty</h2>
            <ProductList
              products={products}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      <EditProductDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={editingProduct}
        isUploading={isUploading}
        onProductChange={(updates) => editingProduct && setEditingProduct({ ...editingProduct, ...updates })}
        onImageUpload={(e) => handleImageUpload(e, true)}
        onImageRemove={(index) => removeImage(index, true)}
        onSubmit={handleEdit}
      />
    </div>
  );
}