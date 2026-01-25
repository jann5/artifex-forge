import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { getStorageUrl } from "@/lib/utils";

interface Product {
  _id: Id<"products">;
  name: string;
  price: number;
  images: string[];
}

interface ProductListProps {
  products: Product[] | undefined;
  onEdit: (product: Product) => void;
  onDelete: (id: Id<"products">) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  return (
    <div className="space-y-4">
      {products?.map(product => (
        <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-4">
            <img 
              src={getStorageUrl(product.images[0])} 
              alt="" 
              className="h-12 w-12 rounded object-cover border"
              onError={(e) => {
                const target = e.currentTarget;
                console.error('Image failed to load:', target.src);
                target.src = 'https://placehold.co/100';
              }}
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
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(product._id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}