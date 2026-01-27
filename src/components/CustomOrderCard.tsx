import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { FileText, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

interface CustomOrderCardProps {
  order: {
    _id: Id<"customOrders">;
    _creationTime: number;
    projectName: string;
    customerName: string;
    material: string;
    description: string;
    status: string;
    estimatedPrice?: number;
    images?: Array<string>;
    messages?: Array<{
      _id: Id<"customOrderMessages">;
      _creationTime: number;
      message: string;
      isAdmin: boolean;
      senderName: string;
    }>;
  };
}

export function CustomOrderCard({ order }: { order: any }) {
  const acceptQuote = useMutation(api.customOrders.acceptQuote);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptQuote = async () => {
    setIsAccepting(true);
    try {
      await acceptQuote({ orderId: order._id });
      toast.success("Wycena zaakceptowana! Możesz teraz przejść do płatności.");
    } catch (error) {
      toast.error("Błąd podczas akceptacji wyceny");
    } finally {
      setIsAccepting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "quoted": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_production": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Oczekujące",
      quoted: "Wycenione",
      accepted: "Zaakceptowane",
      in_production: "W produkcji",
      completed: "Ukończone",
      cancelled: "Anulowane"
    };
    return statusMap[status] || status;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {order.projectName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order._creationTime).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Materiał</h4>
            <p className="text-base">{order.material}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Opis</h4>
            <p className="text-base">{order.description}</p>
          </div>
          
          {order.estimatedPrice && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Wycena</h4>
              <p className="text-2xl font-bold text-primary mb-3">
                {formatCurrency(order.estimatedPrice)}
              </p>
              
              {order.status === "quoted" && (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAcceptQuote}
                    disabled={isAccepting}
                    className="flex-1"
                  >
                    {isAccepting ? "Akceptowanie..." : "Akceptuj i przejdź do płatności"}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Odrzuć
                  </Button>
                </div>
              )}
              
              {order.status === "accepted" && (
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Navigate to checkout with custom order
                    window.location.href = `/checkout?customOrderId=${order._id}`;
                  }}
                >
                  Przejdź do płatności
                </Button>
              )}
            </div>
          )}

          {order.images && order.images.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Załączniki</h4>
              <div className="grid grid-cols-2 gap-2">
                {order.images.slice(0, 4).map((imageId: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-lg bg-muted overflow-hidden border">
                    <img 
                      src={`${import.meta.env.VITE_CONVEX_URL?.replace('.convex.cloud', '.convex.site')}/api/storage/${imageId}`}
                      alt={`Załącznik ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}