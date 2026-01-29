import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedFAQs = mutation({
  args: {},
  handler: async (ctx) => {
    // Allow seeding without authentication for initial setup
    // In production, you should remove this or add proper authentication

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
      },
      {
        question: "Czy produkty są odporne na warunki atmosferyczne?",
        answer: "Zależy od materiału. PLA jest odpowiedni do użytku wewnętrznego, PETG i ABS są bardziej odporne na wilgoć i temperaturę. Dla zastosowań zewnętrznych polecamy PETG lub ASA."
      },
      {
        question: "Jaka jest minimalna wielkość zamówienia?",
        answer: "Nie mamy minimalnej wartości zamówienia. Możesz zamówić nawet jeden produkt. Oferujemy również rabaty ilościowe przy większych zamówieniach."
      },
      {
        question: "Czy mogę zobaczyć próbkę przed zamówieniem?",
        answer: "Tak, dla większych zamówień możemy przygotować próbkę. Skontaktuj się z nami, aby omówić szczegóły i koszty."
      },
      {
        question: "Jakie są możliwości kolorystyczne?",
        answer: "Oferujemy szeroką paletę kolorów dla każdego materiału. Standardowo dostępne są kolory podstawowe, a na zamówienie możemy dostarczyć specjalne odcienie."
      },
      {
        question: "Czy oferujecie obróbkę wykończeniową?",
        answer: "Tak, oferujemy szlifowanie, malowanie, lakierowanie oraz inne formy obróbki wykończeniowej. Szczegóły i wycenę przygotujemy indywidualnie."
      },
      {
        question: "Jaka jest maksymalna wielkość wydruku?",
        answer: "Nasza drukarka Stratasys F170 ma obszar roboczy 254 x 254 x 254 mm. Większe obiekty możemy podzielić na części i złożyć."
      },
      {
        question: "Czy realizujecie zamówienia hurtowe?",
        answer: "Tak, realizujemy zamówienia hurtowe i oferujemy atrakcyjne rabaty. Skontaktuj się z nami, aby omówić szczegóły współpracy."
      },
      {
        question: "Jak przygotować plik do druku 3D?",
        answer: "Plik powinien być w formacie STL lub OBJ, z zamkniętą geometrią (manifold). Chętnie pomożemy w przygotowaniu pliku - wyślij nam swój projekt, a my go zweryfikujemy."
      },
      {
        question: "Czy oferujecie wsparcie techniczne?",
        answer: "Tak, nasz zespół chętnie doradzi w wyborze materiału, optymalizacji projektu i rozwiązaniu problemów technicznych. Skontaktuj się z nami przez formularz lub telefon."
      },
      {
        question: "Jakie są tolerancje wymiarowe?",
        answer: "Standardowa tolerancja to ±0.2mm dla wymiarów do 100mm. Dla większych wymiarów tolerancja wynosi ±0.3%. Możemy osiągnąć wyższą precyzję na specjalne zamówienie."
      },
      {
        question: "Czy mogę anulować zamówienie?",
        answer: "Zamówienie można anulować bezpłatnie przed rozpoczęciem produkcji. Po rozpoczęciu druku pobieramy opłatę manipulacyjną w wysokości 30% wartości zamówienia."
      },
      {
        question: "Czy oferujecie gwarancję na produkty?",
        answer: "Tak, wszystkie nasze produkty objęte są 12-miesięczną gwarancją na wady materiałowe i produkcyjne. Gwarancja nie obejmuje uszkodzeń mechanicznych powstałych w wyniku niewłaściwego użytkowania."
      }
    ];

    for (let i = 0; i < faqs.length; i++) {
      await ctx.db.insert("faq", {
        ...faqs[i],
        order: i
      });
    }

    return { message: "FAQs seeded successfully", count: faqs.length };
  },
});