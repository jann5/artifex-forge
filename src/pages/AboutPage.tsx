import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Flag, Award, Crown } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>
                O Kolekcji <span className="text-[#C1272D]">Nawrocki 2025</span>
              </h1>
              <p className="text-xl text-[#1B2A49]/70 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Upamiętniamy historyczny moment polskiej demokracji. Nasza kolekcja pamiątek prezydenckich 
                łączy najwyższą jakość rzemiosła z duchem patriotyzmu, tworząc przedmioty, które przetrwają pokolenia.
              </p>
            </motion.div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-0 left-0 -z-10 w-full h-full opacity-5">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C1272D] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-white rounded-xl border border-[#D4AF37]/20 shadow-sm"
              >
                <Shield className="h-10 w-10 text-[#C1272D] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Autentyczność</h3>
                <p className="text-[#1B2A49]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Każdy produkt jest oficjalnie licencjonowany i opatrzony certyfikatem autentyczności z unikalnym numerem.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white rounded-xl border border-[#D4AF37]/20 shadow-sm"
              >
                <Flag className="h-10 w-10 text-[#C1272D] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Patriotyzm</h3>
                <p className="text-[#1B2A49]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Celebrujemy polską tradycję demokratyczną i dumę narodową poprzez starannie zaprojektowane pamiątki.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-white rounded-xl border border-[#D4AF37]/20 shadow-sm"
              >
                <Award className="h-10 w-10 text-[#C1272D] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Jakość</h3>
                <p className="text-[#1B2A49]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Najwyższej klasy materiały i precyzyjne wykonanie — od mosiądzu po porcelanę, każdy detal ma znaczenie.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-white rounded-xl border border-[#D4AF37]/20 shadow-sm"
              >
                <Crown className="h-10 w-10 text-[#C1272D] mb-4" />
                <h3 className="text-xl font-bold mb-2 text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Kolekcja</h3>
                <p className="text-[#1B2A49]/60" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Limitowane edycje i ekskluzywne serie tworzą kolekcję, która z czasem zyskuje na wartości.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-square bg-[#1B2A49]/5 rounded-2xl overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&q=80&w=1000" 
                  alt="Kolekcja Prezydencka" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-[#1B2A49]" style={{ fontFamily: "'Playfair Display', serif" }}>Nasza Misja</h2>
                <p className="text-[#1B2A49]/70 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Rok 2025 zapisał się w historii Polski jako moment przełomowy. Wybór Karola Nawrockiego na Prezydenta RP 
                  to wydarzenie, które zasługuje na upamiętnienie w najwyższym stylu.
                </p>
                <p className="text-[#1B2A49]/70 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Tworzymy ekskluzywne pamiątki prezydenckie — od eleganckich monet kolekcjonerskich, przez porcelanowe 
                  filiżanki z herbem, po limitowane edycje medali i znaczków. Każdy przedmiot jest zaprojektowany 
                  z szacunkiem dla urzędu i polskiej tradycji.
                </p>
                <p className="text-[#1B2A49]/70 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Zapraszamy do odkrycia kolekcji, która łączy patriotyzm z luksusem — bo wielkie momenty 
                  zasługują na wielkie pamiątki.
                </p>
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-1 w-12 bg-[#C1272D] rounded-full" />
                  <div className="h-1 w-8 bg-[#D4AF37] rounded-full" />
                  <div className="h-1 w-4 bg-[#1B2A49] rounded-full" />
                </div>
              </div>
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
