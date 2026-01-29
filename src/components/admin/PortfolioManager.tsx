import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { getStorageUrl } from "@/lib/utils";

export function PortfolioManager() {
  const portfolio = useQuery(api.portfolio.list);
  const createPortfolio = useMutation(api.portfolio.create);
  const updatePortfolio = useMutation(api.portfolio.update);
  const removePortfolio = useMutation(api.portfolio.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"portfolio"> | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedImages: string[] = [];
      
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        uploadedImages.push(storageId);
      }
      
      setImages([...images, ...uploadedImages]);
      toast.success("Zdjęcia zostały przesłane");
    } catch (error) {
      toast.error("Nie udało się przesłać zdjęć");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updatePortfolio({
          id: editingId,
          title,
          description,
          images,
          category: category || undefined,
        });
        toast.success("Realizacja zaktualizowana");
      } else {
        await createPortfolio({
          title,
          description,
          images,
          category: category || undefined,
        });
        toast.success("Realizacja dodana");
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Wystąpił błąd");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category || "");
    setImages(item.images);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: Id<"portfolio">) => {
    if (!confirm("Czy na pewno chcesz usunąć tę realizację?")) return;
    
    try {
      await removePortfolio({ id });
      toast.success("Realizacja usunięta");
    } catch (error) {
      toast.error("Nie udało się usunąć realizacji");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setImages([]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Zarządzanie Realizacjami</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj Realizację
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edytuj Realizację" : "Dodaj Nową Realizację"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tytuł</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Kategoria (opcjonalnie)</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="np. Prototypy, Dekoracje, itp."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Opis</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zdjęcia</label>
                  <div className="mt-2">
                    <label className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {uploading ? "Przesyłanie..." : "Kliknij aby dodać zdjęcia"}
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={getStorageUrl(img)}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {editingId ? "Zaktualizuj" : "Dodaj"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio === undefined ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : portfolio.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Brak realizacji. Dodaj pierwszą!
          </p>
        ) : (
          <div className="space-y-4">
            {portfolio.map((item) => (
              <div key={item._id} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {item.images[0] && (
                    <img
                      src={getStorageUrl(item.images[0])}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.category && (
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.images.length} zdjęć
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
