import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { MessageCircle, Package, DollarSign, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomOrderCardProps {
  order: {
    _id: Id<"customOrders">;
    projectName: string;
    description: string;
    material: string;
    status: string;
    estimatedPrice?: number;
    adminNotes?: string;
    _creationTime: number;
    messages?: Array<{
      _id: Id<"customOrderMessages">;
      message: string;
      senderName: string;
      isAdmin: boolean;
      _creationTime: number;
    }>;
  };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Oczekuje", color: "bg-yellow-500" },
  quoted: { label: "Wycenione", color: "bg-blue-500" },
  accepted: { label: "Zaakceptowane", color: "bg-green-500" },
  in_production: { label: "W produkcji", color: "bg-purple-500" },
  completed: { label: "Ukończone", color: "bg-green-600" },
  cancelled: { label: "Anulowane", color: "bg-red-500" },
};

export function CustomOrderCard({ order }: CustomOrderCardProps) {
  const [showMessages, setShowMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const addMessage = useMutation(api.customOrders.addMessage);
  const acceptQuote = useMutation(api.customOrders.acceptQuote);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addMessage({
        customOrderId: order._id,
        message: newMessage,
      });
      setNewMessage("");
      toast.success("Wiadomość wysłana");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAcceptQuote = async () => {
    try {
      const result = await acceptQuote({ customOrderId: order._id });
      toast.success("Wycena zaakceptowana! Przekierowanie do płatności...");
      
      // Redirect to checkout with custom order
      window.location.href = `/checkout?customOrder=${result.orderId}`;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const statusInfo = statusLabels[order.status] || { label: order.status, color: "bg-gray-500" };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {order.projectName}
            </CardTitle>
            <CardDescription>
              {new Date(order._creationTime).toLocaleDateString("pl-PL")}
            </CardDescription>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Materiał:</p>
          <p className="font-medium">{order.material}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Opis:</p>
          <p className="text-sm">{order.description}</p>
        </div>

        {order.estimatedPrice && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Wycena:</p>
              <p className="text-xl font-bold">{order.estimatedPrice} PLN</p>
            </div>
          </div>
        )}

        {order.adminNotes && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-medium mb-1">Notatka od administratora:</p>
            <p className="text-sm">{order.adminNotes}</p>
          </div>
        )}

        {order.status === "quoted" && order.estimatedPrice && (
          <Button onClick={handleAcceptQuote} className="w-full" size="lg">
            <CheckCircle className="mr-2 h-4 w-4" />
            Akceptuj wycenę i przejdź do płatności
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => setShowMessages(!showMessages)}
          className="w-full"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {showMessages ? "Ukryj wiadomości" : "Pokaż wiadomości"}
          {order.messages && order.messages.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {order.messages.length}
            </Badge>
          )}
        </Button>

        <AnimatePresence>
          {showMessages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-muted rounded-lg">
                {order.messages && order.messages.length > 0 ? (
                  order.messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`p-2 rounded ${
                        msg.isAdmin
                          ? "bg-blue-100 dark:bg-blue-900 ml-4"
                          : "bg-white dark:bg-gray-800 mr-4"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.senderName} •{" "}
                        {new Date(msg._creationTime).toLocaleString("pl-PL")}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Brak wiadomości
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  rows={2}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  Wyślij
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
