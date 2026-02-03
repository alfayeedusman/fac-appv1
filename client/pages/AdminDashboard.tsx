import React, { useState, useEffect, Suspense } from "react";
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
  Calendar,
  Wrench,
  AlertCircle,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import NotificationCenter from "@/components/NotificationCenter";
import ErrorBoundary from "@/components/ErrorBoundary";
const AnalyticsCharts = React.lazy(
  () => import("@/components/AnalyticsCharts"),
);
import BranchManagement from "@/components/BranchManagement";
import ThemeToggle from "@/components/ThemeToggle";
import { formatDistanceToNow } from "date-fns";
import AdminAdManagement from "@/components/AdminAdManagement";
import UserRoleManagement from "@/components/UserRoleManagement";
import SalesDashboard from "@/components/SalesDashboard";
import EnhancedBookingManagement from "@/components/EnhancedBookingManagement";
import EnhancedInventoryManagement from "./EnhancedInventoryManagement";
import ImageUploadManager from "@/components/ImageUploadManager";
import NotificationService from "@/components/NotificationService";
import NeonDatabaseSetup from "@/components/NeonDatabaseSetup";
import AdminCMS from "./AdminCMS";
import AdminPushNotifications from "./AdminPushNotifications";
import AdminGamification from "./AdminGamification";
import AdminImageManager from "./AdminImageManager";
import AdminSubscriptionApproval from "./AdminSubscriptionApproval";
import AdminBookingSettings from "./AdminBookingSettings";
import AdminUserManagement from "./AdminUserManagement";
import AdminCrewManagement from "./AdminCrewManagement";
import AdminSettings from "./AdminSettings";
import CustomerHub from "@/components/CustomerHub";
import SalesTransactions from "@/components/SalesTransactions";
import BookingHub from "@/components/BookingHub";
import ActiveSubscriptionsManager from "@/components/ActiveSubscriptionsManager";
import { AdminNotificationBanner } from "@/components/AdminNotificationBanner";
import { createAd, getAds } from "@/utils/adsUtils";
import { initializeSampleAds } from "@/utils/initializeSampleAds";
import {
  getUserSystemNotifications,
  markSystemNotificationAsRead,
  getAllBookings,
  type SystemNotification,
} from "@/utils/databaseSchema";
import { neonDbClient } from "@/services/neonDatabaseService";
import realtimeService from "@/services/realtimeService";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";

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
  totalOnlineBookings: number;
  totalExpenses: number;
  netIncome: number;
  activeSubscriptions: number;
  totalSubscriptionRevenue: number;
  newSubscriptions: number;
  subscriptionUpgrades: number;
  monthlyGrowth: number;
  topPackage: string;
}

