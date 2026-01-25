import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <MapPin className="h-8 w-8" />
              Adresy Dostawy
            </h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Dodaj Adres
            </Button>
          </div>
          
          <div className="text-center py-20 border rounded-xl bg-muted/10">
            <p className="text-muted-foreground">
              Nie masz zapisanych żadnych adresów dostawy.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
