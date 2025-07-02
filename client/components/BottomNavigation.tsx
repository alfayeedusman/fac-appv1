import { Link, useLocation } from "react-router-dom";
import { Calendar, CreditCard, QrCode, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "/booking",
      icon: Calendar,
      label: "Book",
      id: "booking",
    },
    {
      to: "/manage-subscription",
      icon: CreditCard,
      label: "Plans",
      id: "plans",
    },
    {
      to: "/dashboard",
      icon: Home,
      label: "Home",
      id: "home",
      isCenter: true,
    },
    {
      to: "/voucher",
      icon: Gift,
      label: "Voucher",
      id: "voucher",
    },
    {
      to: "/profile",
      icon: User,
      label: "Profile",
      id: "profile",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Home Button Background Circle */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg"></div>

      {/* Background Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="grid grid-cols-5 items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);

              if (item.isCenter) {
                return (
                  <div key={item.id} className="flex justify-center">
                    <Link
                      to={item.to}
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transform -translate-y-4 transition-all duration-300 z-10",
                        active
                          ? "bg-fac-orange-500 text-white scale-110"
                          : "bg-fac-orange-500 hover:bg-fac-orange-600 text-white hover:scale-110 active:scale-95",
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-1 p-2 transition-all duration-200 active:scale-95 rounded-lg",
                    active
                      ? "text-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950"
                      : "text-gray-400 hover:text-fac-orange-500 hover:bg-gray-50 dark:hover:bg-gray-700",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      active && "scale-110",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs transition-all duration-200",
                      active ? "font-semibold" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
