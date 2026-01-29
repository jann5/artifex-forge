import { Link } from "react-router";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

export function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Moje zamówienia',
      href: '/orders',
      icon: <Package className="h-full w-full" />,
    },
    {
      label: 'Opinie',
      href: '/reviews',
      icon: <MessageSquare className="h-full w-full" />,
    },
    {
      label: 'Adresy dostawy',
      href: '/addresses',
      icon: <MapPin className="h-full w-full" />,
    },
    {
      label: 'Ostatnio oglądane',
      href: '/recent',
      icon: <Clock className="h-full w-full" />,
    },
    {
      label: 'Ulubione',
      href: '/favorites',
      icon: <Star className="h-full w-full" />,
    },
    ...(user?.role === 'admin' ? [
      {
        label: 'Panel Admina',
        href: '/admin',
        icon: <ShieldCheck className="h-full w-full" />,
      },
      {
        label: 'Zarządzanie Zamówieniami',
        href: '/admin/orders',
        icon: <Package className="h-full w-full" />,
      }
    ] : []),
    {
      label: 'Ustawienia',
      href: '/settings',
      icon: <Settings className="h-full w-full" />,
      isSeparator: true,
    },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
      isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
        : "bg-transparent border-transparent"
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://harmless-tapir-303.convex.cloud/api/storage/30dff0c3-bcda-4a67-94df-27c80a556658" 
            alt="Essentia Logo" 
            className="h-10 w-10 object-contain"
          />
          <span className="text-2xl font-black text-black uppercase" style={{ fontFamily: "'Proxy_Mono_Beta', monospace" }}>
            ESSENTIA
          </span>
        </Link>

        <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors duration-500 ${
          isScrolled ? "text-muted-foreground" : "text-foreground"
        }`}>
          <Link to="/products" className="hover:text-primary transition-colors">
            Sklep
          </Link>
          <Link to="/products?category=art" className="hover:text-primary transition-colors">
            Sztuka
          </Link>
          <Link to="/products?category=decor" className="hover:text-primary transition-colors">
            Dekoracje
          </Link>
          <Link to="/about" className="hover:text-primary transition-colors">
            O Nas
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Kontakt
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <CartDrawer />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || user?.email?.split('@')[0] || 'Użytkownik'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navItems.map((item, index) => (
                  <div key={index}>
                    {item.isSeparator && <DropdownMenuSeparator />}
                    <DropdownMenuItem asChild>
                      <Link to={item.href} className="cursor-pointer w-full flex items-center">
                        <span className="mr-2 h-4 w-4">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj się</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/auth">Zaloguj się</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://harmless-tapir-303.convex.cloud/api/storage/30dff0c3-bcda-4a67-94df-27c80a556658" 
                      alt="Essentia Logo" 
                      className="h-10 w-10 object-contain"
                    />
                    <span className="text-2xl font-bold text-foreground uppercase" style={{ fontFamily: "'Proxy_Mono_Beta', monospace" }}>
                      ESSENTIA
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  to="/products"
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sklep
                </Link>
                <Link
                  to="/products?category=art"
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sztuka
                </Link>
                <Link
                  to="/products?category=decor"
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dekoracje
                </Link>
                <Link
                  to="/about"
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  O Nas
                </Link>
                <Link
                  to="/contact"
                  className="text-lg font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kontakt
                </Link>
                {!isAuthenticated && (
                  <>
                    <div className="border-t my-2" />
                    <Button asChild className="w-full">
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        Zaloguj się
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}