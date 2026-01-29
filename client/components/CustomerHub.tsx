import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Car,
  Star,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Zap,
  Crown,
  Gift,
  TrendingUpIcon,
  AlertCircle,
} from "lucide-react";
import { neonDbClient } from "@/services/neonDatabaseService";
import { toast } from "@/hooks/use-toast";
import { log, warn, error as logError } from "@/utils/logger";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { notificationSoundService } from "@/services/notificationSoundService";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import SubscriptionDetailsCard from "@/components/SubscriptionDetailsCard";

interface CustomerData {
  id: string;
  fullName: string;
  email: string;
  contactNumber?: string;
  carUnit?: string;
  carPlateNumber?: string;
  subscriptionStatus: string;
  createdAt?: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking?: string;
  status: "active" | "inactive";
  loyaltyScore: number;
  lifecycle?: "new" | "active" | "subscribed" | "vip" | "at-risk" | "upgraded";
}

type LifecycleType =
  | "all"
  | "new"
  | "active"
  | "subscribed"
  | "vip"
  | "at-risk"
  | "upgraded";

const LIFECYCLE_LABELS: Record<string, string> = {
  new: "New Customer",
  active: "Active",
  subscribed: "Subscribed",
  vip: "VIP Member",
  "at-risk": "At Risk",
  upgraded: "Recently Upgraded",
};

const LIFECYCLE_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-300",
  active: "bg-green-100 text-green-800 border-green-300",
  subscribed: "bg-purple-100 text-purple-800 border-purple-300",
  vip: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "at-risk": "bg-red-100 text-red-800 border-red-300",
  upgraded: "bg-orange-100 text-orange-800 border-orange-300",
};

