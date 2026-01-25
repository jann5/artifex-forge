import { useParams } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getStorageUrl } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useQuery(api.products.get, { id: id as Id<"products"> });
  const addToCart = useMutation(api.cart.add);
  const recordView = useMutation(api.recent.record);
  const { isAuthenticated } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (product && isAuthenticated) {
      recordView({ productId: product._id });
    }
  }, [product, isAuthenticated, recordView]);

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-8 bg-muted w-1/3 rounded" />
            <div className="h-4 bg-muted w-2/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Produkt nie znaleziony</h1>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Zaloguj się, aby dodać produkty do koszyka");
      return;
    }

    try {
      await addToCart({ 
        productId: product._id, 
        quantity 
      });
      toast.success("Dodano do koszyka");
    } catch (error) {
      toast.error("Nie udało się dodać do koszyka");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-muted rounded-xl overflow-hidden relative border group cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
              <img 
                src={getStorageUrl(product.images[activeImage])} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  const target = e.currentTarget;
                  console.error('Image failed to load:', target.src);
                  target.src = 'https://placehold.co/600x750/f3f4f6/1f2937?text=Błąd+ładowania';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-full p-3">
                  <ZoomIn className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    activeImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                  }`}
                >
                  <img 
                    src={getStorageUrl(img)} 
                    alt={`Widok ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/100';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{product.name}</h1>
              <p className="text-2xl font-medium text-primary">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="prose prose-neutral dark:prose-invert mb-8">
              <p>{product.description}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-medium">Ilość</span>
                <div className="flex items-center gap-2 border rounded-md p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 h-14 text-lg" onClick={handleAddToCart}>
                  <ShoppingBag className="mr-2 h-5 w-5" /> Dodaj do Koszyka
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground pt-4 border-t">
                <p>Darmowa wysyłka przy zamówieniach powyżej 400 zł</p>
                <p>30-dniowa polityka zwrotów</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={getStorageUrl(product.images[activeImage])}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                console.error('Image failed to load:', target.src);
                target.src = 'https://placehold.co/1200x1500/f3f4f6/1f2937?text=Błąd+ładowania';
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${
                    activeImage === idx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={getStorageUrl(img)}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}