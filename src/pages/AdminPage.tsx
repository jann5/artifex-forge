import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "decor",
    image: "",
    inventory: 0,
  });

  const [editingProduct, setEditingProduct] = useState<{
    id: Id<"products">;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        category: newProduct.category,
        images: [newProduct.image],
        inventory: Number(newProduct.inventory),
        featured: false,
      });
      toast.success("Product created");
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "decor",
        image: "",
        inventory: 0,
      });
    } catch (error) {
      toast.error("Failed to create product");
      console.error(error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await updateProduct({
        id: editingProduct.id,
        updates: {
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          category: editingProduct.category,
          images: [editingProduct.image],
          inventory: Number(editingProduct.inventory),
        },
      });
      toast.success("Product updated");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct({ id });
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
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
      image: product.images[0] || "",
      inventory: product.inventory,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input 
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <Input 
                    type="number"
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Inventory</label>
                  <Input 
                    type="number"
                    value={newProduct.inventory} 
                    onChange={e => setNewProduct({...newProduct, inventory: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input 
                  value={newProduct.category} 
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input 
                  value={newProduct.image} 
                  onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                  required
                />
              </div>
              <Button type="submit">Create Product</Button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Existing Products</h2>
            <div className="space-y-4">
              {products?.map(product => (
                <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={editingProduct.name} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input 
                  value={editingProduct.description} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <Input 
                    type="number"
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Inventory</label>
                  <Input 
                    type="number"
                    value={editingProduct.inventory} 
                    onChange={e => setEditingProduct({...editingProduct, inventory: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input 
                  value={editingProduct.category} 
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input 
                  value={editingProduct.image} 
                  onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Update Product</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}