import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { neonDbClient } from "@/services/neonDatabaseService";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

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

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filterStatus, filterSubscription]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      
      // Load customers from database
      const result = await neonDbClient.getCustomers();
      
      if (result.success && result.users) {
        // Transform and enrich customer data with booking stats
        const enrichedCustomers = await Promise.all(
          result.users.map(async (user: any) => {
            // Get booking statistics for this customer
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
      // Load all bookings and filter by customer
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
    
    // Booking frequency (max 40 points)
    const bookingScore = Math.min(stats.totalBookings * 4, 40);
    score += bookingScore;
    
    // Spending (max 30 points)
    const spendingScore = Math.min(stats.totalSpent / 100, 30);
    score += spendingScore;
    
    // Subscription level (max 20 points)
    const subscriptionBonus =
      user.subscriptionStatus === "premium" ? 20 :
      user.subscriptionStatus === "basic" ? 10 :
      user.subscriptionStatus === "vip" ? 20 : 0;
    score += subscriptionBonus;
    
    // Account age (max 10 points)
    if (user.createdAt) {
      const accountAge = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const ageScore = Math.min(accountAge / 30, 10);
      score += ageScore;
    }
    
    return Math.round(score);
  };

  const filterCustomers = () => {
    let filtered = [...customers];
    
    // Search filter
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
    
    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }
    
    // Subscription filter
    if (filterSubscription !== "all") {
      filtered = filtered.filter((c) => c.subscriptionStatus === filterSubscription);
    }
    
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
    if (score >= 80) return { tier: "Platinum", color: "text-yellow-600" };
    if (score >= 60) return { tier: "Gold", color: "text-yellow-500" };
    if (score >= 40) return { tier: "Silver", color: "text-gray-500" };
    if (score >= 20) return { tier: "Bronze", color: "text-orange-600" };
    return { tier: "New", color: "text-blue-600" };
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Customer Hub</h2>
          <p className="text-muted-foreground mt-1">
            Real-time customer data tracking with booking history
          </p>
        </div>
        <Button
          onClick={loadCustomers}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh Data"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Customers</p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.totalCustomers}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active Today</p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.activeCustomers}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900">
                  ₱{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Avg Spent</p>
                <p className="text-2xl font-bold text-orange-900">
                  ₱{stats.avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Subscriptions</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
              <p className="ml-2 text-muted-foreground">Loading customer data...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Loyalty</TableHead>
                    <TableHead>Last Booking</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const loyalty = getLoyaltyTier(customer.loyaltyScore);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{customer.fullName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.contactNumber}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{customer.carUnit}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.carPlateNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize border ${getSubscriptionBadgeColor(customer.subscriptionStatus)}`}>
                            {customer.subscriptionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {customer.totalBookings}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₱{customer.totalSpent.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className={`text-sm font-bold ${loyalty.color}`}>
                              {loyalty.tier}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {customer.loyaltyScore} pts
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.lastBooking ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(customer.lastBooking), {
                                addSuffix: true,
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No bookings</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize border ${getStatusBadgeColor(customer.status)}`}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
