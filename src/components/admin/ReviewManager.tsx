import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { getStorageUrl } from "@/lib/utils";

export function ReviewManager() {
  const pendingReviews = useQuery(api.reviews.listPending);
  const approveReview = useMutation(api.reviews.approveReview);
  const rejectReview = useMutation(api.reviews.rejectReview);

  const handleApprove = async (id: Id<"reviews">) => {
    try {
      await approveReview({ id });
      toast.success("Opinia zatwierdzona");
    } catch {
      toast.error("Nie udało się zatwierdzić opinii");
    }
  };

  const handleReject = async (id: Id<"reviews">) => {
    if (!confirm("Czy na pewno chcesz odrzucić tę opinię?")) return;
    
    try {
      await rejectReview({ id });
      toast.success("Opinia odrzucona");
    } catch {
      toast.error("Nie udało się odrzucić opinii");
    }
  };

  if (pendingReviews === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Oczekujące Opinie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Oczekujące Opinie</span>
          <span className="text-sm font-normal text-muted-foreground">
            {pendingReviews.length} do zatwierdzenia
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingReviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Brak oczekujących opinii
          </p>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.userImage} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(review._creationTime, { addSuffix: true, locale: pl })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  {review.productImage && (
                    <img 
                      src={getStorageUrl(review.productImage)} 
                      alt={review.productName}
                      className="h-12 w-12 rounded object-cover border"
                    />
                  )}
                  <span className="font-medium text-muted-foreground">{review.productName}</span>
                </div>

                <p className="text-sm leading-relaxed">{review.comment}</p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review._id)}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Zatwierdź
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(review._id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Odrzuć
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