interface CrewCommissionSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  totalRevenue: number;
  totalCommission: number;
  totalBookings: number;
  crewCount: number;
  crew: Array<{
    crewId: string;
    crewName: string;
    totalRevenue: number;
    totalCommission: number;
    totalBookings: number;
  }>;
  breakdown?: Array<{
    serviceType: string;
    bookingCount: number;
    totalRevenue: number;
    totalCommission: number;
  }>;
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
  const [bookingTypeFilter, setBookingTypeFilter] = useState<
    "all" | "walkin" | "booking"
  >("all");

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalRevenue: 0,
    totalWashes: 0,
    totalOnlineBookings: 0,
    totalExpenses: 0,
    netIncome: 0,
    activeSubscriptions: 0,
    totalSubscriptionRevenue: 0,
    newSubscriptions: 0,
    subscriptionUpgrades: 0,
    monthlyGrowth: 0,
    topPackage: "VIP Gold Ultimate",
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [crewCommissionSummary, setCrewCommissionSummary] =
    useState<CrewCommissionSummary | null>(null);
  const [crewCommissionLoading, setCrewCommissionLoading] = useState(false);

  const [realtimeStats, setRealtimeStats] = useState({
    onlineCrew: 0,
    busyCrew: 0,
    activeCustomers: 0,
    activeGroups: 0,
  });
  const [realtimeLoading, setRealtimeLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

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
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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

  const [editCustomerForm, setEditCustomerForm] = useState({
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
    durationType: "preset" as "preset" | "hours" | "custom",
    hours: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    banner: undefined as string | undefined,
    features: [] as string[],
    active: true,
  });

  const [editingFeatures, setEditingFeatures] = useState("");

  const [dailyIncomeAmount, setDailyIncomeAmount] = useState("");
  const [dailyIncomeDate, setDailyIncomeDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [dailyIncomeNotes, setDailyIncomeNotes] = useState("");
  const [dailyIncomeLoading, setDailyIncomeLoading] = useState(false);

  // Function to load real statistics from database
  const loadRealStats = async (period: string = timeFilter) => {
    try {
      setStatsLoading(true);
      console.log("📊 Loading real stats for period:", period);

      const result = await neonDbClient.getStats(period);
      console.log("📈 Stats result:", result);

      if (result.success && result.stats) {
        const newStats = {
          totalCustomers: result.stats.totalUsers || 0,
          totalRevenue: result.stats.totalRevenue || 0,
          totalWashes: result.stats.totalWashes || 0,
          totalOnlineBookings: result.stats.totalOnlineBookings || 0,
          totalExpenses: result.stats.totalExpenses || 0,
          netIncome: result.stats.netIncome || 0,
          activeSubscriptions: result.stats.activeSubscriptions || 0,
          totalSubscriptionRevenue: result.stats.totalSubscriptionRevenue || 0,
          newSubscriptions: result.stats.newSubscriptions || 0,
          subscriptionUpgrades: result.stats.subscriptionUpgrades || 0,
          monthlyGrowth: result.stats.monthlyGrowth || 0,
          topPackage: "VIP Gold Ultimate", // This could be calculated from most popular package
        };
        console.log("✅ Setting new stats:", newStats);
        setStats(newStats);
      } else {
        console.warn(
          "⚠️ Failed to load real stats, using defaults. Result:",
          result,
        );
        // Keep existing stats instead of resetting
      }
    } catch (error) {
      console.error("❌ Error loading statistics:", error);
      // Don't crash the component, just log the error and continue with existing stats
      toast({
        title: "Stats Loading Issue",
        description: "Using cached data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const submitDailyIncome = async () => {
    const amount = Number(dailyIncomeAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a daily income amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const currentUser = localStorage.getItem("currentUser");
    const parsedUser = currentUser ? JSON.parse(currentUser) : null;
    const recordedBy =
      parsedUser?.id ||
      localStorage.getItem("userId") ||
      localStorage.getItem("userEmail") ||
      "unknown";
    const branch = parsedUser?.branchLocation || "Main Branch";

    try {
      setDailyIncomeLoading(true);
      const result = await neonDbClient.createDailyIncome({
        branch,
        incomeDate: dailyIncomeDate,
        amount,
        recordedBy,
        notes: dailyIncomeNotes || undefined,
      });

      if (result.success) {
        toast({
          title: "Daily income saved",
          description: `Recorded ₱${amount.toFixed(2)} for ${branch}.`,
        });
        setDailyIncomeAmount("");
        setDailyIncomeNotes("");
      } else {
        toast({
          title: "Failed to save income",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Daily income submit failed:", error);
      toast({
        title: "Failed to save income",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDailyIncomeLoading(false);
    }
  };

  // Function to load real customer data from database
  const loadRealCustomers = async () => {
    try {
      setCustomersLoading(true);
      console.log("������ Loading customers from database...");

      // Ensure database connection is ready
      const connectionStatus = neonDbClient.getConnectionStatus();
      console.log("🔗 Database connection status:", connectionStatus);

      if (!connectionStatus) {
        console.log("⚠️ Database not connected, attempting to connect...");
        const connected = await neonDbClient.testConnection();
        console.log("🔗 Connection test result:", connected);
        if (!connected.connected) {
          console.warn("⚠️ Database connection failed, showing empty list");
          setCustomers([]);
          return;
        }
      }

      const result = await neonDbClient.getCustomers();
      console.log("👥 Customer load result:", result);

      if (result.success && result.users) {
        console.log("📋 Raw users from database:", result.users);
        // Transform database users to Customer interface
        const transformedCustomers: Customer[] = result.users.map(
          (user: any) => ({
            id: user.id,
            name: user.fullName,
            email: user.email,
            phone: user.contactNumber || "N/A",
            carUnit: user.carUnit || "N/A",
            plateNumber: user.carPlateNumber || "N/A",
            membershipType:
              user.subscriptionStatus === "free"
                ? "Classic"
                : user.subscriptionStatus === "basic"
                  ? "VIP Silver"
                  : user.subscriptionStatus === "premium"
                    ? "VIP Gold"
                    : user.subscriptionStatus === "vip"
                      ? "VIP Gold Ultimate"
                      : "Classic",
            joinDate: new Date(user.createdAt).toISOString().split("T")[0],
            totalWashes: 0, // This would need to be calculated from bookings
            totalSpent: 0, // This would need to be calculated from bookings
            status: user.isActive ? "active" : "inactive",
            approvalStatus: user.isActive ? "approved" : "pending",
          }),
        );

        console.log("✅ Transformed customers:", transformedCustomers);
        setCustomers(transformedCustomers);
      } else {
        console.warn(
          "⚠️ Failed to load real customers, using empty array. Result:",
          result,
        );
        setCustomers([]);
      }
    } catch (error) {
      console.error("❌ Error loading customers:", error);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Function to load real-time crew and customer statistics
  const loadRealtimeStats = async () => {
    try {
      setRealtimeLoading(true);
      console.log("📡 Loading realtime stats...");

      const result = await neonDbClient.getRealtimeStats();
      console.log("🔄 Realtime stats result:", result);

      if (result.success && result.stats) {
        const newRealtimeStats = {
          onlineCrew: result.stats.onlineCrew || 0,
          busyCrew: result.stats.busyCrew || 0,
          activeCustomers: result.stats.activeCustomers || 0,
          activeGroups: result.stats.activeGroups || 0,
        };
        console.log("✅ Setting new realtime stats:", newRealtimeStats);
        setRealtimeStats(newRealtimeStats);
      } else {
        console.warn(
          "⚠️ Failed to load realtime stats, using defaults. Result:",
          result,
        );
        // Keep existing stats instead of resetting
      }
    } catch (error) {
      console.error("❌ Error loading realtime statistics:", error);
      // Don't crash the component, just log the error
    } finally {
      setRealtimeLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    console.log("🔐 Admin Dashboard useEffect - Role:", role, "Email:", email);

    if (role === "admin" || role === "superadmin") {
      console.log("✅ User authorized, setting up dashboard...");
      setUserRole(role);
      // Initialize sample ads for demonstration
      initializeSampleAds();

      // Load real statistics from database
      loadRealStats();

      // Load real-time crew and customer statistics
      loadRealtimeStats();

      // Subscribe to realtime events (booking, pos, inventory, dashboard stats)
      const subs: Array<() => void> = [];
      try {
        subs.push(
          realtimeService.subscribe("dashboard-stats", (d: any) => {
            if (d && d.stats) {
              setRealtimeStats({
                onlineCrew: d.stats.onlineCrew || 0,
                busyCrew: d.stats.busyCrew || 0,
                activeCustomers: d.stats.activeCustomers || 0,
                activeGroups: d.stats.activeGroups || 0,
              });
            }
          }),
        );

        subs.push(
          realtimeService.subscribe("booking.created", (d: any) => {
            setStats((prev) => ({
              ...prev,
              totalOnlineBookings: (prev.totalOnlineBookings || 0) + 1,
            }));
          }),
        );

        subs.push(
          realtimeService.subscribe("pos.transaction.created", (d: any) => {
            setStats((prev) => ({
              ...prev,
              totalRevenue:
                (prev.totalRevenue || 0) + (parseFloat(d.totalAmount) || 0),
            }));
          }),
        );

        subs.push(
          realtimeService.subscribe("inventory.updated", (d: any) => {
            // simple UI hint: trigger a toast
            toast({
              title: "Inventory updated",
              description: d.item?.name || "An inventory item was updated",
            });
          }),
        );
      } catch (e) {
        console.warn("Realtime subscription failed:", e);
      }

      // Load real customer data from database
      console.log("📋 About to call loadRealCustomers...");
      loadRealCustomers()
        .then(() => console.log("✅ loadRealCustomers completed"))
        .catch((error) => console.error("❌ loadRealCustomers failed:", error));

      // Load system notifications
      loadSystemNotifications();

      // Load admin notifications from local store
      import("@/utils/adminNotifications").then(({ getAdminNotifications }) => {
        try {
          setAdminNotifications(getAdminNotifications().slice(0, 50));
        } catch (e) {}
      });

      // Disable polling to prevent lag - use realtime subscriptions instead
      // Stats will be updated via realtime service subscriptions above
      // Users can manually refresh by clicking buttons

      return () => {
        // unsubscribe realtime subscriptions
        subs.forEach((u) => u && u());
      };
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Reload stats when time filter changes
  useEffect(() => {
    loadRealStats(timeFilter);
  }, [timeFilter]);

  const loadSystemNotifications = () => {
    try {
      const userRole = localStorage.getItem("userRole") as
        | "admin"
        | "superadmin";
      const userEmail = localStorage.getItem("userEmail") || "";

      if (userRole && userEmail) {
        const systemNotifications = getUserSystemNotifications(
          userEmail,
          userRole,
        );

        // Convert system notifications to the format expected by the UI with extra safety checks
        const formattedNotifications = Array.isArray(systemNotifications)
          ? systemNotifications
              .map((notification: SystemNotification) => {
                try {
                  return {
                    id: notification?.id || "",
                    type: notification?.type || "system",
                    title: notification?.title || "Notification",
                    message: notification?.message || "",
                    timestamp: notification?.createdAt
                      ? new Date(notification.createdAt)
                      : new Date(),
                    read: Array.isArray(notification?.readBy)
                      ? notification.readBy.some((r) => r?.userId === userEmail)
                      : false,
                    priority: notification?.priority || "medium",
                    data: notification?.data || {},
                    actionRequired: notification?.type === "new_booking",
                  };
                } catch (mapError) {
                  console.error(
                    "Error formatting notification:",
                    mapError,
                    notification,
                  );
                  return null;
                }
              })
              .filter(Boolean) // Remove any null entries
          : [];

        setNotifications(formattedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error loading system notifications:", error);
      // Ensure notifications is always an array even on error
      setNotifications([]);
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

      Swal.fire({
        title: "Customer Added!",
        text: `${newCustomer.name} has been added successfully and is awaiting approval.`,
        icon: "success",
        confirmButtonColor: "#f97316",
      });
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
    Swal.fire({
      title: "Delete Package?",
      text: `Are you sure you want to delete ${pkg.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
        Swal.fire({
          title: "Deleted!",
          text: "Package deleted successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleSavePackage = () => {
    if (!newPackage.name || newPackage.basePrice <= 0) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in all required fields",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
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
      Swal.fire({
        title: "Package Created!",
        text: "Package created successfully!",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
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
      Swal.fire({
        title: "Package Updated!",
        text: "Package updated successfully!",
        icon: "success",
        confirmButtonColor: "#f97316",
      });
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
    if (!Array.isArray(notifications)) return;
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
    if (Array.isArray(notifications)) {
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
    }
    localStorage.setItem(
      "admin_notifications",
      JSON.stringify(updatedNotifications),
    );

    Swal.fire({
      title: "Customer Approved!",
      text: "Customer approved successfully!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });
  };

  const handleRejectCustomer = (notificationId: string) => {
    // Find the notification and extract customer info
    if (!Array.isArray(notifications)) return;
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
    if (Array.isArray(notifications)) {
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
    }
    localStorage.setItem(
      "admin_notifications",
      JSON.stringify(updatedNotifications),
    );

    Swal.fire({
      title: "Customer Rejected",
      text: "Customer registration rejected.",
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      carUnit: customer.carUnit,
      plateNumber: customer.plateNumber,
      membershipType: customer.membershipType,
    });
    setIsEditCustomerModalOpen(true);
  };

  const handleSaveEditedCustomer = () => {
    if (!editingCustomer) return;

    if (!editCustomerForm.name.trim() || !editCustomerForm.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    const updatedCustomers = customers.map((c) =>
      c.id === editingCustomer.id
        ? {
            ...c,
            name: editCustomerForm.name,
            email: editCustomerForm.email,
            phone: editCustomerForm.phone,
            carUnit: editCustomerForm.carUnit,
            plateNumber: editCustomerForm.plateNumber,
            membershipType: editCustomerForm.membershipType,
          }
        : c,
    );

    setCustomers(updatedCustomers);
    setIsEditCustomerModalOpen(false);
    setEditingCustomer(null);

    toast({
      title: "Success",
      description: "Customer updated successfully",
      variant: "default",
    });
  };

  const unreadNotificationCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  if (!userRole) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "fac-map") {
            navigate("/admin-fac-map");
            return;
          }
          setActiveTab(tab);
        }}
        userRole={userRole}
        notificationCount={unreadNotificationCount}
      />

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen">
        {/* Admin Notifications Banner */}
        <AdminNotificationBanner
          notifications={adminNotifications}
          onDismiss={(id) => {
            setAdminNotifications(
              adminNotifications.filter((n) => n.id !== id),
            );
          }}
        />

        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {activeTab === "overview" && "Admin Dashboard"}
                  {activeTab === "customers" && "Customer Management"}
                  {activeTab === "user-management" && "User Management"}
                  {activeTab === "roles" && "User & Role Management"}
                  {activeTab === "ads" && "Advertisement Management"}
                  {activeTab === "packages" && "Package Management"}
                  {activeTab === "branches" && "Branch Management"}
                  {activeTab === "analytics" && "Analytics"}
                  {activeTab === "sales" && "Sales Dashboard"}
                  {activeTab === "inventory" && "Inventory Dashboard"}
                  {activeTab === "notifications" && "Notifications"}
                  {activeTab === "cms" && "Content Management"}
                  {activeTab === "push-notifications" && "Push Notifications"}
                  {activeTab === "gamification" && "Gamification"}
                  {activeTab === "subscription-approval" &&
                    "Subscription Approval"}
                  {activeTab === "booking" && "Booking Settings"}
                  {activeTab === "pos" && "Point of Sale"}
                  {activeTab === "user-management" && "User Management"}
                  {activeTab === "images" && "Image Manager"}
                  {activeTab === "database" && "Database Management"}
                  {activeTab === "settings" && "System Settings"}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {activeTab === "overview" &&
                    "Monitor your business performance"}
                  {activeTab === "customers" &&
                    "Manage customer accounts and approvals"}
                  {activeTab === "user-management" &&
                    "Manage staff accounts and permissions"}
                  {activeTab === "roles" && "Manage user roles and permissions"}
                  {activeTab === "ads" && "Create and manage advertisements"}
                  {activeTab === "packages" && "Configure service packages"}
                  {activeTab === "branches" && "Manage branch locations"}
                  {activeTab === "analytics" && "View performance insights"}
                  {activeTab === "sales" && "Monitor POS sales performance"}
                  {activeTab === "inventory" &&
                    "Track stock levels and inventory value"}
                  {activeTab === "notifications" && "System alerts"}
                  {activeTab === "cms" && "Manage content and pages"}
                  {activeTab === "push-notifications" &&
                    "Send push notifications"}
                  {activeTab === "gamification" && "Manage rewards and levels"}
                  {activeTab === "subscription-approval" &&
                    "Approve payment plans"}
                  {activeTab === "booking" && "Configure booking settings"}
                  {activeTab === "pos" && "Point of sale system"}
                  {activeTab === "user-management" && "Manage staff and users"}
                  {activeTab === "images" &&
                    "Manage media assets and galleries"}
                  {activeTab === "settings" &&
                    "Configure receipts, taxes, features, and user management"}
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
                    <ErrorBoundary
                      fallback={
                        <div className="p-4 text-center text-red-500">
                          Error loading notifications
                        </div>
                      }
                    >
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
                                  try {
                                    const userEmail =
                                      localStorage.getItem("userEmail") || "";
                                    // Mark all unread notifications as read with safety checks
                                    if (
                                      Array.isArray(notifications) &&
                                      notifications.length > 0
                                    ) {
                                      notifications.forEach((notification) => {
                                        if (
                                          notification &&
                                          !notification.read &&
                                          notification.id &&
                                          userEmail
                                        ) {
                                          markSystemNotificationAsRead(
                                            notification.id,
                                            userEmail,
                                          );
                                        }
                                      });
                                    }
                                    loadSystemNotifications(); // Refresh notifications
                                  } catch (error) {
                                    console.error(
                                      "Error marking all notifications as read:",
                                      error,
                                    );
                                  }
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
                          {!Array.isArray(notifications) ||
                          notifications.slice(0, 5).length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-base">No notifications</p>
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notification) => {
                              try {
                                // Add safety checks for notification properties
                                if (
                                  !notification ||
                                  typeof notification !== "object"
                                ) {
                                  return null;
                                }

                                const notificationType =
                                  notification.type || "system";
                                const isRead = Boolean(notification.read);
                                const notificationId =
                                  notification.id || Math.random().toString();

                                return (
                                  <div
                                    key={notificationId}
                                    className={`p-4 rounded-2xl border-l-4 mb-4 transition-all hover:bg-accent cursor-pointer ${
                                      notificationType === "new_customer"
                                        ? "border-l-blue-500"
                                        : notificationType === "subscription"
                                          ? "border-l-green-500"
                                          : notificationType ===
                                              "approval_request"
                                            ? "border-l-yellow-500"
                                            : notificationType === "payment"
                                              ? "border-l-green-500"
                                              : "border-l-purple-500"
                                    } ${
                                      isRead ? "bg-muted opacity-75" : "bg-card"
                                    }`}
                                    onClick={() => {
                                      try {
                                        if (
                                          notification &&
                                          !isRead &&
                                          notificationId
                                        ) {
                                          const userEmail =
                                            localStorage.getItem("userEmail") ||
                                            "";
                                          if (userEmail) {
                                            markSystemNotificationAsRead(
                                              notificationId,
                                              userEmail,
                                            );
                                            loadSystemNotifications(); // Refresh notifications

                                            // If it's a booking notification, navigate to bookings tab
                                            if (
                                              notificationType === "new_booking"
                                            ) {
                                              try {
                                                setActiveTab("bookings");
                                                setIsNotificationDropdownOpen(
                                                  false,
                                                );
                                              } catch (error) {
                                                console.error(
                                                  "Error navigating to bookings tab:",
                                                  error,
                                                );
                                              }
                                            }
                                          }
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error marking notification as read:",
                                          error,
                                        );
                                      }
                                    }}
                                  >
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0 mt-1">
                                        {notificationType === "new_booking" && (
                                          <Calendar className="h-5 w-5 text-fac-orange-500" />
                                        )}
                                        {notificationType ===
                                          "new_customer" && (
                                          <UserPlus className="h-5 w-5 text-blue-500" />
                                        )}
                                        {notificationType ===
                                          "subscription" && (
                                          <CreditCard className="h-5 w-5 text-green-500" />
                                        )}
                                        {notificationType ===
                                          "approval_request" && (
                                          <Clock className="h-5 w-5 text-yellow-500" />
                                        )}
                                        {notificationType ===
                                          "status_update" && (
                                          <CheckCircle className="h-5 w-5 text-blue-500" />
                                        )}
                                        {notificationType === "crew_update" && (
                                          <Wrench className="h-5 w-5 text-purple-500" />
                                        )}
                                        {notificationType ===
                                          "payment_received" && (
                                          <DollarSign className="h-5 w-5 text-green-500" />
                                        )}
                                        {notificationType ===
                                          "system_alert" && (
                                          <AlertCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        {notificationType === "payment" && (
                                          <DollarSign className="h-5 w-5 text-green-500" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <h4 className="text-base font-bold text-foreground truncate">
                                            {notification?.title ||
                                              "Notification"}
                                          </h4>
                                          {!isRead && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                          {notification?.message || ""}
                                        </p>
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-muted-foreground">
                                            {notification?.timestamp
                                              ? formatDistanceToNow(
                                                  notification.timestamp,
                                                  {
                                                    addSuffix: true,
                                                  },
                                                )
                                              : "Unknown time"}
                                          </span>
                                          {(notificationType ===
                                            "new_customer" ||
                                            notificationType ===
                                              "approval_request") && (
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 h-6"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleApproveCustomer(
                                                    notificationId,
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
                                                    notificationId,
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
                                );
                              } catch (error) {
                                console.error(
                                  "Error rendering notification:",
                                  error,
                                );
                                return null;
                              }
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </ErrorBoundary>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={() => navigate("/pos")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                  size="sm"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">POS System</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    console.log("🔄 Refresh button clicked!");
                    loadRealStats();
                    loadRealtimeStats();
                    loadSystemNotifications();

                    // Force customer loading with debug
                    console.log(
                      "🚀 Force loading customers from refresh button...",
                    );
                    await loadRealCustomers();

                    await Swal.fire({
                      title: "Refreshed!",
                      text: "Dashboard data has been refreshed successfully",
                      icon: "success",
                      timer: 2000,
                      showConfirmButton: false,
                      position: "top-end",
                      toast: true,
                    });
                  }}
                  disabled={statsLoading || realtimeLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1 ${statsLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Time Period & Booking Type Filter */}
              <div className="flex justify-end gap-3 flex-wrap">
                <Select
                  value={bookingTypeFilter}
                  onValueChange={(value: any) => setBookingTypeFilter(value)}
                >
                  <SelectTrigger className="w-40 border-orange-500">
                    <SelectValue placeholder="Booking type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="booking">Bookings Only</SelectItem>
                    <SelectItem value="walkin">Walk-in Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40 border-orange-500">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            stats.totalCustomers.toLocaleString()
                          )}
                        </div>
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
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            formatCurrency(stats.totalRevenue)
                          )}
                        </div>
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
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            stats.totalWashes.toLocaleString()
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("bookings")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Total Online Bookings
                        </p>
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            stats.totalOnlineBookings.toLocaleString()
                          )}
                        </div>
                      </div>
                      <div className="bg-cyan-500 p-3 rounded-lg">
                        <Smartphone className="h-6 w-6 text-white" />
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
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            stats.activeSubscriptions.toLocaleString()
                          )}
                        </div>
                      </div>
                      <div className="bg-purple-500 p-3 rounded-lg">
                        <Crown className="h-6 w-6 text-white" />
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
                          Total Expenses
                        </p>
                        <div className="text-3xl font-bold text-red-600">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            formatCurrency(stats.totalExpenses)
                          )}
                        </div>
                      </div>
                      <div className="bg-red-500 p-3 rounded-lg">
                        <Wrench className="h-6 w-6 text-white" />
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
                          Net Income (Profit)
                        </p>
                        <div
                          className={`text-3xl font-bold ${stats.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            formatCurrency(stats.netIncome)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Gross - Expenses
                        </p>
                      </div>
                      <div
                        className={`${stats.netIncome >= 0 ? "bg-green-500" : "bg-red-500"} p-3 rounded-lg`}
                      >
                        <TrendingUp className="h-6 w-6 text-white" />
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
                          Subscription Revenue
                        </p>
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            formatCurrency(stats.totalSubscriptionRevenue)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Active plans
                        </p>
                      </div>
                      <div className="bg-emerald-500 p-3 rounded-lg">
                        <CreditCard className="h-6 w-6 text-white" />
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
                          New Subscriptions
                        </p>
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            stats.newSubscriptions.toLocaleString()
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This period
                        </p>
                      </div>
                      <div className="bg-indigo-500 p-3 rounded-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab("customers")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">
                          Account Upgrades
                        </p>
                        <div className="text-3xl font-bold text-foreground">
                          {statsLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : (
                            stats.subscriptionUpgrades.toLocaleString()
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Free → Premium
                        </p>
                      </div>
                      <div className="bg-pink-500 p-3 rounded-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Location Summary */}
              <Card className="glass border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-fac-orange-500 to-red-500 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Location Summary
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Crew and customer overview
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate("/admin-fac-map")}
                      className="bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-semibold"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View FAC MAP
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {realtimeLoading ? (
                          <div className="animate-pulse">-</div>
                        ) : (
                          realtimeStats.onlineCrew
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Online Crew
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Real-time tracking
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">
                        {realtimeLoading ? (
                          <div className="animate-pulse">-</div>
                        ) : (
                          realtimeStats.busyCrew
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Busy Crew
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        Currently working
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {realtimeLoading ? (
                          <div className="animate-pulse">-</div>
                        ) : (
                          realtimeStats.activeCustomers
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Customers
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        Online now
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {realtimeLoading ? (
                          <div className="animate-pulse">-</div>
                        ) : (
                          realtimeStats.activeGroups
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Groups
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Crew teams
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() => navigate("/admin-fac-map")}
                      variant="outline"
                      className="border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      View Full Heat Map
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                  className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                  onClick={() => navigate("/admin-crew-management")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center text-xl text-foreground">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      Crew Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-base mb-6">
                      Manage crew teams, groups, and real-time locations
                    </p>
                    <Button className="btn-futuristic w-full py-3 rounded-xl font-bold">
                      Manage Crew
                    </Button>
                  </CardContent>
                </Card>

                {userRole === "superadmin" && (
                  <Card
                    className="glass border-border shadow-xl hover-lift cursor-pointer group relative overflow-hidden"
                    onClick={() => setActiveTab("roles")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center text-xl text-foreground">
                        <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
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
                      <div className="gradient-primary p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
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
                      <div className="gradient-secondary p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
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
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
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
                      <div className="gradient-futuristic p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
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

              <Card className="glass border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Daily Income Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="daily-income-date">Date</Label>
                      <Input
                        id="daily-income-date"
                        type="date"
                        value={dailyIncomeDate}
                        onChange={(e) => setDailyIncomeDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="daily-income-amount">Amount (₱)</Label>
                      <Input
                        id="daily-income-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={dailyIncomeAmount}
                        onChange={(e) => setDailyIncomeAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="daily-income-notes">Notes</Label>
                      <Input
                        id="daily-income-notes"
                        placeholder="Optional notes"
                        value={dailyIncomeNotes}
                        onChange={(e) => setDailyIncomeNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={submitDailyIncome}
                      disabled={dailyIncomeLoading}
                      className="btn-futuristic"
                    >
                      {dailyIncomeLoading ? "Saving..." : "Save Daily Income"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "user-management" && <AdminUserManagement />}

          {activeTab === "customers" && (
            <Card className="glass border-border shadow-2xl">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="gradient-primary p-3 rounded-xl mr-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-foreground">
                      Customer Management
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        console.log("🔄 Manual customer reload triggered");
                        await loadRealCustomers();

                        await Swal.fire({
                          title: "Customers Reloaded!",
                          text: "Customer data has been refreshed",
                          icon: "success",
                          timer: 2000,
                          showConfirmButton: false,
                          position: "top-end",
                          toast: true,
                        });
                      }}
                      variant="outline"
                      className="font-bold py-3 px-4 rounded-xl"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reload
                    </Button>
                    <Button
                      onClick={() => setIsAddCustomerModalOpen(true)}
                      className="btn-futuristic font-bold py-3 px-6 rounded-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Customer
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {customersLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading customers...
                      </p>
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No customers found</p>
                      <p className="text-sm">
                        Start by adding your first customer
                      </p>
                    </div>
                  ) : (
                    customers.map((customer, index) => (
                      <div
                        key={customer.id}
                        className="glass rounded-2xl p-6 hover-lift transition-all duration-300"
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
                                onClick={() => handleEditCustomer(customer)}
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
                                    onClick={() =>
                                      handleApproveCustomer(
                                        notifications.find(
                                          (n) =>
                                            n.message.includes(customer.name) &&
                                            n.type === "new_customer",
                                        )?.id || "",
                                      )
                                    }
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 hover-lift"
                                    title="Reject User"
                                    onClick={() =>
                                      handleRejectCustomer(
                                        notifications.find(
                                          (n) =>
                                            n.message.includes(customer.name) &&
                                            n.type === "new_customer",
                                        )?.id || "",
                                      )
                                    }
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "packages" && (
            <div className="space-y-8">
              {/* Package Management Header */}
              <Card className="glass border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="gradient-primary p-3 rounded-xl">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-2xl font-black text-foreground">
                          Package Studio
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs sm:text-sm border-fac-orange-500 text-fac-orange-500 w-fit"
                        >
                          <span className="hidden sm:inline">
                            Role: {userRole} | Editing:{" "}
                          </span>
                          <span className="sm:hidden">{userRole} - </span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
                {packages.map((pkg, index) => (
                  <Card
                    key={pkg.id}
                    className="glass border-border shadow-2xl hover-lift transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xl font-black text-foreground">
                          {pkg.name}
                        </span>
                        <Badge
                          className={`${
                            pkg.active ? "bg-green-500" : "bg-gray-400"
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
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <span className="text-muted-foreground">
                    Loading analytics...
                  </span>
                </div>
              }
            >
              <AnalyticsCharts
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
              />
            </Suspense>
          )}

          {activeTab === "sales" && <SalesDashboard />}

          {activeTab === "old_sales" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass border-border shadow-xl hover-lift">
                  <CardContent className="p-8 text-center">
                    <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
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
                    <div className="gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
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
                    <div className="gradient-futuristic w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
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
              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-8">
                    <span className="text-muted-foreground">
                      Loading analytics...
                    </span>
                  </div>
                }
              >
                <AnalyticsCharts
                  timeFilter={timeFilter}
                  onTimeFilterChange={setTimeFilter}
                />
              </Suspense>
            </div>
          )}

          {activeTab === "roles" && userRole === "superadmin" && (
            <div>
              <ErrorBoundary>
                <UserRoleManagement />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === "ads" && (
            <div>
              <AdminAdManagement
                adminEmail={localStorage.getItem("userEmail") || ""}
              />
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <BookingHub />
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-6">
              <AdminImageManager />
              <ImageUploadManager
                allowedTypes={["before", "after", "receipt", "damage", "other"]}
                maxFileSize={10}
                currentUser={{
                  id: localStorage.getItem("userEmail"),
                  email: localStorage.getItem("userEmail"),
                  role: userRole,
                }}
              />
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <NotificationService
                userRole={userRole}
                userId={localStorage.getItem("userEmail") || "unknown"}
                onNotificationReceived={(notification) => {
                  console.log("New notification received:", notification);
                }}
              />
            </div>
          )}

          {activeTab === "cms" && (
            <div className="space-y-6">
              <AdminCMS />
            </div>
          )}

          {activeTab === "push-notifications" && (
            <div className="space-y-6">
              <AdminPushNotifications />
            </div>
          )}

          {activeTab === "gamification" && (
            <div>
              <AdminGamification />
            </div>
          )}

          {activeTab === "subscription-approval" && (
            <div>
              <AdminSubscriptionApproval />
            </div>
          )}

          {activeTab === "active-subscriptions" && (
            <div className="space-y-6">
              <ActiveSubscriptionsManager />
            </div>
          )}

          {activeTab === "booking" && (
            <div>
              <AdminBookingSettings />
            </div>
          )}

          {activeTab === "pos" && (
            <div className="space-y-6">
              <POS />
            </div>
          )}

          {activeTab === "inventory" && <EnhancedInventoryManagement />}

          {activeTab === "user-management" && (
            <div className="space-y-6">
              <AdminUserManagement />
            </div>
          )}

          {activeTab === "crew" && (
            <div className="space-y-6">
              <AdminCrewManagement />
            </div>
          )}

          {activeTab === "database" && (
            <div className="space-y-6">
              <NeonDatabaseSetup />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <AdminSettings />
            </div>
          )}

          {activeTab === "customers" && (
            <div className="space-y-6">
              <CustomerHub />
            </div>
          )}

          {activeTab === "sales" && (
            <div className="space-y-6">
              <SalesTransactions />
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      <Dialog
        open={isEditCustomerModalOpen}
        onOpenChange={setIsEditCustomerModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Edit Customer
            </DialogTitle>
            <DialogDescription>
              Update customer information and details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCustomerName">Full Name *</Label>
                <Input
                  id="editCustomerName"
                  value={editCustomerForm.name}
                  onChange={(e) =>
                    setEditCustomerForm({
                      ...editCustomerForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., John Dela Cruz"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCustomerEmail">Email *</Label>
                <Input
                  id="editCustomerEmail"
                  type="email"
                  value={editCustomerForm.email}
                  onChange={(e) =>
                    setEditCustomerForm({
                      ...editCustomerForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="e.g., john@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCustomerPhone">Phone Number</Label>
                <Input
                  id="editCustomerPhone"
                  value={editCustomerForm.phone}
                  onChange={(e) =>
                    setEditCustomerForm({
                      ...editCustomerForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="e.g., +63 123 456 7890"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCustomerMembership">Membership Type</Label>
                <Select
                  value={editCustomerForm.membershipType}
                  onValueChange={(value) =>
                    setEditCustomerForm({
                      ...editCustomerForm,
                      membershipType: value,
                    })
                  }
                >
                  <SelectTrigger id="editCustomerMembership" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="VIP Silver">VIP Silver</SelectItem>
                    <SelectItem value="VIP Gold">VIP Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCustomerCar">Vehicle Model</Label>
                <Input
                  id="editCustomerCar"
                  value={editCustomerForm.carUnit}
                  onChange={(e) =>
                    setEditCustomerForm({
                      ...editCustomerForm,
                      carUnit: e.target.value,
                    })
                  }
                  placeholder="e.g., Toyota Vios"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editCustomerPlate">Plate Number</Label>
                <Input
                  id="editCustomerPlate"
                  value={editCustomerForm.plateNumber}
                  onChange={(e) =>
                    setEditCustomerForm({
                      ...editCustomerForm,
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
              onClick={() => setIsEditCustomerModalOpen(false)}
              className="glass"
            >
              Cancel
            </Button>
            <Button
              className="btn-futuristic font-bold"
              onClick={handleSaveEditedCustomer}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
