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
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import NotificationCenter from "@/components/NotificationCenter";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import BranchManagement from "@/components/BranchManagement";

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
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
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
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      customerName: "Carlos Reyes",
      actionRequired: true,
    },
    {
      id: "3",
      type: "subscription",
      title: "VIP Gold Subscription",
      message: "John Dela Cruz upgraded to VIP Gold membership.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      customerName: "John Dela Cruz",
      amount: 3000,
    },
    {
      id: "4",
      type: "payment",
      title: "Payment Received",
      message: "Monthly subscription payment received from Maria Santos.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      customerName: "Maria Santos",
      amount: 1500,
    },
    {
      id: "5",
      type: "system",
      title: "Branch Update",
      message: "Tumaga branch has achieved 95% customer satisfaction rating.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
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
      duration: "30 mins",
      features: ["Basic exterior wash", "Tire cleaning", "Basic dry"],
      active: true,
    },
    {
      id: "vip-silver",
      name: "VIP Silver",
      basePrice: 1500,
      duration: "45 mins",
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
      duration: "60 mins",
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

  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(
    null,
  );
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({
    name: "",
    basePrice: 0,
    duration: "",
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

  const handleEditPackage = (pkg: ServicePackage) => {
    setEditingPackage({ ...pkg });
    setEditingFeatures(pkg.features.join("\n"));
  };

  const handleApproveUser = (userId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === userId
          ? { ...customer, status: "active", approvalStatus: "approved" }
          : customer,
      ),
    );
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

  const handleSavePackage = () => {
    if (editingPackage) {
      const updatedPackage = {
        ...editingPackage,
        features: editingFeatures.split("\n").filter((f) => f.trim() !== ""),
      };
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === editingPackage.id ? updatedPackage : pkg,
        ),
      );
      setEditingPackage(null);
      setEditingFeatures("");
      alert("Package updated successfully!");
    }
  };

  const handleDeletePackage = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      alert("Package deleted successfully!");
    }
  };

  const handleAddPackage = () => {
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
          duration: newPackage.duration || "30 mins",
          features,
          active: true,
        },
      ]);
      setNewPackage({ name: "", basePrice: 0, duration: "", features: [] });
      setEditingFeatures("");
      alert("Package added successfully!");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (!userRole) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
                Admin Dashboard
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-1">
                <Badge
                  className={`${userRole === "superadmin" ? "bg-red-500" : "bg-fac-orange-500"} text-white font-bold w-fit`}
                >
                  {userRole === "superadmin" ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      SUPER ADMIN
                    </>
                  ) : (
                    <>
                      <Settings className="h-3 w-3 mr-1" />
                      ADMIN
                    </>
                  )}
                </Badge>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  Fayeed Auto Care Management
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            <Button variant="outline" className="font-bold flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="border-red-300 text-red-600 hover:bg-red-50 p-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm">
              Customers
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-xs sm:text-sm">
              Packages
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-xs sm:text-sm">
              Sales
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-fac-orange-500 to-fac-orange-600 text-white">
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

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
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

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
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

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
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
              <Card className="bg-white border border-gray-100">
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

              <Card className="bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="h-5 w-5 mr-2 text-fac-orange-500" />
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

              <Card className="bg-white border border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Sales Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Generate and export detailed sales reports
                  </p>
                  <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Customer Management
                  </div>
                  <Button className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold w-full sm:w-auto">
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
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Existing Packages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-fac-orange-500" />
                    Service Packages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <h3 className="font-black text-black">{pkg.name}</h3>
                        <div className="flex items-center flex-wrap gap-2">
                          <Badge
                            className={`${pkg.active ? "bg-green-500" : "bg-gray-400"} text-white font-bold`}
                          >
                            {pkg.active ? "Active" : "Inactive"}
                          </Badge>
                          {userRole === "superadmin" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPackage(pkg)}
                                title="Edit Package"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    title="Delete Package"
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
                                      onClick={() =>
                                        handleDeletePackage(pkg.id)
                                      }
                                    >
                                      Delete Package
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-bold text-fac-orange-500">
                          {formatCurrency(pkg.basePrice)}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Duration: {pkg.duration}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-700 mb-1">
                            Features:
                          </p>
                          {pkg.features.map((feature, index) => (
                            <p
                              key={index}
                              className="text-sm text-gray-600 font-medium pl-2"
                            >
                              • {feature}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Add/Edit Package */}
              {userRole === "superadmin" && (
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {editingPackage ? "Edit Package" : "Add New Package"}
                      {editingPackage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPackage(null);
                            setEditingFeatures("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="packageName" className="font-bold">
                        Package Name
                      </Label>
                      <Input
                        id="packageName"
                        value={
                          editingPackage ? editingPackage.name : newPackage.name
                        }
                        onChange={(e) =>
                          editingPackage
                            ? setEditingPackage({
                                ...editingPackage,
                                name: e.target.value,
                              })
                            : setNewPackage({
                                ...newPackage,
                                name: e.target.value,
                              })
                        }
                        placeholder="e.g., Premium VIP"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="packagePrice" className="font-bold">
                        Base Price (PHP)
                      </Label>
                      <Input
                        id="packagePrice"
                        type="number"
                        value={
                          editingPackage
                            ? editingPackage.basePrice
                            : newPackage.basePrice
                        }
                        onChange={(e) =>
                          editingPackage
                            ? setEditingPackage({
                                ...editingPackage,
                                basePrice: Number(e.target.value),
                              })
                            : setNewPackage({
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
                        value={
                          editingPackage
                            ? editingPackage.duration
                            : newPackage.duration
                        }
                        onChange={(e) =>
                          editingPackage
                            ? setEditingPackage({
                                ...editingPackage,
                                duration: e.target.value,
                              })
                            : setNewPackage({
                                ...newPackage,
                                duration: e.target.value,
                              })
                        }
                        placeholder="e.g., 45 mins"
                        className="mt-1"
                      />
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

                    {editingPackage && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="packageActive" className="font-bold">
                          Active Package
                        </Label>
                        <input
                          type="checkbox"
                          id="packageActive"
                          checked={editingPackage.active}
                          onChange={(e) =>
                            setEditingPackage({
                              ...editingPackage,
                              active: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-fac-orange-500 border-gray-300 rounded focus:ring-fac-orange-500"
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      {editingPackage ? (
                        <>
                          <Button
                            onClick={handleSavePackage}
                            className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold"
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingPackage(null);
                              setEditingFeatures("");
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={handleAddPackage}
                          className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold"
                          disabled={!newPackage.name || !newPackage.basePrice}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Package
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
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
                  <p className="text-sm font-bold text-gray-600">Growth Rate</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-100">
                <CardContent className="p-6 text-center">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg font-black text-black mb-2">
                    {stats.topPackage}
                  </p>
                  <p className="text-sm font-bold text-gray-600">Top Package</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branch Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-fac-orange-500 mr-2" />
                        <span className="font-bold">Tumaga Branch</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">
                          {formatCurrency(89560)}
                        </p>
                        <p className="text-sm text-gray-600">This Month</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-fac-orange-500 mr-2" />
                        <span className="font-bold">Boalan Branch</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">
                          {formatCurrency(67220)}
                        </p>
                        <p className="text-sm text-gray-600">This Month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customers.slice(0, 3).map((customer, index) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="bg-fac-orange-500 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                            {index + 1}
                          </div>
                          <span className="font-bold text-black">
                            {customer.name}
                          </span>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
