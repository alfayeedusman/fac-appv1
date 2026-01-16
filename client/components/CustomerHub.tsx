import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
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
} from "lucide-react";
import { neonDbClient } from "@/services/neonDatabaseService";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

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
}

export default function CustomerHub() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSubscription, setFilterSubscription] = useState<string>("all");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "spent" | "bookings" | "loyalty">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, filterStatus, filterSubscription, sortBy]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      
      const result = await neonDbClient.getCustomers();
      
      if (result.success && result.users) {
        const enrichedCustomers = await Promise.all(
          result.users.map(async (user: any) => {
            const bookingStats = await getCustomerBookingStats(user.id);
            
            return {
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
            };
          })
        );
        
        setCustomers(enrichedCustomers);
        console.log("✅ Customers loaded:", enrichedCustomers);
      } else {
        console.warn("Failed to load customers:", result);
        toast({
          title: "Error",
          description: "Failed to load customers from database",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomerBookingStats = async (customerId: string) => {
    try {
      const result = await neonDbClient.getAllBookings?.() || [];
      
      const customerBookings = Array.isArray(result)
        ? result.filter((b: any) => b.userId === customerId || b.customerId === customerId)
        : [];
      
      const totalBookings = customerBookings.length;
      const totalSpent = customerBookings.reduce(
        (sum: number, b: any) => sum + (parseFloat(b.totalPrice) || 0),
        0
      );
      
      const sortedBookings = customerBookings.sort(
        (a: any, b: any) =>
          new Date(b.bookingDate || b.createdAt).getTime() -
          new Date(a.bookingDate || a.createdAt).getTime()
      );
      
      const lastBooking = sortedBookings[0];
      
      return {
        totalBookings,
        totalSpent,
        lastBooking: lastBooking ? lastBooking.bookingDate || lastBooking.createdAt : null,
      };
    } catch (error) {
      console.error("Error getting booking stats:", error);
      return { totalBookings: 0, totalSpent: 0, lastBooking: null };
    }
  };

  const calculateLoyaltyScore = (user: any, stats: any) => {
    let score = 0;
    
    const bookingScore = Math.min(stats.totalBookings * 4, 40);
    score += bookingScore;
    
    const spendingScore = Math.min(stats.totalSpent / 100, 30);
    score += spendingScore;
    
    const subscriptionBonus =
      user.subscriptionStatus === "premium" ? 20 :
      user.subscriptionStatus === "basic" ? 10 :
      user.subscriptionStatus === "vip" ? 20 : 0;
    score += subscriptionBonus;
    
    if (user.createdAt) {
      const accountAge = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const ageScore = Math.min(accountAge / 30, 10);
      score += ageScore;
    }
    
    return Math.round(score);
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
          c.carPlateNumber.toLowerCase().includes(term)
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }
    
    if (filterSubscription !== "all") {
      filtered = filtered.filter((c) => c.subscriptionStatus === filterSubscription);
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
    if (score >= 80) return { tier: "Platinum", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (score >= 60) return { tier: "Gold", color: "text-yellow-500", bgColor: "bg-yellow-50" };
    if (score >= 40) return { tier: "Silver", color: "text-gray-500", bgColor: "bg-gray-50" };
    if (score >= 20) return { tier: "Bronze", color: "text-orange-600", bgColor: "bg-orange-50" };
    return { tier: "New", color: "text-blue-600", bgColor: "bg-blue-50" };
  };

  const getLoyaltyProgress = (score: number) => {
    return Math.min((score / 100) * 100, 100);
  };

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Customer Hub</h2>
          <p className="text-muted-foreground mt-1">
            Manage and track customer data with real-time statistics
          </p>
        </div>
        <Button
          onClick={loadCustomers}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Customers</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.totalCustomers}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active Customers</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.activeCustomers}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  ₱{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Average Spent</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  ₱{stats.avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-lg">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </div>
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

            {/* Filters & Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Subscription</label>
                <select
                  value={filterSubscription}
                  onChange={(e) => setFilterSubscription(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="spent">Total Spent (High to Low)</option>
                  <option value="bookings">Bookings (Most)</option>
                  <option value="loyalty">Loyalty Score (High)</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="flex-1"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex-1"
                  >
                    List
                  </Button>
                </div>
              </div>

              {(searchTerm || filterStatus !== "all" || filterSubscription !== "all") && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterSubscription("all");
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground pt-2 border-t">
              Showing <span className="font-semibold text-foreground">{filteredCustomers.length}</span> of{" "}
              <span className="font-semibold text-foreground">{customers.length}</span> customers
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
              <p className="text-muted-foreground text-lg">Loading customer data...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No customers found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => {
                const loyalty = getLoyaltyTier(customer.loyaltyScore);
                const loyaltyProgress = getLoyaltyProgress(customer.loyaltyScore);

                return (
                  <Card
                    key={customer.id}
                    className="hover:shadow-lg transition-all cursor-pointer border-border overflow-hidden"
                    onClick={() =>
                      setExpandedCustomer(
                        expandedCustomer === customer.id ? null : customer.id
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
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                        <Badge className={`capitalize border ${getStatusBadgeColor(customer.status)}`}>
                          {customer.status}
                        </Badge>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {customer.totalBookings}
                          </p>
                          <p className="text-xs text-muted-foreground">Bookings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            ₱{customer.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${loyalty.color}`}>
                            {customer.loyaltyScore}
                          </p>
                          <p className="text-xs text-muted-foreground">Loyalty Pts</p>
                        </div>
                      </div>

                      {/* Loyalty Tier */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-semibold ${loyalty.color}`}>
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
                        <Badge className={`capitalize border w-full justify-center ${getSubscriptionBadgeColor(customer.subscriptionStatus)}`}>
                          {customer.subscriptionStatus}
                        </Badge>
                      </div>

                      {/* Expandable Details */}
                      <div
                        className={`overflow-hidden transition-all ${
                          expandedCustomer === customer.id ? "max-h-96" : "max-h-0"
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
                                  {format(new Date(customer.lastBooking), "MMM dd, yyyy")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ({formatDistanceToNow(new Date(customer.lastBooking), { addSuffix: true })})
                                </p>
                              </div>
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
          )}
        </div>
      )}

      {/* Customers List View */}
      {viewMode === "list" && (
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mr-3" />
                <p className="text-muted-foreground text-lg">Loading customer data...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">No customers found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((customer) => {
                  const loyalty = getLoyaltyTier(customer.loyaltyScore);

                  return (
                    <div
                      key={customer.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left: Name & Contact */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {customer.fullName}
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {customer.contactNumber}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Vehicle & Subscription */}
                        <div className="flex flex-col gap-2 md:text-center">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium">{customer.carUnit}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.carPlateNumber}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`capitalize border w-fit ${getSubscriptionBadgeColor(
                              customer.subscriptionStatus
                            )}`}
                          >
                            {customer.subscriptionStatus}
                          </Badge>
                        </div>

                        {/* Right: Stats */}
                        <div className="grid grid-cols-3 gap-4 md:gap-6">
                          <div className="text-center">
                            <p className="text-lg font-bold text-orange-600">
                              {customer.totalBookings}
                            </p>
                            <p className="text-xs text-muted-foreground">Bookings</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">
                              ₱{customer.totalSpent.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">Spent</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-lg font-bold ${loyalty.color}`}>
                              {loyalty.tier}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {customer.loyaltyScore} pts
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={`capitalize border ${getStatusBadgeColor(
                            customer.status
                          )}`}
                        >
                          {customer.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
