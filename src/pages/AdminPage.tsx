import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const products = useQuery(api.products.list, {});
  const createProduct = useMutation(api.products.create);
  const navigate = useNavigate();

  // Simple form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "decor",
    image: "",
    inventory: 0,
  });

  if (!isAuthenticated) {
    return <div className="p-8">Please log in</div>;
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
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
