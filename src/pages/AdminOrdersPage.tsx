import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, XCircle, Truck, FileText, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const orders = useQuery(api.orders.listAll);
  const customOrders = useQuery(api.customOrders.list);
  const updateStatus = useMutation(api.orders.updateStatus);
  const updateCustomOrderStatus = useMutation(api.customOrders.updateStatus);
  const setCustomOrderPrice = useMutation(api.customOrders.updatePrice);
  
  const [selectedCustomOrder, setSelectedCustomOrder] = useState<any>(null);
  const [priceInput, setPriceInput] = useState("");
  const [showPriceDialog, setShowPriceDialog] = useState(false);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold">Access Denied</h1>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (orderId: Id<"orders">, newStatus: string) => {
    try {
      await updateStatus({ 
        orderId, 
        status: newStatus as "pending" | "paid" | "shipped" | "delivered" | "cancelled"
      });
      toast.success("Status zamówienia zaktualizowany");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji statusu");
    }
  };

  const handleCustomOrderStatusChange = async (orderId: Id<"customOrders">, newStatus: string) => {
    try {
      await updateCustomOrderStatus({ orderId, status: newStatus });
      toast.success("Status zamówienia niestandardowego zaktualizowany");
    } catch (error) {
      toast.error("Błąd podczas aktualizacji statusu");
    }
  };

  const handleSetPrice = async () => {
    if (!selectedCustomOrder || !priceInput) return;
    
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      toast.error("Podaj prawidłową cenę");
      return;
    }

    try {
      await setCustomOrderPrice({
        orderId: selectedCustomOrder._id,
        estimatedPrice: price,
      });
      toast.success("Cena została ustawiona i klient otrzymał powiadomienie email");
      setShowPriceDialog(false);
      setPriceInput("");
      setSelectedCustomOrder(null);
    } catch (error) {
      toast.error("Błąd podczas ustawiania ceny");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "paid": return <CheckCircle className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "quoted": return <DollarSign className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "in_production": return <Package className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "paid": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "delivered": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "quoted": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_production": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Zarządzanie Zamówieniami</h1>

          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="standard">Standardowe</TabsTrigger>
              <TabsTrigger value="custom">Niestandardowe</TabsTrigger>
            </TabsList>

            {/* Standard Orders Tab */}
            <TabsContent value="standard" className="mt-6">
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
                    <p className="text-lg text-muted-foreground">Brak zamówień</p>
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
                              Klient: {order.customerName} ({order.customerEmail})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order._creationTime).toLocaleDateString("pl-PL", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(order.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </Badge>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order._id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Oczekujące</SelectItem>
                                <SelectItem value="paid">Opłacone</SelectItem>
                                <SelectItem value="shipped">Wysłane</SelectItem>
                                <SelectItem value="delivered">Dostarczone</SelectItem>
                                <SelectItem value="cancelled">Anulowane</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
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
                        
                        <div className="flex justify-between items-center pt-4 border-t mt-4">
                          <span className="font-medium text-muted-foreground">Suma całkowita</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Custom Orders Tab */}
            <TabsContent value="custom" className="mt-6">
              {customOrders === undefined ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : customOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-lg text-muted-foreground">Brak zamówień niestandardowych</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {customOrders.map((order: any) => (
                    <Card key={order._id} className="overflow-hidden">
                      <CardHeader className="bg-muted/30 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              {order.projectName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Klient: {order.customerName} ({order.customerEmail})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order._creationTime).toLocaleDateString("pl-PL", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(order.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </Badge>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleCustomOrderStatusChange(order._id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Oczekujące</SelectItem>
                                <SelectItem value="quoted">Wycenione</SelectItem>
                                <SelectItem value="accepted">Zaakceptowane</SelectItem>
                                <SelectItem value="in_production">W produkcji</SelectItem>
                                <SelectItem value="completed">Ukończone</SelectItem>
                                <SelectItem value="cancelled">Anulowane</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Materiał</h4>
                              <p className="text-base">{order.material}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Opis</h4>
                              <p className="text-base">{order.description}</p>
                            </div>
                            {order.contactInfo && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Kontakt</h4>
                                <p className="text-base">{order.contactInfo}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Wycena</h4>
                              {order.estimatedPrice ? (
                                <p className="text-2xl font-bold text-primary">
                                  {formatCurrency(order.estimatedPrice)}
                                </p>
                              ) : (
                                <Button
                                  onClick={() => {
                                    setSelectedCustomOrder(order);
                                    setShowPriceDialog(true);
                                  }}
                                  className="mt-1"
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Ustaw cenę
                                </Button>
                              )}
                            </div>
                            
                            {order.images && order.images.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Załączniki</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {order.images.slice(0, 4).map((imageId: string, idx: number) => (
                                    <div key={idx} className="aspect-square rounded-lg bg-muted overflow-hidden border">
                                      <img 
                                        src={imageId} 
                                        alt={`Załącznik ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Price Setting Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ustaw cenę wyceny</DialogTitle>
            <DialogDescription>
              Podaj szacowaną cenę dla zamówienia: {selectedCustomOrder?.projectName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Cena w PLN"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSetPrice}>
              Zapisz i powiadom klienta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}