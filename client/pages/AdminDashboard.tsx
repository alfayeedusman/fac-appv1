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
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import NotificationCenter from "@/components/NotificationCenter";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import BranchManagement from "@/components/BranchManagement";
import { formatDistanceToNow } from "date-fns";

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
    topPackage: "VIP Gold",
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
    {
      id: "4",
      type: "payment",
      title: "Payment Received",
      message: "Monthly subscription payment received from Maria Santos.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
      customerName: "Maria Santos",
      amount: 1500,
    },
    {
      id: "5",
      type: "system",
      title: "Branch Update",
      message: "Tumaga branch has achieved 95% customer satisfaction rating.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
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
    {
      id: "4",
      name: "Carlos Reyes",
      email: "carlos@email.com",
      phone: "+63 917 987 6543",
      carUnit: "Mitsubishi Montero 2018",
      plateNumber: "GHI 3456",
      membershipType: "VIP Silver",
      joinDate: "2024-02-20",
      totalWashes: 8,
      totalSpent: 4000,
      status: "banned",
      approvalStatus: "banned",
    },
  ]);

  const [packages, setPackages] = useState<ServicePackage[]>([
    {
      id: "classic",
      name: "Classic",
      basePrice: 500,
      duration: "Weekly",
      features: ["Basic exterior wash", "Tire cleaning", "Basic dry"],
      active: true,
    },
    {
      id: "vip-silver",
      name: "VIP Silver",
      basePrice: 1500,
      duration: "Monthly",
      features: [
        "Premium exterior wash",
        "Interior vacuum",
        "Tire shine",
        "Dashboard clean",
      ],
      active: true,
    },
    {
      id: "vip-gold",
      name: "VIP Gold",
      basePrice: 3000,
      duration: "Yearly",
      features: [
        "Complete exterior detail",
        "Full interior clean",
        "Wax application",
        "Leather conditioning",
        "Engine bay clean",
      ],
      active: true,
    },
  ]);

  // Notification dropdown state
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);

  // Customer management state
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    carUnit: "",
    plateNumber: "",
    membershipType: "Classic",
  });

  // Package management state
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageModalMode, setPackageModalMode] = useState<"add" | "edit">(
    "add",
  );
  const [currentPackage, setCurrentPackage] = useState<ServicePackage | null>(
    null,
  );
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({
    name: "",
    basePrice: 0,
    duration: "Monthly",
    features: [],
    active: true,
  });
  const [editingFeatures, setEditingFeatures] = useState<string>("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin" && role !== "superadmin") {
      navigate("/login");
      return;
    }
    setUserRole(role || "");
  }, [navigate]);

  const handleApproveUser = (userId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === userId
          ? { ...customer, status: "active", approvalStatus: "approved" }
          : customer,
      ),
    );
    const approvedCustomer = customers.find((c) => c.id === userId);
    if (approvedCustomer) {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: "system",
          title: "Customer Approved",
          message: `${approvedCustomer.name} has been approved and activated.`,
          timestamp: new Date(),
          read: false,
        },
        ...prev,
      ]);
    }
    alert("User approved successfully!");
  };

  const handleRejectUser = (userId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === userId
          ? { ...customer, status: "inactive", approvalStatus: "rejected" }
          : customer,
      ),
    );
    alert("User rejected successfully!");
  };

  const handleBanUser = (userId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === userId
          ? { ...customer, status: "banned", approvalStatus: "banned" }
          : customer,
      ),
    );
    alert("User banned successfully!");
  };

  const handleUnbanUser = (userId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === userId
          ? { ...customer, status: "active", approvalStatus: "approved" }
          : customer,
      ),
    );
    alert("User unbanned successfully!");
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  // Customer management handlers
  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      const id = Date.now().toString();
      const customer: Customer = {
        id,
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
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        carUnit: "",
        plateNumber: "",
        membershipType: "Classic",
      });
      setIsAddCustomerModalOpen(false);

      // Add notification for new customer
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: "new_customer",
          title: "New Customer Added",
          message: `${customer.name} has been added and is awaiting approval.`,
          timestamp: new Date(),
          read: false,
          customerName: customer.name,
          actionRequired: true,
        },
        ...prev,
      ]);

      alert("Customer added successfully!");
    }
  };

  // Package management handlers
  const handleOpenPackageModal = (
    mode: "add" | "edit",
    pkg?: ServicePackage,
  ) => {
    setPackageModalMode(mode);
    if (mode === "edit" && pkg) {
      setCurrentPackage(pkg);
      setNewPackage({
        name: pkg.name,
        basePrice: pkg.basePrice,
        duration: pkg.duration,
        features: pkg.features,
        active: pkg.active,
      });
      setEditingFeatures(pkg.features.join("\n"));
    } else {
      setCurrentPackage(null);
      setNewPackage({
        name: "",
        basePrice: 0,
        duration: "Monthly",
        features: [],
        active: true,
      });
      setEditingFeatures("");
    }
    setIsPackageModalOpen(true);
  };

  const handleSavePackageModal = () => {
    if (packageModalMode === "edit" && currentPackage) {
      // Update existing package
      const updatedPackage = {
        ...currentPackage,
        name: newPackage.name!,
        basePrice: newPackage.basePrice!,
        duration: newPackage.duration!,
        features: editingFeatures.split("\n").filter((f) => f.trim() !== ""),
        active: newPackage.active!,
      };
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === currentPackage.id ? updatedPackage : pkg,
        ),
      );
      alert("Package updated successfully!");
    } else {
      // Add new package
      if (newPackage.name && newPackage.basePrice) {
        const id = newPackage.name.toLowerCase().replace(/\s+/g, "-");
        const features = editingFeatures
          .split("\n")
          .filter((f) => f.trim() !== "");
        setPackages((prev) => [
          ...prev,
          {
            id,
            name: newPackage.name!,
            basePrice: newPackage.basePrice!,
            duration: newPackage.duration || "Monthly",
            features,
            active: true,
          },
        ]);
        alert("Package added successfully!");
      }
    }
    setIsPackageModalOpen(false);
    setCurrentPackage(null);
    setNewPackage({
      name: "",
      basePrice: 0,
      duration: "Monthly",
      features: [],
      active: true,
    });
    setEditingFeatures("");
  };

  const handleDeletePackage = (id: string) => {
    const packageToDelete = packages.find((pkg) => pkg.id === id);
    if (
      packageToDelete &&
      confirm(
        `Are you sure you want to delete the "${packageToDelete.name}" package? This action cannot be undone.`,
      )
    ) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      alert("Package deleted successfully!");
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        notificationCount={unreadNotificationCount}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 ml-12 lg:ml-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-black tracking-tight">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "customers" && "Customer Management"}
                  {activeTab === "packages" && "Package Management"}
                  {activeTab === "branches" && "Branch Management"}
                  {activeTab === "analytics" && "Analytics & Reports"}
                  {activeTab === "sales" && "Sales Dashboard"}
                  {activeTab === "notifications" && "Notification Center"}
                </h1>
                <p className="text-gray-600 font-medium mt-1">
                  {activeTab === "overview" &&
                    "Monitor your business performance and key metrics"}
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
              <div className="flex items-center space-x-3">
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
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-black">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadNotificationCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleMarkAllNotificationsAsRead}
                              className="text-xs h-6"
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
                            className="text-xs h-6"
                          >
                            View all
                          </Button>
                        </div>
                      </div>
                    </div>
                    <ScrollArea className="h-80">
                      <div className="p-2">
                        {notifications.slice(0, 5).length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg border-l-4 mb-2 transition-all hover:bg-gray-50 cursor-pointer ${
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
                                  ? "bg-gray-50 opacity-75"
                                  : "bg-white"
                              }`}
                              onClick={() => {
                                if (!notification.read) {
                                  handleMarkNotificationAsRead(notification.id);
                                }
                                if (
                                  notification.type === "approval_request" ||
                                  notification.type === "new_customer"
                                ) {
                                  setActiveTab("customers");
                                  setIsNotificationDropdownOpen(false);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-2">
                                <div className="flex-shrink-0 mt-1">
                                  {notification.type === "new_customer" && (
                                    <UserPlus className="h-4 w-4 text-blue-500" />
                                  )}
                                  {notification.type === "subscription" && (
                                    <CreditCard className="h-4 w-4 text-green-500" />
                                  )}
                                  {notification.type === "approval_request" && (
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                  )}
                                  {notification.type === "payment" && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                  {notification.type === "system" && (
                                    <Settings className="h-4 w-4 text-purple-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="text-sm font-bold text-black truncate">
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-gray-500">
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

                <Button variant="outline" className="hidden lg:flex">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card
                  className="bg-gradient-to-br from-fac-orange-500 to-fac-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("customers")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          Total Customers
                        </p>
                        <p className="text-3xl font-black">
                          {stats.totalCustomers.toLocaleString()}
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("sales")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Total Revenue
                        </p>
                        <p className="text-3xl font-black">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                      </div>
                      <DollarSign className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("analytics")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Total Washes
                        </p>
                        <p className="text-3xl font-black">
                          {stats.totalWashes.toLocaleString()}
                        </p>
                      </div>
                      <Car className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("packages")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          Active Subscriptions
                        </p>
                        <p className="text-3xl font-black">
                          {stats.activeSubscriptions}
                        </p>
                      </div>
                      <Crown className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <Card
                  className="bg-white border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab("packages")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Package className="h-5 w-5 mr-2 text-fac-orange-500" />
                      Package Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Create, edit, and manage service packages
                    </p>
                    <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                      Manage Packages
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="bg-white border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab("analytics")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="h-5 w-5 mr-2 text-fac-orange-500" />
                      Customer Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      View detailed customer insights and behavior
                    </p>
                    <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="bg-white border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab("branches")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <MapPin className="h-5 w-5 mr-2 text-fac-orange-500" />
                      Branch Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Manage locations and branch operations
                    </p>
                    <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                      View Branches
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Customer Management
                  </div>
                  <Button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-black truncate">
                              {customer.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium truncate">
                              {customer.email} • {customer.phone}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {customer.carUnit} • {customer.plateNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${customer.membershipType === "VIP Gold" ? "bg-yellow-500" : customer.membershipType === "VIP Silver" ? "bg-gray-400" : "bg-blue-500"} text-white font-bold`}
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
                              } text-white font-bold`}
                            >
                              {customer.approvalStatus.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-black">
                            {customer.totalWashes} washes
                          </p>
                          <p className="text-sm text-green-600 font-bold">
                            {formatCurrency(customer.totalSpent)}
                          </p>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Details"
                          >
                            <Smartphone className="h-4 w-4" />
                          </Button>
                          {customer.approvalStatus === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => handleApproveUser(customer.id)}
                                title="Approve User"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => handleRejectUser(customer.id)}
                                title="Reject User"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {customer.approvalStatus === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleBanUser(customer.id)}
                              title="Ban User"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          {customer.approvalStatus === "banned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => handleUnbanUser(customer.id)}
                              title="Unban User"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "packages" && (
            <div className="space-y-6">
              {/* Package Management Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-fac-orange-500" />
                      <span>Package Management</span>
                      <Badge variant="outline" className="text-xs">
                        Role: {userRole} | Editing:{" "}
                        {userRole === "superadmin" || userRole === "admin"
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    </div>
                    {(userRole === "superadmin" || userRole === "admin") && (
                      <Button
                        onClick={() => handleOpenPackageModal("add")}
                        className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Package
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Package Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg font-black">{pkg.name}</span>
                        <Badge
                          className={`${pkg.active ? "bg-green-500" : "bg-gray-400"} text-white font-bold`}
                        >
                          {pkg.active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-black text-fac-orange-500">
                            {formatCurrency(pkg.basePrice)}
                          </p>
                          {(userRole === "superadmin" ||
                            userRole === "admin") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOpenPackageModal("edit", pkg)
                              }
                              className="border-fac-orange-200 text-fac-orange-600 hover:bg-fac-orange-50"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>

                        {/* Duration */}
                        <div>
                          <p className="text-sm text-gray-600 font-medium">
                            <strong>Duration:</strong> {pkg.duration}
                          </p>
                        </div>

                        {/* Features */}
                        <div>
                          <p className="text-sm font-bold text-gray-700 mb-2">
                            Features:
                          </p>
                          <div className="space-y-1">
                            {pkg.features.map((feature, index) => (
                              <p
                                key={index}
                                className="text-sm text-gray-600 font-medium"
                              >
                                • {feature}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        {(userRole === "superadmin" ||
                          userRole === "admin") && (
                          <div className="flex space-x-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                handleOpenPackageModal("edit", pkg)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Package</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete the "
                                    {pkg.name}" package? This action cannot be
                                    undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeletePackage(pkg.id)}
                                  >
                                    Delete Package
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <Card className="bg-white border border-gray-100">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 text-fac-orange-500 mx-auto mb-4" />
                    <p className="text-3xl font-black text-black mb-2">
                      {formatCurrency(156780)}
                    </p>
                    <p className="text-sm font-bold text-gray-600">
                      Monthly Revenue
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-100">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-3xl font-black text-black mb-2">
                      +{stats.monthlyGrowth}%
                    </p>
                    <p className="text-sm font-bold text-gray-600">
                      Growth Rate
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-100">
                  <CardContent className="p-6 text-center">
                    <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-lg font-black text-black mb-2">
                      {stats.topPackage}
                    </p>
                    <p className="text-sm font-bold text-gray-600">
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
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onApproveCustomer={handleApproveUser}
              onRejectCustomer={handleRejectUser}
            />
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog
        open={isAddCustomerModalOpen}
        onOpenChange={setIsAddCustomerModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to the system. They will need approval to
              access services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCustomerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-fac-orange-500 hover:bg-fac-orange-600"
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
              {packageModalMode === "edit" ? "Edit Package" : "Add New Package"}
            </DialogTitle>
            <DialogDescription>
              {packageModalMode === "edit"
                ? "Update the package details below."
                : "Create a new service package for customers."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="packageName" className="font-bold">
                Package Name *
              </Label>
              <Input
                id="packageName"
                value={newPackage.name}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, name: e.target.value })
                }
                placeholder="e.g., Premium VIP"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packagePrice" className="font-bold">
                  Base Price (PHP) *
                </Label>
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
                  placeholder="e.g., 1500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="packageDuration" className="font-bold">
                  Duration
                </Label>
                <Input
                  id="packageDuration"
                  value={newPackage.duration}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, duration: e.target.value })
                  }
                  placeholder="e.g., 45 mins"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="packageFeatures" className="font-bold">
                Package Features
              </Label>
              <Textarea
                id="packageFeatures"
                value={editingFeatures}
                onChange={(e) => setEditingFeatures(e.target.value)}
                placeholder="Enter each feature on a new line&#10;e.g.:&#10;Premium exterior wash&#10;Interior vacuum&#10;Tire shine&#10;Dashboard clean"
                className="mt-1 min-h-[120px]"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each feature on a new line
              </p>
            </div>

            {packageModalMode === "edit" && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="packageActive" className="font-bold">
                  Active Package
                </Label>
                <input
                  type="checkbox"
                  id="packageActive"
                  checked={newPackage.active}
                  onChange={(e) =>
                    setNewPackage({ ...newPackage, active: e.target.checked })
                  }
                  className="w-4 h-4 text-fac-orange-500 border-gray-300 rounded focus:ring-fac-orange-500"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPackageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-fac-orange-500 hover:bg-fac-orange-600"
              onClick={handleSavePackageModal}
              disabled={!newPackage.name || !newPackage.basePrice}
            >
              {packageModalMode === "edit" ? "Update Package" : "Add Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
