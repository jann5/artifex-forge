import { Navbar } from "@/components/Navbar";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, CreditCard, Truck, ArrowLeft, Lock, AlertCircle, MapPin, Package } from "lucide-react";
import { InpostGeowidgetReact } from "inpost-geowidget-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStorageUrl } from "@/lib/utils";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customOrderId = searchParams.get("customOrder") as Id<"customOrders"> | null;
  
  const cart = useQuery(api.cart.get);
  const addresses = useQuery(api.addresses.list);
  const customOrder = customOrderId ? useQuery(api.customOrders.getById, { orderId: customOrderId }) : null;
  
  const { isAuthenticated } = useAuth();
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const createCustomOrderCheckout = useMutation(api.customOrders.createCheckoutSession);
  const createCustomOrderStripeSession = useAction(api.stripe.createCustomOrderCheckoutSession);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'inpost' | 'courier'>('inpost');
  const [selectedParcelLocker, setSelectedParcelLocker] = useState<any>(null);
  const [showParcelMap, setShowParcelMap] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Id<"addresses"> | null>(null);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const totalAmount = customOrder 
    ? customOrder.estimatedPrice || 0
    : (cart?.reduce((sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity, 0) || 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-6">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Wymagane logowanie</h1>
            <p className="text-muted-foreground mb-6">
              Zaloguj się, aby bezpiecznie dokończyć zakupy i śledzić swoje zamówienie.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
              Zaloguj się
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (customOrder) {
      // Handle custom order checkout
      if (deliveryMethod === 'inpost' && !selectedParcelLocker) {
        toast.error("Wybierz paczkomat");
        return;
      }
      if (deliveryMethod === 'courier' && !selectedAddress) {
        toast.error("Wybierz adres dostawy");
        return;
      }

      setIsProcessing(true);
      try {
        if (deliveryMethod === 'courier' && !selectedAddress) {
          toast.error("Wybierz adres dostawy");
          setIsProcessing(false);
          return;
        }

        const checkoutData = await createCustomOrderCheckout({
          customOrderId: customOrder._id,
          addressId: selectedAddress || undefined,
        });

        // Now call the Stripe action to create the checkout session
        const result = await createCustomOrderStripeSession({
          customOrderId: checkoutData.customOrderId,
          addressId: checkoutData.addressId || undefined,
          userId: checkoutData.userId as Id<"users">,
          amount: checkoutData.amount,
        });

        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.error("Nie udało się utworzyć sesji płatności");
          setIsProcessing(false);
        }
      } catch (error: any) {
        toast.error(error.message);
        setIsProcessing(false);
      }
    } else {
      if (!cart || cart.length === 0) {
        toast.error("Twój koszyk jest pusty");
        return;
      }

      if (deliveryMethod === 'inpost' && !selectedParcelLocker) {
        toast.error("Wybierz paczkomat");
        return;
      }

      if (deliveryMethod === 'courier') {
        if (!shippingDetails.fullName || !shippingDetails.street || !shippingDetails.city || !shippingDetails.postalCode || !shippingDetails.phone) {
          toast.error("Proszę uzupełnić wszystkie dane do wysyłki");
          return;
        }
      }

      setIsProcessing(true);
      try {
        const items = cart.map((item: any) => ({
          productId: item.productId,
          name: item.product?.name || "Produkt",
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.images?.[0],
        }));

        const shippingData = deliveryMethod === 'inpost' 
          ? {
              fullName: shippingDetails.fullName || "Odbiór w paczkomacie",
              street: selectedParcelLocker.name,
              city: selectedParcelLocker.address.line2,
              postalCode: "",
              phone: shippingDetails.phone || "",
              parcelLocker: selectedParcelLocker.name,
            }
          : shippingDetails;

        const result = await createCheckout({ 
          items,
          shippingAddress: shippingData
        });
        
        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.error("Nie udało się utworzyć sesji płatności");
          setIsProcessing(false);
        }
      } catch (error: any) {
        console.error("Błąd płatności:", error);
        const errorMessage = error.message || "Nie udało się przetworzyć płatności";
        toast.error(errorMessage);
        setIsProcessing(false);
      }
    }
  };

  if (cart === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-64 bg-muted rounded-xl" />
              </div>
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8">Finalizacja zamówienia</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {customOrder ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Zamówienie niestandardowe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{customOrder.projectName}</p>
                      <p className="text-sm text-muted-foreground">{customOrder.description}</p>
                      <p className="text-sm">Materiał: {customOrder.material}</p>
                      <p className="text-2xl font-bold mt-4">{customOrder.estimatedPrice} PLN</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="border shadow-none bg-card overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b py-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Truck className="h-5 w-5 text-primary" />
                        Produkty w koszyku ({cart.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {cart.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          Twój koszyk jest pusty.
                          <Button variant="link" onClick={() => navigate("/products")}>Wróć do sklepu</Button>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {cart.map((item: any) => (
                            <div key={item._id} className="p-6 flex gap-4 sm:gap-6 items-center hover:bg-muted/5 transition-colors">
                              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
                                {item.product?.images?.[0] && (
                                  <img 
                                    src={getStorageUrl(item.product.images[0])} 
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-lg truncate">{item.product?.name}</h3>
                                <p className="text-sm text-muted-foreground capitalize mb-1">{item.product?.category}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="font-normal bg-background">
                                    Ilość: {item.quantity}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">
                                  {formatCurrency((item.product?.price || 0) * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatCurrency(item.product?.price || 0)} / szt.
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border shadow-none bg-card">
                    <CardHeader className="bg-muted/30 border-b py-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                        Dane do wysyłki
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fullName">Imię i Nazwisko</Label>
                        <Input 
                          id="fullName" 
                          placeholder="Jan Kowalski"
                          value={shippingDetails.fullName}
                          onChange={(e) => setShippingDetails({...shippingDetails, fullName: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="street">Ulica i numer</Label>
                        <Input 
                          id="street" 
                          placeholder="ul. Słoneczna 12/4"
                          value={shippingDetails.street}
                          onChange={(e) => setShippingDetails({...shippingDetails, street: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="postalCode">Kod pocztowy</Label>
                          <Input 
                            id="postalCode" 
                            placeholder="00-000"
                            value={shippingDetails.postalCode}
                            onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="city">Miasto</Label>
                          <Input 
                            id="city" 
                            placeholder="Warszawa"
                            value={shippingDetails.city}
                            onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Numer telefonu</Label>
                        <Input 
                          id="phone" 
                          placeholder="+48 123 456 789"
                          value={shippingDetails.phone}
                          onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Bezpieczna transakcja</p>
                      <p className="opacity-90">
                        Wszystkie transakcje są szyfrowane i bezpieczne. Gwarantujemy 100% satysfakcji lub zwrot pieniędzy.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Card className="border shadow-none bg-card">
                <CardHeader className="bg-muted/30 border-b py-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5 text-primary" />
                    Metoda dostawy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        deliveryMethod === 'inpost' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDeliveryMethod('inpost')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-semibold">InPost Paczkomat</p>
                            <p className="text-sm text-muted-foreground">Odbierz z paczkomatu 24/7</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Darmowa
                        </Badge>
                      </div>
                    </div>

                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        deliveryMethod === 'courier' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDeliveryMethod('courier')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Kurier do domu</p>
                            <p className="text-sm text-muted-foreground">Dostawa pod wskazany adres</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Darmowa
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {deliveryMethod === 'inpost' && (
                    <div className="mt-4 space-y-3">
                      <Label>Wybierz paczkomat</Label>
                      {selectedParcelLocker ? (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{selectedParcelLocker.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {selectedParcelLocker.address.line1}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedParcelLocker.address.line2}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowParcelMap(true)}
                            >
                              Zmień
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setShowParcelMap(true)}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Wybierz paczkomat z mapy
                        </Button>
                      )}
                    </div>
                  )}

                  {deliveryMethod === 'courier' && addresses && addresses.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <Label>Wybierz adres dostawy</Label>
                      <div className="space-y-2">
                        {addresses.map((address) => (
                          <div 
                            key={address._id} 
                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedAddress === address._id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedAddress(address._id)}
                          >
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                              selectedAddress === address._id 
                                ? 'border-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              {selectedAddress === address._id && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{address.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {address.street}, {address.city}, {address.postalCode}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border shadow-sm bg-card overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-xl">Do zapłaty</CardTitle>
                  <CardDescription>Podsumowanie kosztów</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Wartość produktów</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Wysyłka</span>
                      <span className="text-green-600 font-medium">Darmowa</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Podatek VAT (23%)</span>
                      <span>wliczony</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Razem</span>
                    <span className="font-bold text-3xl text-primary">{formatCurrency(totalAmount)}</span>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all" 
                      size="lg" 
                      onClick={handleCheckout}
                      disabled={!cart?.length || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Przetwarzanie...
                        </>
                      ) : (
                        <>
                          Zapłać teraz <CreditCard className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-4 flex flex-col gap-3">
                  <div className="w-full flex justify-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                    <div className="h-6 px-2 border rounded bg-white flex items-center justify-center text-[10px] font-bold text-gray-700">VISA</div>
                    <div className="h-6 px-2 border rounded bg-white flex items-center justify-center text-[10px] font-bold text-gray-700">Mastercard</div>
                    <div className="h-6 px-2 border rounded bg-white flex items-center justify-center text-[10px] font-bold text-gray-700">BLIK</div>
                    <div className="h-6 px-2 border rounded bg-white flex items-center justify-center text-[10px] font-bold text-gray-700">Przelewy24</div>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Płatności obsługiwane przez Stripe. Twoje dane są bezpieczne.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* InPost Parcel Locker Map Dialog */}
        <Dialog open={showParcelMap} onOpenChange={setShowParcelMap}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Wybierz paczkomat InPost</DialogTitle>
            </DialogHeader>
            <div className="h-full w-full">
              <div className="p-8 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
                <h3 className="text-lg font-semibold">Wymagana konfiguracja InPost</h3>
                <p className="text-sm text-muted-foreground">
                  Aby korzystać z wyboru paczkomatu, administrator musi skonfigurować token API InPost.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-left text-xs space-y-2">
                  <p className="font-semibold">Instrukcja dla administratora:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Zarejestruj konto na: <a href="https://sandbox-manager.paczkomaty.pl/" target="_blank" className="text-primary underline">sandbox-manager.paczkomaty.pl</a></li>
                    <li>Uzupełnij dane firmy w zakładce "Moje Konto"</li>
                    <li>Przejdź do zakładki API i wygeneruj token Geowidget</li>
                    <li>Dla localhost zostaw pole domeny puste</li>
                    <li>Dodaj token do zmiennych środowiskowych jako INPOST_GEOWIDGET_TOKEN</li>
                  </ol>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowParcelMap(false)}
                  className="mt-4"
                >
                  Zamknij
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}