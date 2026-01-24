import { Link } from "react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  price: number;
  image: string;
  category: string;
}

export function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  const addToCart = useMutation(api.cart.add);
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }

    try {
      await addToCart({ productId: id, quantity: 1 });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Link to={`/products/${id}`} className="group">
      <Card className="overflow-hidden border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-muted relative">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <Button
              size="icon"
              className="absolute bottom-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-4 gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{category}</span>
          <h3 className="font-medium text-lg leading-tight group-hover:text-primary transition-colors">{name}</h3>
          <p className="font-semibold text-muted-foreground">{formatCurrency(price)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
