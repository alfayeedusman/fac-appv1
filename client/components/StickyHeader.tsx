import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Bell, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationDropdown from "@/components/NotificationDropdown";
import { LogoutModal } from "@/components/ConfirmModal";

interface StickyHeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  className?: string;
}

export default function StickyHeader({
  title,
  showBack = false,
  backTo = "/dashboard",
  className,
}: StickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const getPageTitle = () => {
    if (title) return title;

    switch (location.pathname) {
      case "/booking":
        return "Book Service";
      case "/manage-subscription":
        return "Plans";
      case "/voucher":
        return "Vouchers";
      case "/profile":
        return "Profile";
      case "/history":
        return "History";
      default:
        return "Fayeed Auto Care";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform",
        isVisible ? "translate-y-0" : "-translate-y-full",
        className,
      )}
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showBack && (
                <Link to={backTo}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => alert("🔍 Search feature coming soon!")}
              >
                <Search className="h-5 w-5" />
              </Button>
              <NotificationDropdown />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    localStorage.clear();
                    window.location.href = "/login";
                  }
                }}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
