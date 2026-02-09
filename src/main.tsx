import React, { Component, ReactNode, StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Toaster } from "sonner";
import "./index.css";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import AdminPage from "./pages/AdminPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import FavoritesPage from "./pages/FavoritesPage";
import ReviewsPage from "./pages/ReviewsPage";
import AddressesPage from "./pages/AddressesPage";
import RecentPage from "./pages/RecentPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CustomOrderPage from "./pages/CustomOrderPage";
import PortfolioPage from "./pages/PortfolioPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";
import Demo from "./demo";

// Debug log for user
console.log("================================================");
console.log("DEBUG: VITE_CONVEX_URL is:", import.meta.env.VITE_CONVEX_URL);
console.log("================================================");

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function MissingConvexConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-6 shadow-lg">
        <h1 className="text-xl font-bold text-destructive mb-4">Brak konfiguracji Convex</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Ustaw <span className="font-mono">VITE_CONVEX_URL</span> w pliku <span className="font-mono">.env.local</span>,
          a następnie uruchom ponownie serwer dev.
        </p>
        <pre className="bg-muted p-4 rounded text-xs overflow-auto mb-4">{`CONVEX_DEPLOYMENT=your-deployment\nVITE_CONVEX_URL=your-convex-url`}</pre>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary text-primary-foreground h-10 rounded-md font-medium"
        >
          Odśwież stronę
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border rounded-lg p-6 shadow-lg">
            <h1 className="text-xl font-bold text-destructive mb-4">Wystąpił błąd</h1>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto mb-4">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground h-10 rounded-md font-medium"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/products",
    element: <ProductsPage />,
  },
  {
    path: "/products/:id",
    element: <ProductPage />,
  },
  {
    path: "/custom-order",
    element: <CustomOrderPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/admin/orders",
    element: <AdminOrdersPage />,
  },
  {
    path: "/admin/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/orders",
    element: <OrdersPage />,
  },
  {
    path: "/payment-success",
    element: <PaymentSuccessPage />,
  },
  {
    path: "/favorites",
    element: <FavoritesPage />,
  },
  {
    path: "/reviews",
    element: <ReviewsPage />,
  },
  {
    path: "/addresses",
    element: <AddressesPage />,
  },
  {
    path: "/recent",
    element: <RecentPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/portfolio",
    element: <PortfolioPage />,
  },
  {
    path: "/faq",
    element: <FAQPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
  },
  {
    path: "/demo",
    element: <Demo />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      {convex ? (
        <ConvexAuthProvider client={convex}>
          <RouterProvider router={router} />
          <Toaster />
        </ConvexAuthProvider>
      ) : (
        <MissingConvexConfig />
      )}
    </ErrorBoundary>
  </StrictMode>,
);
