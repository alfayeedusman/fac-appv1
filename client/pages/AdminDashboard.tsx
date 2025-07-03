import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Car,
  TrendingUp,
  DollarSign,
  Crown,
  Package,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MapPin,
  Shield,
  Smartphone,
  X,
  Check,
  Ban,
  UserCheck,
  UserX,
  LayoutDashboard,
  Bell,
  UserPlus,
  CreditCard,
  Clock,
  Sparkles,
  Zap,
  Star,
  Activity,
  CheckCircle,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import NotificationCenter from "@/components/NotificationCenter";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import BranchManagement from "@/components/BranchManagement";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import { formatDistanceToNow } from "date-fns";
import AdminAdManagement from "@/components/AdminAdManagement";
import UserRoleManagement from "@/components/UserRoleManagement";
import { createAd, getAds } from "@/utils/adsUtils";
import { initializeSampleAds } from "@/utils/initializeSampleAds";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  carUnit: string;
  plateNumber: string;
  membershipType: string;
  joinDate: string;
  totalWashes: number;
  totalSpent: number;
  status: "active" | "inactive" | "pending" | "banned";
  approvalStatus: "approved" | "pending" | "rejected" | "banned";
}

interface ServicePackage {
  id: string;
  name: string;
  basePrice: number;
  duration: string;
  features: string[];
  active: boolean;
}

interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  totalWashes: number;
  activeSubscriptions: number;
  monthlyGrowth: number;
  topPackage: string;
}

