import { UserProfileSidebar } from "@/components/ui/menu";
import { User, Settings, LogOut, Package } from "lucide-react";

export default function Demo() {
  const user = {
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
  };

  const navItems = [
    {
      label: "Moje zamówienia",
      href: "/orders",
      icon: <Package className="h-full w-full" />,
    },
    {
      label: "Profil",
      href: "/profile",
      icon: <User className="h-full w-full" />,
    },
    {
      label: "Ustawienia",
      href: "/settings",
      icon: <Settings className="h-full w-full" />,
      isSeparator: true,
    },
  ];

  const logoutItem = {
    label: "Wyloguj się",
    icon: <LogOut className="h-full w-full" />,
    onClick: () => console.log("Logout clicked"),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-8">
      <UserProfileSidebar
        user={user}
        navItems={navItems}
        logoutItem={logoutItem}
      />
    </div>
  );
}