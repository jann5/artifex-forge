# Artifex Forge

Artifex Forge to rozbudowany sklep i platforma zamówień dla produktów oraz realizacji druku 3D.

## Funkcje

- katalog produktów, filtrowanie i widoki szczegółów;
- koszyk, checkout i statusy zamówień;
- formularz zamówień indywidualnych;
- konto użytkownika, ulubione, adresy i historia zamówień;
- opinie, FAQ i portfolio;
- panel administracyjny do zarządzania produktami, zamówieniami i treścią;
- responsywny interfejs z elementami 3D.

## Stack

- React 19 i TypeScript
- Vite
- React Router
- Tailwind CSS i komponenty Radix UI
- Convex i Convex Auth
- Stripe
- Framer Motion oraz Three.js

## Uruchomienie lokalne

Projekt wymaga Node.js oraz skonfigurowanego backendu Convex.

```bash
npm install
VITE_CONVEX_URL=https://twoj-projekt.convex.cloud npm run dev
```

Bez `VITE_CONVEX_URL` aplikacja wyświetli ekran informujący o brakującej konfiguracji.

## Polecenia

```bash
npm run dev
npm run build
npm run type-check
npm run lint
```
