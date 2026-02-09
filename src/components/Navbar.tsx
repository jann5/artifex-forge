import { Link, useLocation } from "react-router";
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
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
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

  // On homepage: transparent at top, solid when scrolled
  // On other pages: always solid
  const shouldBeTransparent = isHomePage && !isScrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
      shouldBeTransparent
        ? "bg-transparent"
        : "glass shadow-sm border-b border-white/10"
    }`}>
      <div className="container mx-auto px-4 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-[#C1272D] flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>N</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold tracking-wide transition-colors duration-500 ${
              shouldBeTransparent ? "text-white" : "text-[#1B2A49]"
            }`}>
              NAWROCKI
            </span>
            <span className="text-[#D4AF37] text-xs font-semibold">2025</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {[
            { to: "/products", label: "Kolekcja" },
            { to: "/portfolio", label: "Galeria" },
            { to: "/about", label: "O Nas" },
            { to: "/faq", label: "FAQ" },
            { to: "/contact", label: "Kontakt" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative group py-1 transition-colors duration-300 ${
                shouldBeTransparent
                  ? "text-white/80 hover:text-white"
                  : "text-[#1B2A49]/70 hover:text-[#C1272D]"
              }`}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C1272D] group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <CartDrawer />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`relative ${shouldBeTransparent ? "text-white" : "text-[#1B2A49]"} hover:bg-white/10`}>
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
            <Button variant="ghost" asChild className={`hidden md:inline-flex ${shouldBeTransparent ? "text-white hover:bg-white/10" : "text-[#1B2A49] hover:bg-[#1B2A49]/5"}`}>
              <Link to="/auth">Zaloguj się</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`md:hidden ${shouldBeTransparent ? "text-white" : "text-[#1B2A49]"}`}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#C1272D] flex items-center justify-center">
                      <span className="text-white font-bold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>N</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold tracking-wide text-[#1B2A49]">NAWROCKI</span>
                      <span className="text-[#D4AF37] text-xs font-semibold">2025</span>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  to="/products"
                  className="text-lg font-medium hover:text-[#C1272D] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kolekcja
                </Link>
                <Link
                  to="/portfolio"
                  className="text-lg font-medium hover:text-[#C1272D] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Galeria
                </Link>
                <Link
                  to="/about"
                  className="text-lg font-medium hover:text-[#C1272D] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  O Nas
                </Link>
                <Link
                  to="/faq"
                  className="text-lg font-medium hover:text-[#C1272D] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link
                  to="/contact"
                  className="text-lg font-medium hover:text-[#C1272D] transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kontakt
                </Link>
                {!isAuthenticated && (
                  <>
                    <div className="border-t my-2" />
                    <Button asChild className="w-full bg-[#C1272D] hover:bg-[#9E1F24]">
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