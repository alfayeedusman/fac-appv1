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
import { useNavigate } from 'react-router-dom';
import StickyHeader from '@/components/StickyHeader';
import {
  getGeolocationErrorDetails,
  getGeolocationErrorMessage,
  isGeolocationSupported
} from '@/utils/geolocationUtils';
import { 
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  Navigation,
  Camera,
  Phone,
  Mail,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Upload,
  Download,
  Settings,
  LogOut,
  Wrench,
  User,
  Star,
  FileImage,
  MessageSquare,
  Activity,
  Timer,
  Route,
  MapPinned
} from 'lucide-react';

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
}

interface Assignment {
  id: string;
  bookingId: string;
  assignedAt: string;
  acceptedAt?: string;
  status: 'assigned' | 'accepted' | 'rejected' | 'completed';
  notes?: string;
}

export default function CrewDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [uploadType, setUploadType] = useState<'before' | 'after'>('before');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadCrewData();
    startLocationTracking();
  }, []);

  const loadCrewData = () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        navigate('/login');
        return;
      }

      // Get current user info
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find((u: any) => u.email === userEmail);
      setCurrentUser(user);

      // Get crew assignments
      const allAssignments = JSON.parse(localStorage.getItem('crew_assignments') || '[]');
      const userAssignments = allAssignments.filter((a: Assignment) => a.crewId === user?.id);
      setAssignments(userAssignments);

      // Get assigned bookings
      const allBookings = [
        ...JSON.parse(localStorage.getItem('userBookings') || '[]'),
        ...JSON.parse(localStorage.getItem('guestBookings') || '[]')
      ];

      const assignedBookings = allBookings.filter((booking: Booking) => 
        booking.assignedCrew?.includes(user?.id)
      );
      setBookings(assignedBookings);

    } catch (error) {
      console.error('Error loading crew data:', error);
      toast({
        title: "Error",
        description: "Failed to load crew data",
        variant: "destructive",
      });
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        console.log('Location updated:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error);
        console.error('Location tracking error:', errorMessage);

        // Don't retry for permission denied
        if (error.code !== 1) {
          // Retry for other errors after a delay
          setTimeout(() => {
            console.log('Retrying location tracking...');
            startLocationTracking();
          }, 10000);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return `Permission denied: ${error.message}`;
      case 2: // POSITION_UNAVAILABLE
        return `Position unavailable: ${error.message}`;
      case 3: // TIMEOUT
        return `Request timeout: ${error.message}`;
      default:
        return `Unknown error: ${error.message || 'An unknown geolocation error occurred'}`;
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
          crewNotes: statusNotes,
          ...(status === 'crew_arrived' && { crewArrivalTime: new Date().toISOString() }),
          ...(status === 'washing' && { crewStartTime: new Date().toISOString() }),
          ...(status === 'completed' && { crewCompletionTime: new Date().toISOString() })
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
          crewNotes: statusNotes,
          ...(status === 'crew_arrived' && { crewArrivalTime: new Date().toISOString() }),
          ...(status === 'washing' && { crewStartTime: new Date().toISOString() }),
          ...(status === 'completed' && { crewCompletionTime: new Date().toISOString() })
        } : booking
      );
      localStorage.setItem('guestBookings', JSON.stringify(updatedGuestBookings));

      // Add status update to history
      const statusUpdate = {
        id: `status_${Date.now()}`,
        bookingId,
        status,
        updatedBy: currentUser?.id,
        updatedByRole: 'crew',
        timestamp: new Date().toISOString(),
        notes: statusNotes,
        location: currentLocation
      };

      const statusUpdates = JSON.parse(localStorage.getItem('booking_status_updates') || '[]');
      statusUpdates.push(statusUpdate);
      localStorage.setItem('booking_status_updates', JSON.stringify(statusUpdates));

      // Send notification to manager/admin
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'booking_update',
        title: 'Booking Status Updated',
        message: `Booking ${bookingId} status updated to ${status} by ${currentUser?.fullName}`,
        priority: 'medium',
        targetRoles: ['manager', 'admin', 'superadmin'],
        data: { bookingId, status, crewId: currentUser?.id },
        createdAt: new Date().toISOString(),
        readBy: [],
        playSound: true,
        soundType: 'status_update'
      };

      const systemNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      systemNotifications.push(notification);
      localStorage.setItem('system_notifications', JSON.stringify(systemNotifications));

      // Reload data
      loadCrewData();
      
      setIsStatusUpdateOpen(false);
      setStatusNotes('');
      
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

  const acceptAssignment = (assignmentId: string) => {
    try {
      const assignments = JSON.parse(localStorage.getItem('crew_assignments') || '[]');
      const updatedAssignments = assignments.map((a: Assignment) => 
        a.id === assignmentId ? { 
          ...a, 
          status: 'accepted', 
          acceptedAt: new Date().toISOString() 
        } : a
      );
      localStorage.setItem('crew_assignments', JSON.stringify(updatedAssignments));

      // Update crew status to busy
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = users.map((user: any) => 
        user.id === currentUser?.id ? { 
          ...user, 
          crewStatus: 'busy',
          currentAssignment: assignmentId,
          updatedAt: new Date().toISOString()
        } : user
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      loadCrewData();
      
      toast({
        title: "Assignment Accepted",
        description: "You have accepted this booking assignment",
      });

    } catch (error) {
      console.error('Error accepting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to accept assignment",
        variant: "destructive",
      });
    }
  };

  const rejectAssignment = (assignmentId: string) => {
    try {
      const assignments = JSON.parse(localStorage.getItem('crew_assignments') || '[]');
      const updatedAssignments = assignments.map((a: Assignment) => 
        a.id === assignmentId ? { 
          ...a, 
          status: 'rejected'
        } : a
      );
      localStorage.setItem('crew_assignments', JSON.stringify(updatedAssignments));

      loadCrewData();
      
      toast({
        title: "Assignment Rejected",
        description: "Assignment has been rejected",
      });

    } catch (error) {
      console.error('Error rejecting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to reject assignment",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imageData = {
          id: `img_${Date.now()}`,
          bookingId: selectedBooking?.id || '',
          type: uploadType,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          base64Data: e.target?.result as string,
          uploadedBy: currentUser?.id,
          uploadedAt: new Date().toISOString(),
          description: `${uploadType} image uploaded by crew`
        };

        const images = JSON.parse(localStorage.getItem('booking_images') || '[]');
        images.push(imageData);
        localStorage.setItem('booking_images', JSON.stringify(images));

        setIsImageUploadOpen(false);
        
        toast({
          title: "Image Uploaded",
          description: `${uploadType} image uploaded successfully`,
        });

      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Upload Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      assigned: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
      crew_assigned: 'bg-orange-100 text-orange-800',
      crew_going: 'bg-yellow-100 text-yellow-800',
      crew_arrived: 'bg-teal-100 text-teal-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      washing: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-emerald-100 text-emerald-800',
    };
    return <Badge className={styles[status as keyof typeof styles] || styles.pending}>{status.replace('_', ' ')}</Badge>;
  };

  const getBookingsByStatus = (status: string) => {
    return bookings.filter(b => b.status === status);
  };

  const stats = {
    totalAssignments: assignments.length,
    pendingAssignments: assignments.filter(a => a.status === 'assigned').length,
    acceptedAssignments: assignments.filter(a => a.status === 'accepted').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Wrench className="h-8 w-8 mr-3 text-fac-orange-500" />
              Crew Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center">
              <User className="h-4 w-4 mr-2" />
              {currentUser?.fullName} - {currentUser?.branchLocation}
              {currentUser?.crewRating && (
                <span className="ml-4 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {currentUser.crewRating}/5.0
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold">{stats.totalAssignments}</p>
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
                  <p className="text-2xl font-bold">{stats.pendingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">{stats.acceptedAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Jobs
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-4">
              {assignments.filter(a => a.status === 'assigned').map((assignment) => {
                const booking = bookings.find(b => b.id === assignment.bookingId);
                if (!booking) return null;

                return (
                  <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="grid md:grid-cols-3 gap-4 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {booking.customerPhone}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {booking.customerEmail}
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
                              {booking.serviceType === 'home' ? booking.customerAddress : booking.branch}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-fac-orange-500">₱{booking.totalPrice.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Car className="h-4 w-4 mr-1" />
                              {booking.vehicleType} - {booking.plateNumber}
                            </p>
                            {getStatusBadge(assignment.status)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            onClick={() => acceptAssignment(assignment.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            onClick={() => rejectAssignment(assignment.id)}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Active Jobs Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-4">
              {bookings.filter(b => ['confirmed', 'crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status)).map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="grid md:grid-cols-3 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {booking.customerPhone}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.serviceType === 'home' ? booking.customerAddress : booking.branch}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {booking.date} at {booking.timeSlot}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Car className="h-4 w-4 mr-1" />
                            {booking.vehicleType} - {booking.plateNumber}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-fac-orange-500">₱{booking.totalPrice.toLocaleString()}</p>
                          {getStatusBadge(booking.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated: {new Date(booking.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Update Status
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
                                    <SelectItem value="crew_going">Going to Location</SelectItem>
                                    <SelectItem value="crew_arrived">Arrived at Location</SelectItem>
                                    <SelectItem value="in_progress">Work in Progress</SelectItem>
                                    <SelectItem value="washing">Currently Washing</SelectItem>
                                    <SelectItem value="completed">Work Completed</SelectItem>
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
                                    setNewStatus('');
                                  }
                                }}
                                disabled={!newStatus}
                              >
                                Update Status
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsImageUploadOpen(true);
                              }}
                            >
                              <Camera className="h-4 w-4 mr-1" />
                              Upload Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Upload Image</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Image Type</Label>
                                <Select value={uploadType} onValueChange={(value: 'before' | 'after') => setUploadType(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="before">Before Work</SelectItem>
                                    <SelectItem value="after">After Work</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Select Image</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Maximum file size: 5MB
                                </p>
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

          {/* Completed Jobs Tab */}
          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-4">
              {bookings.filter(b => b.status === 'completed').map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="grid md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                        </div>
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-fac-orange-500">₱{booking.totalPrice.toLocaleString()}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Completed: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
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
