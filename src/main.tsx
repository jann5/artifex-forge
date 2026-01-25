import { StrictMode, Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter, Route, Routes } from "react-router";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProductPage from "./pages/ProductPage";
import ProductsPage from "./pages/ProductsPage";
import AdminPage from "./pages/AdminPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import ReviewsPage from "./pages/ReviewsPage";
import AddressesPage from "./pages/AddressesPage";
import RecentPage from "./pages/RecentPage";
import SettingsPage from "./pages/SettingsPage";
import Demo from "./demo";
import AboutPage from "./pages/AboutPage";
import { Toaster } from "@/components/ui/sonner";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/recent" element={<RecentPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ConvexAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);