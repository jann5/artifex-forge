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
  MessageSquare 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

export function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

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
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      isScrolled 
        ? "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/95 shadow-sm" 
        : "bg-transparent border-transparent"
    }`}>
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
          <Link to="/contact" className="hover:text-foreground transition-colors">
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
            <Button variant="ghost" asChild>
              <Link to="/auth">Zaloguj się</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}