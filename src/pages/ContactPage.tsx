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

  const faqItems = [
    {
      question: "Jak długo trwa realizacja zamówienia?",
      answer: "Standardowy czas realizacji to 3-5 dni roboczych. W przypadku większych lub bardziej skomplikowanych projektów czas może się wydłużyć do 7-10 dni. O dokładnym czasie poinformujemy Cię po złożeniu zamówienia."
    },
    {
      question: "Jakie materiały używacie do druku 3D?",
      answer: "Używamy wysokiej jakości filamentów PLA, PETG, ABS oraz żywic fotopolimerowych. Każdy materiał ma swoje unikalne właściwości - PLA jest ekologiczny i łatwy w obróbce, PETG jest wytrzymały i odporny na wilgoć, a ABS charakteryzuje się wysoką odpornością termiczną."
    },
    {
      question: "Czy mogę zamówić produkt na indywidualne zamówienie?",
      answer: "Tak! Specjalizujemy się w projektach niestandardowych. Skontaktuj się z nami przez formularz kontaktowy lub email, opisując swój pomysł. Nasz zespół pomoże Ci w realizacji projektu od koncepcji po finalny produkt."
    },
    {
      question: "Jakie są koszty wysyłki?",
      answer: "Koszty wysyłki zależą od wagi i rozmiaru przesyłki. Standardowa wysyłka kurierem w Polsce to 15-20 zł. Dla zamówień powyżej 200 zł oferujemy darmową wysyłkę. Dokładny koszt zobaczysz podczas finalizacji zamówienia."
    },
    {
      question: "Czy mogę zwrócić produkt?",
      answer: "Tak, masz 14 dni na zwrot produktu zgodnie z prawem konsumenckim. Produkt musi być w stanie nienaruszonym. Produkty wykonane na indywidualne zamówienie nie podlegają zwrotowi, chyba że są wadliwe."
    },
    {
      question: "Jak mogę śledzić moje zamówienie?",
      answer: "Po wysłaniu zamówienia otrzymasz email z numerem przesyłki. Możesz również śledzić status zamówienia w swoim panelu użytkownika w zakładce 'Zamówienia'."
    },
    {
      question: "Czy oferujecie gwarancję na produkty?",
      answer: "Wszystkie nasze produkty objęte są 12-miesięczną gwarancją na wady produkcyjne. W przypadku problemów skontaktuj się z nami, a my zajmiemy się sprawą jak najszybciej."
    },
    {
      question: "Jakie metody płatności akceptujecie?",
      answer: "Akceptujemy płatności kartą kredytową/debetową, BLIK, przelewy bankowe oraz płatności online przez Stripe. Wszystkie transakcje są w pełni zabezpieczone."
    }
  ];

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
                    onClick={() => {
                      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Zobacz FAQ
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

        {/* FAQ Section */}
        <section id="faq-section" className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Często Zadawane Pytania</h2>
                <p className="text-xl text-muted-foreground">
                  Znajdź odpowiedzi na najczęściej zadawane pytania
                </p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-card border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5">
                      <span className="font-medium text-lg">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Nie znalazłeś odpowiedzi na swoje pytanie?
                </p>
                <Button 
                  size="lg"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Skontaktuj się z nami
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20 mt-auto">
        <div className="container mx-auto px-4">
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ESSENTIA. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}