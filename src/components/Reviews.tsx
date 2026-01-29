import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface ReviewsProps {
  productId: Id<"products">;
}

export function Reviews({ productId }: ReviewsProps) {
  const reviews = useQuery(api.reviews.list, { productId });
  const canReviewData = useQuery(api.reviews.canReview, { productId });
  const createReview = useMutation(api.reviews.create);
  const { isAuthenticated } = useAuth();
  const deleteReview = useMutation(api.reviews.deleteReview);
  const currentUser = useQuery(api.users.currentUser);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Musisz być zalogowany, aby dodać opinię");
      return;
    }

    if (!canReviewData?.canReview) {
      toast.error(canReviewData?.reason || "Nie możesz wystawić opinii dla tego produktu");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Opinia musi mieć co najmniej 10 znaków");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        productId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Opinia została dodana");
      setComment("");
      setRating(5);
    } catch (error: any) {
      toast.error(error.message || "Nie udało się dodać opinii");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"reviews">) => {
    try {
      await deleteReview({ id });
      toast.success("Opinia usunięta");
    } catch (error) {
      toast.error("Nie udało się usunąć opinii");
    }
  };

  if (reviews === undefined) {
    return <div className="animate-pulse h-40 bg-muted rounded-xl" />;
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opinie Klientów</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-current" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length} opinii)
            </span>
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Dodaj swoją opinię</h3>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Napisz co myślisz o tym produkcie..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Dodawanie..." : "Dodaj Opinię"}
          </Button>
        </form>
      ) : (
        <div className="bg-muted/30 rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-4">Zaloguj się, aby dodać opinię</p>
          <Button variant="outline" asChild>
            <a href="/auth">Zaloguj się</a>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Ten produkt nie ma jeszcze opinii. Bądź pierwszy!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.userImage} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(review._creationTime, { addSuffix: true, locale: pl })}
                    </p>
                  </div>
                </div>
                {currentUser && (currentUser._id === review.userId || currentUser.role === "admin") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(review._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex text-yellow-400 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}