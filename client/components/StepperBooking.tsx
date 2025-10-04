import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Car,
  Sparkles,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Upload,
  Star,
  Crown,
  Zap,
  Shield,
  AlertTriangle,
  Menu,
  X,
  Tag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { notificationManager } from "@/components/NotificationModal";
import Swal from 'sweetalert2';
import { getAdminConfig, generateTimeSlots, isSlotAvailable } from "@/utils/adminConfig";
import { neonDbClient, type Booking } from "@/services/neonDatabaseService";
import { getCarWashServices } from "@/utils/carWashServices";
import { getSlotAvailability } from "@/utils/databaseSchema";

interface BookingData {
  // Service Selection
  category: string; // "carwash", "auto_detailing", "graphene_coating"
  service: string; // specific service type
  serviceType: string; // "branch" or "home"

  // Unit Selection
  unitType: string; // "car" or "motorcycle"
  unitSize: string; // sedan/suv/pickup etc for cars, regular/medium/big for motorcycles

  // Customer Details
  fullName: string;
  mobile: string;
  email: string;
  plateNo: string;
  carModel: string; // car year and model (e.g., "Hilux Conquest 2024")
  address: string;
  notes?: string;

  // Schedule
  date: string;
  timeSlot: string;
  branch: string;

  // Payment
  paymentMethod: string; // "branch", "online", or "onsite"
  receiptFile: File | null;

  // Terms
  acceptTerms: boolean;

  // Computed
  basePrice: number;
  totalPrice: number;

  // Voucher
  voucherCode?: string;
  voucherDiscount?: number;
  voucherData?: { title: string; discountType: string; discountValue: number; };
}

interface StepperBookingProps {
  isGuest?: boolean;
}

const STEPS = [
  { id: 1, title: "Schedule", icon: Calendar, description: "Pick date & time" },
  { id: 2, title: "Unit", icon: Car, description: "Select vehicle type" },
  { id: 3, title: "Service", icon: Sparkles, description: "Choose your service" },
  { id: 4, title: "Payment", icon: CreditCard, description: "Payment method" },
  { id: 5, title: "Review", icon: CheckCircle, description: "Confirm booking" },
];

// Load admin configuration with error handling
let adminConfig;
try {
  adminConfig = getAdminConfig();
} catch (error) {
  console.error('Error loading admin config:', error);
  // Fallback to basic config
  adminConfig = {
    pricing: {
      carwash: {},
      autoDetailing: { car: {}, motorcycle: {} },
      grapheneCoating: { car: {}, motorcycle: {} }
    },
    branches: [],
    paymentMethods: { branch: { enabled: true }, online: { enabled: true }, onsite: { enabled: true, name: 'On-Site Payment', description: 'Pay the crew at your location (Home Service only)' } } ,
    terms: { termsAndConditions: '', cancellationPolicy: '', noShowPolicy: '' }
  };
}

// Function to check if a service is available for home service
const isServiceAvailableForHome = (category: string, service?: string, vehicleType?: string) => {
  const homeServiceConfig = adminConfig?.homeService || {};

  if (!homeServiceConfig.enabled) {
    return false;
  }

  if (category === 'carwash' && service) {
    // Special validation for motorcycles
    if (vehicleType === 'motorcycle') {
      return homeServiceConfig.availableServices?.motorcycleCarwash?.includes(service) || false;
    }
    return homeServiceConfig.availableServices?.carwash?.includes(service) || false;
  } else if (category === 'auto_detailing') {
    return homeServiceConfig.availableServices?.autoDetailing || false;
  } else if (category === 'graphene_coating') {
    return homeServiceConfig.availableServices?.grapheneCoating || false;
  }

  return false;
};

