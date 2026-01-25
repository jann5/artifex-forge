import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface EditingProduct {
  id: Id<"products">;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: number;
}

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: EditingProduct | null;
  isUploading: boolean;
  onProductChange: (updates: Partial<EditingProduct>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditProductDialog({
  isOpen,
  onOpenChange,
  product,
  isUploading,
  onProductChange,
  onImageUpload,
  onImageRemove,
  onSubmit,
}: EditProductDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj Produkt</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nazwa</label>
            <Input 
              value={product.name} 
              onChange={e => onProductChange({ name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opis</label>
            <Textarea 
              value={product.description} 
              onChange={e => onProductChange({ description: e.target.value })}
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cena (PLN)</label>
              <Input 
                type="number"
                value={product.price} 
                onChange={e => onProductChange({ price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zapas</label>
              <Input 
                type="number"
                value={product.inventory} 
                onChange={e => onProductChange({ inventory: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategoria</label>
            <Input 
              value={product.category} 
              onChange={e => onProductChange({ category: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Zdjęcia ({product.images.length}/6)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {product.images.map((imageId, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                  <img 
                    src={imageId.startsWith('http') ? imageId : `${import.meta.env.VITE_CONVEX_URL}/api/storage/${imageId}`}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', imageId);
                      e.currentTarget.src = 'https://placehold.co/400x400/f3f4f6/1f2937?text=Błąd+ładowania';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onImageRemove(idx)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {product.images.length < 6 && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageUpload}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
