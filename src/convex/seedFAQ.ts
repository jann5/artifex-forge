import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedFAQs = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (user?.role !== "admin") throw new Error("Admin access required");

    // Check if FAQs already exist
    const existingFAQs = await ctx.db.query("faq").collect();
    if (existingFAQs.length > 0) {
      return { message: "FAQs already exist", count: existingFAQs.length };
    }

    const faqs = [
      {
        question: "Jak długo trwa realizacja zamówienia?",
        answer: "Standardowy czas realizacji to 3-7 dni roboczych. W przypadku zamówień indywidualnych czas może się wydłużyć do 14 dni. O dokładnym terminie poinformujemy Cię po złożeniu zamówienia."
      },
      {
        question: "Jakie materiały używacie do druku 3D?",
        answer: "Używamy wysokiej jakości materiałów: PLA, PETG, ABS oraz żywice do druku SLA. Każdy materiał ma swoje unikalne właściwości - PLA jest ekologiczny, PETG wytrzymały, a żywica zapewnia najwyższą precyzję detali."
      },
      {
        question: "Czy mogę zamówić produkt według własnego projektu?",
        answer: "Tak! Oferujemy usługę druku na zamówienie. Wystarczy przesłać nam plik 3D (STL, OBJ) lub opis projektu, a my przygotujemy wycenę i harmonogram realizacji."
      },
      {
        question: "Jakie są koszty wysyłki?",
        answer: "Koszty wysyłki zależą od wagi i rozmiaru przesyłki. Standardowa wysyłka kurierem to 15-20 PLN. Przy zamówieniach powyżej 200 PLN wysyłka jest darmowa."
      },
      {
        question: "Czy mogę zwrócić produkt?",
        answer: "Tak, masz 14 dni na zwrot produktu zgodnie z prawem konsumenckim. Produkt musi być w stanie nienaruszonym. Zwrot kosztów następuje w ciągu 14 dni od otrzymania zwrotu."
      },
      {
        question: "Jak mogę śledzić status mojego zamówienia?",
        answer: "Po zalogowaniu się na swoje konto, w sekcji 'Moje zamówienia' znajdziesz aktualny status każdego zamówienia oraz numer przesyłki do śledzenia."
      },
      {
        question: "Czy oferujecie rabaty dla stałych klientów?",
        answer: "Tak! Dla stałych klientów przygotowujemy specjalne oferty i kody rabatowe. Zapisz się do naszego newslettera, aby być na bieżąco z promocjami."
      },
      {
        question: "Jakie formy płatności akceptujecie?",
        answer: "Akceptujemy płatności kartą kredytową/debetową, BLIK, przelewy bankowe oraz płatności online przez Stripe. Wszystkie transakcje są w pełni zabezpieczone."
      }
    ];

    for (const faq of faqs) {
      await ctx.db.insert("faq", faq);
    }

    return { message: "FAQs seeded successfully", count: faqs.length };
  },
});
