import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, User, CreditCard, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: "Home",
  },
  {
    path: "/booking",
    icon: Calendar,
    label: "Booking",
  },
  {
    path: "/manage-subscription",
    icon: CreditCard,
    label: "Plans",
  },
  {
    path: "/profile",
    icon: User,
    label: "Profile",
  },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive
                  ? "text-fac-orange-500 bg-fac-orange-50"
                  : "text-gray-500 hover:text-fac-orange-400",
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "text-fac-orange-500")}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
