import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Printer, Heart, Lightbulb, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Pasja do <span className="text-primary">Tworzenia</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                W ESSENTIA wierzymy, że druk 3D to nie tylko technologia – to nowa forma rzemiosła. 
                Łączymy inżynieryjną precyzję z artystyczną wizją, aby dostarczać przedmioty, które inspirują.
              </p>
            </motion.div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-0 -z-10 w-full h-full opacity-5">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-background rounded-xl border shadow-sm">
                <Printer className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Technologia</h3>
                <p className="text-muted-foreground">
                  Wykorzystujemy najnowocześniejsze drukarki i materiały, aby zapewnić najwyższą jakość każdego detalu.
                </p>
              </div>
              <div className="p-6 bg-background rounded-xl border shadow-sm">
                <Heart className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Pasja</h3>
                <p className="text-muted-foreground">
                  Każdy projekt powstaje z miłości do designu i chęci tworzenia rzeczy pięknych i użytecznych.
                </p>
              </div>
              <div className="p-6 bg-background rounded-xl border shadow-sm">
                <Lightbulb className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Innowacja</h3>
                <p className="text-muted-foreground">
                  Stale eksperymentujemy z nowymi formami i strukturami, przesuwając granice tego, co możliwe.
                </p>
              </div>
              <div className="p-6 bg-background rounded-xl border shadow-sm">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Społeczność</h3>
                <p className="text-muted-foreground">
                  Tworzymy dla ludzi, którzy cenią unikalność i chcą otaczać się przedmiotami z duszą.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                  alt="Proces druku 3D" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Nasza Historia</h2>
                <p className="text-muted-foreground text-lg">
                  Wszystko zaczęło się od jednej małej drukarki i wielkiego marzenia. Chcieliśmy udowodnić, że druk 3D może być czymś więcej niż tylko prototypowaniem – może być sztuką.
                </p>
                <p className="text-muted-foreground text-lg">
                  Dziś ESSENTIA to studio projektowe, które dostarcza unikalne produkty do domów na całym świecie. Każdy przedmiot, który opuszcza naszą pracownię, jest ręcznie wykańczany i sprawdzany, aby spełniał nasze rygorystyczne standardy.
                </p>
                <p className="text-muted-foreground text-lg">
                  Jesteśmy dumni, że możemy dzielić się naszą pasją z Wami. Dziękujemy, że jesteście częścią naszej podróży.
                </p>
              </div>
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
