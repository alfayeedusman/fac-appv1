import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import AdminNotificationDropdown from "@/components/AdminNotificationDropdown";
import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  MapPin,
  Bell,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  BarChart3,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
  Crown,
  Zap,
  CreditCard,
  Home,
  Camera,
  Wrench,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  notificationCount: number;
}

const sidebarItems = [
  {
    id: "overview",
    label: "Command Center",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
    gradient: "from-fac-orange-500 to-purple-600",
  },
  {
    id: "customers",
    label: "Customer Hub",
    icon: Users,
    description: "User Management",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "roles",
    label: "User & Roles",
    icon: Shield,
    description: "Role Management",
    gradient: "from-purple-500 to-violet-600",
    superAdminOnly: true,
  },
  {
    id: "ads",
    label: "Ad Studio",
    icon: Sparkles,
    description: "Advertisement Management",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "packages",
    label: "Package Studio",
    icon: Package,
    description: "Service Plans",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "branches",
    label: "Branch Network",
    icon: MapPin,
    description: "Location Management",
    gradient: "from-green-500 to-blue-500",
  },
  {
    id: "analytics",
    label: "Analytics Center",
    icon: BarChart3,
    description: "Reports & Insights",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "bookings",
    label: "Booking Hub",
    icon: Calendar,
    description: "Booking & Crew Management",
    gradient: "from-green-500 to-blue-500",
  },
  {
    id: "images",
    label: "Image Manager",
    icon: Camera,
    description: "Booking Images",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "sales",
    label: "Revenue Hub",
    icon: DollarSign,
    description: "Revenue Tracking",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "System Alerts",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "cms",
    label: "CMS Manager",
    icon: Settings,
    description: "Content Management",
    gradient: "from-fac-orange-500 to-yellow-500",
  },
  {
    id: "booking",
    label: "Booking Settings",
    icon: Calendar,
    description: "All Booking Configuration",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    id: "push-notifications",
    label: "Push Notifications",
    icon: Bell,
    description: "Broadcast Messages",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "gamification",
    label: "Gamification",
    icon: TrendingUp,
    description: "Customer Levels & Rewards",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "subscription-approval",
    label: "Subscription Approval",
    icon: CreditCard,
    description: "Payment Verification",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    id: "pos",
    label: "Point of Sale",
    icon: CreditCard,
    description: "Sales Terminal",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    description: "Stock Management",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "user-management",
    label: "User Management",
    icon: Users,
    description: "Staff & Roles",
    gradient: "from-purple-500 to-violet-600",
  },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  userRole,
  notificationCount,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filter sidebar items based on user role
  const filteredItems = sidebarItems.filter((item) => {
    if (item.superAdminOnly && userRole !== "superadmin") {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 glass rounded-full hover-lift"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in-scale"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full border-r border-border bg-background z-50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                      alt="FAC Logo"
                      className="h-8 w-auto object-contain"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Fayeed Auto Care
                      </h2>
                      <Badge
                        className={`${
                          userRole === "superadmin"
                            ? "bg-red-500"
                            : "bg-fac-orange-500"
                        } text-white text-xs px-2 py-1`}
                      >
                        {userRole === "superadmin" ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            SUPER ADMIN
                          </>
                        ) : (
                          <>
                            <Crown className="h-3 w-3 mr-1" />
                            ADMIN
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <AdminNotificationDropdown />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex glass rounded-full hover-lift"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showNotification =
                item.id === "notifications" && notificationCount > 0;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start relative transition-colors rounded-lg p-3",
                    isActive
                      ? "bg-fac-orange-500 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    isCollapsed ? "px-2" : "px-3",
                  )}
                  onClick={() => {
                    if (item.id === "cms") {
                      navigate("/admin-cms");
                    } else if (item.id === "home-service") {
                      navigate("/admin-home-service");
                    } else if (item.id === "booking") {
                      navigate("/admin-booking-settings");
                    } else if (item.id === "push-notifications") {
                      navigate("/admin-push-notifications");
                    } else if (item.id === "gamification") {
                      navigate("/admin-gamification");
                    } else if (item.id === "subscription-approval") {
                      navigate("/admin-subscription-approval");
                    } else if (item.id === "pos") {
                      navigate("/pos");
                    } else if (item.id === "inventory") {
                      navigate("/inventory-management");
                    } else if (item.id === "user-management") {
                      navigate("/admin-user-management");
                    } else {
                      onTabChange(item.id);
                    }
                    setIsMobileOpen(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center w-full",
                      isCollapsed ? "justify-center" : "space-x-3",
                    )}
                  >
                    <div className="relative">
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-white" : "text-muted-foreground",
                        )}
                      />
                      {showNotification && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Badge>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                      </div>
                    )}

                    {showNotification && !isCollapsed && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="relative z-10 p-4 border-t border-border/30 space-y-3">
            {/* Theme Toggle */}
            <div className="animate-fade-in-up animate-delay-700">
              <ThemeToggle
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start glass rounded-2xl p-4 hover-lift transition-all duration-300",
                  isCollapsed ? "px-3" : "px-4",
                )}
                showText={!isCollapsed}
              />
            </div>

            {/* Logout Button */}
            <div className="border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full border-red-200 text-red-600 hover:bg-red-50",
                  isCollapsed ? "px-2" : "px-3",
                )}
                title={isCollapsed ? "Logout" : undefined}
              >
                <div
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "space-x-2",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">Logout</span>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
