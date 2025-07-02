import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
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
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    description: "User Management",
  },
  {
    id: "packages",
    label: "Packages",
    icon: Package,
    description: "Service Plans",
  },
  {
    id: "branches",
    label: "Branches",
    icon: MapPin,
    description: "Location Management",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Reports & Insights",
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    description: "Revenue Tracking",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "System Alerts",
  },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  userRole,
  notificationCount,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        className="lg:hidden fixed top-4 left-4 z-50 bg-white"
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
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-background border-r border-border z-50 transition-all duration-300 ease-in-out theme-transition",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border theme-transition">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                    alt="FAC Logo"
                    className="h-8 w-auto object-contain"
                  />
                  <div>
                    <h2 className="text-lg font-black text-black">FAC Admin</h2>
                    <Badge
                      className={`${
                        userRole === "superadmin"
                          ? "bg-red-500"
                          : "bg-fac-orange-500"
                      } text-white font-bold text-xs`}
                    >
                      {userRole === "superadmin" ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          SUPER
                        </>
                      ) : (
                        <>
                          <Settings className="h-3 w-3 mr-1" />
                          ADMIN
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showNotification =
                item.id === "notifications" && notificationCount > 0;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start relative transition-all duration-200",
                    isActive
                      ? "bg-fac-orange-500 text-white hover:bg-fac-orange-600"
                      : "text-gray-700 hover:bg-gray-100",
                    isCollapsed ? "px-2" : "px-3",
                  )}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileOpen(false);
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">
                        {item.description}
                      </div>
                    </div>
                  )}
                  {showNotification && (
                    <Badge className="bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
