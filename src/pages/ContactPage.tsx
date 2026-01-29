import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate sending
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Wiadomość została wysłana! Skontaktujemy się z Tobą wkrótce.");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Skontaktuj się <span className="text-primary">z Nami</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Masz pytania dotyczące naszych produktów? Chcesz zrealizować indywidualny projekt?
                Jesteśmy tutaj, aby Ci pomóc.
              </p>
            </motion.div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-0 -z-10 w-full h-full opacity-5">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="bg-card border rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">Dane Kontaktowe</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Email</h3>
                        <p className="text-muted-foreground">kontakt@essentia.pl</p>
                        <p className="text-muted-foreground">wspolpraca@essentia.pl</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Telefon</h3>
                        <p className="text-muted-foreground">+48 123 456 789</p>
                        <p className="text-sm text-muted-foreground mt-1">Pn-Pt: 9:00 - 17:00</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Lokalizacja</h3>
                        <p className="text-muted-foreground">ul. Rzemieślnicza 15</p>
                        <p className="text-muted-foreground">00-001 Warszawa</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-8 border">
                  <h3 className="font-bold mb-2">Częste pytania</h3>
                  <p className="text-muted-foreground mb-4">
                    Zanim napiszesz, sprawdź naszą sekcję FAQ. Być może odpowiedź na Twoje pytanie już tam jest.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <a href="/faq">Zobacz FAQ</a>
                  </Button>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold mb-6">Napisz do nas</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Imię</label>
                      <Input id="name" placeholder="Twoje imię" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" placeholder="twoj@email.com" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Temat</label>
                    <Input id="subject" placeholder="Czego dotyczy wiadomość?" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Wiadomość</label>
                    <Textarea 
                      id="message" 
                      placeholder="Treść Twojej wiadomości..." 
                      className="min-h-[150px]" 
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Wysyłanie..."
                    ) : (
                      <span className="flex items-center gap-2">
                        Wyślij wiadomość <Send className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">E</span>
                </div>
                <span className="font-bold" style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif", letterSpacing: '0.1em' }}>ESSENTIA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redefiniujemy cyfrową produkcję z nutą luksusu.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Sklep</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/products" className="hover:text-foreground">Wszystkie Produkty</a></li>
                <li><a href="/products?category=art" className="hover:text-foreground">Sztuka</a></li>
                <li><a href="/products?category=decor" className="hover:text-foreground">Dekoracje</a></li>
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
            © {new Date().getFullYear()} ESSENTIA. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}