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
  Printer,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ErrorBoundary from "@/components/ErrorBoundary";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import BranchManagement from "@/components/BranchManagement";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import { formatDistanceToNow } from "date-fns";
import AdminAdManagement from "@/components/AdminAdManagement";
import UserRoleManagement from "@/components/UserRoleManagement";
import SalesDashboard from "@/components/SalesDashboard";
import InventoryDashboard from "@/components/InventoryDashboard";
import EnhancedBookingManagement from "@/components/EnhancedBookingManagement";
import ImageUploadManager from "@/components/ImageUploadManager";
import NotificationService from "@/components/NotificationService";
import { createAd, getAds } from "@/utils/adsUtils";
import { initializeSampleAds } from "@/utils/initializeSampleAds";
import {
  getUserSystemNotifications,
  markSystemNotificationAsRead,
  getAllBookings,
  type SystemNotification
} from "@/utils/databaseSchema";

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
  durationType?: "preset" | "hours" | "custom";
  hours?: number;
  startDate?: string;
  endDate?: string;
  banner?: string;
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
    vehicleType: "car",
    motorcycleType: "",
  });

  const [newPackage, setNewPackage] = useState({
    name: "",
    basePrice: 0,
    duration: "Monthly",
    durationType: "preset" as "preset" | "hours" | "custom",
    hours: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    banner: undefined as string | undefined,
    features: [] as string[],
    active: true,
  });

  const [editingFeatures, setEditingFeatures] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");

    if (role === "admin" || role === "superadmin") {
      setUserRole(role);
      // Initialize sample ads for demonstration
      initializeSampleAds();

      // Load system notifications
      loadSystemNotifications();

      // Set up polling for new notifications every 10 seconds
      const notificationInterval = setInterval(loadSystemNotifications, 10000);

      return () => clearInterval(notificationInterval);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadSystemNotifications = () => {
    try {
      const userRole = localStorage.getItem("userRole") as "admin" | "superadmin";
      const userEmail = localStorage.getItem("userEmail") || "";

      if (userRole && userEmail) {
        const systemNotifications = getUserSystemNotifications(userEmail, userRole);

        // Convert system notifications to the format expected by the UI
        const formattedNotifications = systemNotifications.map((notification: SystemNotification) => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.createdAt),
          read: notification.readBy.some(r => r.userId === userEmail),
          priority: notification.priority,
          data: notification.data,
          actionRequired: notification.type === 'new_booking',
        }));

        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error loading system notifications:', error);
    }
  };

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
        vehicleType: "car",
        motorcycleType: "",
      });
      alert("Customer added successfully!");
    }
  };

  // Package management handlers
  const handleAddPackage = () => {
    setPackageModalMode("add");
    setCurrentPackage(null);
    setNewPackage({
      name: "",
      basePrice: 0,
      duration: "Monthly",
      features: [],
      active: true,
    });
    setEditingFeatures("");
    setIsPackageModalOpen(true);
  };

  const handleEditPackage = (pkg: ServicePackage) => {
    setPackageModalMode("edit");
    setCurrentPackage(pkg);
    setNewPackage({
      name: pkg.name,
      basePrice: pkg.basePrice,
      duration: pkg.duration,
      features: pkg.features,
      active: pkg.active,
    });
    setEditingFeatures(pkg.features.join("\n"));
    setIsPackageModalOpen(true);
  };

  const handleDeletePackage = (pkg: ServicePackage) => {
    if (confirm(`Are you sure you want to delete ${pkg.name}?`)) {
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      alert("Package deleted successfully!");
    }
  };

  const handleSavePackage = () => {
    if (!newPackage.name || newPackage.basePrice <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    const features = editingFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (packageModalMode === "add") {
      const pkg: ServicePackage = {
        id: Date.now().toString(),
        name: newPackage.name,
        basePrice: newPackage.basePrice,
        duration: newPackage.duration,
        features,
        active: newPackage.active,
      };
      setPackages((prev) => [...prev, pkg]);
      alert("Package created successfully!");
    } else if (currentPackage) {
      const updatedPackage: ServicePackage = {
        ...currentPackage,
        name: newPackage.name,
        basePrice: newPackage.basePrice,
        duration: newPackage.duration,
        features,
        active: newPackage.active,
      };
      setPackages((prev) =>
        prev.map((p) => (p.id === currentPackage.id ? updatedPackage : p)),
      );
      alert("Package updated successfully!");
    }

    setIsPackageModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleApproveCustomer = (notificationId: string) => {
    // Find the notification and extract customer info
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    // Update customer status to approved
    const updatedCustomers = customers.map((customer) => {
      // Extract customer ID from notification message or use a different approach
      if (notification.message.includes(customer.name)) {
        return {
          ...customer,
          approvalStatus: "approved" as const,
          status: "active" as const,
        };
      }
      return customer;
    });
    setCustomers(updatedCustomers);

    // Mark notification as processed and read
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId
        ? {
            ...n,
            read: true,
            title: n.title.replace("New", "Approved"),
            message: n.message.replace("approval", "approved"),
          }
        : n,
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(
      "admin_notifications",
      JSON.stringify(updatedNotifications),
    );

    alert(`Customer approved successfully!`);
  };

  const handleRejectCustomer = (notificationId: string) => {
    // Find the notification and extract customer info
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return;

    // Update customer status to rejected
    const updatedCustomers = customers.map((customer) => {
      if (notification.message.includes(customer.name)) {
        return {
          ...customer,
          approvalStatus: "rejected" as const,
          status: "inactive" as const,
        };
      }
      return customer;
    });
    setCustomers(updatedCustomers);

    // Mark notification as processed and read
    const updatedNotifications = notifications.map((n) =>
      n.id === notificationId
        ? {
            ...n,
            read: true,
            title: n.title.replace("New", "Rejected"),
            message: n.message.replace("approval", "rejected"),
          }
        : n,
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(
      "admin_notifications",
      JSON.stringify(updatedNotifications),
    );

    alert(`Customer registration rejected.`);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  if (!userRole) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <StickyHeader showBack={false} title="Admin Dashboard" />

      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        notificationCount={unreadNotificationCount}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 ml-12 lg:ml-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {activeTab === "overview" && "Admin Dashboard"}
                  {activeTab === "customers" && "Customer Management"}
                  {activeTab === "roles" && "User & Role Management"}
                  {activeTab === "ads" && "Advertisement Management"}
                  {activeTab === "packages" && "Package Management"}
                  {activeTab === "branches" && "Branch Management"}
                  {activeTab === "analytics" && "Analytics"}
                  {activeTab === "sales" && "Sales Dashboard"}
                  {activeTab === "inventory" && "Inventory Dashboard"}
                  {activeTab === "notifications" && "Notifications"}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {activeTab === "overview" &&
                    "Monitor your business performance"}
                  {activeTab === "customers" &&
                    "Manage customer accounts and approvals"}
                  {activeTab === "roles" && "Manage user roles and permissions"}
                  {activeTab === "ads" && "Create and manage advertisements"}
                  {activeTab === "packages" && "Configure service packages"}
                  {activeTab === "branches" && "Manage branch locations"}
                  {activeTab === "analytics" && "View performance insights"}
                  {activeTab === "sales" && "Monitor POS sales performance"}
                  {activeTab === "inventory" &&
                    "Track stock levels and inventory value"}
                  {activeTab === "notifications" && "System alerts"}
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Notification Dropdown */}
                <DropdownMenu
                  open={isNotificationDropdownOpen}
                  onOpenChange={setIsNotificationDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadNotificationCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {unreadNotificationCount > 9
                            ? "9+"
                            : unreadNotificationCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
                    <div className="p-6 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground">
                          Notifications
                        </h3>
                        <div className="flex items-center space-x-2">
                          {unreadNotificationCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                const userEmail = localStorage.getItem("userEmail") || "";
                                // Mark all unread notifications as read
                                notifications.forEach(notification => {
                                  if (!notification.read) {
                                    markSystemNotificationAsRead(notification.id, userEmail);
                                  }
                                });
                                loadSystemNotifications(); // Refresh notifications
                              }}
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
                            className="text-xs h-7"
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
                              onClick={() => {
                                if (!notification.read) {
                                  const userEmail = localStorage.getItem("userEmail") || "";
                                  markSystemNotificationAsRead(notification.id, userEmail);
                                  loadSystemNotifications(); // Refresh notifications

                                  // If it's a booking notification, navigate to bookings tab
                                  if (notification.type === 'new_booking') {
                                    setActiveTab('bookings');
                                    setIsNotificationDropdownOpen(false);
                                  }
                                }
                              }}
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 mt-1">
                                  {notification.type === "new_booking" && (
                                    <Calendar className="h-5 w-5 text-fac-orange-500" />
                                  )}
                                  {notification.type === "new_customer" && (
                                    <UserPlus className="h-5 w-5 text-blue-500" />
                                  )}
                                  {notification.type === "subscription" && (
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                  )}
                                  {notification.type === "approval_request" && (
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                  )}
                                  {notification.type === "status_update" && (
                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                  )}
                                  {notification.type === "crew_update" && (
                                    <Wrench className="h-5 w-5 text-purple-500" />
                                  )}
                                  {notification.type === "payment_received" && (
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                  )}
                                  {notification.type === "system_alert" && (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                  )}
                                  {notification.type === "payment" && (
                                    <DollarSign className="h-5 w-5 text-green-500" />
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
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(
                                        notification.timestamp,
                                        {
                                          addSuffix: true,
                                        },
                                      )}
                                    </span>
                                    {(notification.type === "new_customer" ||
                                      notification.type ===
                                        "approval_request") && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 h-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApproveCustomer(
                                              notification.id,
                                            );
                                          }}
                                        >
                                          <UserCheck className="h-3 w-3 mr-1" />
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="text-xs px-2 py-1 h-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRejectCustomer(
                                              notification.id,
                                            );
                                          }}
                                        >
                                          <UserX className="h-3 w-3 mr-1" />
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={() => navigate("/pos-kiosk")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                  size="sm"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">POS Kiosk</span>
                </Button>
                <Button
                  onClick={() => navigate("/admin-receipt-designer")}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold"
                  size="sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Receipt Designer</span>
                </Button>
                <ThemeToggle />
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("customers")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Total Customers
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stats.totalCustomers.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-fac-orange-500 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("sales")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Total Revenue
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                      <div className="bg-green-500 p-3 rounded-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("analytics")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Total Washes
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stats.totalWashes.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("packages")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Active Subscriptions
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stats.activeSubscriptions}
                        </p>
                      </div>
                      <div className="bg-purple-500 p-3 rounded-lg">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userRole === "superadmin" && (
                  <Card
                    className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                    onClick={() => setActiveTab("roles")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center text-xl text-foreground">
                        <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform animate-pulse-glow">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        Role Manager
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-muted-foreground text-base mb-6">
                        Manage user roles and permissions
                      </p>
                      <Button className="btn-futuristic w-full py-3 rounded-xl font-bold">
                        Manage Roles
                      </Button>
                    </CardContent>
                  </Card>
                )}

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
                  onClick={() => setActiveTab("ads")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center text-xl text-foreground">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform animate-pulse-glow">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      Ad Studio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-base mb-6">
                      Create and manage promotional advertisements
                    </p>
                    <Button className="btn-futuristic w-full py-3 rounded-xl font-bold">
                      Manage Ads
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
                      <Button
                        onClick={handleAddPackage}
                        className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 px-6 rounded-xl"
                      >
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
                              onClick={() => handleEditPackage(pkg)}
                              className="border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50 font-bold"
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
                              onClick={() => handleEditPackage(pkg)}
                              className="flex-1 border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePackage(pkg)}
                              className="text-red-600 border-red-500 hover:bg-red-50"
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

          {activeTab === "sales" && <SalesDashboard />}

          {activeTab === "inventory" && <InventoryDashboard />}

          {activeTab === "old_sales" && (
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

          {activeTab === "roles" && userRole === "superadmin" && (
            <div className="animate-fade-in-scale">
              <ErrorBoundary>
                <UserRoleManagement />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === "ads" && (
            <div className="animate-fade-in-scale">
              <AdminAdManagement
                adminEmail={localStorage.getItem("userEmail") || ""}
              />
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="animate-fade-in-scale">
              <EnhancedBookingManagement
                userRole={userRole as "admin" | "superadmin"}
                showCrewAssignment={true}
              />
            </div>
          )}

          {activeTab === "images" && (
            <div className="animate-fade-in-scale">
              <ImageUploadManager
                allowedTypes={['before', 'after', 'receipt', 'damage', 'other']}
                maxFileSize={10}
                currentUser={{
                  id: localStorage.getItem('userEmail'),
                  email: localStorage.getItem('userEmail'),
                  role: userRole
                }}
              />
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="animate-fade-in-scale">
              <NotificationService
                userRole={userRole}
                userId={localStorage.getItem('userEmail') || 'unknown'}
                onNotificationReceived={(notification) => {
                  console.log('New notification received:', notification);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog
        open={isAddCustomerModalOpen}
        onOpenChange={setIsAddCustomerModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Add New Customer
            </DialogTitle>
            <DialogDescription>
              Add a new customer to the system. They will need approval to
              access services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="e.g., John Dela Cruz"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  placeholder="e.g., john@email.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="e.g., +63 912 345 6789"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerMembership">Membership Type</Label>
                <Select
                  value={newCustomer.membershipType}
                  onValueChange={(value) =>
                    setNewCustomer({ ...newCustomer, membershipType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="VIP Silver">VIP Silver</SelectItem>
                    <SelectItem value="VIP Gold">VIP Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={newCustomer.vehicleType}
                  onValueChange={(value) =>
                    setNewCustomer({
                      ...newCustomer,
                      vehicleType: value,
                      motorcycleType:
                        value === "car" ? "" : newCustomer.motorcycleType,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newCustomer.vehicleType === "motorcycle" && (
                <div>
                  <Label htmlFor="motorcycleType">Motorcycle Type</Label>
                  <Select
                    value={newCustomer.motorcycleType}
                    onValueChange={(value) =>
                      setNewCustomer({ ...newCustomer, motorcycleType: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Bike</SelectItem>
                      <SelectItem value="medium">Medium Bike</SelectItem>
                      <SelectItem value="bigbike">Big Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerCar">
                  {newCustomer.vehicleType === "motorcycle"
                    ? "Motorcycle Model"
                    : "Car Unit"}
                </Label>
                <Input
                  id="customerCar"
                  value={newCustomer.carUnit}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, carUnit: e.target.value })
                  }
                  placeholder={
                    newCustomer.vehicleType === "motorcycle"
                      ? "e.g., Honda Click 150"
                      : "e.g., Toyota Vios 2020"
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerPlate">Plate Number</Label>
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
                  className="mt-1"
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

      {/* Package Modal */}
      <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {packageModalMode === "add"
                ? "Create New Package"
                : "Edit Package"}
            </DialogTitle>
            <DialogDescription>
              {packageModalMode === "add"
                ? "Create a new service package with custom features and pricing."
                : "Update the selected package details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="packageName">Package Name *</Label>
              <Input
                id="packageName"
                value={newPackage.name}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, name: e.target.value })
                }
                placeholder="e.g., Premium Wash Package"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="packageBanner">Package Banner/Photo</Label>
              <div className="mt-2 space-y-2">
                <Input
                  id="packageBanner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewPackage({
                          ...newPackage,
                          banner: event.target?.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="mt-2"
                />
                {newPackage.banner && (
                  <div className="relative">
                    <img
                      src={newPackage.banner}
                      alt="Package banner"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setNewPackage({ ...newPackage, banner: undefined })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packagePrice">Base Price (₱) *</Label>
                <Input
                  id="packagePrice"
                  type="number"
                  value={newPackage.basePrice}
                  onChange={(e) =>
                    setNewPackage({
                      ...newPackage,
                      basePrice: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="packageDuration">Duration Type</Label>
                <Select
                  value={newPackage.durationType || "preset"}
                  onValueChange={(value) =>
                    setNewPackage({
                      ...newPackage,
                      durationType: value as "preset" | "hours" | "custom",
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset">Preset Duration</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(!newPackage.durationType ||
                newPackage.durationType === "preset") && (
                <div>
                  <Label htmlFor="packageDurationValue">Billing Cycle</Label>
                  <Select
                    value={newPackage.duration}
                    onValueChange={(value) =>
                      setNewPackage({ ...newPackage, duration: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newPackage.durationType === "hours" && (
                <div>
                  <Label htmlFor="packageHours">Duration (Hours)</Label>
                  <Input
                    id="packageHours"
                    type="number"
                    min="1"
                    max="8760"
                    value={newPackage.hours || ""}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        hours: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="e.g., 24 for 24 hours"
                    className="mt-2"
                  />
                </div>
              )}

              {newPackage.durationType === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="packageStartDate">Start Date</Label>
                    <Input
                      id="packageStartDate"
                      type="datetime-local"
                      value={newPackage.startDate || ""}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          startDate: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packageEndDate">End Date</Label>
                    <Input
                      id="packageEndDate"
                      type="datetime-local"
                      value={newPackage.endDate || ""}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          endDate: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="packageFeatures">Features (one per line)</Label>
              <Textarea
                id="packageFeatures"
                value={editingFeatures}
                onChange={(e) => setEditingFeatures(e.target.value)}
                placeholder="Professional exterior wash&#10;Interior cleaning&#10;Tire protection&#10;..."
                rows={5}
                className="mt-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="packageActive"
                checked={newPackage.active}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, active: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="packageActive">Active Package</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPackageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePackage}
              className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
            >
              {packageModalMode === "add" ? "Create Package" : "Update Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