export default function CustomerHub() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>(
    [],
  );
  const [displayedCustomers, setDisplayedCustomers] = useState<CustomerData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSubscription, setFilterSubscription] = useState<string>("all");
  const [filterLifecycle, setFilterLifecycle] = useState<LifecycleType>("all");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "spent" | "bookings" | "loyalty"
  >("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(
    null,
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");

  // Open subscription modal with proper initialization
  const openUpgradeModal = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    // Determine next upgrade plan based on current subscription
    let nextPlan = "premium";
    if (customer.subscriptionStatus === "free") {
      nextPlan = "basic";
    } else if (customer.subscriptionStatus === "basic") {
      nextPlan = "premium";
    } else if (customer.subscriptionStatus === "premium") {
      nextPlan = "vip";
    } else if (customer.subscriptionStatus === "vip") {
      nextPlan = "vip"; // Already at highest
    }
    setSelectedPlan(nextPlan);
    setIsSubscriptionModalOpen(true);
  };

  const PAGINATION_OPTIONS = [5, 10, 25, 50, 100];

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [
    customers,
    searchTerm,
    filterStatus,
    filterSubscription,
    filterLifecycle,
    sortBy,
  ]);

  useEffect(() => {
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex =
      itemsPerPage === -1 ? undefined : startIndex + itemsPerPage;
    setDisplayedCustomers(filteredCustomers.slice(startIndex, endIndex));
  }, [filteredCustomers, itemsPerPage, currentPage]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);

      // Fetch customers AND bookings in parallel (only once each!)
      const [customersResult, bookingsResult] = await Promise.all([
        neonDbClient.getCustomers(),
        neonDbClient.getBookings({
          userRole: localStorage.getItem("userRole") || "admin",
          userEmail: localStorage.getItem("userEmail") || "",
        }),
      ]);

      if (customersResult.success && customersResult.users) {
        // Build a map of customer bookings for O(1) lookup
        const bookingsByCustomerId = new Map<string, any[]>();
        const allBookings = bookingsResult?.bookings || [];

        allBookings.forEach((booking: any) => {
          const customerId = booking.userId || booking.customerId;
          if (customerId) {
            if (!bookingsByCustomerId.has(customerId)) {
              bookingsByCustomerId.set(customerId, []);
            }
            bookingsByCustomerId.get(customerId)!.push(booking);
          }
        });

        // Now compute stats for all customers efficiently
        const enrichedCustomers = customersResult.users.map((user: any) => {
          const customerBookings = bookingsByCustomerId.get(user.id) || [];
          const bookingStats = computeBookingStats(customerBookings);

          const customerData: CustomerData = {
            id: user.id,
            fullName: user.fullName || "Unknown",
            email: user.email,
            contactNumber: user.contactNumber || "-",
            carUnit: user.carUnit || "-",
            carPlateNumber: user.carPlateNumber || "-",
            subscriptionStatus: user.subscriptionStatus || "free",
            createdAt: user.createdAt,
            totalBookings: bookingStats.totalBookings,
            totalSpent: bookingStats.totalSpent,
            lastBooking: bookingStats.lastBooking,
            status: user.status || "active",
            loyaltyScore: calculateLoyaltyScore(user, bookingStats),
            lifecycle: calculateLifecycle(user, bookingStats),
          };
          return customerData;
        });

        setCustomers(enrichedCustomers);
        log("✅ Customers loaded:", enrichedCustomers.length);
      } else {
        warn("Failed to load customers:", customersResult);
        toast({
          title: "Error",
          description: "Failed to load customers from database",
          variant: "destructive",
        });
      }
    } catch (error) {
      logError("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compute booking stats from a pre-filtered array (no more DB calls)
  const computeBookingStats = (customerBookings: any[]) => {
    const totalBookings = customerBookings.length;
    const totalSpent = customerBookings.reduce(
      (sum: number, b: any) => sum + (parseFloat(b.totalPrice) || 0),
      0,
    );

    const sortedBookings = customerBookings.sort(
      (a: any, b: any) =>
        new Date(b.bookingDate || b.createdAt).getTime() -
        new Date(a.bookingDate || a.createdAt).getTime(),
    );

    const lastBooking = sortedBookings[0];

    return {
      totalBookings,
      totalSpent,
      lastBooking: lastBooking
        ? lastBooking.bookingDate || lastBooking.createdAt
        : null,
    };
  };

  const calculateLoyaltyScore = (user: any, stats: any) => {
    let score = 0;

    const bookingScore = Math.min(stats.totalBookings * 4, 40);
    score += bookingScore;

    const spendingScore = Math.min(stats.totalSpent / 100, 30);
    score += spendingScore;

    const subscriptionBonus =
      user.subscriptionStatus === "premium"
        ? 20
        : user.subscriptionStatus === "basic"
          ? 10
          : user.subscriptionStatus === "vip"
            ? 20
            : 0;
    score += subscriptionBonus;

    if (user.createdAt) {
      const accountAge = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const ageScore = Math.min(accountAge / 30, 10);
      score += ageScore;
    }

    return Math.round(score);
  };

  const calculateLifecycle = (user: any, stats: any): LifecycleType => {
    if (!user.createdAt) return "active";

    const daysSinceCreated = differenceInDays(
      new Date(),
      new Date(user.createdAt),
    );

    // New customer (within 30 days)
    if (daysSinceCreated <= 30) return "new";

    // VIP
    if (
      user.subscriptionStatus === "vip" ||
      user.subscriptionStatus === "premium"
    ) {
      return "vip";
    }

    // Subscribed (has active subscription)
    if (user.subscriptionStatus && user.subscriptionStatus !== "free") {
      return "subscribed";
    }

    // Recently Upgraded (has bookings recently)
    if (stats.lastBooking) {
      const daysSinceLastBooking = differenceInDays(
        new Date(),
        new Date(stats.lastBooking),
      );
      if (daysSinceLastBooking <= 7 && stats.totalBookings >= 3) {
        return "upgraded";
      }
    }

    // At Risk (inactive for 60+ days)
    if (stats.lastBooking) {
      const daysSinceLastBooking = differenceInDays(
        new Date(),
        new Date(stats.lastBooking),
      );
      if (daysSinceLastBooking > 60) {
        return "at-risk";
      }
    }

    return "active";
  };

  const filterAndSortCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.contactNumber.toLowerCase().includes(term) ||
          c.carPlateNumber.toLowerCase().includes(term),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    if (filterSubscription !== "all") {
      filtered = filtered.filter(
        (c) => c.subscriptionStatus === filterSubscription,
      );
    }

    if (filterLifecycle !== "all") {
      filtered = filtered.filter((c) => c.lifecycle === filterLifecycle);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "spent":
          return b.totalSpent - a.totalSpent;
        case "bookings":
          return b.totalBookings - a.totalBookings;
        case "loyalty":
          return b.loyaltyScore - a.loyaltyScore;
        case "name":
        default:
          return a.fullName.localeCompare(b.fullName);
      }
    });

    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "vip":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";
  };

  const getLoyaltyTier = (score: number) => {
    if (score >= 80)
      return {
        tier: "Platinum",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    if (score >= 60)
      return {
        tier: "Gold",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    if (score >= 40)
      return { tier: "Silver", color: "text-gray-500", bgColor: "bg-gray-50" };
    if (score >= 20)
      return {
        tier: "Bronze",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    return { tier: "New", color: "text-blue-600", bgColor: "bg-blue-50" };
  };

  const getLoyaltyProgress = (score: number) => {
    return Math.min((score / 100) * 100, 100);
  };

  const handleSubscriptionUpgrade = async () => {
    if (!selectedCustomer) return;

    // Validate that we're actually upgrading
    if (selectedPlan === selectedCustomer.subscriptionStatus) {
      toast({
        title: "ℹ️ No Change",
        description: `Customer is already on the ${selectedPlan} plan`,
      });
      return;
    }

    try {
      // Update the subscription in the database via the API
      log("🔄 Upgrading subscription for", selectedCustomer.email, "to", selectedPlan);

      const response = await fetch(`/api/neon/auth/update-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedCustomer.id,
          newStatus: selectedPlan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update subscription");
      }

      // Play notification sound
      notificationSoundService.playNotificationSound("upgrade");

      // Show success toast
      toast({
        title: "✨ Upgrade Successful!",
        description: `${selectedCustomer.fullName} upgraded to ${selectedPlan} plan! 🔔`,
      });

      // Update customer in list
      const updatedCustomers = customers.map((c) =>
        c.id === selectedCustomer.id
          ? { ...c, subscriptionStatus: selectedPlan, lifecycle: "upgraded" }
          : c,
      );
      setCustomers(updatedCustomers);
      setIsSubscriptionModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      logError("❌ Subscription upgrade failed:", error instanceof Error ? error.message : String(error));
      toast({
        title: "❌ Upgrade Failed",
        description: error instanceof Error ? error.message : "Failed to upgrade subscription. Please try again.",
      });
    }
  };

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    newCustomers: customers.filter((c) => c.lifecycle === "new").length,
    vipCustomers: customers.filter((c) => c.lifecycle === "vip").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
        : 0,
  };

  const totalPages = Math.ceil(
    filteredCustomers.length /
      (itemsPerPage === -1 ? filteredCustomers.length : itemsPerPage),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Customer Hub</h2>
          <p className="text-muted-foreground mt-1">
            Manage customers, track subscriptions, and monitor lifecycle
          </p>
        </div>
        <Button
          onClick={loadCustomers}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 font-medium">Total</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {stats.totalCustomers}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-xs text-green-700 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {stats.activeCustomers}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 font-medium">New</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {stats.newCustomers}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-700 font-medium">VIP</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {stats.vipCustomers}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-xs text-purple-700 font-medium">Revenue</p>
            <p className="text-lg font-bold text-purple-900 mt-1">
              ₱{(stats.totalRevenue / 1000).toFixed(0)}k
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-xs text-orange-700 font-medium">Avg Spent</p>
            <p className="text-lg font-bold text-orange-900 mt-1">
              ₱
              {stats.avgSpent.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border shadow-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, phone, or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Subscription
                </label>
                <Select
                  value={filterSubscription}
                  onValueChange={setFilterSubscription}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Lifecycle
                </label>
                <Select
                  value={filterLifecycle}
                  onValueChange={(value: any) => setFilterLifecycle(value)}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="new">New Customers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="upgraded">Recently Upgraded</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="spent">Total Spent</SelectItem>
                    <SelectItem value="bookings">Bookings</SelectItem>
                    <SelectItem value="loyalty">Loyalty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Show
                </label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) =>
                    setItemsPerPage(value === "all" ? -1 : parseInt(value))
                  }
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGINATION_OPTIONS.map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} items
                      </SelectItem>
                    ))}
                    <SelectItem value="all">All items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm ||
                filterStatus !== "all" ||
                filterSubscription !== "all" ||
                filterLifecycle !== "all") && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterSubscription("all");
                      setFilterLifecycle("all");
                    }}
                    className="w-full h-10"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground pt-2 border-t">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {displayedCustomers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {filteredCustomers.length}
              </span>{" "}
              (Total: <span className="font-semibold">{customers.length}</span>)
              {totalPages > 1 && (
                <span className="ml-2">
                  • Page{" "}
                  <span className="font-semibold">
                    {currentPage} of {totalPages}
                  </span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid View */}
      {viewMode === "grid" && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mr-3" />
              <p className="text-muted-foreground text-lg">
                Loading customer data...
              </p>
            </div>
          ) : displayedCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                No customers found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedCustomers.map((customer) => {
                  const loyalty = getLoyaltyTier(customer.loyaltyScore);
                  const loyaltyProgress = getLoyaltyProgress(
                    customer.loyaltyScore,
                  );

                  return (
                    <Card
                      key={customer.id}
                      className="hover:shadow-lg transition-all cursor-pointer border-border overflow-hidden"
                      onClick={() =>
                        setExpandedCustomer(
                          expandedCustomer === customer.id ? null : customer.id,
                        )
                      }
                    >
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground">
                              {customer.fullName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge
                              className={`capitalize border text-xs ${getStatusBadgeColor(customer.status)}`}
                            >
                              {customer.status}
                            </Badge>
                            {customer.lifecycle && (
                              <Badge
                                className={`capitalize border text-xs ${LIFECYCLE_COLORS[customer.lifecycle]}`}
                              >
                                <span className="flex items-center gap-1">
                                  {customer.lifecycle === "new" && (
                                    <Zap className="h-3 w-3" />
                                  )}
                                  {customer.lifecycle === "vip" && (
                                    <Crown className="h-3 w-3" />
                                  )}
                                  {customer.lifecycle === "upgraded" && (
                                    <TrendingUpIcon className="h-3 w-3" />
                                  )}
                                  {customer.lifecycle === "at-risk" && (
                                    <AlertCircle className="h-3 w-3" />
                                  )}
                                  {LIFECYCLE_LABELS[customer.lifecycle]}
                                </span>
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                              {customer.totalBookings}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Bookings
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              ₱
                              {customer.totalSpent.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Spent
                            </p>
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-2xl font-bold ${loyalty.color}`}
                            >
                              {customer.loyaltyScore}
                            </p>
                            <p className="text-xs text-muted-foreground">Pts</p>
                          </div>
                        </div>

                        {/* Loyalty Tier */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p
                              className={`text-sm font-semibold ${loyalty.color}`}
                            >
                              {loyalty.tier} Member
                            </p>
                            <Star className={`h-4 w-4 ${loyalty.color}`} />
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                loyalty.tier === "Platinum"
                                  ? "bg-yellow-500"
                                  : loyalty.tier === "Gold"
                                    ? "bg-yellow-400"
                                    : loyalty.tier === "Silver"
                                      ? "bg-gray-400"
                                      : loyalty.tier === "Bronze"
                                        ? "bg-orange-400"
                                        : "bg-blue-400"
                              }`}
                              style={{ width: `${loyaltyProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Subscription Badge */}
                        <div className="mb-4">
                          <SubscriptionStatusBadge
                            subscriptionType={
                              customer.subscriptionStatus as any
                            }
                            showIcon={true}
                            size="md"
                          />
                        </div>

                        {/* Action Button */}
                        {customer.subscriptionStatus === "free" && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(customer);
                              setIsSubscriptionModalOpen(true);
                            }}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-sm"
                          >
                            <Gift className="h-3 w-3 mr-1" />
                            Upgrade to Plan
                          </Button>
                        )}

                        {/* Expandable Details */}
                        <div
                          className={`overflow-hidden transition-all ${
                            expandedCustomer === customer.id
                              ? "max-h-full"
                              : "max-h-0"
                          }`}
                        >
                          <div className="pt-4 border-t space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{customer.contactNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p>{customer.carUnit}</p>
                                <p className="text-xs text-muted-foreground">
                                  {customer.carPlateNumber}
                                </p>
                              </div>
                            </div>
                            {customer.lastBooking && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs">
                                    {format(
                                      new Date(customer.lastBooking),
                                      "MMM dd, yyyy",
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    (
                                    {formatDistanceToNow(
                                      new Date(customer.lastBooking),
                                      {
                                        addSuffix: true,
                                      },
                                    )}
                                    )
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Subscription Details */}
                            {customer.subscriptionStatus !== "free" && (
                              <div className="pt-3 border-t">
                                <p className="text-xs font-semibold mb-2 text-muted-foreground">
                                  📅 Subscription Info
                                </p>
                                <SubscriptionDetailsCard
                                  customerId={customer.id}
                                  customerName={customer.fullName}
                                  subscriptionStatus={
                                    customer.subscriptionStatus as any
                                  }
                                  compact={true}
                                  onManageClick={() => {
                                    setSelectedCustomer(customer);
                                    setIsSubscriptionModalOpen(true);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expand indicator */}
                        <div className="flex justify-center mt-3 pt-3 border-t">
                          {expandedCustomer === customer.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subscription/Upgrade Modal */}
      <Dialog
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              ✨ Upgrade {selectedCustomer?.fullName}
            </DialogTitle>
            <DialogDescription>
              Choose a subscription plan to unlock premium features
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">
                  Current Plan:{" "}
                  <span className="capitalize font-bold">
                    {selectedCustomer.subscriptionStatus}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCustomer.totalBookings} bookings • ₱
                  {selectedCustomer.totalSpent.toLocaleString()}
                  spent
                </p>
              </div>

              {/* Plan Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "basic",
                    name: "Basic",
                    price: "₱500/month",
                    features: [
                      "5 free washes/month",
                      "Priority booking",
                      "Email support",
                    ],
                    icon: <TrendingUp className="h-6 w-6" />,
                  },
                  {
                    id: "premium",
                    name: "Premium",
                    price: "₱1,500/month",
                    features: [
                      "Unlimited washes",
                      "VIP lounge access",
                      "Phone support",
                      "Free detailing",
                    ],
                    icon: <Crown className="h-6 w-6" />,
                    popular: true,
                  },
                  {
                    id: "vip",
                    name: "VIP",
                    price: "₱3,000/month",
                    features: [
                      "Everything in Premium",
                      "24/7 concierge",
                      "Free premium detailing",
                      "Priority scheduling",
                    ],
                    icon: <Star className="h-6 w-6 text-yellow-500" />,
                  },
                ].map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${plan.popular ? "ring-2 ring-orange-200" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-foreground">{plan.name}</h4>
                      {plan.popular && (
                        <Badge className="bg-orange-500 text-white">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-bold text-orange-600 mb-3">
                      {plan.price}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="text-green-600 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubscriptionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscriptionUpgrade}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {selectedPlan}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
