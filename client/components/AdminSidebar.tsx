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
  Sparkles,
  Crown,
  Zap,
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
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  userRole,
  notificationCount,
}: AdminSidebarProps) {
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
          "fixed left-0 top-0 h-full glass border-r border-border/50 z-50 transition-all duration-500 ease-out backdrop-blur-2xl",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Futuristic background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/5 via-transparent to-purple-500/5"></div>

          {/* Header */}
          <div className="relative z-10 p-6 border-b border-border/30">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-4 animate-fade-in-up">
                  <div className="relative">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                      alt="FAC Logo"
                      className="h-10 w-auto object-contain animate-pulse-glow"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">
                      FAC{" "}
                      <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                        2025
                      </span>
                    </h2>
                    <Badge
                      className={`${
                        userRole === "superadmin"
                          ? "bg-gradient-to-r from-red-500 to-pink-500"
                          : "bg-gradient-to-r from-fac-orange-500 to-purple-600"
                      } text-white font-bold text-xs px-3 py-1 animate-pulse-glow`}
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
          <div className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showNotification =
                item.id === "notifications" && notificationCount > 0;

              return (
                <div
                  key={item.id}
                  className={`animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start relative transition-all duration-300 rounded-2xl p-4 group hover-lift",
                      isActive
                        ? "glass bg-gradient-to-r from-fac-orange-500/20 to-purple-600/20 border border-fac-orange-500/30 text-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      isCollapsed ? "px-3" : "px-4",
                    )}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileOpen(false);
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-fac-orange-500 to-purple-600 rounded-r-full animate-pulse-glow"></div>
                    )}

                    <div
                      className={cn(
                        "flex items-center w-full",
                        isCollapsed ? "justify-center" : "space-x-4",
                      )}
                    >
                      <div
                        className={cn(
                          "relative p-2 rounded-xl transition-all duration-300",
                          isActive
                            ? `bg-gradient-to-r ${item.gradient} animate-pulse-glow`
                            : "bg-muted/50 group-hover:bg-muted",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-transform duration-300",
                            isActive
                              ? "text-white scale-110"
                              : "text-muted-foreground group-hover:text-foreground group-hover:scale-105",
                          )}
                        />
                      </div>

                      {!isCollapsed && (
                        <div className="flex-1 text-left">
                          <div className="font-bold text-sm">{item.label}</div>
                          <div className="text-xs opacity-75 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      )}

                      {showNotification && (
                        <Badge className="bg-red-500 text-white text-xs h-6 w-6 rounded-full p-0 flex items-center justify-center animate-pulse-glow ml-auto">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Badge>
                      )}
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-fac-orange-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </Button>
                </div>
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
            <div className="animate-fade-in-up animate-delay-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full glass border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 rounded-2xl p-4 hover-lift transition-all duration-300 group",
                  isCollapsed ? "px-3" : "px-4",
                )}
                title={isCollapsed ? "Logout" : undefined}
              >
                <div
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "space-x-4",
                  )}
                >
                  <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  {!isCollapsed && (
                    <span className="font-bold text-sm">Logout</span>
                  )}
                </div>
              </Button>
            </div>

            {/* Version Info */}
            {!isCollapsed && (
              <div className="text-center animate-fade-in-up animate-delay-900">
                <div className="glass rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    FAC Admin v2025.1
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Powered by AI
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
