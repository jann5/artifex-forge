import { Link } from "react-router";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Package, Settings, LogOut, ShieldCheck } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UserProfileSidebar } from "@/components/ui/menu";

export function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth();

  const navItems = [
    {
      label: 'Moje zamówienia',
      href: '/orders',
      icon: <Package className="h-full w-full" />,
    },
    ...(user?.role === 'admin' ? [{
      label: 'Panel Admina',
      href: '/admin',
      icon: <ShieldCheck className="h-full w-full" />,
    }] : []),
    {
      label: 'Ustawienia',
      href: '/settings', // Placeholder, could be profile page
      icon: <Settings className="h-full w-full" />,
      isSeparator: true,
    },
  ];

  const logoutItem = {
    label: 'Wyloguj się',
    icon: <LogOut className="h-full w-full" />,
    onClick: () => signOut(),
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Artifex</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/products" className="hover:text-foreground transition-colors">
            Sklep
          </Link>
          <Link to="/products?category=art" className="hover:text-foreground transition-colors">
            Sztuka
          </Link>
          <Link to="/products?category=decor" className="hover:text-foreground transition-colors">
            Dekoracje
          </Link>
          <Link to="/about" className="hover:text-foreground transition-colors">
            O Nas
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <CartDrawer />
          
          {isAuthenticated ? (
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Link to="/orders">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent align="end" className="w-80 p-0 border-none bg-transparent shadow-none" sideOffset={10}>
                <UserProfileSidebar 
                  user={{
                    name: user?.name || user?.email?.split('@')[0] || 'Użytkownik',
                    email: user?.email || '',
                    avatarUrl: user?.image,
                  }}
                  navItems={navItems}
                  logoutItem={logoutItem}
                />
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/auth">Zaloguj się</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}