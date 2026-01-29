import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableFAQItem({ faq, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">{faq.question}</h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(faq)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(faq._id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function FAQManager() {
  const faqs = useQuery(api.faq.list);
  const createFAQ = useMutation(api.faq.create);
  const updateFAQ = useMutation(api.faq.update);
  const removeFAQ = useMutation(api.faq.remove);
  const reorderFAQ = useMutation(api.faq.reorder);

  const [isCreating, setIsCreating] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [localFaqs, setLocalFaqs] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local state when faqs change
  useEffect(() => {
    if (faqs) {
      setLocalFaqs(faqs);
    }
  }, [faqs]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localFaqs.findIndex((faq) => faq._id === active.id);
    const newIndex = localFaqs.findIndex((faq) => faq._id === over.id);

    const newOrder = arrayMove(localFaqs, oldIndex, newIndex);
    setLocalFaqs(newOrder);

    // Update order in database
    try {
    const updates = newOrder.map((faq: any, index: number) => ({
      id: faq._id,
      order: index,
    }));
      await reorderFAQ({ updates });
      toast.success("Kolejność FAQ zaktualizowana");
    } catch (error: any) {
      toast.error(error.message || "Błąd zmiany kolejności");
      // Revert on error
      if (faqs) setLocalFaqs(faqs);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFAQ({ question: newQuestion, answer: newAnswer });
      toast.success("FAQ dodane");
      setNewQuestion("");
      setNewAnswer("");
      setIsCreating(false);
    } catch (error: any) {
      toast.error(error.message || "Błąd dodawania FAQ");
      console.error("FAQ creation error:", error);
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
    } catch (error: any) {
      toast.error(error.message || "Błąd aktualizacji FAQ");
      console.error("FAQ update error:", error);
    }
  };

  const handleDelete = async (id: Id<"faq">) => {
    if (!confirm("Czy na pewno chcesz usunąć to FAQ?")) return;
    try {
      await removeFAQ({ id });
      toast.success("FAQ usunięte");
    } catch (error: any) {
      toast.error(error.message || "Błąd usuwania FAQ");
      console.error("FAQ deletion error:", error);
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localFaqs.map((faq) => faq._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {localFaqs.map((faq) => (
              <SortableFAQItem
                key={faq._id}
                faq={faq}
                onEdit={setEditingFAQ}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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