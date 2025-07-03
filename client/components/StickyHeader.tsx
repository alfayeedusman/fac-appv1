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

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Define public routes where StickyHeader should not appear
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // useEffect must be called before any conditional returns (Rules of Hooks)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't render StickyHeader on public routes or if not authenticated
  if (isPublicRoute && !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    // Get current user email before clearing
    const userEmail = localStorage.getItem("userEmail");

    // Clear all authentication data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("hasSeenWelcome");
    localStorage.removeItem("showSplashScreen");

    // For additional security, we could clear user-specific data on logout
    // but we'll keep it so users don't lose their subscription data
    // when they log back in. In production, this data would be on the server.

    // Clear any temporary cached data
    localStorage.removeItem("signUpData");

    // Show logout notification and redirect
    window.location.href = "/login";
  };

  const getPageTitle = () => {
    if (title) return title;

    switch (location.pathname) {
      case "/booking":
        return "Book Service";
      case "/my-bookings":
        return "Booking History";
      case "/manage-subscription":
        return "Plans";
      case "/voucher":
        return "Vouchers";
      case "/profile":
        return "Profile";
      case "/history":
        return "History";
      case "/admin-dashboard":
        return "Admin Dashboard";
      case "/admin-cms":
        return "Content Management";
      case "/admin-push-notifications":
        return "Push Notifications";
      case "/admin-gamification":
        return "Gamification Settings";
      case "/admin-subscription-approval":
        return "Subscription Approvals";
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
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
