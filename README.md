# ESSENTIA

Profesjonalny sklep internetowy z drukiem 3D

## Overview

ESSENTIA to nowoczesna platforma e-commerce specjalizująca się w sprzedaży produktów wydrukowanych na profesjonalnej drukarce przemysłowej Stratasys F170. Oferujemy unikalne przedmioty artystyczne, dekoracyjne oraz możliwość zamówienia projektów niestandardowych.

## Features

- 🛒 Pełnofunkcjonalny sklep internetowy z produktami druku 3D
- 🎨 Zamówienia niestandardowe z interaktywnym czatem
- 💳 Integracja z Stripe do obsługi płatności
- 📦 System zarządzania zamówieniami ze śledzeniem statusu
- 👤 Uwierzytelnianie użytkowników przez Convex Auth (email OTP)
- ⭐ System recenzji i ocen produktów
- 🔍 Wyszukiwanie i filtrowanie produktów
- 📱 Responsywny design dostosowany do urządzeń mobilnych
- 🎭 Panel administracyjny do zarządzania produktami i zamówieniami
- 📧 Integracja z Resend do wysyłki emaili

## Tech Stack

This project is built with:
- Vite
- TypeScript
- React Router v7
- React 19
- Tailwind v4
- Shadcn UI
- Lucide Icons
- Convex (backend & database)
- Convex Auth
- Framer Motion
- Three.js
- Bun (package manager)

## Getting Started

### Prerequisites

- Bun installed
- Convex account

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### Environment Variables

Create a `.env.local` file with:

```
CONVEX_DEPLOYMENT=your-deployment
VITE_CONVEX_URL=your-convex-url
```

## Project Structure

```
src/
├── components/     # React components
│   └── ui/        # Shadcn UI components
├── pages/         # Page components
├── convex/        # Convex backend
├── hooks/         # Custom React hooks
└── lib/           # Utility functions
```

## Development Guidelines

See [VLY.md](./VLY.md) for detailed development conventions and best practices.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run type-check` - Run TypeScript type checking
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run preview` - Preview production build
- `bun run test` - Run tests
- `bun run test:watch` - Run tests in watch mode

## Contributing

<!-- AI Agent: Add contribution guidelines if applicable -->

## License

<!-- AI Agent: Add license information -->

---

**Note for AI Agents:** This README should be updated to reflect the actual application being built. Keep it concise and user-focused. For detailed development conventions, refer to [VLY.md](./VLY.md).
