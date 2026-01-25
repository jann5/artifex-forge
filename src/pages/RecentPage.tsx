import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function RecentPage() {
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
            <Clock className="h-8 w-8" />
            Ostatnio Oglądane
          </h1>
          
          <div className="text-center py-20 border rounded-xl bg-muted/10">
            <p className="text-muted-foreground">
              Historia przeglądania jest pusta.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
