import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";

export function FAQManager() {
  const faqs = useQuery(api.faq.list);
  const createFAQ = useMutation(api.faq.create);
  const updateFAQ = useMutation(api.faq.update);
  const removeFAQ = useMutation(api.faq.remove);

  const [isCreating, setIsCreating] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFAQ({ question: newQuestion, answer: newAnswer });
      toast.success("FAQ dodane");
      setNewQuestion("");
      setNewAnswer("");
      setIsCreating(false);
    } catch (error) {
      toast.error("Błąd dodawania FAQ");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ) return;
    try {
      await updateFAQ({
        id: editingFAQ._id,
        question: editingFAQ.question,
        answer: editingFAQ.answer,
      });
      toast.success("FAQ zaktualizowane");
      setEditingFAQ(null);
    } catch (error) {
      toast.error("Błąd aktualizacji FAQ");
    }
  };

  const handleDelete = async (id: Id<"faq">) => {
    if (!confirm("Czy na pewno chcesz usunąć to FAQ?")) return;
    try {
      await removeFAQ({ id });
      toast.success("FAQ usunięte");
    } catch (error) {
      toast.error("Błąd usuwania FAQ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie FAQ</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj FAQ
        </Button>
      </div>

      <div className="space-y-4">
        {faqs?.map((faq) => (
          <Card key={faq._id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingFAQ(faq)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(faq._id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nowe FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pytanie</label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Wpisz pytanie..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Odpowiedź</label>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Wpisz odpowiedź..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Anuluj
              </Button>
              <Button type="submit">Dodaj</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingFAQ} onOpenChange={() => setEditingFAQ(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj FAQ</DialogTitle>
          </DialogHeader>
          {editingFAQ && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pytanie</label>
                <Input
                  value={editingFAQ.question}
                  onChange={(e) =>
                    setEditingFAQ({ ...editingFAQ, question: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Odpowiedź</label>
                <Textarea
                  value={editingFAQ.answer}
                  onChange={(e) =>
                    setEditingFAQ({ ...editingFAQ, answer: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingFAQ(null)}>
                  Anuluj
                </Button>
                <Button type="submit">Zapisz</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
