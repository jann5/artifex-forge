import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Shield, Cookie, Lock, Eye, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót do strony głównej
              </Link>
            </Button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Polityka Prywatności</h1>
                <p className="text-muted-foreground mt-2">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">1. Wprowadzenie</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych 
                  przekazanych przez Użytkowników w związku z korzystaniem ze strony internetowej ESSENTIA. 
                  Administratorem danych osobowych jest ESSENTIA.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">2. Pliki Cookie</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nasza strona wykorzystuje pliki cookie w celu:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Dostosowania zawartości strony do preferencji użytkownika</li>
                  <li>• Optymalizacji korzystania ze strony internetowej</li>
                  <li>• Prowadzenia statystyk odwiedzin</li>
                  <li>• Utrzymania sesji użytkownika po zalogowaniu</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Użytkownik może w każdej chwili zmienić ustawienia dotyczące plików cookie w swojej przeglądarce.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">3. Zbierane Dane</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  W ramach świadczonych usług zbieramy następujące dane:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Adres e-mail (wymagany do rejestracji)</li>
                  <li>• Imię i nazwisko (opcjonalne)</li>
                  <li>• Adres dostawy (dla realizacji zamówień)</li>
                  <li>• Numer telefonu (dla celów dostawy)</li>
                  <li>• Historia zamówień i preferencje zakupowe</li>
                </ul>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">4. Cel Przetwarzania Danych</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Dane osobowe są przetwarzane w celu:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Realizacji zamówień i świadczenia usług</li>
                  <li>• Komunikacji z klientem</li>
                  <li>• Prowadzenia działań marketingowych (za zgodą użytkownika)</li>
                  <li>• Wypełnienia obowiązków prawnych</li>
                  <li>• Dochodzenia roszczeń i obrony przed roszczeniami</li>
                </ul>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">5. Prawa Użytkownika</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Każdy użytkownik ma prawo do:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Dostępu do swoich danych osobowych</li>
                  <li>• Sprostowania (poprawiania) swoich danych</li>
                  <li>• Usunięcia danych (prawo do bycia zapomnianym)</li>
                  <li>• Ograniczenia przetwarzania danych</li>
                  <li>• Przenoszenia danych</li>
                  <li>• Wniesienia sprzeciwu wobec przetwarzania danych</li>
                  <li>• Cofnięcia zgody w dowolnym momencie</li>
                </ul>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">6. Bezpieczeństwo Danych</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające ochronę 
                  przetwarzanych danych osobowych odpowiednią do zagrożeń oraz kategorii danych 
                  objętych ochroną. W szczególności zabezpieczamy dane przed ich udostępnieniem 
                  osobom nieupoważnionym, utratą, uszkodzeniem lub zniszczeniem.
                </p>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">7. Kontakt</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  W sprawach dotyczących przetwarzania danych osobowych oraz realizacji przysługujących 
                  praw prosimy o kontakt poprzez:
                </p>
                <ul className="space-y-2 text-muted-foreground mt-4">
                  <li>• Formularz kontaktowy na stronie</li>
                  <li>• Email: kontakt@essentia.pl</li>
                </ul>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold m-0">8. Zmiany w Polityce Prywatności</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
                  O wszelkich zmianach użytkownicy będą informowani poprzez komunikat na stronie głównej. 
                  Zmiany wchodzą w życie w dniu ich publikacji.
                </p>
              </section>
            </div>

            <div className="mt-12 p-6 bg-muted/50 rounded-2xl border">
              <p className="text-sm text-muted-foreground text-center">
                Masz pytania dotyczące naszej polityki prywatności?{" "}
                <Link to="/contact" className="text-primary hover:underline font-medium">
                  Skontaktuj się z nami
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ESSENTIA. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}