// Function to show home service unavailable alert
const showHomeServiceUnavailableAlert = (serviceName: string, goBackToStep1: () => void) => {
  Swal.fire({
    icon: 'warning',
    title: 'Service Not Available for Home Service',
    html: `<div style="text-align: left;">
      <p><strong>${serviceName}</strong> is not available for home service.</p>
      <br>
      <p><strong>Available home services:</strong></p>
      <ul style="margin-left: 20px;">
        <li>VIP ProMax Wash</li>
        <li>Premium Wash</li>
        <li>FAC Wash</li>
        <li>Auto Detailing</li>
        <li>Graphene Coating</li>
      </ul>
      <br>
      <p>Please choose an available service.</p>
    </div>`,
    confirmButtonText: 'Choose Another Service',
    confirmButtonColor: '#f97316',
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then((result) => {
    if (result.isConfirmed) {
      goBackToStep1();
    }
  });
};

// Function to get available services based on service type
const getAvailableServices = (serviceType: string) => {
  const homeServiceConfig = adminConfig?.homeService || {};

  if (serviceType === 'home' && homeServiceConfig.enabled) {
    // Get actual carwash services from the carwash services utility
    const allCarwashServices = getCarWashServices();
    const availableCarwashServices = homeServiceConfig.availableServices?.carwash || [];

    // Convert carwash services array to object format expected by the UI
    const filteredCarwashServices = allCarwashServices
      .filter(service => availableCarwashServices.includes(service.id))
      .reduce((acc, service) => {
        acc[service.id] = {
          name: service.name,
          price: service.basePrice,
          duration: service.duration,
          description: service.description,
          features: service.features,
          popular: service.category === 'premium',
        };
        return acc;
      }, {} as any);

    return {
      ...(Object.keys(filteredCarwashServices).length > 0 && {
        carwash: {
          name: "Car Wash (Home Service)",
          icon: Car,
          gradient: "from-blue-500 to-cyan-500",
          services: filteredCarwashServices,
        }
      }),
      ...(homeServiceConfig.availableServices?.autoDetailing && {
        auto_detailing: {
          name: "Auto Detailing (Home Service)",
          icon: Star,
          gradient: "from-purple-500 to-pink-500",
          description: "Professional interior and exterior detailing at your location",
        }
      }),
      ...(homeServiceConfig.availableServices?.grapheneCoating && {
        graphene_coating: {
          name: "Graphene Coating (Home Service)",
          icon: Shield,
          gradient: "from-orange-500 to-red-500",
          description: "Advanced protection coating applied at your location",
        }
      }),
    };
  }

  // Branch service - show all services
  const allCarwashServices = getCarWashServices();
  const branchCarwashServices = allCarwashServices.reduce((acc, service) => {
    acc[service.id] = {
      name: service.name,
      price: service.basePrice,
      duration: service.duration,
      description: service.description,
      features: service.features,
      popular: service.category === 'premium',
    };
    return acc;
  }, {} as any);

  return {
    carwash: {
      name: "Car Wash",
      icon: Car,
      gradient: "from-blue-500 to-cyan-500",
      services: branchCarwashServices,
    },
    auto_detailing: {
      name: "Auto Detailing",
      icon: Star,
      gradient: "from-purple-500 to-pink-500",
      description: "Professional interior and exterior detailing",
    },
    graphene_coating: {
      name: "Graphene Coating",
      icon: Shield,
      gradient: "from-orange-500 to-red-500",
      description: "Advanced protection coating",
    },
  };
};

const SERVICE_CATEGORIES = {
  carwash: {
    name: "Car Wash",
    icon: Car,
    iconText: "🚗", // Safe for SelectItem
    gradient: "from-blue-500 to-cyan-500",
    services: adminConfig?.pricing?.carwash || {},
  },
  auto_detailing: {
    name: "Auto Detailing",
    icon: Star,
    iconText: "���", // Safe for SelectItem
    gradient: "from-purple-500 to-pink-500",
    description: "Professional interior and exterior detailing",
  },
  graphene_coating: {
    name: "Graphene Coating",
    icon: Shield,
    iconText: "🛡️", // Safe for SelectItem
    gradient: "from-orange-500 to-red-500",
    description: "Advanced protection coating",
  },
};

const UNIT_TYPES = {
  car: {
    name: "Car",
    sizes: {
      sedan: "Sedan",
      suv: "SUV",
      pickup: "Pickup",
      van_small: "Van Small",
      van_big: "Van Big",
    },
  },
  motorcycle: {
    name: "Motorcycle",
    sizes: {
      regular: "Regular",
      medium: "Medium",
      big_bike: "Big Bike",
    },
  },
};

// Get dynamic time slots based on admin config
const getTimeSlots = (date: string) => {
  try {
    if (!date) return [];
    const dayOfWeek = new Date(date).toLocaleDateString('en-us', { weekday: 'long' }).toLowerCase();
    return generateTimeSlots(dayOfWeek);
  } catch (error) {
    console.error('Error generating time slots:', error);
    return [];
  }
};

export default function StepperBooking({ isGuest = false }: StepperBookingProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const receiptObjectUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    category: "",
    service: "",
    serviceType: "branch", // Default to branch service
    unitType: "",
    unitSize: "",
    fullName: "",
    mobile: "",
    email: "",
    plateNo: "",
    carModel: "",
    address: "",
    date: "",
    timeSlot: "",
    branch: "",
    paymentMethod: "",
    receiptFile: null,
    acceptTerms: false,
    basePrice: 0,
    totalPrice: 0,
    voucherCode: undefined,
    voucherDiscount: 0,
    voucherData: undefined,
  });

  const [voucherInput, setVoucherInput] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (receiptObjectUrlRef.current) {
        URL.revokeObjectURL(receiptObjectUrlRef.current);
        receiptObjectUrlRef.current = null;
      }
    };
  }, []);

  // Memoize price calculation to prevent infinite loops
  const { basePrice, totalPrice } = useMemo(() => {
    let price = 0;

    if (bookingData.category === "carwash" && bookingData.service) {
      price = adminConfig.pricing.carwash[bookingData.service as keyof typeof adminConfig.pricing.carwash]?.price || 0;
    } else if (bookingData.category === "auto_detailing" && bookingData.unitType && bookingData.unitSize) {
      price = adminConfig.pricing.autoDetailing[bookingData.unitType as keyof typeof adminConfig.pricing.autoDetailing]?.[bookingData.unitSize as keyof typeof adminConfig.pricing.autoDetailing.car] || 0;
    } else if (bookingData.category === "graphene_coating" && bookingData.unitType && bookingData.unitSize) {
      price = adminConfig.pricing.grapheneCoating[bookingData.unitType as keyof typeof adminConfig.pricing.grapheneCoating]?.[bookingData.unitSize as keyof typeof adminConfig.pricing.grapheneCoating.car] || 0;
    }

    // Apply home service multiplier if applicable
    const basePrice = price;
    let totalPrice = price;
    if (bookingData.serviceType === 'home' && adminConfig.homeService?.enabled) {
      totalPrice = price * (adminConfig.homeService.priceMultiplier || 1.2);
    }

    // Apply voucher discount
    if (bookingData.voucherDiscount && bookingData.voucherDiscount > 0) {
      totalPrice = Math.max(0, totalPrice - bookingData.voucherDiscount);
    }

    return { basePrice, totalPrice };
  }, [bookingData.category, bookingData.service, bookingData.unitType, bookingData.unitSize, bookingData.serviceType, bookingData.voucherDiscount]);

  // Update prices when calculated values change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setBookingData(prev => ({
        ...prev,
        basePrice,
        totalPrice,
      }));
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [basePrice, totalPrice]);

  // Memoize progress calculation to prevent unnecessary re-renders
  const progressPercentage = useMemo(() => {
    const filledFields = Object.values(bookingData).filter(v => v && v !== "").length;
    return Math.round((filledFields / 10) * 100);
  }, [bookingData]);

  const goBackToStep1 = () => {
    setCurrentStep(1);
    setBookingData(prev => ({
      ...prev,
      serviceType: 'home',
      category: '',
      service: '',
      branch: 'Home Service',
      basePrice: 0,
      totalPrice: 0,
    }));
  };

  const updateBookingData = async (field: keyof BookingData, value: any) => {
    // Special handling for service type changes
    if (field === 'serviceType') {
      if (value === 'home') {
        // Silently clear incompatible selections when switching to home service
        // Don't show alert - let user make new selections
        if (bookingData.category) {
          const isAvailable = isServiceAvailableForHome(bookingData.category, bookingData.service || undefined);
          if (!isAvailable) {
            // Clear incompatible selections silently
            setBookingData(prev => ({
              ...prev,
              [field]: value,
              category: '',
              service: '',
              basePrice: 0,
              totalPrice: 0,
            }));
            return;
          }
        }
      }
    }

    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: { // Schedule
        const serviceTypeValid = !!bookingData.serviceType;
        const scheduleValid = !!(bookingData.date && bookingData.timeSlot);
        const locationValid = bookingData.serviceType === 'home' || !!bookingData.branch;
        return serviceTypeValid && scheduleValid && locationValid;
      }
      case 2: // Unit
        return !!(bookingData.unitType && bookingData.unitSize);
      case 3: { // Service
        if (!bookingData.category) return false;
        // For carwash require specific service; others rely on unit selection already made
        if (bookingData.category === 'carwash') {
          return !!bookingData.service;
        }
        return true;
      }
      case 4: { // Payment
        const paymentValid = !!bookingData.paymentMethod;
        const receiptValid = bookingData.paymentMethod === "online" ? !!bookingData.receiptFile : true;
        return paymentValid && receiptValid;
      }
      case 5: { // Review
        const basicCustomerValid = !!(bookingData.fullName && bookingData.mobile);
        const homeServiceAddressValid = bookingData.serviceType !== 'home' || !!bookingData.address;
        const emailValid = !isGuest || !!bookingData.email; // Email required for guests
        return basicCustomerValid && homeServiceAddressValid && emailValid && bookingData.acceptTerms;
      }
      default:
        return false;
    }
  };

  const canProceed = () => validateStep(currentStep);

  const nextStep = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum 1 day lead time
    return today.toISOString().split("T")[0];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      updateBookingData("receiptFile", file);
    }
  };

  const validateVoucherCode = async () => {
    if (!voucherInput.trim()) {
      toast({ title: "Enter voucher code", description: "Please enter a voucher code", variant: "destructive" });
      return;
    }
    if (bookingData.totalPrice <= 0) {
      toast({ title: "No booking amount", description: "Please complete booking details first", variant: "destructive" });
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const userEmail = isGuest ? bookingData.email : localStorage.getItem('userEmail') || undefined;
      const result = await neonDbClient.validateVoucher({
        code: voucherInput.trim().toUpperCase(),
        bookingAmount: bookingData.totalPrice,
        userEmail,
        bookingType: isGuest ? 'guest' : 'registered',
      });

      if (result.success && result.data) {
        setBookingData(prev => ({
          ...prev,
          voucherCode: result.data!.code,
          voucherDiscount: result.data!.discountAmount,
          voucherData: { title: result.data!.title, discountType: result.data!.discountType, discountValue: result.data!.discountValue },
        }));
        toast({ title: "Voucher Applied! \ud83c\udf89", description: `${result.data.title}: \u20b1${result.data.discountAmount.toFixed(2)} discount` });
        setVoucherInput("");
      } else {
        toast({ title: "Invalid Voucher", description: result.error || "This voucher code is invalid or cannot be used", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Validation Failed", description: err?.message || "Failed to validate voucher", variant: "destructive" });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setBookingData(prev => ({ ...prev, voucherCode: undefined, voucherDiscount: 0, voucherData: undefined }));
    setVoucherInput("");
    toast({ title: "Voucher Removed", description: "Voucher discount has been removed" });
  };

  const submitBooking = async () => {
    setIsLoading(true);

    try {
      // Prepare booking data for database
      const currentUser = localStorage.getItem("userEmail");

      const bookingPayload: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'confirmationCode'> = {
        userId: isGuest ? undefined : currentUser || undefined,
        guestInfo: isGuest ? {
          firstName: bookingData.fullName.split(' ')[0] || '',
          lastName: bookingData.fullName.split(' ').slice(1).join(' ') || '',
          email: bookingData.email,
          phone: bookingData.mobile,
        } : undefined,
        type: isGuest ? "guest" : "registered",

        // Service Details
        category: bookingData.category as any,
        service: bookingData.service,
        serviceType: bookingData.serviceType as "branch" | "home", // 'branch' or 'home'

        // Vehicle Details
        unitType: bookingData.unitType as any,
        unitSize: bookingData.unitSize,
        plateNumber: bookingData.plateNo,
        vehicleModel: bookingData.carModel,

        // Schedule Details
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        branch: bookingData.branch,
        serviceLocation: bookingData.serviceType === 'home' ? bookingData.address : bookingData.branch,
        estimatedDuration: getEstimatedDuration(bookingData.category, bookingData.service),

        // Pricing
        basePrice: bookingData.basePrice,
        totalPrice: bookingData.totalPrice,
        currency: 'PHP',

        // Payment Details
        paymentMethod: bookingData.paymentMethod as any,
        paymentStatus: bookingData.paymentMethod === 'online' ? 'pending' : 'pending',
        receiptUrl: bookingData.receiptFile ? (() => {
          // Clean up any existing object URL first
          if (receiptObjectUrlRef.current) {
            URL.revokeObjectURL(receiptObjectUrlRef.current);
          }
          // Create new object URL and store reference for cleanup
          const objectUrl = URL.createObjectURL(bookingData.receiptFile);
          receiptObjectUrlRef.current = objectUrl;
          return objectUrl;
        })() : undefined,

        // Status
        status: 'pending',

        // Additional Info
        notes: bookingData.notes,
        specialRequests: bookingData.notes,

        // Loyalty Points (for registered users)
        pointsEarned: isGuest ? 0 : Math.floor(bookingData.totalPrice / 100), // 1 point per 100 pesos
      };

      // Create booking using Neon database
      const bookingResult = await neonDbClient.createBooking(bookingPayload);
      if (!bookingResult.success || !bookingResult.booking) {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }
      const createdBooking = bookingResult.booking;

      // Send system notification to admin and manager about new booking
      const customerName = isGuest ? `${bookingData.fullName}` : 'Registered Customer';
      const notificationMessage = `New booking received from ${customerName}\n` +
        `Service: ${SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES].name}\n` +
        `Date: ${bookingData.date} at ${bookingData.timeSlot}\n` +
        `Amount: ₱${bookingData.totalPrice.toLocaleString()}\n` +
        `Type: ${isGuest ? 'Guest' : 'Registered User'}`;

      // Create system notification through API (this happens automatically in the API)
      console.log('🎯 New booking created:', createdBooking.id);

      // Redeem voucher if applied
      if (bookingData.voucherCode && bookingData.voucherDiscount && bookingData.voucherDiscount > 0) {
        try {
          const userEmail = isGuest ? bookingData.email : localStorage.getItem('userEmail') || undefined;
          await neonDbClient.redeemVoucher({
            code: bookingData.voucherCode,
            userEmail,
            bookingId: createdBooking.id,
            discountAmount: bookingData.voucherDiscount,
          });
          console.log('✅ Voucher redeemed:', bookingData.voucherCode);
        } catch (voucherErr) {
          console.warn('⚠️ Voucher redemption failed (non-critical):', voucherErr);
        }
      }

      notificationManager.success(
        "Booking Confirmed! 🎉",
        `Your booking has been successfully submitted!\n\nBooking ID: ${createdBooking.id}\nConfirmation Code: ${createdBooking.confirmationCode}\nService: ${SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES].name}\nTotal: ₱${bookingData.totalPrice.toLocaleString()}\n\nYou will receive confirmation shortly.`,
        { autoClose: 5000 }
      );

      // Reset form
      setBookingData({
        category: "",
        service: "",
        serviceType: "branch",
        unitType: "",
        unitSize: "",
        fullName: "",
        mobile: "",
        email: "",
        plateNo: "",
        carModel: "",
        address: "",
        date: "",
        timeSlot: "",
        branch: "",
        paymentMethod: "",
        receiptFile: null,
        acceptTerms: false,
        basePrice: 0,
        totalPrice: 0,
        voucherCode: undefined,
        voucherDiscount: 0,
        voucherData: undefined,
      });
      setVoucherInput("");
      setCurrentStep(1);

      // Navigate based on user type
      setTimeout(() => {
        if (isGuest) {
          navigate("/login?message=booking_created");
        } else {
          navigate("/my-bookings");
        }
      }, 3000);

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get estimated duration
  const getEstimatedDuration = (category: string, service: string): number => {
    if (category === "carwash" && adminConfig?.pricing?.carwash?.[service as keyof typeof adminConfig.pricing.carwash]) {
      const serviceData = adminConfig.pricing.carwash[service as keyof typeof adminConfig.pricing.carwash];
      const durationStr = serviceData.duration || "60 mins";
      return parseInt(durationStr.replace(/\D/g, '')) || 60;
    }
    return 60; // Default duration
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ScheduleStep bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 2:
        return <UnitStep bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 3:
        return <ServiceStep bookingData={bookingData} updateBookingData={updateBookingData} goBackToStep1={goBackToStep1} />;
      case 4:
        return <PaymentStep bookingData={bookingData} updateBookingData={updateBookingData} handleFileUpload={handleFileUpload} voucherInput={voucherInput} setVoucherInput={setVoucherInput} validateVoucherCode={validateVoucherCode} removeVoucher={removeVoucher} isValidatingVoucher={isValidatingVoucher} />;
      case 5:
        return <ReviewStep bookingData={bookingData} updateBookingData={updateBookingData} isGuest={isGuest} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Mobile Bottom Sheet for Booking Summary */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 md:hidden">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base font-bold">Booking Summary</SheetTitle>
            </SheetHeader>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <BookingSummary bookingData={bookingData} progressPercentage={progressPercentage} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Container with max width */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar (desktop only) */}
          <div className={`
            hidden lg:block lg:sticky top-0 left-0 h-screen w-80 lg:w-80 xl:w-96 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-border/50 z-10 lg:shadow-none
            lg:top-0 lg:h-auto lg:min-h-screen lg:max-h-screen
          `}>
            <div className="p-4 md:p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-black text-foreground">Booking Summary</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden h-10 w-10 rounded-full hover:bg-muted active:scale-95 transition-all"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <BookingSummary bookingData={bookingData} progressPercentage={progressPercentage} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 min-w-0">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-56 md:pb-8">
              {/* Mobile Sidebar Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSidebar(true)}
                  className="w-full h-12 text-base font-medium glass border-fac-orange-200 hover:bg-fac-orange-50 rounded-xl active:scale-95 transition-all duration-200"
                >
                  <Menu className="h-5 w-5 mr-2" />
                  View Booking Summary
                </Button>
              </div>

              {/* Stepper Header */}
              <div className="mb-4 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-foreground">
                    {isGuest ? "Guest " : ""}
                    <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                      Booking
                    </span>
                  </h1>
                  <Badge variant="outline" className="text-sm md:text-sm w-fit px-3 py-1 rounded-full">
                    Step {currentStep} of 5
                  </Badge>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden md:flex items-center space-x-4 overflow-x-auto pb-4">
                  {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <div className={`
                        flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 transition-all
                        ${currentStep === step.id
                          ? 'border-fac-orange-500 bg-fac-orange-500 text-white shadow-lg shadow-fac-orange-500/25'
                          : currentStep > step.id
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-border bg-background text-muted-foreground'
                        }
                      `}>
                        {currentStep > step.id ? (
                          <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                        ) : (
                          <step.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                        )}
                      </div>
                      <div className="ml-3 min-w-0">
                        <p className={`text-sm lg:text-base font-semibold ${
                          currentStep === step.id ? 'text-fac-orange-500' :
                          currentStep > step.id ? 'text-green-500' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-4 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Stepper - App-like Design */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-foreground">Progress</span>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {currentStep} of {STEPS.length}
                    </span>
                  </div>

                  {/* Enhanced Progress Bar for Mobile */}
                  <div className="w-full bg-muted rounded-full h-3 mb-4 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Enhanced Current Step Indicator */}
                  <div className="p-4 rounded-2xl border-2 border-fac-orange-500 bg-gradient-to-r from-fac-orange-50 to-orange-50 dark:from-fac-orange-950/50 dark:to-orange-950/50 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white shadow-lg">
                        {(() => {
                          const CurrentIcon = STEPS[currentStep - 1].icon;
                          return <CurrentIcon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <span className="text-base font-bold text-fac-orange-600 dark:text-fac-orange-400">
                          {STEPS[currentStep - 1].title}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">{STEPS[currentStep - 1].description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="w-full max-w-4xl">
                <div className="w-full overflow-visible pb-4 md:pb-6">
                  {renderStepContent()}
                </div>
              </div>

              {/* Navigation - Desktop only; mobile uses sticky bottom bar */}
              <div className="hidden md:flex flex-row justify-between items-stretch gap-3 mt-6 max-w-4xl">
                {/* Primary Action Button (Next/Submit) - First on mobile for better UX */}
                <div className="order-1 sm:order-2">
                  {currentStep === 5 ? (
                    <Button
                      onClick={submitBooking}
                      disabled={!canProceed() || isLoading}
                      className="w-full sm:min-w-[180px] h-14 sm:h-12 text-lg sm:text-base font-bold bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-lg active:scale-95"
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className={`w-full sm:min-w-[140px] h-14 sm:h-12 text-lg sm:text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-lg active:scale-95 ${
                        !canProceed()
                          ? 'bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white'
                      }`}
                      title={!canProceed() ? `Complete all fields in step ${currentStep} to continue` : 'Continue to next step'}
                    >
                      <span className="flex items-center">
                        {!canProceed() ? 'Complete Step' : 'Next'}
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </span>
                    </Button>
                  )}
                </div>

                {/* Secondary Action Button (Back) - Second on mobile */}
                <div className="order-2 sm:order-1">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="w-full sm:min-w-[120px] h-12 sm:h-12 text-base font-medium border border-border hover:bg-muted/50 transition-all duration-200 rounded-xl sm:rounded-lg active:scale-95 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar - Enhanced with Back Button */}
      <div className="fixed bottom-20 left-3 right-3 z-50 md:hidden">
        <div className="glass border-2 border-border bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl p-4 space-y-4">
          {/* Progress Info */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                {bookingData.basePrice > 0 ? 'Total Price' : `Step ${currentStep} of ${STEPS.length}`}
              </p>
              <p className="text-lg font-black text-foreground truncate">
                {bookingData.basePrice > 0 ? `₱${(bookingData.totalPrice || 0).toLocaleString()}` : STEPS[currentStep - 1].title}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl font-medium flex-shrink-0"
              onClick={() => setShowSidebar(true)}
            >
              Summary
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex-1 h-12 rounded-xl font-semibold border-2 disabled:opacity-40 disabled:cursor-not-allowed text-base"
            >
              <ChevronLeft className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>Back</span>
            </Button>

            {/* Next/Confirm Button */}
            {currentStep === 5 ? (
              <Button
                onClick={submitBooking}
                disabled={!canProceed() || isLoading}
                className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-base"
              >
                {isLoading ? 'Processing...' : 'Confirm Booking'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-base"
              >
                <span>Next Step</span>
                <ChevronRight className="h-4 w-4 ml-1.5 flex-shrink-0" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
const ServiceStep = ({ bookingData, updateBookingData, goBackToStep1 }: any) => {
  const availableServices = getAvailableServices(bookingData.serviceType || 'branch');
  const [branches, setBranches] = useState<{ id: string; name: string; address?: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const isAdmin = (localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'superadmin');

  useEffect(() => {
    const load = async () => {
      setLoadingBranches(true);
      try {
        const res = await neonDbClient.getBranches();
        if (res.success && res.branches && Array.isArray(res.branches)) {
          setBranches(res.branches.map((b: any) => ({ id: b.id || b.code || b.name, name: b.name, address: b.address })));
        } else {
          // Fallback to local admin config
          setBranches((adminConfig.branches || []).filter((b: any) => b.enabled).map((b: any) => ({ id: b.id, name: b.name, address: b.address })));
        }
      } catch (e) {
        setBranches((adminConfig.branches || []).filter((b: any) => b.enabled).map((b: any) => ({ id: b.id, name: b.name, address: b.address })));
      } finally {
        setLoadingBranches(false);
      }
    };
    load();
  }, []);

  const handleAddBranch = async () => {
    const name = window.prompt('New branch name');
    if (!name) return;
    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + String(Date.now()).slice(-2);
    const address = window.prompt('Branch address (optional)') || undefined;
    const city = 'Zamboanga City';
    try {
      const resp = await neonDbClient.createBranch({ name, code, address, city });
      if (resp.success) {
        toast({ title: 'Branch created', description: `${name} added.` });
        // reload branches - silently handle errors
        try {
          const res = await neonDbClient.getBranches();
          if (res.success && res.branches) {
            setBranches(res.branches.map((b: any) => ({ id: b.id || b.code || b.name, name: b.name, address: b.address })));
          }
        } catch {
          // Ignore errors, keep existing branches
        }
      } else {
        toast({ title: 'Failed to create branch', description: resp.error || 'Please try again', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Connection error', description: 'Unable to create branch. Please try again.', variant: 'destructive' });
    }
  };

  return (
  <Card className="glass border-border shadow-xl">
    <CardHeader className="pb-4 md:pb-6">
      <CardTitle className="flex items-center text-xl md:text-2xl">
        <Sparkles className="h-5 w-5 md:h-6 md:w-6 mr-3 text-fac-orange-500" />
        Choose Your Service
      </CardTitle>
      <p className="text-sm md:text-base text-muted-foreground mt-2">
        Select the perfect car care service for your vehicle
        {bookingData.serviceType === 'home' && (
          <span className="block text-xs text-orange-600 mt-1">
            Only selected services are available for home service
          </span>
        )}
      </p>
    </CardHeader>
    <CardContent className="space-y-4 md:space-y-6">
      {Object.entries(availableServices).map(([categoryKey, category]) => (
        <div
          key={categoryKey}
          className={`p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 active:scale-[0.98] ${
            bookingData.category === categoryKey
              ? 'border-fac-orange-500 bg-gradient-to-r from-fac-orange-50/80 to-orange-50/80 dark:from-fac-orange-950/50 dark:to-orange-950/50 shadow-xl shadow-fac-orange-500/20'
              : 'border-border/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-fac-orange-300 hover:shadow-xl hover:bg-fac-orange-50/30 dark:hover:bg-fac-orange-950/30'
          }`}
          onClick={async () => {
            // No need to validate category here - getAvailableServices already filtered
            // Only validate specific service selections (handled in service onClick)
            updateBookingData("category", categoryKey);
            updateBookingData("service", ""); // Reset service when category changes
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`bg-gradient-to-r ${category.gradient} p-3 md:p-4 rounded-2xl shadow-lg`}>
                <category.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-foreground text-lg md:text-xl">{category.name}</h3>
                {category.description && (
                  <p className="text-muted-foreground text-sm md:text-base mt-1">{category.description}</p>
                )}
              </div>
            </div>
            {bookingData.category === categoryKey && (
              <div className="mt-3 sm:mt-0 flex-shrink-0">
                <Badge className="bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                  ✓ Selected
                </Badge>
              </div>
            )}
          </div>
          
          {bookingData.category === categoryKey && categoryKey === "carwash" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-1 w-6 bg-fac-orange-500 rounded-full"></div>
                <p className="text-sm md:text-base font-semibold text-foreground">Select wash type:</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(category.services).map(([serviceKey, service]) => (
                  <div
                    key={serviceKey}
                    className={`relative p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                      bookingData.service === serviceKey
                        ? 'border-fac-orange-500 bg-gradient-to-br from-fac-orange-50 to-orange-50 dark:from-fac-orange-950 dark:to-orange-950 shadow-xl shadow-fac-orange-500/30'
                        : 'border-border/50 bg-white/90 dark:bg-gray-800/90 hover:border-fac-orange-300 hover:shadow-lg hover:bg-fac-orange-50/50 dark:hover:bg-fac-orange-950/50'
                    }`}
                    onClick={async (e) => {
                      e.stopPropagation();

                      // Check if this service is available for current service type
                      if (bookingData.serviceType === 'home') {
                        const isAvailable = isServiceAvailableForHome('carwash', serviceKey, bookingData.unitType);
                        if (!isAvailable) {
                          if (bookingData.unitType === 'motorcycle') {
                          showHomeServiceUnavailableAlert(`${service.name} is not available for motorcycle home service. Please check available motorcycle services in admin settings.`, goBackToStep1);
                        } else {
                          showHomeServiceUnavailableAlert(service.name, goBackToStep1);
                        }
                          return;
                        }
                      }

                      updateBookingData("service", serviceKey);
                    }}
                  >
                    {service.popular && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-gradient-to-r from-fac-orange-500 to-red-500 text-white text-xs">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-bold text-foreground text-sm md:text-base">{service.name}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{service.duration}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base md:text-lg font-black text-fac-orange-500">₱{service.price.toLocaleString()}</p>
                        {bookingData.service === serviceKey && (
                          <div className="flex items-center justify-end mt-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {bookingData.category === categoryKey && categoryKey !== "carwash" && (
            <div className="mt-4">
              {bookingData.unitType && bookingData.unitSize ? (
                <div className="p-4 md:p-5 rounded-lg bg-gradient-to-r from-fac-orange-50 to-orange-50 dark:from-fac-orange-950/50 dark:to-orange-950/50 border-2 border-fac-orange-200 dark:border-fac-orange-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm md:text-base text-foreground font-semibold">
                        Service Price
                      </p>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-fac-orange-500">
                      ₱{(() => {
                        const getPrice = () => {
                          if (categoryKey === "auto_detailing") {
                            return adminConfig.pricing.autoDetailing[bookingData.unitType as keyof typeof adminConfig.pricing.autoDetailing]?.[bookingData.unitSize as keyof typeof adminConfig.pricing.autoDetailing.car] || 0;
                          } else if (categoryKey === "graphene_coating") {
                            return adminConfig.pricing.grapheneCoating[bookingData.unitType as keyof typeof adminConfig.pricing.grapheneCoating]?.[bookingData.unitSize as keyof typeof adminConfig.pricing.grapheneCoating.car] || 0;
                          }
                          return 0;
                        };
                        return getPrice().toLocaleString();
                      })()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Price for {UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]?.sizes[bookingData.unitSize as keyof typeof UNIT_TYPES.car.sizes]}
                  </p>
                </div>
              ) : (
                <div className="p-3 md:p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Selected — price will be shown after vehicle selection.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
  );
};

const UnitStep = ({ bookingData, updateBookingData }: any) => (
  <Card className="glass border-border shadow-xl">
    <CardHeader>
      <CardTitle className="flex items-center text-2xl">
        <Car className="h-6 w-6 mr-3 text-fac-orange-500" />
        Select Your Vehicle
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {Object.entries(UNIT_TYPES).map(([typeKey, type]) => (
        <div key={typeKey} className="space-y-4">
          <div
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 active:scale-[0.98] ${
              bookingData.unitType === typeKey
                ? 'border-fac-orange-500 bg-gradient-to-r from-fac-orange-50 to-orange-50 dark:from-fac-orange-950/50 dark:to-orange-950/50 shadow-xl'
                : 'border-border/50 bg-white/90 dark:bg-gray-800/90 hover:border-fac-orange-300 hover:shadow-lg hover:bg-fac-orange-50/30 dark:hover:bg-fac-orange-950/30'
            }`}
            onClick={() => {
              updateBookingData("unitType", typeKey);
              updateBookingData("unitSize", ""); // Reset size when type changes
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-foreground text-xl">{type.name}</h3>
              {bookingData.unitType === typeKey && (
                <Badge className="bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                  ✓ Selected
                </Badge>
              )}
            </div>
          </div>
          
          {bookingData.unitType === typeKey && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-0 sm:ml-4">
              {Object.entries(type.sizes).map(([sizeKey, sizeName]) => {
                const getPrice = () => {
                  if (bookingData.category === "auto_detailing") {
                    return adminConfig.pricing.autoDetailing[typeKey as keyof typeof adminConfig.pricing.autoDetailing]?.[sizeKey as keyof typeof adminConfig.pricing.autoDetailing.car] || 0;
                  } else if (bookingData.category === "graphene_coating") {
                    return adminConfig.pricing.grapheneCoating[typeKey as keyof typeof adminConfig.pricing.grapheneCoating]?.[sizeKey as keyof typeof adminConfig.pricing.grapheneCoating.car] || 0;
                  }
                  return 0;
                };

                return (
                  <div
                    key={sizeKey}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center active:scale-95 min-h-[80px] flex flex-col justify-center ${
                      bookingData.unitSize === sizeKey
                        ? 'border-fac-orange-500 bg-gradient-to-br from-fac-orange-500 to-fac-orange-600 text-white shadow-xl'
                        : 'border-border/50 bg-white/90 dark:bg-gray-800/90 hover:border-fac-orange-300 hover:shadow-lg hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950/50'
                    }`}
                    onClick={() => updateBookingData("unitSize", sizeKey)}
                  >
                    <p className="font-bold text-base mb-1">{sizeName}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
);

const ScheduleStep = ({ bookingData, updateBookingData }: any) => {
  const availableSlots = bookingData?.date ? getTimeSlots(bookingData.date) : [];
  const homeServiceConfig = adminConfig?.homeService || {};

  // Load branches from backend and allow admin to add branches
  const [branches, setBranches] = useState<{ id: string; name: string; address?: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const isAdmin = (localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'superadmin');

  useEffect(() => {
    const load = async () => {
      setLoadingBranches(true);
      try {
        console.log("📍 Loading branches from database...");
        const res = await neonDbClient.getBranches();
        console.log("📍 Branches response:", res);

        if (res.success && res.branches && Array.isArray(res.branches) && res.branches.length > 0) {
          const mappedBranches = res.branches.map((b: any) => ({
            id: b.id || b.code || b.name,
            name: b.name,
            address: b.address
          }));
          console.log("✅ Loaded", mappedBranches.length, "branches from database");
          setBranches(mappedBranches);
        } else {
          console.warn("⚠️ No branches in database, using fallback config");
          // Fallback to local admin config
          const fallbackBranches = (adminConfig.branches || [])
            .filter((b: any) => b.enabled)
            .map((b: any) => ({ id: b.id, name: b.name, address: b.address }));
          setBranches(fallbackBranches);
          console.log("📍 Using", fallbackBranches.length, "fallback branches from config");
        }
      } catch (e) {
        // Silently handle error and use fallback - this is expected behavior
        console.warn("⚠️ Using fallback branches (database unavailable)");
        // Fallback to local admin config on error
        const fallbackBranches = (adminConfig.branches || [])
          .filter((b: any) => b.enabled)
          .map((b: any) => ({ id: b.id, name: b.name, address: b.address }));
        setBranches(fallbackBranches);
        console.log("📍 Loaded", fallbackBranches.length, "branches from config");
      } finally {
        setLoadingBranches(false);
      }
    };
    load();
  }, []);

  const handleAddBranch = async () => {
    const name = window.prompt('New branch name');
    if (!name) return;
    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + String(Date.now()).slice(-2);
    const address = window.prompt('Branch address (optional)') || undefined;
    const city = 'Zamboanga City';
    try {
      const resp = await neonDbClient.createBranch({ name, code, address, city });
      if (resp.success) {
        toast({ title: 'Branch created', description: `${name} added.` });
        // reload branches - silently handle errors
        try {
          const res = await neonDbClient.getBranches();
          if (res.success && res.branches) {
            setBranches(res.branches.map((b: any) => ({ id: b.id || b.code || b.name, name: b.name, address: b.address })));
          }
        } catch {
          // Ignore errors, keep existing branches
        }
      } else {
        toast({ title: 'Failed to create branch', description: resp.error || 'Please try again', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Connection error', description: 'Unable to create branch. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <Card className="glass border-border shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="h-6 w-6 mr-3 text-fac-orange-500" />
          Schedule Your Visit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Type Selection */}
        <div>
          <Label className="text-foreground font-semibold">Service Type</Label>
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                bookingData.serviceType === 'branch'
                  ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 shadow-lg'
                  : 'border-border hover:border-fac-orange-300'
              }`}
              onClick={() => {
                updateBookingData("serviceType", "branch");
                updateBookingData("branch", ""); // Reset branch selection
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Visit Branch</h3>
                  <p className="text-sm text-muted-foreground">Come to our service center</p>
                </div>
              </div>
              {bookingData.serviceType === 'branch' && (
                <Badge className="bg-fac-orange-500 text-white text-xs mt-2">Selected</Badge>
              )}
            </div>

            {homeServiceConfig.enabled && (
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  bookingData.serviceType === 'home'
                    ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 shadow-lg'
                    : 'border-border hover:border-fac-orange-300'
                }`}
                onClick={() => {
                  updateBookingData("serviceType", "home");
                  updateBookingData("branch", "Home Service"); // Set branch to home service
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Home Service</h3>
                    <p className="text-sm text-muted-foreground">We come to your location</p>
                    <p className="text-xs text-orange-600 mt-1">
                      +{Math.round((homeServiceConfig.priceMultiplier - 1) * 100)}% additional fee
                    </p>
                  </div>
                </div>
                {bookingData.serviceType === 'home' && (
                  <Badge className="bg-fac-orange-500 text-white text-xs mt-2">Selected</Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="text-foreground font-semibold">Select Date</Label>
            <div className="relative mt-2">
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={bookingData.date}
                onChange={(e) => updateBookingData("date", e.target.value)}
                className="pr-10 cursor-pointer"
                placeholder="Choose service date"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {bookingData.serviceType === 'branch' && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-semibold">Select Branch</Label>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={handleAddBranch} className="text-xs">+ Add Branch</Button>
                )}
              </div>
              <Select value={bookingData.branch} onValueChange={(value) => updateBookingData("branch", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Choose branch"} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {String(branch.name)}{branch.address ? ` - ${branch.address}` : ''}
                    </SelectItem>
                  ))}
                  {branches.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No branches available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {bookingData.serviceType === 'home' && (
            <div>
              <Label className="text-foreground font-semibold">Service Area</Label>
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Available Areas:
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {homeServiceConfig.coverage?.areas?.join(', ') || 'Coverage areas not configured'}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  Minimum {homeServiceConfig.leadTime || 4} hours advance booking required
                </p>
              </div>
            </div>
          )}
        </div>

        {bookingData.date && (bookingData.serviceType === 'branch' ? bookingData.branch : true) && (
          <div>
            <Label className="text-foreground font-semibold">Available Time Slots</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {availableSlots.map((slot) => {
                const slotInfo = bookingData?.date && bookingData?.branch ?
                  getSlotAvailability(bookingData.date, slot, bookingData.branch) :
                  { isAvailable: true, currentBookings: 0, maxCapacity: 2 };
                const isAvailable = slotInfo.isAvailable;
                return (
                  <Button
                    key={slot}
                    variant={bookingData.timeSlot === slot ? "default" : "outline"}
                    onClick={() => isAvailable && updateBookingData("timeSlot", slot)}
                    disabled={!isAvailable}
                    className={`h-auto py-3 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-center">
                      <div className="font-medium">{slot}</div>
                      {!isAvailable ? (
                        <span className="block text-xs text-red-500">Full</span>
                      ) : slotInfo.currentBookings > 0 ? (
                        <span className="block text-xs text-orange-500">
                          {slotInfo.currentBookings}/{slotInfo.maxCapacity} booked
                        </span>
                      ) : (
                        <span className="block text-xs text-green-500">Available</span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            {availableSlots.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No available slots for this date. Please select another date.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PaymentStep = ({ bookingData, updateBookingData, handleFileUpload, voucherInput, setVoucherInput, validateVoucherCode, removeVoucher, isValidatingVoucher }: any) => (
  <Card className="glass border-border shadow-xl">
    <CardHeader>
      <CardTitle className="flex items-center text-2xl">
        <CreditCard className="h-6 w-6 mr-3 text-fac-orange-500" />
        Payment Method
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Voucher Section */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-700">
        <div className="flex items-center mb-3">
          <Tag className="h-5 w-5 mr-2 text-purple-600" />
          <h4 className="font-bold text-foreground">Have a Voucher Code?</h4>
        </div>
        {bookingData.voucherCode ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200">
              <div className="flex-1">
                <p className="font-bold text-green-700 dark:text-green-300">{bookingData.voucherData?.title}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Code: {bookingData.voucherCode}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Discount: ₱{bookingData.voucherDiscount?.toFixed(2)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={removeVoucher} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter voucher code"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && validateVoucherCode()}
              className="flex-1"
              disabled={isValidatingVoucher}
            />
            <Button onClick={validateVoucherCode} disabled={isValidatingVoucher || !voucherInput.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
              {isValidatingVoucher ? "Checking..." : "Apply"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {adminConfig.paymentMethods.branch.enabled && (
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              bookingData.paymentMethod === "branch"
                ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50'
                : 'border-border hover:border-fac-orange-300'
            }`}
            onClick={() => updateBookingData("paymentMethod", "branch")}
          >
            <h3 className="font-bold text-foreground">{adminConfig.paymentMethods.branch.name}</h3>
            <p className="text-sm text-muted-foreground">{adminConfig.paymentMethods.branch.description}</p>
          </div>
        )}

        {adminConfig.paymentMethods.online.enabled && (
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              bookingData.paymentMethod === "online"
                ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50'
                : 'border-border hover:border-fac-orange-300'
            }`}
            onClick={() => updateBookingData("paymentMethod", "online")}
          >
            <h3 className="font-bold text-foreground">{adminConfig.paymentMethods.online.name}</h3>
            <p className="text-sm text-muted-foreground">{adminConfig.paymentMethods.online.description}</p>
          </div>
        )}

        {/* On-site payment for home service */}
        {bookingData.serviceType === 'home' && adminConfig.paymentMethods.onsite && adminConfig.paymentMethods.onsite.enabled && (
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              bookingData.paymentMethod === "onsite"
                ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50'
                : 'border-border hover:border-fac-orange-300'
            }`}
            onClick={() => updateBookingData("paymentMethod", "onsite")}
          >
            <h3 className="font-bold text-foreground">{adminConfig.paymentMethods.onsite.name}</h3>
            <p className="text-sm text-muted-foreground">{adminConfig.paymentMethods.onsite.description}</p>
          </div>
        )}
      </div>

      {bookingData.paymentMethod === "online" && adminConfig.paymentMethods.online.enabled && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200">
          <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-3">Payment Instructions</h4>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            {adminConfig.paymentMethods.online.instructions.bankTransfer && (
              <>
                <p><strong>Bank Transfer:</strong> {adminConfig.paymentMethods.online.instructions.bankTransfer.bankName} - {adminConfig.paymentMethods.online.instructions.bankTransfer.accountNumber}</p>
                <p><strong>Account Name:</strong> {adminConfig.paymentMethods.online.instructions.bankTransfer.accountName}</p>
              </>
            )}
            {adminConfig.paymentMethods.online.instructions.gcash && (
              <>
                <p><strong>GCash:</strong> {adminConfig.paymentMethods.online.instructions.gcash.number}</p>
                <p><strong>Account Name:</strong> {adminConfig.paymentMethods.online.instructions.gcash.accountName}</p>
              </>
            )}
            <p><strong>Amount:</strong> ₱{bookingData.totalPrice.toLocaleString()}</p>
          </div>

          <div className="mt-4">
            <Label className="text-blue-800 dark:text-blue-200 font-semibold">Upload Receipt</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="mt-2"
            />
            {bookingData.receiptFile && (
              <p className="text-xs text-green-600 mt-1">✓ {bookingData.receiptFile.name}</p>
            )}
          </div>
        </div>
      )}

      {bookingData.paymentMethod === "onsite" && adminConfig.paymentMethods.onsite && adminConfig.paymentMethods.onsite.enabled && (
        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200">
          <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">On-Site Payment</h4>
          <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>The crew will collect payment at your location.</p>
            <p><strong>Amount:</strong> ���{bookingData.totalPrice.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Please prepare the exact amount. Receipts will be provided by the crew.</p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const ReviewStep = ({ bookingData, updateBookingData, isGuest }: any) => (
  <div className="space-y-6">
    {/* Customer Details */}
    <Card className="glass border-border shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <User className="h-6 w-6 mr-3 text-fac-orange-500" />
          Customer Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground font-semibold">Full Name *</Label>
            <Input
              value={bookingData.fullName}
              onChange={(e) => updateBookingData("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={`mt-1 ${!bookingData.fullName.trim() ? 'border-red-500 focus:border-red-500' : ''}`}
              required
            />
            {!bookingData.fullName.trim() && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Full name is required
              </p>
            )}
          </div>
          <div>
            <Label className="text-foreground font-semibold">Mobile Number *</Label>
            <Input
              value={bookingData.mobile}
              onChange={(e) => {
                // Auto-format mobile number
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('0')) value = '63' + value.substring(1);
                updateBookingData("mobile", value);
              }}
              placeholder="+63 912 345 6789"
              className={`mt-1 ${!bookingData.mobile.trim() || bookingData.mobile.replace(/\D/g, '').length < 10 ? 'border-red-500 focus:border-red-500' : ''}`}
              required
            />
            {(!bookingData.mobile.trim() || bookingData.mobile.replace(/\D/g, '').length < 10) && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {!bookingData.mobile.trim() ? 'Mobile number is required' : 'Please enter a valid mobile number'}
              </p>
            )}
          </div>
          <div>
            <Label className="text-foreground font-semibold">
              Email {isGuest && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="email"
              value={bookingData.email}
              onChange={(e) => updateBookingData("email", e.target.value)}
              placeholder="your.email@example.com"
              className={`mt-1 ${(isGuest && !bookingData.email.trim()) || (bookingData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) ? 'border-red-500 focus:border-red-500' : ''}`}
              required={isGuest}
            />
            {((isGuest && !bookingData.email.trim()) || (bookingData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email))) && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {isGuest && !bookingData.email.trim() ? 'Email is required for guest bookings' : 'Please enter a valid email address'}
              </p>
            )}
          </div>
          <div>
            <Label className="text-foreground font-semibold">Plate Number</Label>
            <Input
              value={bookingData.plateNo}
              onChange={(e) => updateBookingData("plateNo", e.target.value.toUpperCase())}
              placeholder="ABC 1234"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Optional - helps us identify your vehicle</p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-foreground font-semibold">Car Model & Year</Label>
            <Input
              value={bookingData.carModel}
              onChange={(e) => updateBookingData("carModel", e.target.value)}
              placeholder="e.g., Hilux Conquest 2024, Honda Civic 2023, Toyota Vios 2022"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Example: "Toyota Hilux Conquest 2024" or "Honda Civic Type R 2023"
            </p>
          </div>
        </div>
        <div>
          <Label className="text-foreground font-semibold">Address *</Label>

          {/* Address Options */}
          <div className="mt-2 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const defaultAddress = "123 Sample Street, Barangay Example, Manila City, Metro Manila";
                updateBookingData("address", defaultAddress);
              }}
              className="flex items-center justify-center text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Use Default
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      // In a real app, you'd reverse geocode these coordinates
                      const { latitude, longitude } = position.coords;
                      const locationAddress = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                      updateBookingData("address", locationAddress);
                      toast({
                        title: "Location Retrieved",
                        description: "Your current location has been set as the address.",
                      });
                    },
                    (error) => {
                      toast({
                        title: "Location Error",
                        description: "Unable to get your current location. Please enter manually.",
                        variant: "destructive",
                      });
                    }
                  );
                } else {
                  toast({
                    title: "Not Supported",
                    description: "Geolocation is not supported by this browser.",
                    variant: "destructive",
                  });
                }
              }}
              className="flex items-center justify-center text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Current Location
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateBookingData("address", "");
              }}
              className="flex items-center justify-center text-xs"
            >
              <User className="h-3 w-3 mr-1" />
              Custom Address
            </Button>
          </div>

          <Textarea
            value={bookingData.address}
            onChange={(e) => updateBookingData("address", e.target.value)}
            placeholder="Enter your complete address (street, barangay, city, province)"
            className={`${!bookingData.address.trim() || bookingData.address.trim().length < 10 ? 'border-red-500 focus:border-red-500' : ''}`}
            rows={3}
            required
          />
          {(!bookingData.address.trim() || bookingData.address.trim().length < 10) && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {!bookingData.address.trim() ? 'Address is required' : 'Please provide a complete address'}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            💡 Use the buttons above for quick address entry, or type your custom address
          </p>
        </div>
      </CardContent>
    </Card>
    
    {/* Terms and Conditions */}
    <Card className="glass border-border shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={bookingData.acceptTerms}
            onCheckedChange={(checked) => updateBookingData("acceptTerms", checked)}
          />
          <div className="text-sm">
            <p className="text-foreground font-semibold">Terms and Conditions *</p>
            <div className="text-muted-foreground mt-1 space-y-2">
              <p>{adminConfig.terms.termsAndConditions}</p>
              <p><strong>Cancellation Policy:</strong> {adminConfig.terms.cancellationPolicy}</p>
              {adminConfig.terms.noShowPolicy && (
                <p><strong>No-Show Policy:</strong> {adminConfig.terms.noShowPolicy}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Booking Summary Component
const BookingSummary = ({ bookingData, progressPercentage }: { bookingData: BookingData; progressPercentage: number }) => (
  <div className="space-y-3 md:space-y-4">
    {/* Service Details */}
    <Card className="border-border glass">
      <CardContent className="p-3 md:p-4">
        <h4 className="font-bold text-foreground mb-2 md:mb-3 text-sm md:text-base flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-fac-orange-500" />
          Service Details
        </h4>
        {bookingData.category ? (
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium text-foreground text-right">
                {bookingData.category && SERVICE_CATEGORIES?.[bookingData.category as keyof typeof SERVICE_CATEGORIES]?.name || '-'}
              </span>
            </div>
            {bookingData.service && bookingData.category === "carwash" && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-foreground text-right">
                  {adminConfig?.pricing?.carwash?.[bookingData.service as keyof typeof adminConfig.pricing.carwash]?.name || '-'}
                </span>
              </div>
            )}
            {bookingData.unitType && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">
                  {bookingData.unitType ? UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]?.name : '-'}
                  {bookingData.unitSize && bookingData.unitType && ` - ${UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]?.sizes?.[bookingData.unitSize as keyof typeof UNIT_TYPES.car] || ''}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground">Select a service to see details</p>
        )}
      </CardContent>
    </Card>

    {/* Schedule Details */}
    {bookingData.date && (
      <Card className="border-border glass">
        <CardContent className="p-3 md:p-4">
          <h4 className="font-bold text-foreground mb-2 md:mb-3 text-sm md:text-base flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-fac-orange-500" />
            Schedule
          </h4>
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium text-foreground">
                {(() => {
                  try {
                    if (!bookingData.date) return '-';
                    const date = new Date(bookingData.date);
                    if (isNaN(date.getTime())) return bookingData.date;
                    return date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    });
                  } catch {
                    return bookingData.date || '-';
                  }
                })()}
              </span>
            </div>
            {bookingData.timeSlot && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium text-foreground">{bookingData.timeSlot}</span>
              </div>
            )}
            {bookingData.branch && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{bookingData.branch}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Customer Info (for guest bookings) */}
    {bookingData.fullName && (
      <Card className="border-border glass">
        <CardContent className="p-3 md:p-4">
          <h4 className="font-bold text-foreground mb-2 md:mb-3 text-sm md:text-base flex items-center">
            <User className="h-4 w-4 mr-2 text-fac-orange-500" />
            Customer
          </h4>
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground text-right max-w-[60%]">{bookingData.fullName}</span>
            </div>
            {bookingData.mobile && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-medium text-foreground">{bookingData.mobile}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Price Summary */}
    <Card className="border-fac-orange-200 glass bg-gradient-to-br from-fac-orange-50/50 to-purple-50/50 dark:from-fac-orange-950/30 dark:to-purple-950/30">
      <CardContent className="p-3 md:p-4">
        <h4 className="font-bold text-foreground mb-2 md:mb-3 text-sm md:text-base flex items-center">
          <CreditCard className="h-4 w-4 mr-2 text-fac-orange-500" />
          Price Summary
        </h4>
        {bookingData.basePrice > 0 ? (
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Base Price:</span>
              <span className="font-medium text-foreground">₱{(bookingData.basePrice || 0).toLocaleString()}</span>
            </div>
            {bookingData.serviceType === 'home' && adminConfig?.homeService?.enabled && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Home Service Fee:</span>
                <span className="font-medium text-orange-600">
                  +₱{((bookingData.totalPrice || 0) - (bookingData.basePrice || 0) + (bookingData.voucherDiscount || 0)).toLocaleString()}
                </span>
              </div>
            )}
            {bookingData.voucherCode && bookingData.voucherDiscount && bookingData.voucherDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center">
                  <Tag className="h-3 w-3 mr-1 text-purple-600" />
                  Voucher ({bookingData.voucherCode}):
                </span>
                <span className="font-medium text-green-600">
                  -₱{(bookingData.voucherDiscount || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-base md:text-lg">Total:</span>
                <span className="font-bold text-fac-orange-500 text-lg md:text-xl">₱{(bookingData.totalPrice || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground">Price will be calculated based on your selections</p>
        )}
      </CardContent>
    </Card>

    {/* Progress Indicator */}
    <Card className="border-border glass">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-foreground">Booking Progress</span>
          <span className="text-xs md:text-sm text-muted-foreground">{progressPercentage || 0}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-gradient-to-r from-fac-orange-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage || 0}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  </div>
);
