import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  Car,
  MapPin,
  CreditCard,
  CheckCircle,
  X,
  AlertTriangle,
  TrendingUp,
  Users,
  Star,
  PhilippinePeso,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { bookingDB, type Booking, getDashboardStats } from "@/utils/databaseSchema";
import { toast } from "@/hooks/use-toast";

interface BookingDashboardProps {
  userRole?: 'admin' | 'superadmin' | 'cashier';
}

export default function BookingDashboard({ userRole = 'admin' }: BookingDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadBookings();
    loadDashboardStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, dateFilter, branchFilter, searchQuery]);

  const loadBookings = () => {
    setLoading(true);
    try {
      const allBookings = bookingDB.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = () => {
    try {
      const stats = getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.date === dateFilter);
    }

    // Branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter(booking => booking.branch === branchFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(query) ||
        booking.confirmationCode.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query) ||
        (booking.guestInfo?.firstName + ' ' + booking.guestInfo?.lastName).toLowerCase().includes(query) ||
        booking.plateNumber?.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const success = bookingDB.updateBookingStatus(bookingId, newStatus);
      if (success) {
        loadBookings();
        loadDashboardStats();
        toast({
          title: "Success",
          description: `Booking status updated to ${newStatus}`,
        });
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportBookings = () => {
    const csvContent = [
      // Header
      ['ID', 'Confirmation Code', 'Customer', 'Service', 'Date', 'Time', 'Branch', 'Status', 'Amount', 'Created At'].join(','),
      // Data
      ...filteredBookings.map(booking => [
        booking.id,
        booking.confirmationCode,
        booking.type === 'guest' 
          ? `${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName}` 
          : booking.userId || 'N/A',
        booking.service,
        booking.date,
        booking.timeSlot,
        booking.branch,
        booking.status,
        `₱${booking.totalPrice}`,
        new Date(booking.createdAt).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PhilippinePeso className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₱{dashboardStats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{dashboardStats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Bookings</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by ID, code, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Branch</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Tumaga Hub">Tumaga Hub</SelectItem>
                  <SelectItem value="Boalan Hub">Boalan Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button onClick={loadBookings} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportBookings} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bookings ({filteredBookings.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found matching your criteria.
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-fac-orange-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Booking Info */}
                      <div className="lg:col-span-8 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">#{booking.confirmationCode}</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">₱{booking.totalPrice.toLocaleString()}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {booking.type === 'guest' 
                                  ? `${booking.guestInfo?.firstName} ${booking.guestInfo?.lastName} (Guest)`
                                  : booking.userId || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.service} - {booking.unitType} ({booking.unitSize})</span>
                            </div>
                            {booking.plateNumber && (
                              <div className="flex items-center space-x-2">
                                <span className="h-4 w-4 text-center text-xs font-bold border rounded">P</span>
                                <span>{booking.plateNumber}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.date} at {booking.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.branch}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.paymentMethod === 'branch' ? 'Pay at Branch' : 'Online Payment'}</span>
                              <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            <strong>Notes:</strong> {booking.notes}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="lg:col-span-4 flex flex-col space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(booking.createdAt).toLocaleString()}
                        </div>
                        
                        {userRole === 'admin' || userRole === 'superadmin' ? (
                          <div className="flex flex-wrap gap-2">
                            {booking.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                                className="bg-purple-500 hover:bg-purple-600"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            
                            {booking.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            {['pending', 'confirmed'].includes(booking.status) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'no_show')}
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                No Show
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            View only access
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
