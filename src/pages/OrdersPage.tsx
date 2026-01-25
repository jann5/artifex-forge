import { Navbar } from "@/components/Navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderTracking } from "@/components/ui/order-tracking";

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const orders = useQuery(api.orders.list, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Zaloguj się, aby zobaczyć swoje zamówienia</h1>
          <Button onClick={() => navigate("/auth")}>Zaloguj się</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Package className="h-4 w-4" />;
      case "delivered":
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
      case "paid":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Oczekujące",
      paid: "Opłacone",
      shipped: "Wysłane",
      delivered: "Dostarczone",
      cancelled: "Anulowane"
    };
    return statusMap[status] || status;
  };

  const getTrackingSteps = (order: any) => {
    const creationDate = new Date(order._creationTime).toLocaleDateString("pl-PL", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    if (order.status === "cancelled") {
      return [
        {
          name: "Złożono zamówienie",
          timestamp: creationDate,
          isCompleted: true,
        },
        {
          name: "Anulowano",
          timestamp: "Zamówienie zostało anulowane",
          isCompleted: true,
        }
      ];
    }

    return [
      {
        name: "Złożono zamówienie",
        timestamp: creationDate,
        isCompleted: true,
      },
      {
        name: "Płatność",
        timestamp: order.status === "pending" ? "Oczekuje na płatność" : "Zatwierdzona",
        isCompleted: ["paid", "shipped", "delivered"].includes(order.status),
      },
      {
        name: "Wysłano",
        timestamp: ["shipped", "delivered"].includes(order.status) ? "Przekazano kurierowi" : "Oczekuje",
        isCompleted: ["shipped", "delivered"].includes(order.status),
      },
      {
        name: "Dostarczono",
        timestamp: order.status === "delivered" ? "Dostarczono pomyślnie" : "W drodze",
        isCompleted: order.status === "delivered",
      }
    ];
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
          <h1 className="text-4xl font-bold mb-8">Moje Zamówienia</h1>

          {orders === undefined ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-lg text-muted-foreground mb-4">Brak zamówień</p>
                <Button onClick={() => navigate("/products")}>Rozpocznij Zakupy</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          Zamówienie #{order._id.slice(-8).toUpperCase()}
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
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                              <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × {formatCurrency(item.price)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <span className="font-medium text-muted-foreground">Suma całkowita</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/10 rounded-xl p-6 border h-fit">
                        <h3 className="font-semibold mb-6">Status zamówienia</h3>
                        <OrderTracking steps={getTrackingSteps(order)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">A</span>
                </div>
                <span className="font-display font-bold">Artifex</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redefiniujemy cyfrową produkcję z nutą luksusu.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Sklep</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/products")} className="hover:text-foreground">Wszystkie Produkty</button></li>
                <li><button onClick={() => navigate("/products")} className="hover:text-foreground">Sztuka</button></li>
                <li><button onClick={() => navigate("/products")} className="hover:text-foreground">Dekoracje</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">O Nas</a></li>
                <li><a href="/contact" className="hover:text-foreground">Kontakt</a></li>
                <li><a href="/terms" className="hover:text-foreground">Regulamin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Wpisz swój email" 
                  className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
                />
                <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                  Zapisz się
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Artifex Forge. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}