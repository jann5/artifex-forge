import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddressesPage() {
  const addresses = useQuery(api.addresses.list);
  const addAddress = useMutation(api.addresses.add);
  const removeAddress = useMutation(api.addresses.remove);
  const setDefault = useMutation(api.addresses.setDefault);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await addAddress({
        fullName: formData.get("fullName") as string,
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        postalCode: formData.get("postalCode") as string,
        country: formData.get("country") as string,
        phone: formData.get("phone") as string || "",
        isDefault: formData.get("isDefault") === "on",
      });
      toast.success("Adres został dodany");
      setIsOpen(false);
    } catch (error) {
      toast.error("Nie udało się dodać adresu");
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
              <MapPin className="h-6 w-6 md:h-8 md:w-8" />
              Adresy Dostawy
            </h1>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Dodaj Adres
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Dodaj nowy adres</DialogTitle>
                  <DialogDescription>
                    Wypełnij poniższy formularz, aby dodać nowy adres dostawy.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Imię i Nazwisko</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="street">Ulica i numer</Label>
                    <Input id="street" name="street" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Kod pocztowy</Label>
                      <Input id="postalCode" name="postalCode" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">Miasto</Label>
                      <Input id="city" name="city" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Kraj</Label>
                    <Input id="country" name="country" defaultValue="Polska" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+48 123 456 789" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isDefault" name="isDefault" />
                    <Label htmlFor="isDefault">Ustaw jako domyślny</Label>
                  </div>
                  <Button type="submit" className="mt-4">Zapisz adres</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {addresses === undefined ? (
            <div className="text-center py-20">Ładowanie...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/10">
              <p className="text-muted-foreground">
                Nie masz zapisanych żadnych adresów dostawy.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {addresses.map((address) => (
                <div key={address._id} className="border rounded-xl p-6 relative bg-card">
                  {address.isDefault && (
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                      Domyślny
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2">{address.fullName}</h3>
                  <p className="text-muted-foreground">{address.street}</p>
                  <p className="text-muted-foreground">{address.postalCode} {address.city}</p>
                  <p className="text-muted-foreground mb-4">{address.country}</p>
                  
                  <div className="flex gap-2 mt-4">
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDefault({ id: address._id })}
                      >
                        <Check className="mr-2 h-3 w-3" /> Ustaw domyślny
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if(confirm("Czy na pewno chcesz usunąć ten adres?")) {
                          removeAddress({ id: address._id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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