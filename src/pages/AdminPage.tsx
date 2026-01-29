import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { ProductList } from "@/components/admin/ProductList";
import { ProductForm } from "@/components/admin/ProductForm";
import { EditProductDialog } from "@/components/admin/EditProductDialog";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ReviewManager } from "@/components/admin/ReviewManager";
import { PortfolioManager } from "@/components/admin/PortfolioManager";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "art",
    inventory: 1,
    images: [] as string[],
    featured: false,
  });

  if (isLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Brak dostępu. Wymagane uprawnienia administratora.</p>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImageIds: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const postUrl = await generateUploadUrl();
        
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        const { storageId } = await result.json();
        newImageIds.push(storageId);
      }

      if (isEditMode && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [...editingProduct.images, ...newImageIds]
        });
      } else {
        setNewProduct({
          ...newProduct,
          images: [...newProduct.images, ...newImageIds]
        });
      }
      toast.success("Zdjęcia przesłane pomyślnie");
    } catch (error) {
      console.error(error);
      toast.error("Błąd przesyłania zdjęć");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      toast.success("Produkt utworzony");
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "art",
        inventory: 1,
        images: [],
        featured: false,
      });
    } catch (error) {
      toast.error("Błąd tworzenia produktu");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      await updateProduct({
        id: editingProduct._id,
        updates: {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          inventory: editingProduct.inventory,
          images: editingProduct.images,
          featured: editingProduct.featured,
        }
      });
      toast.success("Produkt zaktualizowany");
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error("Błąd aktualizacji produktu");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Panel Administratora</h1>
        
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Produkty</TabsTrigger>
            <TabsTrigger value="categories">Kategorie</TabsTrigger>
            <TabsTrigger value="reviews">Opinie</TabsTrigger>
            <TabsTrigger value="portfolio">Realizacje</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="space-y-6">
              <ProductForm
                product={newProduct}
                images={newProduct.images}
                isUploading={isUploading}
                onProductChange={(updates) => setNewProduct({ ...newProduct, ...updates })}
                onImageUpload={(e) => handleImageUpload(e, false)}
                onImageRemove={(idx) => setNewProduct({
                  ...newProduct,
                  images: newProduct.images.filter((_, i) => i !== idx)
                })}
                onSubmit={handleCreateProduct}
                submitLabel="Utwórz Produkt"
              />
              
              <div>
                <h2 className="text-xl font-bold mb-4">Lista Produktów</h2>
                <ProductList
                  products={products}
                  onEdit={(product) => {
                    setEditingProduct(product);
                    setIsEditing(true);
                  }}
                  onDelete={(id) => removeProduct({ id })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewManager />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioManager />
          </TabsContent>
        </Tabs>
      </div>

      <EditProductDialog 
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        product={editingProduct}
        isUploading={isUploading}
        onProductChange={(updates) => setEditingProduct({...editingProduct, ...updates})}
        onImageUpload={(e) => handleImageUpload(e, true)}
        onImageRemove={(idx) => setEditingProduct({
          ...editingProduct, 
          images: editingProduct.images.filter((_: any, i: number) => i !== idx)
        })}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}