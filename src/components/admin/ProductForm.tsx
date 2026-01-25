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
import { useRef } from "react";
import { getStorageUrl } from "@/lib/utils";

interface ProductFormProps {
  product: {
    name: string;
    description: string;
    price: number;
    category: string;
    inventory: number;
    featured?: boolean;
  };
  images: string[];
  isUploading: boolean;
  onProductChange: (updates: Partial<ProductFormProps['product']>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}

export function ProductForm({
  product,
  images,
  isUploading,
  onProductChange,
  onImageUpload,
  onImageRemove,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
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
          id="featured"
          checked={product.featured || false}
          onCheckedChange={(checked) => onProductChange({ featured: checked })}
        />
        <Label htmlFor="featured">Wyróżniony produkt</Label>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Zdjęcia ({images.length}/6)
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((imageId, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
              <img 
                src={getStorageUrl(imageId)}
                alt={`Upload ${idx + 1}`}
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
        
        {images.length < 6 && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
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
                  Przesyłanie zdjęć...
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

      <Button type="submit" disabled={isUploading || images.length === 0}>
        {submitLabel}
      </Button>
    </form>
  );
}