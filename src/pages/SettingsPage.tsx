import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Ustawienia Konta
          </h1>
          
          <div className="space-y-8">
            <div className="space-y-4 p-6 border rounded-xl bg-card">
              <h2 className="text-xl font-semibold">Dane Osobowe</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Imię i Nazwisko</Label>
                  <Input id="name" defaultValue={user?.name || ""} placeholder="Twoje imię" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Adres Email</Label>
                  <Input id="email" defaultValue={user?.email || ""} disabled />
                </div>
              </div>
              <Button>Zapisz Zmiany</Button>
            </div>

            <div className="space-y-4 p-6 border rounded-xl bg-card">
              <h2 className="text-xl font-semibold text-destructive">Strefa Niebezpieczna</h2>
              <p className="text-sm text-muted-foreground">
                Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną utracone.
              </p>
              <Button variant="destructive">Usuń Konto</Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
