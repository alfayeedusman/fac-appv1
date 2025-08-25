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
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import StickyHeader from '@/components/StickyHeader';
import { cn } from '@/lib/utils';
import {
  getGeolocationErrorDetails,
  getGeolocationErrorMessage,
  getGeolocationErrorHelp,
  isGeolocationSupported,
  isGeolocationContextSecure
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
  MapPinned,
  PenTool,
  Users,
  Eye,
  ImageIcon,
  FileText,
  Truck,
  ArrowRight,
  CheckSquare,
  MousePointer
} from 'lucide-react';
import { 
  Booking, 
  CrewAssignment, 
  BookingStatusUpdate, 
  ImageAttachment,
  addBookingStatusUpdate,
  updateCrewAssignmentStatus,
  saveBookingImage,
  getBookingImages,
  getAllBookings,
  getCrewAssignments,
  updateCrewStatus
} from '@/utils/databaseSchema';

interface SignatureData {
  bookingId: string;
  customerName: string;
  signatureDataUrl: string;
  timestamp: string;
  crewMember: string;
}

export default function EnhancedCrewDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState<CrewAssignment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isLocationUpdateOpen, setIsLocationUpdateOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [uploadType, setUploadType] = useState<'before' | 'after'>('before');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [workTimer, setWorkTimer] = useState(0);
  const [isWorkActive, setIsWorkActive] = useState(false);
  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    loadCrewData();
    const locationCleanup = startLocationTracking();

    return () => {
      // Cleanup location tracking
      if (locationCleanup) {
        locationCleanup();
      }
    };
  }, []);

  useEffect(() => {
    // Work timer
    let interval: NodeJS.Timeout;
    if (isWorkActive) {
      interval = setInterval(() => {
        setWorkTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkActive]);

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

      if (!user || user.role !== 'crew') {
        toast({
          title: "Access Denied",
          description: "This dashboard is only for crew members",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Get crew assignments using the utility function
      const userAssignments = getCrewAssignments(user.id);
      setAssignments(userAssignments);

      // Get all bookings and filter for assigned ones
      const allBookings = getAllBookings();
      const assignedBookings = allBookings.filter((booking: Booking) => 
        booking.assignedCrew?.includes(user.id)
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
    // Check for geolocation support
    if (!isGeolocationSupported()) {
      console.warn('Geolocation is not supported by this browser');
      toast({
        title: "Location Not Available",
        description: "Location tracking is not supported on this device. GPS features will be disabled.",
        variant: "destructive",
      });
      return;
    }

    // Check for HTTPS requirement (geolocation requires secure context)
    if (!isGeolocationContextSecure()) {
      console.warn('Geolocation requires HTTPS or localhost');
      toast({
        title: "Secure Connection Required",
        description: "Location tracking requires a secure (HTTPS) connection",
        variant: "destructive",
      });
      return;
    }

    setIsTrackingLocation(true);

    // Check permissions if supported
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('Geolocation permission status:', result.state);
        if (result.state === 'denied') {
          toast({
            title: "⚠️ Location Permission Denied",
            description: "Location access is blocked. Please enable it in your browser settings.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }).catch((error) => {
        console.warn('Could not check geolocation permissions:', error);
      });
    }

    const handleLocationSuccess = (position: GeolocationPosition) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setCurrentLocation(newLocation);
      setIsTrackingLocation(true);

      console.log('✅ Location updated successfully:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toLocaleTimeString()
      });

      // Check location accuracy and provide guidance
      const accuracy = position.coords.accuracy;
      if (accuracy > 100) {
        toast({
          title: "⚠️ Poor GPS Signal",
          description: `Location accuracy is ${Math.round(accuracy)}m. For better accuracy, try moving outdoors or near a window.`,
          variant: "destructive",
          duration: 4000,
        });
      } else if (!currentLocation) {
        // Show success toast only on first successful location
        toast({
          title: "📍 Location Tracking Active",
          description: `GPS coordinates acquired (±${Math.round(accuracy)}m accuracy)`,
          duration: 3000,
        });
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      // Log proper error details for debugging
      const errorDetails = getGeolocationErrorDetails(error);
      console.error('Geolocation error:', errorDetails);

      setIsTrackingLocation(false);

      const errorHelp = getGeolocationErrorHelp(error);

      // Handle timeout with retry logic
      if (error.code === 3) { // TIMEOUT
        console.log('Location timeout, retrying...');
        // Retry after timeout
        setTimeout(() => {
          if (isGeolocationSupported()) {
            console.log('Retrying location tracking after timeout...');
            startLocationTracking();
          }
        }, 5000);
        return; // Don't show error toast for timeout, just retry
      }

      // Show error toast for other errors
      toast({
        title: errorHelp.title,
        description: errorHelp.description,
        variant: "destructive",
      });

      // Show additional help for permission errors
      if (error.code === 1 && errorHelp.helpText) {
        setTimeout(() => {
          toast({
            title: "💡 How to Enable Location",
            description: errorHelp.helpText,
            duration: 8000,
          });
        }, 2000);
      }
    };

    // First try to get current position
    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      (error) => {
        const errorDetails = getGeolocationErrorDetails(error);
        console.warn('Initial location fetch failed, starting watch anyway:', errorDetails);
        // Continue to watchPosition even if getCurrentPosition fails
      },
      {
        enableHighAccuracy: false, // Use less accurate but faster for initial position
        timeout: 5000,
        maximumAge: 60000
      }
    );

    // Then start watching position
    const watchId = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 30000
      }
    );

    // Store watch ID for cleanup if needed
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      // Update the booking status using the schema function
      const allBookings = getAllBookings();
      const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
      
      if (bookingIndex === -1) {
        toast({
          title: "Error",
          description: "Booking not found",
          variant: "destructive",
        });
        return;
      }

      const booking = allBookings[bookingIndex];
      
      // Update the booking with new status and timestamps
      const updatedBooking = {
        ...booking,
        status,
        updatedAt: new Date().toISOString(),
        crewNotes: statusNotes,
        ...(status === 'crew_arrived' && { crewArrivalTime: new Date().toISOString() }),
        ...(status === 'washing' && { crewStartTime: new Date().toISOString() }),
        ...(status === 'completed' && { crewCompletionTime: new Date().toISOString() })
      };

      allBookings[bookingIndex] = updatedBooking;
      localStorage.setItem('bookings', JSON.stringify(allBookings));

      // Add status update to history
      addBookingStatusUpdate(
        bookingId,
        status,
        currentUser?.id || 'unknown',
        statusNotes,
        currentLocation ? {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          address: 'Current location'
        } : undefined
      );

      // Update crew status if work is completed
      if (status === 'completed') {
        updateCrewStatus(currentUser?.id, 'available');
        setIsWorkActive(false);
        setWorkTimer(0);
      } else if (status === 'washing' && !isWorkActive) {
        setIsWorkActive(true);
      }

      // Send system notification
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'booking_update' as const,
        title: 'Booking Status Updated',
        message: `Booking ${bookingId} status updated to ${status} by ${currentUser?.fullName}`,
        priority: 'medium' as const,
        targetRoles: ['manager', 'admin', 'superadmin'] as const,
        data: { bookingId, status, crewId: currentUser?.id },
        createdAt: new Date().toISOString(),
        readBy: [],
        playSound: true,
        soundType: 'status_update' as const
      };

      const systemNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      systemNotifications.push(notification);
      localStorage.setItem('system_notifications', JSON.stringify(systemNotifications));

      // Reload data
      loadCrewData();
      
      setIsStatusUpdateOpen(false);
      setStatusNotes('');
      setNewStatus('');
      
      toast({
        title: "Success",
        description: `Booking status updated to ${status.replace('_', ' ')}`,
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

  const acceptAssignment = async (assignmentId: string) => {
    try {
      // Update assignment status
      updateCrewAssignmentStatus(assignmentId, 'accepted', 'Assignment accepted by crew member');

      // Update crew status to busy
      updateCrewStatus(currentUser?.id, 'busy', assignmentId);

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

  const rejectAssignment = async (assignmentId: string) => {
    try {
      updateCrewAssignmentStatus(assignmentId, 'rejected', 'Assignment rejected by crew member');
      
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBooking) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageData: Omit<ImageAttachment, 'id' | 'uploadedAt'> = {
          bookingId: selectedBooking.id,
          type: uploadType,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          base64Data: e.target?.result as string,
          uploadedBy: currentUser?.id || 'unknown',
          description: `${uploadType} image uploaded by ${currentUser?.fullName}`
        };

        await saveBookingImage(imageData);

        setIsImageUploadOpen(false);
        
        toast({
          title: "Image Uploaded",
          description: `${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} image uploaded successfully`,
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

  const initializeSignatureCanvas = (canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    
    setSignatureCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    canvas.width = 400;
    canvas.height = 200;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvas) return;
    
    setIsDrawing(true);
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvas) return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!signatureCanvas) return;
    
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
  };

  const saveSignature = () => {
    if (!signatureCanvas || !selectedBooking) return;
    
    const signatureDataUrl = signatureCanvas.toDataURL();
    
    const signatureData: SignatureData = {
      bookingId: selectedBooking.id,
      customerName: selectedBooking.guestInfo?.firstName + ' ' + selectedBooking.guestInfo?.lastName || 'Customer',
      signatureDataUrl,
      timestamp: new Date().toISOString(),
      crewMember: currentUser?.fullName || 'Unknown Crew'
    };

    // Save signature as an image attachment
    const imageData: Omit<ImageAttachment, 'id' | 'uploadedAt'> = {
      bookingId: selectedBooking.id,
      type: 'other',
      filename: `signature_${selectedBooking.id}_${Date.now()}.png`,
      originalName: 'Customer Signature',
      mimeType: 'image/png',
      size: signatureDataUrl.length,
      base64Data: signatureDataUrl,
      uploadedBy: currentUser?.id || 'unknown',
      description: `Customer signature collected by ${currentUser?.fullName}`
    };

    saveBookingImage(imageData);

    // Save signature data separately
    const signatures = JSON.parse(localStorage.getItem('customer_signatures') || '[]');
    signatures.push(signatureData);
    localStorage.setItem('customer_signatures', JSON.stringify(signatures));

    setIsSignatureModalOpen(false);
    
    toast({
      title: "Signature Saved",
      description: "Customer signature has been saved successfully",
    });
  };

  const handleLogout = () => {
    // Update crew status to offline before logout
    if (currentUser?.id) {
      updateCrewStatus(currentUser.id, 'offline');
    }
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (status: string) => {
    const statusProgress = {
      'pending': 0,
      'confirmed': 10,
      'crew_assigned': 20,
      'crew_going': 40,
      'crew_arrived': 60,
      'in_progress': 70,
      'washing': 85,
      'completed': 100,
    };
    return statusProgress[status as keyof typeof statusProgress] || 0;
  };

  const refreshLocation = () => {
    if (!isGeolocationSupported()) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    setIsTrackingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast({
          title: "Location Updated",
          description: `Location refreshed successfully`,
        });
      },
      (error) => {
        setIsTrackingLocation(false);

        // Log error details for debugging
        const errorDetails = getGeolocationErrorDetails(error);
        console.error('Refresh location error:', errorDetails);

        // Get user-friendly error information
        const errorHelp = getGeolocationErrorHelp(error);

        toast({
          title: errorHelp.title,
          description: errorHelp.description,
          variant: "destructive",
        });

        // Show additional help for permission errors
        if (error.code === 1 && errorHelp.helpText) {
          setTimeout(() => {
            toast({
              title: "🔧 Location Setup Help",
              description: errorHelp.helpText,
              duration: 10000,
            });
          }, 1000);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Force fresh location
      }
    );
  };

  const getLocationStatus = () => {
    if (!navigator.geolocation) return "Not Supported";
    if (isTrackingLocation && currentLocation) return "Active";
    if (isTrackingLocation && !currentLocation) return "Searching...";
    return "Inactive";
  };

  const stats = {
    totalAssignments: assignments.length,
    pendingAssignments: assignments.filter(a => a.status === 'assigned').length,
    acceptedAssignments: assignments.filter(a => a.status === 'accepted').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    rating: currentUser?.crewRating || 0,
    activeJobs: bookings.filter(b => ['crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status)).length,
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
            <div className="flex items-center gap-6 mt-2 text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {currentUser?.fullName}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {currentUser?.branchLocation}
              </div>
              {currentUser?.crewRating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {currentUser.crewRating}/5.0
                </div>
              )}
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Status: <Badge className="ml-2">{currentUser?.crewStatus || 'offline'}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isWorkActive && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                <Timer className="h-4 w-4" />
                {formatTime(workTimer)}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge
                variant={isTrackingLocation && currentLocation ? "default" : "outline"}
                className={cn(
                  "flex items-center gap-1",
                  isTrackingLocation && currentLocation ? "bg-green-100 text-green-800" :
                  isTrackingLocation ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                )}
              >
                <Navigation className="h-3 w-3" />
                GPS {getLocationStatus()}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshLocation}
                disabled={isTrackingLocation && !currentLocation}
                className="px-2"
              >
                <Navigation className="h-3 w-3" />
              </Button>
            </div>
            {/* Debug info in development */}
            {currentLocation && import.meta.env.DEV && (
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </div>
            )}
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-blue-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">Total Assignments</p>
                  <p className="text-xl font-bold">{stats.totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">{stats.pendingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-orange-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-xl font-bold">{stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{stats.completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold">{stats.rating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MapPinned className="h-6 w-6 text-purple-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="text-xl font-bold">{isTrackingLocation ? 'ON' : 'OFF'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border p-1">
            <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
              <TabsTrigger
                value="assignments"
                className="flex items-center gap-2 py-3 px-4 rounded-md data-[state=active]:bg-fac-orange-500 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">New Assignments</span>
                <span className="sm:hidden">New</span>
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="flex items-center gap-2 py-3 px-4 rounded-md data-[state=active]:bg-fac-orange-500 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Active Jobs</span>
                <span className="sm:hidden">Active</span>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2 py-3 px-4 rounded-md data-[state=active]:bg-fac-orange-500 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Completed</span>
                <span className="sm:hidden">Done</span>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="flex items-center gap-2 py-3 px-4 rounded-md data-[state=active]:bg-fac-orange-500 data-[state=active]:text-white font-medium transition-all duration-200"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Images</span>
                <span className="sm:hidden">Pics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">New Assignments</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {assignments.filter(a => a.status === 'assigned').length} pending assignment{assignments.filter(a => a.status === 'assigned').length !== 1 ? 's' : ''}
                </p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {assignments.filter(a => a.status === 'assigned').length} New
              </Badge>
            </div>

            <div className="grid gap-6">
              {assignments.filter(a => a.status === 'assigned').map((assignment) => {
                const booking = bookings.find(b => b.id === assignment.bookingId);
                if (!booking) return null;

                return (
                  <Card key={assignment.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-fac-orange-500 bg-gradient-to-r from-orange-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                          {/* Customer Info */}
                          <div className="flex items-start gap-4">
                            <div className="bg-fac-orange-100 p-3 rounded-full">
                              <User className="h-5 w-5 text-fac-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900">
                                {booking.guestInfo ?
                                  `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` :
                                  'Registered Customer'
                                }
                              </h3>
                              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  {booking.guestInfo?.phone || 'Customer Phone'}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                  {booking.guestInfo?.email || 'Customer Email'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Service & Vehicle Info */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Wrench className="h-5 w-5 text-fac-orange-500" />
                                <div>
                                  <p className="font-semibold text-fac-orange-600">{booking.service}</p>
                                  <p className="text-sm text-gray-500">Service Package</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{booking.date}</p>
                                  <p className="text-sm text-gray-500">{booking.timeSlot}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-green-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{booking.branch}</p>
                                  <p className="text-sm text-gray-500">Service Location</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Car className="h-5 w-5 text-purple-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{booking.unitType}</p>
                                  <p className="text-sm text-gray-500">{booking.plateNumber}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-amber-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{booking.estimatedDuration} mins</p>
                                  <p className="text-sm text-gray-500">Estimated Duration</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">💰</span>
                                <div>
                                  <p className="font-bold text-xl text-fac-orange-600">₱{booking.totalPrice.toLocaleString()}</p>
                                  <p className="text-sm text-gray-500">Total Amount</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Assignment Details */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusBadge(assignment.status)}
                                <span className="text-sm text-gray-500">
                                  Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                          <Button
                            onClick={() => acceptAssignment(assignment.id)}
                            className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => rejectAssignment(assignment.id)}
                            variant="destructive"
                            className="flex-1 lg:flex-none font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-900">Special Instructions</p>
                              <p className="text-sm text-blue-700 mt-1">{booking.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {assignments.filter(a => a.status === 'assigned').length === 0 && (
                <Card className="border-2 border-dashed border-gray-200">
                  <CardContent className="p-12 text-center">
                    <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No New Assignments</h3>
                    <p className="text-gray-600 mb-4">You're all caught up! New assignments will appear here when available.</p>
                    <Badge variant="outline" className="px-4 py-2">
                      ✨ Ready for new work
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Active Jobs Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-4">
              {bookings.filter(b => ['confirmed', 'crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status)).map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">{getProgressPercentage(booking.status)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(booking.status)} className="h-2" />
                      </div>

                      {/* Main Info */}
                      <div className="flex items-start justify-between">
                        <div className="grid md:grid-cols-3 gap-4 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {booking.guestInfo ? 
                                `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` : 
                                'Registered Customer'
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {booking.guestInfo?.phone || 'Customer Phone'}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.branch}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-fac-orange-500">{booking.service}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {booking.date} at {booking.timeSlot}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Car className="h-4 w-4 mr-1" />
                              {booking.unitType} - {booking.plateNumber}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-fac-orange-500">₱{booking.totalPrice.toLocaleString()}</p>
                            {getStatusBadge(booking.status)}
                            <p className="text-xs text-muted-foreground mt-1">
                              Updated: {new Date(booking.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
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
                                    rows={3}
                                  />
                                </div>
                                {currentLocation && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPinned className="h-4 w-4 mr-1" />
                                    Location will be recorded with this update
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsStatusUpdateOpen(false)}>
                                  Cancel
                                </Button>
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
                          
                          <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsImageUploadOpen(true);
                                }}
                              >
                                <Camera className="h-4 w-4 mr-1" />
                                Photo
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Progress Photo</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Photo Type</Label>
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
                                  <Label>Select Photo</Label>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="mt-1"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Maximum file size: 10MB. Recommended formats: JPG, PNG
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsSignatureModalOpen(true);
                                }}
                                disabled={booking.status !== 'completed' && booking.status !== 'washing'}
                              >
                                <PenTool className="h-4 w-4 mr-1" />
                                Signature
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Customer Signature</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Ask the customer to sign below to confirm service completion
                                  </p>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <canvas
                                      ref={initializeSignatureCanvas}
                                      onMouseDown={startDrawing}
                                      onMouseMove={draw}
                                      onMouseUp={stopDrawing}
                                      onMouseLeave={stopDrawing}
                                      className="border border-gray-200 rounded cursor-crosshair"
                                      style={{ touchAction: 'none' }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-4">
                                    <Button variant="outline" onClick={clearSignature}>
                                      Clear
                                    </Button>
                                    <Button onClick={saveSignature}>
                                      <CheckSquare className="h-4 w-4 mr-1" />
                                      Save Signature
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const phoneNumber = booking.guestInfo?.phone || 'customer';
                              const message = `Hello! This is ${currentUser?.fullName} from Fayeed Auto Care. I'm handling your ${booking.service} service today. I'll keep you updated on the progress.`;
                              const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.crewNotes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm"><strong>Crew Notes:</strong> {booking.crewNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {bookings.filter(b => ['confirmed', 'crew_assigned', 'crew_going', 'crew_arrived', 'in_progress', 'washing'].includes(b.status)).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active jobs at the moment</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Completed Jobs Tab */}
          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-4">
              {bookings.filter(b => b.status === 'completed').map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="grid md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.guestInfo ? 
                              `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` : 
                              'Registered Customer'
                            }
                          </h3>
                          <p className="text-sm text-muted-foreground">{booking.guestInfo?.phone}</p>
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
                            Completed: {booking.completedAt ? new Date(booking.completedAt).toLocaleDateString() : 'N/A'}
                          </p>
                          {booking.qualityRating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm">{booking.qualityRating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {booking.customerFeedback && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm"><strong>Customer Feedback:</strong> {booking.customerFeedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {bookings.filter(b => b.status === 'completed').length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed jobs yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <div className="grid gap-4">
              {bookings.map((booking) => {
                const bookingImages = getBookingImages(booking.id);
                if (bookingImages.length === 0) return null;

                return (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        {booking.service} - {booking.date}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {bookingImages.map((image) => (
                          <div key={image.id} className="space-y-2">
                            <img 
                              src={image.base64Data} 
                              alt={image.description}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <p className="text-xs text-center text-muted-foreground">
                              {image.type.charAt(0).toUpperCase() + image.type.slice(1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
