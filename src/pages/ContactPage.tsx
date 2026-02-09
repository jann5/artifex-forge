import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Kontakt <span className="text-[#C1272D]">z Nami</span>
              </h1>
              <p className="text-xl text-[#1B2A49]/70 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Masz pytania dotyczące naszej kolekcji? Chcesz zamówić spersonalizowaną pamiątkę prezydencką?
                Jesteśmy do Twojej dyspozycji.
              </p>
            </motion.div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-0 -z-10 w-full h-full opacity-5">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#C1272D] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
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
                <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Dane Kontaktowe</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-[#C1272D]/10 rounded-lg flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-[#C1272D]" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1 text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Email</h3>
                        <p className="text-[#1B2A49]/60">sklep@nawrocki2025.pl</p>
                        <p className="text-[#1B2A49]/60">współpraca@nawrocki2025.pl</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-[#C1272D]/10 rounded-lg flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-[#C1272D]" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1 text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Telefon</h3>
                        <p className="text-[#1B2A49]/60">+48 800 200 300</p>
                        <p className="text-sm text-[#1B2A49]/50 mt-1">Pn-Pt: 9:00 - 17:00</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-[#C1272D]/10 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-[#C1272D]" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1 text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lokalizacja</h3>
                        <p className="text-[#1B2A49]/60">Krakowskie Przedmieście 48/50</p>
                        <p className="text-[#1B2A49]/60">00-071 Warszawa</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-[#D4AF37]/20">
                  <h3 className="font-bold mb-2 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Częste pytania</h3>
                  <p className="text-[#1B2A49]/60 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Zanim napiszesz, sprawdź naszą sekcję FAQ. Być może odpowiedź na Twoje pytanie już tam jest.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#1B2A49]/20 text-[#1B2A49] hover:bg-[#1B2A49] hover:text-white"
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
                className="bg-white border border-[#D4AF37]/20 rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold mb-6 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Napisz do nas</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Imię</label>
                      <Input id="name" placeholder="Twoje imię" required className="border-[#1B2A49]/20 focus:border-[#C1272D]" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Email</label>
                      <Input id="email" type="email" placeholder="twoj@email.com" required className="border-[#1B2A49]/20 focus:border-[#C1272D]" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Temat</label>
                    <Input id="subject" placeholder="Czego dotyczy wiadomość?" required className="border-[#1B2A49]/20 focus:border-[#C1272D]" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Wiadomość</label>
                    <Textarea 
                      id="message" 
                      placeholder="Treść Twojej wiadomości..." 
                      className="min-h-[150px] border-[#1B2A49]/20 focus:border-[#C1272D]" 
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#C1272D] hover:bg-[#A01F25] text-white" 
                    disabled={isSubmitting}
                  >
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
      <footer className="py-16 bg-[#1B2A49] mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 bg-[#C1272D] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>N</span>
                </div>
                <span className="text-white font-bold tracking-[0.15em] text-sm">NAWROCKI <span className="text-[#D4AF37]">2025</span></span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Oficjalny sklep z kolekcjonerskimi pamiątkami prezydenckimi.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Kolekcja</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="/products" className="hover:text-[#D4AF37] transition-colors">Wszystkie Produkty</a></li>
                <li><a href="/about" className="hover:text-[#D4AF37] transition-colors">O Nas</a></li>
                <li><a href="/faq" className="hover:text-[#D4AF37] transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Kontakt</h4>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li>sklep@nawrocki2025.pl</li>
                <li>+48 800 200 300</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/30">
            © {new Date().getFullYear()} Nawrocki 2025. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}