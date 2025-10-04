import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import BranchFilter from '@/components/BranchFilter';
import { neonDbClient } from '@/services/neonDatabaseService';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail,
  User,
  Wrench,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Download,
  Upload,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  FileText,
  Settings,
  UserPlus,
  Star,
  MessageSquare,
  Camera,
  MapPinned,
  Timer,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  getAllBookings,
  updateBookingStatus,
  assignCrewToBooking,
  createSystemNotification,
  type Booking as DatabaseBooking
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
  status: 'pending' | 'confirmed' | 'crew_assigned' | 'crew_going' | 'crew_arrived' | 'in_progress' | 'washing' | 'completed' | 'cancelled' | 'paid';
  createdAt: string;
  notes?: string;
  assignedCrew?: string[];
  statusHistory?: any[];
  beforeImages?: any[];
  afterImages?: any[];
  crewNotes?: string;
  crewArrivalTime?: string;
  crewStartTime?: string;
  crewCompletionTime?: string;
}

interface CrewMember {
  id: string;
  fullName: string;
  email: string;
  branchLocation: string;
  crewSkills: string[];
  crewStatus: 'available' | 'busy' | 'offline';
  crewRating: number;
  crewExperience: number;
}

interface EnhancedBookingManagementProps {
  userRole: 'admin' | 'superadmin' | 'manager';
  showCrewAssignment?: boolean;
}

