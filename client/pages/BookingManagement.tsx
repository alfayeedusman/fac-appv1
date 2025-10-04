import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import StickyHeader from "@/components/StickyHeader";
import BookingCard from "@/components/BookingCard";
import { neonDbClient } from "@/services/neonDatabaseService";
import type { Booking } from "@/services/neonDatabaseService";

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      if (!userId || !userEmail) {
        console.warn("No user logged in");
        setBookings([]);
        return;
      }

      console.log(
        "📥 Fetching bookings for user:",
        userEmail,
        "userId:",
        userId,
      );
      const result = await neonDbClient.getBookings({ userId });

      if (result.success && result.bookings) {
        console.log(
          "✅ Loaded",
          result.bookings.length,
          "real bookings from database",
        );
        setBookings(result.bookings);
      } else {
        console.warn("⚠️ No bookings found or fetch failed");
        setBookings([]);
      }
    } catch (error) {
      console.error("❌ Error loading bookings:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixBookingUserIds = async () => {
    if (
      !confirm(
        "This will fix bookings that have email addresses in the userId field. Continue?",
      )
    ) {
      return;
    }

    try {
      console.log("🔧 Running booking userId fix...");
      const result = await neonDbClient.fixBookingUserIds();

      if (result.success) {
        alert(
          `Fixed ${result.fixed} out of ${result.total} bookings!${result.errors ? "\n\nErrors: " + result.errors.join("\n") : ""}`,
        );
        // Reload bookings
        loadBookings();
      } else {
        alert("Failed to fix bookings");
      }
    } catch (error) {
      console.error("Error fixing bookings:", error);
      alert("Error fixing bookings: " + error);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.confirmationCode &&
            booking.confirmationCode
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          booking.branch.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "rating":
          return (b.customerRating || 0) - (a.customerRating || 0);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const getStatusStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };

    const averageRating =
      bookings.filter((b) => b.customerRating).length > 0
        ? bookings
            .filter((b) => b.customerRating)
            .reduce((sum, b) => sum + (b.customerRating || 0), 0) /
          bookings.filter((b) => b.customerRating).length
        : 0;

    return { ...stats, averageRating };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden pb-20">
      <StickyHeader showBack={true} />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-2xl animate-float"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in-up">
          <Link to="/dashboard" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full glass hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="gradient-primary p-3 rounded-xl ">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">
                My{" "}
                <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                  Bookings
                </span>
              </h1>
              <p className="text-muted-foreground font-medium">
                Track your service history and status
              </p>
            </div>
          </div>
        </div>

        {/* Admin Fix Button */}
        {(localStorage.getItem("userRole") === "admin" ||
          localStorage.getItem("userRole") === "superadmin") && (
          <div className="mb-4">
            <Button
              onClick={handleFixBookingUserIds}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🔧 Fix Booking User IDs (Admin)
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up animate-delay-100">
          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.total}
              </p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.completed}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.pending + stats.confirmed}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 text-center">
              <div className="bg-fac-orange-100 dark:bg-fac-orange-900/30 p-3 rounded-lg w-fit mx-auto mb-2">
                <Star className="h-6 w-6 text-fac-orange-600 dark:text-fac-orange-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {stats.averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass border-border mb-8 animate-fade-in-up animate-delay-200">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, service, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="date">Service Date</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* New Booking Button */}
        <div className="mb-8 animate-fade-in-up animate-delay-300">
          <Link to="/booking">
            <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-4 rounded-xl">
              <Plus className="h-5 w-5 mr-2" />
              Book New Service
            </Button>
          </Link>
        </div>

        {/* Bookings List */}
        <div className="space-y-6 animate-fade-in-up animate-delay-400">
          {isLoading ? (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center">
                <div className="bg-muted/30 p-6 rounded-full w-fit mx-auto mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fac-orange-500"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Loading your bookings...
                </h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch your booking history
                </p>
              </CardContent>
            </Card>
          ) : filteredBookings.length === 0 ? (
            <Card className="glass border-border">
              <CardContent className="p-8 text-center">
                <div className="bg-muted/30 p-6 rounded-full w-fit mx-auto mb-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No bookings found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "You haven't made any bookings yet. Book your first service now!"}
                </p>
                <Link to="/booking">
                  <Button className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white">
                    <Plus className="h-5 w-5 mr-2" />
                    Make Your First Booking
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdate={loadBookings}
              />
            ))
          )}
        </div>

        {/* Summary Info */}
        {filteredBookings.length > 0 && (
          <div className="text-center mt-8 animate-fade-in-up animate-delay-500">
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBookings.length} of {bookings.length} bookings
                {statusFilter !== "all" && ` • Status: ${statusFilter}`}
                {searchTerm && ` • Search: "${searchTerm}"`}
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
