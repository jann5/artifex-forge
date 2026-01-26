import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getStorageUrl } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router";

export default function ReviewsPage() {
  const reviews = useQuery(api.reviews.getByUser);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const handleDelete = async (id: any) => {
    try {
      await deleteReview({ id });
      toast.success("Opinia usunięta");
    } catch (error) {
      toast.error("Nie udało się usunąć opinii");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <MessageSquare className="h-8 w-8" />
            Moje Opinie
          </h1>
          
          {reviews === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/10">
              <p className="text-muted-foreground mb-4">
                Nie dodałeś jeszcze żadnych opinii o produktach.
              </p>
              <Button asChild>
                <Link to="/products">Przeglądaj Produkty</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-card border rounded-xl p-6 flex gap-6">
                  <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    {review.productImage && (
                      <img 
                        src={getStorageUrl(review.productImage)} 
                        alt={review.productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{review.productName}</h3>
                        <div className="flex text-yellow-400 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(review._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mb-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">
                      Dodano {formatDistanceToNow(review._creationTime, { addSuffix: true, locale: pl })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}