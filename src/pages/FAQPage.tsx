import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function FAQPage() {
  const navigate = useNavigate();
  const faqItems = useQuery(api.faq.list);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Często Zadawane <span className="text-[#C1272D]">Pytania</span>
                </h1>
                <p className="text-xl text-[#1B2A49]/70" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Znajdź odpowiedzi na najczęściej zadawane pytania o kolekcji Nawrocki 2025
                </p>
              </div>

              {faqItems === undefined ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 bg-[#F8F9FA] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : faqItems.length === 0 ? (
                <div className="text-center py-12 bg-[#F8F9FA] rounded-2xl border border-[#D4AF37]/20">
                  <p className="text-[#1B2A49]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Wkrótce pojawią się tutaj odpowiedzi na najczęściej zadawane pytania
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {faqItems.map((item, index) => (
                    <AccordionItem 
                      key={item._id} 
                      value={`item-${index}`}
                      className="bg-white border border-[#D4AF37]/20 rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-5">
                        <span className="font-medium text-lg text-[#1B2A49]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-[#1B2A49]/60 pb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              <div className="mt-12 text-center bg-[#F8F9FA] rounded-2xl p-8 border border-[#D4AF37]/20">
                <h3 className="font-bold text-xl mb-2 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Nie znalazłeś odpowiedzi?</h3>
                <p className="text-[#1B2A49]/60 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Skontaktuj się z nami, a chętnie odpowiemy na wszystkie Twoje pytania
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/contact")}
                  className="bg-[#C1272D] hover:bg-[#A01F25] text-white"
                >
                  Skontaktuj się z nami
                </Button>
              </div>
            </motion.div>
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