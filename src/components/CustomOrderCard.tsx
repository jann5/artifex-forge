import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

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
    messages?: Array<{
      _id: Id<"customOrderMessages">;
      _creationTime: number;
      message: string;
      isAdmin: boolean;
      senderName: string;
    }>;
  };
}

export function CustomOrderCard({ order }: CustomOrderCardProps) {
  const navigate = useNavigate();
  const acceptQuote = useMutation(api.customOrders.acceptQuote);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "quoted":
        return <Package className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "in_production":
        return <Package className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "quoted":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "accepted":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_production":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Oczekuje na wycenę",
      quoted: "Wyceniono",
      accepted: "Zaakceptowano",
      in_production: "W produkcji",
      completed: "Ukończono",
      cancelled: "Anulowano"
    };
    return statusMap[status] || status;
  };

  const handleAcceptQuote = async () => {
    try {
      await acceptQuote({ orderId: order._id });
      toast.success("Wycena zaakceptowana! Przejdź do płatności.");
      navigate(`/checkout?customOrderId=${order._id}`);
    } catch (error) {
      toast.error("Nie udało się zaakceptować wyceny");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{order.projectName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order._creationTime).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {getStatusText(order.status)}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Materiał</p>
            <p className="font-medium">{order.material}</p>
          </div>
          {order.estimatedPrice && (
            <div>
              <p className="text-sm text-muted-foreground">Szacowana cena</p>
              <p className="font-bold text-lg text-primary">{formatCurrency(order.estimatedPrice)}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Opis</p>
          <p className="text-sm">{order.description}</p>
        </div>

        {order.status === "quoted" && order.estimatedPrice && (
          <Button onClick={handleAcceptQuote} className="w-full">
            Zaakceptuj wycenę i przejdź do płatności
          </Button>
        )}
      </CardContent>
    </Card>
  );
}