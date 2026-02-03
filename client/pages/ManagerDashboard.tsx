import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import StickyHeader from '@/components/StickyHeader';
import { neonDbClient } from '@/services/neonDatabaseService';
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Car,
  Star,
  Shield,
  AlertCircle,
  Send,
  Filter,
  Search,
  Download,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import {
  getAllBookings,
  updateBookingStatus,
  getUserSystemNotifications,
  markSystemNotificationAsRead
} from '@/utils/databaseSchema';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  service: string;
  category: string;
  vehicleType: string;
  vehicleSize?: string;
  plateNumber: string;
  date: string;
  timeSlot: string;
  branch: string;
  serviceType: 'branch' | 'home';
  totalPrice: number;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface Customer {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  carUnit?: string;
  carPlateNumber?: string;
  carType?: string;
  totalBookings: number;
  lastBooking?: string;
  status: 'active' | 'inactive' | 'blocked';
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dailyIncomeDate, setDailyIncomeDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [dailyIncomeAmount, setDailyIncomeAmount] = useState('');
  const [dailyIncomeNotes, setDailyIncomeNotes] = useState('');
  const [dailyIncomeLoading, setDailyIncomeLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadBookings();
    loadCustomers();
    loadNotifications();

    // Set up polling for new notifications every 10 seconds
    const notificationInterval = setInterval(loadNotifications, 10000);

    return () => clearInterval(notificationInterval);
  }, []);

  const loadNotifications = () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const systemNotifications = getUserSystemNotifications(userEmail, 'manager');

      // Convert system notifications to UI format
      const formattedNotifications = systemNotifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: new Date(notification.createdAt),
        read: notification.readBy.some(r => r.userId === userEmail),
        priority: notification.priority,
        data: notification.data,
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadBookings = () => {
    try {
      const allBookings = getAllBookings().map(booking => ({
        ...booking,
        customerName: booking.guestInfo ?
          `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` :
          'Registered Customer',
        customerEmail: booking.guestInfo?.email || 'N/A',
        customerPhone: booking.guestInfo?.phone || 'N/A',
        customerAddress: 'N/A', // This would need to be added to the booking schema if needed
        plateNumber: booking.plateNumber || 'N/A',
        status: booking.status || 'pending',
        createdAt: booking.createdAt || new Date().toISOString(),
      }));

      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    }
  };

  const loadCustomers = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

      const customerList = registeredUsers
        .filter((user: any) => user.role === 'user')
        .map((user: any) => {
          const customerBookings = userBookings.filter((booking: any) => booking.email === user.email);
          return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            contactNumber: user.contactNumber,
            address: user.address,
            carUnit: user.carUnit,
            carPlateNumber: user.carPlateNumber,
            carType: user.carType,
            totalBookings: customerBookings.length,
            lastBooking: customerBookings.length > 0 ? customerBookings[customerBookings.length - 1].date : undefined,
            status: 'active',
          };
        });

      setCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  const submitDailyIncome = async () => {
    const amount = Number(dailyIncomeAmount);
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a daily income amount greater than zero.',
        variant: 'destructive',
      });
      return;
    }

    const currentUser = localStorage.getItem('currentUser');
    const parsedUser = currentUser ? JSON.parse(currentUser) : null;
    const recordedBy =
      parsedUser?.id ||
      localStorage.getItem('userId') ||
      localStorage.getItem('userEmail') ||
      'unknown';
    const branch = parsedUser?.branchLocation || 'Main Branch';

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
          title: 'Daily income saved',
          description: `Recorded ₱${amount.toFixed(2)} for ${branch}.`,
        });
        setDailyIncomeAmount('');
        setDailyIncomeNotes('');
      } else {
        toast({
          title: 'Failed to save income',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Daily income submit failed:', error);
      toast({
        title: 'Failed to save income',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDailyIncomeLoading(false);
    }
  };

  const updateBookingStatusManager = (bookingId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      // Use the database schema function to update booking status
      const success = updateBookingStatus(bookingId, status === 'approved' ? 'confirmed' : 'cancelled', notes);

      if (success) {
        // Reload bookings
        loadBookings();

        // Send notification to customer
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          sendNotificationToCustomer(booking, status, notes);
        }

        toast({
          title: "Success",
          description: `Booking ${status} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Booking not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const sendNotificationToCustomer = (booking: Booking, status: string, notes?: string) => {
    try {
      const notification = {
        id: `booking_${booking.id}_${Date.now()}`,
        type: 'booking',
        title: `Booking ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: status === 'approved' 
          ? `Your booking for ${booking.service} on ${booking.date} has been approved!`
          : `Your booking for ${booking.service} on ${booking.date} has been rejected. ${notes ? `Reason: ${notes}` : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/my-bookings',
        actionText: 'View Bookings',
      };

      // Add to customer notifications
      const customerNotifications = JSON.parse(
        localStorage.getItem(`notifications_${booking.customerEmail}`) || '[]'
      );
      customerNotifications.unshift(notification);
      localStorage.setItem(
        `notifications_${booking.customerEmail}`,
        JSON.stringify(customerNotifications)
      );
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendMessageToCustomer = (customer: Customer) => {
    if (!messageText.trim()) return;

    try {
      const message = {
        id: `msg_${Date.now()}`,
        type: 'message',
        title: 'Message from Manager',
        message: messageText,
        timestamp: new Date().toISOString(),
        read: false,
        from: 'manager',
      };

      // Add to customer notifications
      const customerNotifications = JSON.parse(
        localStorage.getItem(`notifications_${customer.email}`) || '[]'
      );
      customerNotifications.unshift(message);
      localStorage.setItem(
        `notifications_${customer.email}`,
        JSON.stringify(customerNotifications)
      );

      setMessageText('');
      setIsMessageDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Message sent to customer",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={styles[status as keyof typeof styles] || styles.pending}>{status}</Badge>;
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    approvedBookings: bookings.filter(b => b.status === 'approved').length,
    totalCustomers: customers.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Users className="h-8 w-8 mr-3 text-fac-orange-500" />
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage bookings and customer relationships
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Mark all notifications as read
                  const userEmail = localStorage.getItem("userEmail") || "";
                  notifications.forEach(notification => {
                    if (!notification.read) {
                      markSystemNotificationAsRead(notification.id, userEmail);
                    }
                  });
                  loadNotifications();

                  toast({
                    title: "📢 Notifications",
                    description: `You have ${notifications.length} total notifications`,
                  });
                }}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length > 9 ? "9+" : notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Button>
            </div>

            <Button
              onClick={() => navigate('/dispatcher-dashboard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Dispatcher View
            </Button>

            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Income Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="manager-income-date">Date</Label>
                <Input
                  id="manager-income-date"
                  type="date"
                  value={dailyIncomeDate}
                  onChange={(e) => setDailyIncomeDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager-income-amount">Amount (₱)</Label>
                <Input
                  id="manager-income-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyIncomeAmount}
                  onChange={(e) => setDailyIncomeAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager-income-notes">Notes</Label>
                <Input
                  id="manager-income-notes"
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
                {dailyIncomeLoading ? 'Saving...' : 'Save Daily Income'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approvedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Booking Management
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Management
            </TabsTrigger>
          </TabsList>

          {/* Booking Management Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Search Bookings</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by customer name, email, or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="grid md:grid-cols-3 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {booking.customerEmail}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {booking.customerPhone}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {booking.date} at {booking.timeSlot}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.serviceType === 'home' ? 'Home Service' : booking.branch}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-fac-orange-500">₱{booking.totalPrice.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{booking.paymentMethod}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Customer Information</h4>
                                    <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                                    <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                    <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                                    <p><strong>Address:</strong> {selectedBooking.customerAddress}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Service Details</h4>
                                    <p><strong>Service:</strong> {selectedBooking.service}</p>
                                    <p><strong>Vehicle:</strong> {selectedBooking.vehicleType} {selectedBooking.vehicleSize}</p>
                                    <p><strong>Plate:</strong> {selectedBooking.plateNumber}</p>
                                    <p><strong>Date:</strong> {selectedBooking.date}</p>
                                    <p><strong>Time:</strong> {selectedBooking.timeSlot}</p>
                                    <p><strong>Location:</strong> {selectedBooking.serviceType === 'home' ? 'Home Service' : selectedBooking.branch}</p>
                                    <p><strong>Price:</strong> ₱{selectedBooking.totalPrice.toLocaleString()}</p>
                                  </div>
                                </div>
                                {selectedBooking.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateBookingStatusManager(selectedBooking.id, 'approved')}
                                      className="bg-green-500 hover:bg-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => updateBookingStatusManager(selectedBooking.id, 'rejected')}
                                      variant="destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {booking.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatusManager(booking.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 px-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatusManager(booking.id, 'rejected')}
                              className="px-2"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customer Management Tab */}
          <TabsContent value="customers" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div>
                  <Label>Search Customers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customers List */}
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="grid md:grid-cols-3 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{customer.fullName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {customer.email}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {customer.contactNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {customer.address}
                          </p>
                          {customer.carUnit && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Car className="h-4 w-4 mr-1" />
                              {customer.carUnit} ({customer.carPlateNumber})
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{customer.totalBookings} bookings</p>
                          {customer.lastBooking && (
                            <p className="text-sm text-muted-foreground">
                              Last: {customer.lastBooking}
                            </p>
                          )}
                          <Badge className="bg-green-100 text-green-800">{customer.status}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog open={isMessageDialogOpen && selectedCustomer?.id === customer.id} onOpenChange={setIsMessageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Send Message to {customer.fullName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Message</Label>
                                <Textarea
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  placeholder="Type your message here..."
                                  className="min-h-24"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => sendMessageToCustomer(customer)}>
                                  <Send className="h-4 w-4 mr-1" />
                                  Send Message
                                </Button>
                                <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