export default function EnhancedBookingManagement({ userRole, showCrewAssignment = true }: EnhancedBookingManagementProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCrewAssignModalOpen, setIsCrewAssignModalOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [canViewAllBranches, setCanViewAllBranches] = useState(false);
  const [userBranch, setUserBranch] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
    loadCrewMembers();
  }, [branchFilter]);

  const loadBookings = async () => {
    try {
      // Get current user info
      const userEmail = localStorage.getItem('userEmail');

      // Fetch bookings from Neon database with branch filtering
      const result = await neonDbClient.getBookings({
        branch: branchFilter,
        userEmail: userEmail || undefined,
        userRole: userRole,
      });

      if (result.success && result.bookings) {
        // Store branch access info
        setCanViewAllBranches(result.canViewAllBranches || false);
        setUserBranch(result.userBranch || null);

        // Map bookings to match the expected format
        const allBookings = result.bookings.map(booking => ({
          ...booking,
          customerName: booking.guestInfo ?
            `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` :
            'Registered Customer',
          customerEmail: booking.guestInfo?.email || 'N/A',
          customerPhone: booking.guestInfo?.phone || 'N/A',
          customerAddress: booking.serviceLocation || 'N/A',
          plateNumber: booking.plateNumber || 'N/A',
          status: booking.status || 'pending',
          createdAt: booking.createdAt || new Date().toISOString(),
        }));

        // Sort by creation date (newest first)
        allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setBookings(allBookings);

        console.log(`✅ Loaded ${allBookings.length} bookings from Neon database (branch: ${branchFilter})`);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings from database",
        variant: "destructive",
      });
    }
  };

  const loadCrewMembers = () => {
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const crew = users
        .filter((user: any) => user.role === 'crew')
        .map((user: any) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          branchLocation: user.branchLocation,
          crewSkills: user.crewSkills || [],
          crewStatus: user.crewStatus || 'available',
          crewRating: user.crewRating || 0,
          crewExperience: user.crewExperience || 0,
        }));
      
      setCrewMembers(crew);
    } catch (error) {
      console.error('Error loading crew members:', error);
    }
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    try {
      // Update user bookings
      const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updatedUserBookings = userBookings.map((booking: any) => 
        booking.id === bookingId ? { 
          ...booking, 
          status, 
          updatedAt: new Date().toISOString(),
          ...(statusNotes && { managerNotes: statusNotes })
        } : booking
      );
      localStorage.setItem('userBookings', JSON.stringify(updatedUserBookings));

      // Update guest bookings
      const guestBookings = JSON.parse(localStorage.getItem('guestBookings') || '[]');
      const updatedGuestBookings = guestBookings.map((booking: any) => 
        booking.id === bookingId ? { 
          ...booking, 
          status, 
          updatedAt: new Date().toISOString(),
          ...(statusNotes && { managerNotes: statusNotes })
        } : booking
      );
      localStorage.setItem('guestBookings', JSON.stringify(updatedGuestBookings));

      // Send notification to customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        sendNotificationToCustomer(booking, status, statusNotes);
      }

      loadBookings();
      setIsStatusUpdateOpen(false);
      setStatusNotes('');
      setNewStatus('');
      
      toast({
        title: "Success",
        description: `Booking status updated to ${status}`,
      });

    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const assignCrewToBooking = (bookingId: string, crewIds: string[]) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
        .find((u: any) => u.email === localStorage.getItem('userEmail'));

      // Create crew assignments
      const assignments = crewIds.map(crewId => ({
        id: `assign_${Date.now()}_${crewId}`,
        bookingId,
        crewId,
        assignedBy: currentUser?.id,
        assignedAt: new Date().toISOString(),
        status: 'assigned'
      }));

      const existingAssignments = JSON.parse(localStorage.getItem('crew_assignments') || '[]');
      const updatedAssignments = [...existingAssignments, ...assignments];
      localStorage.setItem('crew_assignments', JSON.stringify(updatedAssignments));

      // Update booking with assigned crew
      const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      const updatedUserBookings = userBookings.map((booking: any) => 
        booking.id === bookingId ? { 
          ...booking, 
          assignedCrew: crewIds,
          status: 'crew_assigned',
          updatedAt: new Date().toISOString()
        } : booking
      );
      localStorage.setItem('userBookings', JSON.stringify(updatedUserBookings));

      const guestBookings = JSON.parse(localStorage.getItem('guestBookings') || '[]');
      const updatedGuestBookings = guestBookings.map((booking: any) => 
        booking.id === bookingId ? { 
          ...booking, 
          assignedCrew: crewIds,
          status: 'crew_assigned',
          updatedAt: new Date().toISOString()
        } : booking
      );
      localStorage.setItem('guestBookings', JSON.stringify(updatedGuestBookings));

      // Update crew status to busy
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = users.map((user: any) => 
        crewIds.includes(user.id) ? { 
          ...user, 
          crewStatus: 'busy',
          currentAssignment: bookingId,
          updatedAt: new Date().toISOString()
        } : user
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // Send notifications to crew
      crewIds.forEach(crewId => {
        const crewMember = crewMembers.find(c => c.id === crewId);
        if (crewMember) {
          const notification = {
            id: `notif_${Date.now()}_${crewId}`,
            userId: crewId,
            type: 'booking_assignment',
            title: 'New Assignment',
            message: `You have been assigned to booking ${bookingId}`,
            timestamp: new Date().toISOString(),
            read: false,
            data: { bookingId, assignmentId: assignments.find(a => a.crewId === crewId)?.id }
          };

          const notifications = JSON.parse(localStorage.getItem(`notifications_${crewMember.email}`) || '[]');
          notifications.unshift(notification);
          localStorage.setItem(`notifications_${crewMember.email}`, JSON.stringify(notifications));
        }
      });

      loadBookings();
      loadCrewMembers();
      setIsCrewAssignModalOpen(false);
      setSelectedCrew([]);
      
      toast({
        title: "Crew Assigned",
        description: `${crewIds.length} crew member(s) assigned to booking`,
      });

    } catch (error) {
      console.error('Error assigning crew:', error);
      toast({
        title: "Error",
        description: "Failed to assign crew",
        variant: "destructive",
      });
    }
  };

  const sendNotificationToCustomer = (booking: Booking, status: string, notes?: string) => {
    try {
      const notification = {
        id: `booking_${booking.id}_${Date.now()}`,
        type: 'booking_update',
        title: `Booking ${status === 'confirmed' ? 'Confirmed' : status === 'completed' ? 'Completed' : 'Updated'}`,
        message: status === 'confirmed' 
          ? `Your booking for ${booking.service} on ${booking.date} has been confirmed!`
          : status === 'completed'
          ? `Your ${booking.service} service has been completed. Thank you for choosing us!`
          : `Your booking status has been updated to ${status}. ${notes ? `Note: ${notes}` : ''}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/history',
        actionText: 'View Booking',
      };

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

  const exportBookingsData = () => {
    try {
      const dataStr = JSON.stringify(bookings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bookings_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export Successful",
        description: "Bookings data has been exported",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export bookings data",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      crew_assigned: 'bg-orange-100 text-orange-800',
      crew_going: 'bg-indigo-100 text-indigo-800',
      crew_arrived: 'bg-teal-100 text-teal-800',
      in_progress: 'bg-purple-100 text-purple-800',
      washing: 'bg-cyan-100 text-cyan-800',
      completed: 'bg-green-100 text-green-800',
      paid: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return <Badge className={styles[status as keyof typeof styles] || styles.pending}>{status.replace('_', ' ')}</Badge>;
  };

  const getBookingsByStatus = (status: string) => {
    if (status === 'all') return bookings;
    if (status === 'active') return bookings.filter(b => ['confirmed', 'crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status));
    return bookings.filter(b => b.status === status);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => ['confirmed', 'crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.filter(b => ['completed', 'paid'].includes(b.status)).reduce((sum, b) => sum + b.totalPrice, 0),
    pendingRevenue: bookings.filter(b => ['confirmed', 'crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status)).reduce((sum, b) => sum + b.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Booking Management</h2>
          <p className="text-muted-foreground">Comprehensive booking and crew management system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadBookings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportBookingsData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold">₱{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-lg font-bold">₱{stats.pendingRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, service, or plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <BranchFilter
                value={branchFilter}
                onChange={setBranchFilter}
                canViewAllBranches={canViewAllBranches}
                userBranch={userBranch}
                label="Branch"
              />
            </div>
            <div>
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="active">Active Jobs</SelectItem>
                  <SelectItem value="crew_assigned">Crew Assigned</SelectItem>
                  <SelectItem value="crew_going">Crew Going</SelectItem>
                  <SelectItem value="crew_arrived">Crew Arrived</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="washing">Washing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Filter</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setBranchFilter('all');
                  setDateFilter('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
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
                <div className="grid md:grid-cols-4 gap-4 flex-1">
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
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      {booking.vehicleType} - {booking.plateNumber}
                    </p>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div>
                    {booking.assignedCrew && booking.assignedCrew.length > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Wrench className="h-4 w-4 mr-1" />
                        <span>{booking.assignedCrew.length} crew assigned</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ID: {booking.id.slice(-8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Booking Details - {booking.id}</DialogTitle>
                      </DialogHeader>
                      {selectedBooking && (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3">Customer Information</h4>
                              <div className="space-y-2">
                                <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                                <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                                <p><strong>Address:</strong> {selectedBooking.customerAddress}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Service Details</h4>
                              <div className="space-y-2">
                                <p><strong>Service:</strong> {selectedBooking.service}</p>
                                <p><strong>Category:</strong> {selectedBooking.category}</p>
                                <p><strong>Vehicle:</strong> {selectedBooking.vehicleType} {selectedBooking.vehicleSize}</p>
                                <p><strong>Plate:</strong> {selectedBooking.plateNumber}</p>
                                <p><strong>Date:</strong> {selectedBooking.date}</p>
                                <p><strong>Time:</strong> {selectedBooking.timeSlot}</p>
                                <p><strong>Location:</strong> {selectedBooking.serviceType === 'home' ? 'Home Service' : selectedBooking.branch}</p>
                                <p><strong>Price:</strong> ₱{selectedBooking.totalPrice.toLocaleString()}</p>
                                <p><strong>Payment:</strong> {selectedBooking.paymentMethod}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">Status & Progress</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span><strong>Current Status:</strong></span>
                                {getStatusBadge(selectedBooking.status)}
                              </div>
                              {selectedBooking.crewArrivalTime && (
                                <p><strong>Crew Arrival:</strong> {new Date(selectedBooking.crewArrivalTime).toLocaleString()}</p>
                              )}
                              {selectedBooking.crewStartTime && (
                                <p><strong>Work Started:</strong> {new Date(selectedBooking.crewStartTime).toLocaleString()}</p>
                              )}
                              {selectedBooking.crewCompletionTime && (
                                <p><strong>Work Completed:</strong> {new Date(selectedBooking.crewCompletionTime).toLocaleString()}</p>
                              )}
                              {selectedBooking.crewNotes && (
                                <p><strong>Crew Notes:</strong> {selectedBooking.crewNotes}</p>
                              )}
                            </div>
                          </div>

                          {selectedBooking.assignedCrew && selectedBooking.assignedCrew.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">Assigned Crew</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedBooking.assignedCrew.map(crewId => {
                                  const crew = crewMembers.find(c => c.id === crewId);
                                  return crew ? (
                                    <div key={crewId} className="flex items-center p-2 bg-muted rounded">
                                      <Wrench className="h-4 w-4 mr-2" />
                                      <span>{crew.fullName} - {crew.branchLocation}</span>
                                    </div>
                                  ) : null;
                                })}
                              </div>
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
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="bg-green-500 hover:bg-green-600 px-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="px-2"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {showCrewAssignment && booking.status === 'confirmed' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign Crew
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Crew to Booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Available Crew Members</Label>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {crewMembers.filter(c => c.crewStatus === 'available').map(crew => (
                                <div key={crew.id} className="flex items-center space-x-2 p-2 border rounded">
                                  <input
                                    type="checkbox"
                                    checked={selectedCrew.includes(crew.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCrew([...selectedCrew, crew.id]);
                                      } else {
                                        setSelectedCrew(selectedCrew.filter(id => id !== crew.id));
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{crew.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{crew.branchLocation}</p>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Star className="h-3 w-3 mr-1" />
                                      {crew.crewRating}/5.0 • {crew.crewExperience}y exp
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`text-xs ${
                                      crew.crewStatus === 'available' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {crew.crewStatus}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              if (selectedBooking && selectedCrew.length > 0) {
                                assignCrewToBooking(selectedBooking.id, selectedCrew);
                              }
                            }}
                            disabled={selectedCrew.length === 0}
                          >
                            Assign {selectedCrew.length} Crew Member(s)
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {['crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(booking.status) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsStatusUpdateOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Booking Status</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>New Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="crew_going">Crew Going to Location</SelectItem>
                                <SelectItem value="crew_arrived">Crew Arrived at Location</SelectItem>
                                <SelectItem value="in_progress">Work in Progress</SelectItem>
                                <SelectItem value="washing">Currently Washing</SelectItem>
                                <SelectItem value="completed">Work Completed</SelectItem>
                                <SelectItem value="paid">Payment Received</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes (Optional)</Label>
                            <Textarea
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                              placeholder="Add any notes about the status update..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              if (selectedBooking && newStatus) {
                                updateBookingStatus(selectedBooking.id, newStatus as Booking['status']);
                              }
                            }}
                            disabled={!newStatus}
                          >
                            Update Status
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || dateFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'No bookings have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
