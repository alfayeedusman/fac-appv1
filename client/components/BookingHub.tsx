import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Clock,
  MapPin,
  DollarSign,
  User,
  Car,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  X,
  Edit2,
  Truck,
  DropletIcon,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { neonDbClient } from "@/services/neonDatabaseService";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface BookingData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleModel: string;
  plateNumber: string;
  bookingDate: string;
  serviceType: string;
  totalPrice: number;
  paymentMethod: string;
  status: "pending" | "waitinglist" | "onbay" | "washing" | "finish" | "paid" | "completed";
  paymentStatus?: "pending" | "completed" | "failed";
  confirmationCode?: string;
  type: "booking" | "walkin" | "guest";
  notes?: string;
  rawBooking?: any;
}

type StatusType = "pending" | "waitinglist" | "onbay" | "washing" | "finish" | "paid" | "completed" | "all";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Confirmation",
  waitinglist: "Waiting List",
  onbay: "On the Bay",
  washing: "Washing in Progress",
  finish: "Washing Finished",
  paid: "Payment Complete",
  completed: "Booking Complete",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800 border-blue-300",
  waitinglist: "bg-yellow-100 text-yellow-800 border-yellow-300",
  onbay: "bg-purple-100 text-purple-800 border-purple-300",
  washing: "bg-cyan-100 text-cyan-800 border-cyan-300",
  finish: "bg-orange-100 text-orange-800 border-orange-300",
  paid: "bg-green-100 text-green-800 border-green-300",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const STATUS_ORDER = [
  "pending",
  "waitinglist",
  "onbay",
  "washing",
  "finish",
  "paid",
  "completed",
];

export default function BookingHub() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "booking" | "walkin" | "guest">("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<BookingData["status"]>("pending");

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const response = await neonDbClient.getBookings({
        userRole: localStorage.getItem("userRole") || "user",
        userEmail: localStorage.getItem("userEmail") || "",
      });
      const result = response?.bookings || [];

      if (Array.isArray(result)) {
        const formattedBookings = result.map((booking: any) => {
          // Handle guest bookings with guestInfo
          const isGuest = booking.type === 'guest';
          const guestInfo = isGuest && booking.guestInfo ? booking.guestInfo : null;

          const customerName = guestInfo
            ? `${guestInfo.firstName || ''} ${guestInfo.lastName || ''}`.trim()
            : booking.customerName || booking.fullName || "Unknown";

          const customerEmail = guestInfo
            ? guestInfo.email
            : booking.customerEmail || booking.email || "";

          const customerPhone = guestInfo
            ? guestInfo.phone
            : booking.customerPhone || booking.phone || "";

          return {
            id: booking.id || booking.bookingId || `booking-${Date.now()}`,
            customerName,
            customerEmail,
            customerPhone,
            vehicleModel: booking.vehicleModel || booking.carUnit || "-",
            plateNumber: booking.plateNumber || booking.carPlateNumber || "-",
            bookingDate: booking.bookingDate || booking.createdAt || new Date().toISOString(),
            serviceType: booking.serviceType || booking.service || "Car Wash",
            totalPrice: parseFloat(booking.totalPrice || booking.price || 0),
            paymentMethod: booking.paymentMethod || "cash",
            status: booking.status || "pending",
            paymentStatus: booking.paymentStatus || "pending", // Add payment status for display
            type: booking.type || "booking",
            confirmationCode: booking.confirmationCode || "",
            notes: booking.notes || "",
            rawBooking: booking, // Keep raw booking data for details
          };
        });

        setBookings(formattedBookings);
        console.log("✅ Bookings loaded:", formattedBookings.length);
      } else {
        console.warn("No bookings found");
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(term) ||
          b.customerEmail.toLowerCase().includes(term) ||
          b.customerPhone.toLowerCase().includes(term) ||
          b.plateNumber.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Type filter (booking vs walkin)
    if (typeFilter !== "all") {
      filtered = filtered.filter((b) => b.type === typeFilter);
    }

    // Sort by status order (ascending through the workflow)
    filtered.sort((a, b) => {
      const aIndex = STATUS_ORDER.indexOf(a.status);
      const bIndex = STATUS_ORDER.indexOf(b.status);
      return aIndex - bIndex;
    });

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = (booking: BookingData) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setIsStatusDialogOpen(true);
  };

  const handleSaveStatusUpdate = () => {
    if (!selectedBooking) return;

    const updatedBookings = bookings.map((b) =>
      b.id === selectedBooking.id ? { ...b, status: newStatus } : b
    );

    setBookings(updatedBookings);
    setIsStatusDialogOpen(false);
    setSelectedBooking(null);

    toast({
      title: "Success",
      description: `Booking status updated to ${STATUS_LABELS[newStatus]}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "waitinglist":
        return <AlertCircle className="h-4 w-4" />;
      case "onbay":
        return <Truck className="h-4 w-4" />;
      case "washing":
        return <DropletIcon className="h-4 w-4" />;
      case "finish":
        return <CheckCircle className="h-4 w-4" />;
      case "paid":
        return <CreditCard className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Calculate stats
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    completedBookings: bookings.filter((b) => b.status === "completed").length,
    totalSales: bookings
      .filter((b) => b.status === "completed" || b.status === "paid")
      .reduce((sum, b) => sum + b.totalPrice, 0),
    todayBookings: bookings.filter((b) => {
      const bookingDate = new Date(b.bookingDate);
      const today = new Date();
      return (
        bookingDate.toDateString() === today.toDateString()
      );
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Booking Hub</h2>
          <p className="text-muted-foreground mt-1">
            Manage bookings and track washing progress in real-time
          </p>
        </div>
        <Button
          onClick={loadBookings}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {stats.pendingBookings}
                </p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.completedBookings}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  ₱{stats.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-border shadow-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, phone, or plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Type
                </label>
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="walkin">Walk-in</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground pt-2 border-t">
              Showing <span className="font-semibold text-foreground">{filteredBookings.length}</span> of{" "}
              <span className="font-semibold text-foreground">{bookings.length}</span> bookings
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card className="border-border shadow-lg">
        <CardHeader>
          <CardTitle>Bookings & Washing Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-orange-500 mr-3" />
              <p className="text-muted-foreground">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Customer & Vehicle */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">
                            {booking.customerName}
                          </h4>
                          <Badge
                            className={`capitalize border ${
                              booking.type === "walkin"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {booking.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            📧 {booking.customerEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            📱 {booking.customerPhone}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">{booking.vehicleModel}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.plateNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(booking.bookingDate), "MMM dd")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(booking.bookingDate), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center: Status */}
                    <div className="flex flex-col items-center gap-2">
                      <Badge className={`capitalize border px-3 py-1 ${STATUS_COLORS[booking.status]}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking)}
                        className="w-full"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Update Status
                      </Button>
                    </div>

                    {/* Right: Price & Actions */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        {booking.serviceType}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ₱{booking.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {booking.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Update Booking Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedBooking?.customerName}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {selectedBooking.vehicleModel} ({selectedBooking.plateNumber})
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Current Status: <span className="font-semibold">{STATUS_LABELS[selectedBooking.status]}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="statusSelect" className="mb-2 block text-sm font-medium">
                  New Status
                </Label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger id="statusSelect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(status)}</span>
                          {STATUS_LABELS[status]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Updating to "completed" or "paid" status will add this booking to today's sales total.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStatusUpdate}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
