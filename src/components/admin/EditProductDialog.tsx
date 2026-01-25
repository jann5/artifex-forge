import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { getStorageUrl } from "@/lib/utils";

interface EditingProduct {
  id: Id<"products">;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  model3d?: string;
  inventory: number;
  featured?: boolean;
}

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: EditingProduct | null;
  isUploading: boolean;
  onProductChange: (updates: Partial<EditingProduct>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onModelUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModelRemove?: () => void;
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
  onModelUpload,
  onModelRemove,
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
            <Select 
              value={product.category} 
              onValueChange={(value) => onProductChange({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="art">Sztuka</SelectItem>
                <SelectItem value="decor">Dekoracje</SelectItem>
                <SelectItem value="functional">Funkcjonalne</SelectItem>
                <SelectItem value="gadgets">Gadżety</SelectItem>
                <SelectItem value="other">Inne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-featured"
              checked={product.featured || false}
              onCheckedChange={(checked) => onProductChange({ featured: checked })}
            />
            <Label htmlFor="edit-featured">Wyróżniony produkt</Label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Model 3D (.glb)</label>
            <p className="text-xs text-muted-foreground mb-2">
              Model 3D będzie wyświetlany jako pierwszy element na stronie produktu.
            </p>
            {product.model3d ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xs">3D</div>
                  <span className="text-sm truncate max-w-[200px]">Model załadowany</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onModelRemove}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={onModelUpload}
                  className="hidden"
                  id="edit-model-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('edit-model-upload')?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Dodaj Model 3D
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Zdjęcia ({product.images.length}/6)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {product.images.map((imageId, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                  <img 
                    src={getStorageUrl(imageId)}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      console.error('Image failed to load:', target.src);
                      target.src = 'https://placehold.co/400x400/f3f4f6/1f2937?text=Błąd+ładowania';
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