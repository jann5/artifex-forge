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

export default function FAQPage() {
  const navigate = useNavigate();

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
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Często Zadawane <span className="text-primary">Pytania</span>
                </h1>
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

              <div className="mt-12 text-center bg-muted/30 rounded-2xl p-8 border">
                <h3 className="font-bold text-xl mb-2">Nie znalazłeś odpowiedzi?</h3>
                <p className="text-muted-foreground mb-6">
                  Skontaktuj się z nami, a chętnie odpowiemy na wszystkie Twoje pytania
                </p>
                <Button size="lg" onClick={() => navigate("/contact")}>
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
                <li><a href="/portfolio" className="hover:text-foreground">Realizacje</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">O Nas</a></li>
                <li><a href="/contact" className="hover:text-foreground">Kontakt</a></li>
                <li><a href="/faq" className="hover:text-foreground">FAQ</a></li>
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