interface Notification {
  id: string;
  type:
    | "new_customer"
    | "subscription"
    | "approval_request"
    | "payment"
    | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  customerName?: string;
  amount?: number;
  actionRequired?: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeFilter, setTimeFilter] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 1247,
    totalRevenue: 156780,
    totalWashes: 3456,
    activeSubscriptions: 892,
    monthlyGrowth: 12.5,
    topPackage: "VIP Gold Ultimate",
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "approval_request",
      title: "New Customer Approval",
      message:
        "Ana Rodriguez is requesting account approval for VIP Silver membership.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      customerName: "Ana Rodriguez",
      actionRequired: true,
    },
    {
      id: "2",
      type: "new_customer",
      title: "New Registration",
      message:
        "Carlos Reyes has completed registration and is awaiting approval.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      customerName: "Carlos Reyes",
      actionRequired: true,
    },
    {
      id: "3",
      type: "subscription",
      title: "VIP Gold Subscription",
      message: "John Dela Cruz upgraded to VIP Gold membership.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      customerName: "John Dela Cruz",
      amount: 3000,
    },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "John Dela Cruz",
      email: "john@email.com",
      phone: "+63 912 345 6789",
      carUnit: "Toyota Vios 2020",
      plateNumber: "ABC 1234",
      membershipType: "VIP Gold",
      joinDate: "2024-01-15",
      totalWashes: 24,
      totalSpent: 12000,
      status: "active",
      approvalStatus: "approved",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "+63 918 765 4321",
      carUnit: "Honda Civic 2019",
      plateNumber: "XYZ 5678",
      membershipType: "VIP Silver",
      joinDate: "2024-02-01",
      totalWashes: 15,
      totalSpent: 7500,
      status: "active",
      approvalStatus: "approved",
    },
    {
      id: "3",
      name: "Ana Rodriguez",
      email: "ana@email.com",
      phone: "+63 920 123 4567",
      carUnit: "Ford EcoSport 2021",
      plateNumber: "DEF 9012",
      membershipType: "Classic",
      joinDate: "2024-03-10",
      totalWashes: 0,
      totalSpent: 0,
      status: "pending",
      approvalStatus: "pending",
    },
  ]);

  const [packages, setPackages] = useState<ServicePackage[]>([
    {
      id: "classic",
      name: "Classic Pro",
      basePrice: 500,
      duration: "Weekly",
      features: ["AI exterior wash", "Smart tire cleaning", "Basic protection"],
      active: true,
    },
    {
      id: "vip-silver",
      name: "VIP Silver Elite",
      basePrice: 1500,
      duration: "Monthly",
      features: [
        "Premium AI wash",
        "Interior deep clean",
        "Paint protection",
        "Priority booking",
      ],
      active: true,
    },
    {
      id: "vip-gold",
      name: "VIP Gold Ultimate",
      basePrice: 3000,
      duration: "Yearly",
      features: [
        "Unlimited AI washes",
        "VIP concierge service",
        "Premium detailing",
        "Exclusive lounge access",
        "Priority everything",
      ],
      active: true,
    },
  ]);

  // Modal states
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageModalMode, setPackageModalMode] = useState<"add" | "edit">(
    "add",
  );
  const [currentPackage, setCurrentPackage] = useState<ServicePackage | null>(
    null,
  );

  // Form states
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    carUnit: "",
    plateNumber: "",
    membershipType: "Classic",
  });

  const [newPackage, setNewPackage] = useState({
    name: "",
    basePrice: 0,
    duration: "Monthly",
    features: [] as string[],
    active: true,
  });

  const [editingFeatures, setEditingFeatures] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "admin" || role === "superadmin") {
      setUserRole(role);
      // Initialize sample ads for demonstration
      initializeSampleAds();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      const customer: Customer = {
        id: Date.now().toString(),
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        carUnit: newCustomer.carUnit,
        plateNumber: newCustomer.plateNumber,
        membershipType: newCustomer.membershipType,
        joinDate: new Date().toISOString().split("T")[0],
        totalWashes: 0,
        totalSpent: 0,
        status: "pending",
        approvalStatus: "pending",
      };

      setCustomers((prev) => [customer, ...prev]);

      // Add notification
      const notification: Notification = {
        id: Date.now().toString(),
        type: "new_customer",
        title: "New Customer Added",
        message: `${newCustomer.name} has been added and is awaiting approval.`,
        timestamp: new Date(),
        read: false,
        customerName: newCustomer.name,
        actionRequired: true,
      };
      setNotifications((prev) => [notification, ...prev]);

      setIsAddCustomerModalOpen(false);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        carUnit: "",
        plateNumber: "",
        membershipType: "Classic",
      });
      alert("Customer added successfully!");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  if (!userRole) return null;

  return (
    <div className="min-h-screen bg-background flex theme-transition relative overflow-hidden">
      <StickyHeader showBack={false} title="Admin Dashboard" />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-fac-orange-500/2 to-purple-500/2 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/2 to-fac-orange-500/2 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/3 to-pink-500/3 blur-xl animate-float animate-delay-300"></div>
      </div>

      {/* Modern Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        notificationCount={unreadNotificationCount}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen relative z-10">
        <div className="p-4 lg:p-8">
          {/* Modern Header */}
          <div className="mb-8 ml-12 lg:ml-0 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                  {activeTab === "overview" && (
                    <>
                      Admin{" "}
                      <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                        Command
                      </span>
                    </>
                  )}
                  {activeTab === "customers" && "Customer Hub"}
                  {activeTab === "packages" && "Package Studio"}
                  {activeTab === "branches" && "Branch Network"}
                  {activeTab === "analytics" && "Analytics Center"}
                  {activeTab === "sales" && "Revenue Dashboard"}
                  {activeTab === "notifications" && "Notification Center"}
                </h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">
                  {activeTab === "overview" &&
                    "Monitor your business performance in real-time"}
                  {activeTab === "customers" &&
                    "Manage customer accounts and approvals"}
                  {activeTab === "packages" &&
                    "Configure service packages and pricing"}
                  {activeTab === "branches" &&
                    "Oversee all branch locations and operations"}
                  {activeTab === "analytics" &&
                    "Detailed insights and performance reports"}
                  {activeTab === "sales" &&
                    "Track revenue and sales performance"}
                  {activeTab === "notifications" &&
                    "System alerts and customer notifications"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Modern Notification Dropdown */}
                <DropdownMenu
                  open={isNotificationDropdownOpen}
                  onOpenChange={setIsNotificationDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative glass rounded-full hover-lift"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotificationCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-6 w-6 rounded-full p-0 flex items-center justify-center animate-pulse-glow">
                          {unreadNotificationCount > 9
                            ? "9+"
                            : unreadNotificationCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-96 p-0 glass border-border shadow-2xl"
                  >
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-foreground text-lg">
                          Notifications
                        </h3>
                        <div className="flex items-center space-x-3">
                          {unreadNotificationCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm h-8 hover-lift"
                            >
                              Mark all read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveTab("notifications");
                              setIsNotificationDropdownOpen(false);
                            }}
                            className="text-sm h-8 hover-lift"
                          >
                            View all
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="h-96">
                      <div className="p-4">
                        {notifications.slice(0, 5).length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-base">No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-2xl border-l-4 mb-4 transition-all hover:bg-accent cursor-pointer ${
                                notification.type === "new_customer"
                                  ? "border-l-blue-500"
                                  : notification.type === "subscription"
                                    ? "border-l-green-500"
                                    : notification.type === "approval_request"
                                      ? "border-l-yellow-500"
                                      : notification.type === "payment"
                                        ? "border-l-green-500"
                                        : "border-l-purple-500"
                              } ${
                                notification.read
                                  ? "bg-muted opacity-75"
                                  : "bg-card"
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                  {notification.type === "new_customer" && (
                                    <UserPlus className="h-5 w-5 text-blue-500" />
                                  )}
                                  {notification.type === "subscription" && (
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                  )}
                                  {notification.type === "approval_request" && (
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="text-base font-bold text-foreground truncate">
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(
                                      notification.timestamp,
                                      {
                                        addSuffix: true,
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle variant="outline" className="glass rounded-full" />
                <Button
                  variant="outline"
                  className="glass rounded-full hover-lift"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Modern Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animate-delay-100">
                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("customers")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium mb-2">
                          Total Customers
                        </p>
                        <p className="text-4xl font-black text-foreground">
                          {stats.totalCustomers.toLocaleString()}
                        </p>
                      </div>
                      <div className="gradient-primary p-4 rounded-2xl animate-pulse-glow group-hover:scale-110 transition-transform">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("sales")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium mb-2">
                          Total Revenue
                        </p>
                        <p className="text-4xl font-black text-foreground">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                      <div className="gradient-secondary p-4 rounded-2xl animate-pulse-glow group-hover:scale-110 transition-transform">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("analytics")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium mb-2">
                          Total Washes
                        </p>
                        <p className="text-4xl font-black text-foreground">
                          {stats.totalWashes.toLocaleString()}
                        </p>
                      </div>
                      <div className="gradient-futuristic p-4 rounded-2xl animate-pulse-glow group-hover:scale-110 transition-transform">
                        <Car className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("packages")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium mb-2">
                          Active Subscriptions
                        </p>
                        <p className="text-4xl font-black text-foreground">
                          {stats.activeSubscriptions}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl animate-pulse-glow group-hover:scale-110 transition-transform">
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions with Modern Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animate-delay-200">
                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("packages")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center text-xl text-foreground">
                      <div className="gradient-primary p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform animate-pulse-glow">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      Package Studio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-base mb-6">
                      Create and manage premium service packages
                    </p>
                    <Button className="btn-futuristic w-full py-3 rounded-xl font-bold">
                      Manage Packages
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("analytics")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center text-xl text-foreground">
                      <div className="gradient-secondary p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform animate-pulse-glow">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      Analytics Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-base mb-6">
                      View detailed insights and performance metrics
                    </p>
                    <Button className="btn-futuristic w-full py-3 rounded-xl font-bold">
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveTab("branches")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center text-xl text-foreground">
                      <div className="gradient-futuristic p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform animate-pulse-glow">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      Branch Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-base mb-6">
                      Manage locations and branch operations
                    </p>
                    <Button className="btn-futuristic w-full py-3 rounded-xl font-bold">
                      View Branches
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <Card className="glass border-border shadow-2xl animate-fade-in-scale">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="gradient-primary p-3 rounded-xl mr-4 animate-pulse-glow">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-foreground">
                      Customer Management
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="btn-futuristic font-bold w-full sm:w-auto py-3 px-6 rounded-xl"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Customer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {customers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className={`glass rounded-2xl p-6 hover-lift transition-all duration-300 animate-fade-in-up`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-foreground text-lg truncate">
                                {customer.name}
                              </h3>
                              <p className="text-sm text-muted-foreground font-medium truncate">
                                {customer.email} • {customer.phone}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {customer.carUnit} • {customer.plateNumber}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                className={`${
                                  customer.membershipType === "VIP Gold"
                                    ? "bg-gradient-to-r from-yellow-500 to-fac-orange-500"
                                    : customer.membershipType === "VIP Silver"
                                      ? "bg-gradient-to-r from-gray-400 to-gray-600"
                                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                } text-white font-bold px-4 py-2 rounded-full`}
                              >
                                {customer.membershipType}
                              </Badge>
                              <Badge
                                className={`${
                                  customer.approvalStatus === "approved"
                                    ? "bg-green-500"
                                    : customer.approvalStatus === "pending"
                                      ? "bg-yellow-500"
                                      : customer.approvalStatus === "banned"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                } text-white font-bold px-4 py-2 rounded-full`}
                              >
                                {customer.approvalStatus.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-base font-bold text-foreground">
                              {customer.totalWashes} washes
                            </p>
                            <p className="text-base text-green-600 font-bold">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              title="Edit Customer"
                              className="glass hover-lift"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {customer.approvalStatus === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-300 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 hover-lift"
                                  title="Approve User"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 hover-lift"
                                  title="Reject User"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "packages" && (
            <div className="space-y-8 animate-fade-in-scale">
              {/* Package Management Header */}
              <Card className="glass border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="gradient-primary p-3 rounded-xl animate-pulse-glow">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-foreground">
                          Package Studio
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-4 text-sm border-fac-orange-500 text-fac-orange-500"
                        >
                          Role: {userRole} | Editing:{" "}
                          {userRole === "superadmin" || userRole === "admin"
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                    {(userRole === "superadmin" || userRole === "admin") && (
                      <Button className="btn-futuristic font-bold py-3 px-6 rounded-xl">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Package
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Package Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <Card
                    key={pkg.id}
                    className={`glass border-border shadow-2xl hover-lift transition-all duration-300 relative overflow-hidden animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xl font-black text-foreground">
                          {pkg.name}
                        </span>
                        <Badge
                          className={`${
                            pkg.active
                              ? "bg-green-500 animate-pulse-glow"
                              : "bg-gray-400"
                          } text-white font-bold px-3 py-1 rounded-full`}
                        >
                          {pkg.active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-6">
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <p className="text-3xl font-black text-fac-orange-500">
                            {formatCurrency(pkg.basePrice)}
                          </p>
                          {(userRole === "superadmin" ||
                            userRole === "admin") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass hover-lift font-bold"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>

                        {/* Duration */}
                        <div className="glass rounded-lg p-4">
                          <p className="text-sm text-muted-foreground font-medium">
                            <strong>Billing Cycle:</strong> {pkg.duration}
                          </p>
                        </div>

                        {/* Features */}
                        <div>
                          <p className="text-base font-bold text-foreground mb-4">
                            Features:
                          </p>
                          <div className="space-y-2">
                            {pkg.features.map((feature, featureIndex) => (
                              <p
                                key={featureIndex}
                                className="text-sm text-muted-foreground font-medium flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                {feature}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        {(userRole === "superadmin" ||
                          userRole === "admin") && (
                          <div className="flex space-x-3 pt-4 border-t border-border">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 glass hover-lift"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 hover-lift"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "branches" && <BranchManagement userRole={userRole} />}

          {activeTab === "analytics" && (
            <AnalyticsCharts
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          )}

          {activeTab === "sales" && (
            <div className="space-y-8 animate-fade-in-scale">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass border-border shadow-xl hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-4xl font-black text-foreground mb-2">
                      {formatCurrency(156780)}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground">
                      Monthly Revenue
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-border shadow-xl hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-4xl font-black text-foreground mb-2">
                      +{stats.monthlyGrowth}%
                    </p>
                    <p className="text-sm font-bold text-muted-foreground">
                      Growth Rate
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-border shadow-xl hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="gradient-futuristic w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-xl font-black text-foreground mb-2">
                      {stats.topPackage}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground">
                      Top Package
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sales Analytics Chart */}
              <AnalyticsCharts
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
              />
            </div>
          )}

          {activeTab === "notifications" && (
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onApproveCustomer={() => {}}
              onRejectCustomer={() => {}}
            />
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog
        open={isAddCustomerModalOpen}
        onOpenChange={setIsAddCustomerModalOpen}
      >
        <DialogContent className="max-w-lg glass border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">
              Add New Customer
            </DialogTitle>
            <DialogDescription>
              Add a new customer to the system. They will need approval to
              access services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName" className="font-bold">
                  Full Name *
                </Label>
                <Input
                  id="customerName"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="e.g., John Dela Cruz"
                  className="mt-2 glass border-border rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail" className="font-bold">
                  Email *
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="e.g., john@email.com"
                  className="mt-2 glass border-border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone" className="font-bold">
                  Phone Number *
                </Label>
                <Input
                  id="customerPhone"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="e.g., +63 912 345 6789"
                  className="mt-2 glass border-border rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="customerMembership" className="font-bold">
                  Membership Type
                </Label>
                <Select
                  value={newCustomer.membershipType}
                  onValueChange={(value) =>
                    setNewCustomer({ ...newCustomer, membershipType: value })
                  }
                >
                  <SelectTrigger className="mt-2 glass border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="VIP Silver">VIP Silver</SelectItem>
                    <SelectItem value="VIP Gold">VIP Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerCar" className="font-bold">
                  Car Unit
                </Label>
                <Input
                  id="customerCar"
                  value={newCustomer.carUnit}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, carUnit: e.target.value })
                  }
                  placeholder="e.g., Toyota Vios 2020"
                  className="mt-2 glass border-border rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="customerPlate" className="font-bold">
                  Plate Number
                </Label>
                <Input
                  id="customerPlate"
                  value={newCustomer.plateNumber}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      plateNumber: e.target.value,
                    })
                  }
                  placeholder="e.g., ABC 1234"
                  className="mt-2 glass border-border rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCustomerModalOpen(false)}
              className="glass"
            >
              Cancel
            </Button>
            <Button
              className="btn-futuristic font-bold"
              onClick={handleAddCustomer}
              disabled={
                !newCustomer.name || !newCustomer.email || !newCustomer.phone
              }
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
