import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function CategoryManager() {
  const categories = useQuery(api.categories.list, {});
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [editingData, setEditingData] = useState({ name: "", slug: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.slug.trim()) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }

    try {
      await createCategory(newCategory);
      toast.success("Kategoria utworzona");
      setNewCategory({ name: "", slug: "" });
    } catch (error: any) {
      toast.error(error.message || "Błąd tworzenia kategorii");
    }
  };

  const handleUpdate = async (id: Id<"categories">) => {
    if (!editingData.name.trim() || !editingData.slug.trim()) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }

    try {
      await updateCategory({ id, ...editingData });
      toast.success("Kategoria zaktualizowana");
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || "Błąd aktualizacji kategorii");
    }
  };

  const handleDelete = async (id: Id<"categories">) => {
    if (!confirm("Czy na pewno chcesz usunąć tę kategorię?")) return;

    try {
      await removeCategory({ id });
      toast.success("Kategoria usunięta");
    } catch (error: any) {
      toast.error(error.message || "Błąd usuwania kategorii");
    }
  };

  const startEdit = (category: any) => {
    setEditingId(category._id);
    setEditingData({ name: category.name, slug: category.slug });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zarządzanie Kategoriami</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold">Dodaj Nową Kategorię</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nazwa</label>
              <Input
                placeholder="np. Sztuka"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Identyfikator (slug)</label>
              <Input
                placeholder="np. art"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
            </div>
          </div>
          <Button type="submit" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj Kategorię
          </Button>
        </form>

        <div className="space-y-2">
          <h3 className="font-semibold mb-3">Istniejące Kategorie</h3>
          {categories === undefined ? (
            <div className="text-sm text-muted-foreground">Ładowanie...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-muted-foreground">Brak kategorii</div>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="flex items-center gap-2 p-3 border rounded-lg">
                {editingId === category._id ? (
                  <>
                    <Input
                      value={editingData.name}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      value={editingData.slug}
                      onChange={(e) => setEditingData({ ...editingData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => handleUpdate(category._id)}>
                      Zapisz
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Anuluj
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.slug}</div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(category._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
