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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import Swal from "sweetalert2";
import {
  getAdminConfig,
  generateTimeSlots,
  isSlotAvailable,
} from "@/utils/adminConfig";
import { neonDbClient, type Booking } from "@/services/neonDatabaseService";
import {
  getCarWashServices,
  calculateServicePrice,
} from "@/utils/carWashServices";
import { getSlotAvailability } from "@/utils/databaseSchema";
import { xenditService } from "@/services/xenditService";
import FACPayButton from "@/components/FACPayButton";
import PaymentMethodsSelection from "@/components/PaymentMethodsSelection";
import React, { Suspense } from "react";
import BookingProgressBar from "@/components/BookingProgressBar";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

const BookingReceiptModal = React.lazy(
  () => import("@/components/BookingReceiptModal"),
);

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
  paymentMethodDetail?: string; // e.g., 'gcash', 'paymaya', 'card'
  receiptFile: File | null;

  // Terms
  acceptTerms: boolean;

  // Computed
  basePrice: number;
  totalPrice: number;

  // Voucher
  voucherCode?: string;
  voucherDiscount?: number;
  voucherData?: { title: string; discountType: string; discountValue: number };
}

interface StepperBookingProps {
  isGuest?: boolean;
}

const STEPS = [
  { id: 1, title: "Schedule", icon: Calendar, description: "Pick date & time" },
  { id: 2, title: "Vehicle", icon: Car, description: "Select vehicle type" },
  {
    id: 3,
    title: "Category",
    icon: Sparkles,
    description: "Choose service category",
  },
  { id: 4, title: "Package", icon: Star, description: "Select package" },
  { id: 5, title: "Details", icon: User, description: "Your information" },
  { id: 6, title: "Payment", icon: CreditCard, description: "Payment method" },
  { id: 7, title: "Review", icon: CheckCircle, description: "Confirm booking" },
];

// Load admin configuration with error handling
let adminConfig;
try {
  adminConfig = getAdminConfig();
} catch (error) {
  console.error("Error loading admin config:", error);
  // Fallback to basic config
  adminConfig = {
    pricing: {
      carwash: {},
      autoDetailing: { car: {}, motorcycle: {} },
      grapheneCoating: { car: {}, motorcycle: {} },
    },
    branches: [],
    paymentMethods: {
      branch: { enabled: true },
      online: { enabled: true },
      onsite: {
        enabled: true,
        name: "On-Site Payment",
        description: "Pay the crew at your location (Home Service only)",
      },
    },
    terms: { termsAndConditions: "", cancellationPolicy: "", noShowPolicy: "" },
  };
}

// Function to check if a service is available for home service
const isServiceAvailableForHome = (
  category: string,
  service?: string,
  vehicleType?: string,
) => {
  const homeServiceConfig = adminConfig?.homeService || {};

  if (!homeServiceConfig.enabled) {
    return false;
  }

  if (category === "carwash" && service) {
    // Special validation for motorcycles
    if (vehicleType === "motorcycle") {
      return (
        homeServiceConfig.availableServices?.motorcycleCarwash?.includes(
          service,
        ) || false
      );
    }
    return (
      homeServiceConfig.availableServices?.carwash?.includes(service) || false
    );
  } else if (category === "auto_detailing") {
    return homeServiceConfig.availableServices?.autoDetailing || false;
  } else if (category === "graphene_coating") {
    return homeServiceConfig.availableServices?.grapheneCoating || false;
  }

  return false;
};

// Function to show home service unavailable alert
const showHomeServiceUnavailableAlert = (
  serviceName: string,
  goBackToStep1: () => void,
) => {
  Swal.fire({
    icon: "warning",
    title: "Service Not Available for Home Service",
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
    confirmButtonText: "Choose Another Service",
    confirmButtonColor: "#f97316",
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

  if (serviceType === "home" && homeServiceConfig.enabled) {
    // Get actual carwash services from the carwash services utility
    const allCarwashServices = getCarWashServices();
    const availableCarwashServices =
      homeServiceConfig.availableServices?.carwash || [];

    // Convert carwash services array to object format expected by the UI
    const filteredCarwashServices = allCarwashServices
      .filter((service) => availableCarwashServices.includes(service.id))
      .reduce((acc, service) => {
        acc[service.id] = {
          name: service.name,
          price: service.basePrice,
          duration: service.duration,
          description: service.description,
          features: service.features,
          popular: service.category === "premium",
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
        },
      }),
      ...(homeServiceConfig.availableServices?.autoDetailing && {
        auto_detailing: {
          name: "Auto Detailing (Home Service)",
          icon: Star,
          gradient: "from-purple-500 to-pink-500",
          description:
            "Professional interior and exterior detailing at your location",
        },
      }),
      ...(homeServiceConfig.availableServices?.grapheneCoating && {
        graphene_coating: {
          name: "Graphene Coating (Home Service)",
          icon: Shield,
          gradient: "from-orange-500 to-red-500",
          description: "Advanced protection coating applied at your location",
        },
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
      popular: service.category === "premium",
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
    vehicleTypes: ["car"],
  },
  motorwash: {
    name: "Motorwash",
    icon: Car,
    iconText: "🏍️", // Safe for SelectItem
    gradient: "from-cyan-500 to-blue-600",
    description: "Professional motorcycle washing and care",
    vehicleTypes: ["motorcycle"],
  },
  auto_detailing: {
    name: "Auto Detailing",
    icon: Star,
    iconText: "���", // Safe for SelectItem
    gradient: "from-purple-500 to-pink-500",
    description: "Professional interior and exterior detailing",
    vehicleTypes: ["car", "motorcycle"],
  },
  graphene_coating: {
    name: "Graphene Coating",
    icon: Shield,
    iconText: "🛡️", // Safe for SelectItem
    gradient: "from-orange-500 to-red-500",
    description: "Advanced protection coating",
    vehicleTypes: ["car", "motorcycle"],
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
    // Parse date string (YYYY-MM-DD) without timezone interpretation
    // Add T00:00:00 and Z to explicitly set UTC, then use the date as-is
    const [year, month, day] = date.split("-").map(Number);
    // Create date in local timezone by specifying components
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d
      .toLocaleDateString("en-us", { weekday: "long" })
      .toLowerCase();
    console.log(`📅 Date: ${date}, Day: ${dayOfWeek}`);
    return generateTimeSlots(dayOfWeek);
  } catch (error) {
    console.error("Error generating time slots:", error);
    return [];
  }
};

export default function StepperBooking({
  isGuest = false,
}: StepperBookingProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const receiptObjectUrlRef = useRef<string | null>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

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
    paymentMethodDetail: undefined,
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

  // Inline step errors to show near navigation
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // User vehicles and data for registered users
  const [savedVehicles, setSavedVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Debounce protection for navigation buttons
  const navigationDebounceRef = useRef(false);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (receiptObjectUrlRef.current) {
        URL.revokeObjectURL(receiptObjectUrlRef.current);
        receiptObjectUrlRef.current = null;
      }
    };
  }, []);

  // Load user data and vehicles for registered users
  useEffect(() => {
    const loadUserData = async () => {
      if (isGuest) return;

      const userEmail = localStorage.getItem("userEmail");
      const userId = localStorage.getItem("userId");
      const currentUserStr = localStorage.getItem("currentUser");

      if (!userEmail || !userId) return;

      // Parse current user object if available
      let currentUser: any = null;
      try {
        if (currentUserStr) {
          currentUser = JSON.parse(currentUserStr);
        }
      } catch (e) {
        console.error("Failed to parse currentUser:", e);
      }

      // Set user basic data
      const userName =
        currentUser?.fullName || localStorage.getItem("userFullName") || "";
      const userContact = currentUser?.contactNumber || "";
      const userAddress =
        currentUser?.address || currentUser?.defaultAddress || "";

      const user = {
        id: userId,
        email: userEmail,
        fullName: userName,
        contactNumber: userContact,
        defaultAddress: userAddress,
      };
      setUserData(user);

      // Auto-fill user details
      setBookingData((prev) => ({
        ...prev,
        fullName: userName,
        mobile: userContact,
        email: userEmail,
        address: userAddress,
      }));

      // Load saved vehicles
      setIsLoadingVehicles(true);
      try {
        const result = await neonDbClient.getUserVehicles(userId);
        if (result.success && result.vehicles) {
          setSavedVehicles(result.vehicles);

          // Auto-select default vehicle if exists
          const defaultVehicle = result.vehicles.find((v) => v.isDefault);
          if (defaultVehicle) {
            setSelectedVehicleId(defaultVehicle.id);
            setBookingData((prev) => ({
              ...prev,
              unitType: defaultVehicle.unitType,
              unitSize: defaultVehicle.unitSize,
              plateNo: defaultVehicle.plateNumber,
              carModel: defaultVehicle.vehicleModel,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load user vehicles:", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    loadUserData();
  }, [isGuest]);

  // Memoize price calculation to prevent infinite loops
  const { basePrice, totalPrice } = useMemo(() => {
    let price = 0;

    if (bookingData.category === "carwash" && bookingData.service) {
      // Get the service from carWashServices
      const services = getCarWashServices();
      const selectedService = services.find(
        (s) => s.id === bookingData.service,
      );

      if (selectedService && bookingData.unitType) {
        // For motorcycle, use unitType as "motorcycle" and unitSize for subtype
        const vehicleTypeId =
          bookingData.unitType === "motorcycle"
            ? "motorcycle"
            : bookingData.unitSize || "sedan"; // For cars, use unitSize (sedan, suv, pickup, etc)

        const motorcycleSubtypeId =
          bookingData.unitType === "motorcycle"
            ? bookingData.unitSize // For motorcycles, unitSize contains the subtype (small, medium, big)
            : undefined;

        // Calculate price using the service variant system
        price = calculateServicePrice(
          selectedService.basePrice,
          vehicleTypeId,
          motorcycleSubtypeId,
        );
      } else {
        // Fallback to old system
        price =
          adminConfig.pricing.carwash[
            bookingData.service as keyof typeof adminConfig.pricing.carwash
          ]?.price || 0;
      }
    } else if (
      bookingData.category === "auto_detailing" &&
      bookingData.unitType &&
      bookingData.unitSize
    ) {
      price =
        adminConfig.pricing.autoDetailing[
          bookingData.unitType as keyof typeof adminConfig.pricing.autoDetailing
        ]?.[
          bookingData.unitSize as keyof typeof adminConfig.pricing.autoDetailing.car
        ] || 0;
    } else if (
      bookingData.category === "graphene_coating" &&
      bookingData.unitType &&
      bookingData.unitSize
    ) {
      price =
        adminConfig.pricing.grapheneCoating[
          bookingData.unitType as keyof typeof adminConfig.pricing.grapheneCoating
        ]?.[
          bookingData.unitSize as keyof typeof adminConfig.pricing.grapheneCoating.car
        ] || 0;
    }

    // Apply home service multiplier if applicable
    const basePrice = price;
    let totalPrice = price;
    if (
      bookingData.serviceType === "home" &&
      adminConfig.homeService?.enabled
    ) {
      totalPrice = price * (adminConfig.homeService.priceMultiplier || 1.2);
    }

    // Apply voucher discount
    if (bookingData.voucherDiscount && bookingData.voucherDiscount > 0) {
      totalPrice = Math.max(0, totalPrice - bookingData.voucherDiscount);
    }

    return { basePrice, totalPrice };
  }, [
    bookingData.category,
    bookingData.service,
    bookingData.unitType,
    bookingData.unitSize,
    bookingData.serviceType,
    bookingData.voucherDiscount,
  ]);

  // Update prices when calculated values change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setBookingData((prev) => ({
        ...prev,
        basePrice,
        totalPrice,
      }));
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [basePrice, totalPrice]);

  // Focus management on step change for accessibility
  useEffect(() => {
    // Focus on the step content when it changes for keyboard accessibility
    const focusTimer = setTimeout(() => {
      const stepContent = document.querySelector('[data-step-content]');
      if (stepContent) {
        // Set focus to the step content for keyboard users
        (stepContent as HTMLElement).focus();
      }
    }, 100);

    return () => clearTimeout(focusTimer);
  }, [currentStep]);

  // Memoize progress calculation to prevent unnecessary re-renders
  const progressPercentage = useMemo(() => {
    const filledFields = Object.values(bookingData).filter(
      (v) => v && v !== "",
    ).length;
    return Math.round((filledFields / 10) * 100);
  }, [bookingData]);

  const goBackToStep1 = () => {
    setCurrentStep(1);
    setBookingData((prev) => ({
      ...prev,
      serviceType: "home",
      category: "",
      service: "",
      branch: "Home Service",
      basePrice: 0,
      totalPrice: 0,
    }));
  };

  const updateBookingData = async (field: keyof BookingData, value: any) => {
    // Special handling for service type changes
    if (field === "serviceType") {
      if (value === "home") {
        // Silently clear incompatible selections when switching to home service
        // Don't show alert - let user make new selections
        if (bookingData.category) {
          const isAvailable = isServiceAvailableForHome(
            bookingData.category,
            bookingData.service || undefined,
          );
          if (!isAvailable) {
            // Clear incompatible selections silently
            setBookingData((prev) => ({
              ...prev,
              [field]: value,
              category: "",
              service: "",
              basePrice: 0,
              totalPrice: 0,
            }));
            return;
          }
        }
      }
    }

    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        // Schedule
        const serviceTypeValid = !!bookingData.serviceType;
        const scheduleValid = !!(bookingData.date && bookingData.timeSlot);
        const locationValid =
          bookingData.serviceType === "home" || !!bookingData.branch;
        return serviceTypeValid && scheduleValid && locationValid;
      }
      case 2: // Vehicle
        return !!(bookingData.unitType && bookingData.unitSize);
      case 3: // Category
        return !!bookingData.category;
      case 4: {
        // Package
        // For carwash/motorwash require specific service package
        if (
          bookingData.category === "carwash" ||
          bookingData.category === "motorwash"
        ) {
          return !!bookingData.service;
        }
        return true;
      }
      case 5: {
        // Details (Customer information)
        const basicCustomerValid = !!(
          bookingData.fullName &&
          bookingData.mobile &&
          bookingData.plateNo &&
          bookingData.carModel
        );
        const homeServiceAddressValid =
          bookingData.serviceType !== "home" || !!bookingData.address;
        const emailValid = !isGuest || !!bookingData.email; // Email required for guests
        return basicCustomerValid && homeServiceAddressValid && emailValid;
      }
      case 6: {
        // Payment
        return !!bookingData.paymentMethod;
      }
      case 7: {
        // Review (Final confirmation)
        return bookingData.acceptTerms;
      }
      default:
        return false;
    }
  };

  const focusFirstInvalidField = () => {
    // Try to focus the first visible invalid input or control marked by the red border
    setTimeout(() => {
      try {
        const invalidEl = document.querySelector(".border-red-500");
        if (!invalidEl) return;
        // Prefer an input/textarea/select/button inside the invalid element
        const focusable = (invalidEl as HTMLElement).querySelector(
          'input, textarea, select, button, [role="button"]',
        ) as HTMLElement | null;
        let toFocus: HTMLElement | null = focusable;
        if (!toFocus) {
          const el = invalidEl as HTMLElement;
          if (
            ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(el.tagName)
          ) {
            toFocus = el;
          } else {
            // Make non-focusable element focusable briefly so keyboard users land there
            el.setAttribute("tabindex", "-1");
            toFocus = el;
          }
        }
        if (toFocus) {
          toFocus.focus();
          toFocus.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch (e) {
        // swallow errors - this is a best-effort accessibility enhancement
      }
    }, 50);
  };

  const canProceed = () => validateStep(currentStep);

  const nextStep = () => {
    // Debounce: prevent rapid clicks
    if (navigationDebounceRef.current) return;
    navigationDebounceRef.current = true;
    setTimeout(() => {
      navigationDebounceRef.current = false;
    }, 300);

    if (canProceed() && currentStep < 7) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // If validation failed, compute friendly feedback and show toast to explain why
    const errors: string[] = [];
    switch (currentStep) {
      case 1:
        if (!bookingData.serviceType)
          errors.push("Select service type (Branch or Home)");
        if (!bookingData.date || !bookingData.timeSlot)
          errors.push("Choose a date and time slot");
        if (bookingData.serviceType === "branch" && !bookingData.branch)
          errors.push("Select a branch");
        break;
      case 2:
        if (!bookingData.unitType || !bookingData.unitSize)
          errors.push("Select your vehicle type and size");
        break;
      case 3:
        if (!bookingData.category) errors.push("Pick a service category");
        break;
      case 4:
        if (
          (bookingData.category === "carwash" ||
            bookingData.category === "motorwash") &&
          !bookingData.service
        )
          errors.push("Choose a package for your service");
        break;
      case 5:
        if (!bookingData.fullName) errors.push("Enter your name");
        if (!bookingData.mobile) errors.push("Provide your mobile number");
        if (!bookingData.plateNo)
          errors.push("Enter your vehicle plate number");
        if (!bookingData.carModel) errors.push("Provide your vehicle model");
        if (isGuest && !bookingData.email)
          errors.push("Email is required for guest bookings");
        if (bookingData.serviceType === "home" && !bookingData.address)
          errors.push("Provide your address for home service");
        break;
      case 6:
        if (!bookingData.paymentMethod) errors.push("Select a payment method");
        if (
          bookingData.paymentMethod === "online" &&
          !bookingData.paymentMethodDetail
        )
          errors.push("Choose a payment channel (e.g., GCash, Card)");
        break;
      default:
        errors.push("Please complete the required fields for this step");
    }

    if (errors.length > 0) {
      setStepErrors(errors);
      toast({
        title: "Complete required fields",
        description: errors.slice(0, 3).join("; "),
        variant: "destructive",
      });
      // Focus the first invalid field for keyboard users
      focusFirstInvalidField();
      // Move user to payment step if error relates to payment so they can fix quickly
      if (errors.some((e) => e.toLowerCase().includes("payment"))) {
        setCurrentStep(6);
      }
    } else {
      // Clear any previous step errors and do not auto-advance silently
      setStepErrors([]);
      // If canProceed is false we politely do nothing (validation prevents moving)
      // but if canProceed is true we would have advanced earlier
    }
  };

  const prevStep = () => {
    // Debounce: prevent rapid clicks
    if (navigationDebounceRef.current) return;
    navigationDebounceRef.current = true;
    setTimeout(() => {
      navigationDebounceRef.current = false;
    }, 300);

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
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
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
      toast({
        title: "Enter voucher code",
        description: "Please enter a voucher code",
        variant: "destructive",
      });
      return;
    }
    if (bookingData.totalPrice <= 0) {
      toast({
        title: "No booking amount",
        description: "Please complete booking details first",
        variant: "destructive",
      });
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const userEmail = isGuest
        ? bookingData.email
        : localStorage.getItem("userEmail") || undefined;
      const result = await neonDbClient.validateVoucher({
        code: voucherInput.trim().toUpperCase(),
        bookingAmount: bookingData.totalPrice,
        userEmail,
        bookingType: isGuest ? "guest" : "registered",
      });

      if (result.success && result.data) {
        setBookingData((prev) => ({
          ...prev,
          voucherCode: result.data!.code,
          voucherDiscount: result.data!.discountAmount,
          voucherData: {
            title: result.data!.title,
            discountType: result.data!.discountType,
            discountValue: result.data!.discountValue,
          },
        }));
        toast({
          title: "Voucher Applied! \ud83c\udf89",
          description: `${result.data.title}: \u20b1${result.data.discountAmount.toFixed(2)} discount`,
        });
        setVoucherInput("");
      } else {
        toast({
          title: "Invalid Voucher",
          description:
            result.error || "This voucher code is invalid or cannot be used",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Validation Failed",
        description: err?.message || "Failed to validate voucher",
        variant: "destructive",
      });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setBookingData((prev) => ({
      ...prev,
      voucherCode: undefined,
      voucherDiscount: 0,
      voucherData: undefined,
    }));
    setVoucherInput("");
    toast({
      title: "Voucher Removed",
      description: "Voucher discount has been removed",
    });
  };

  const handleXenditPayment = async (bookingId: string, amount: number) => {
    try {
      const customerName = isGuest
        ? bookingData.fullName
        : localStorage.getItem("userFullName") || "Customer";
      const customerEmail = isGuest
        ? bookingData.email
        : localStorage.getItem("userEmail") || "";

      const invoiceData = await xenditService.createInvoice({
        amount: amount,
        externalId: `BOOKING_${bookingId}`,
        customerName: customerName,
        customerEmail: customerEmail,
        description: `Payment for booking ${bookingId} - ${SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES]?.name || "Service"}`,
        successRedirectUrl: `${window.location.origin}/booking-success?bookingId=${bookingId}`,
        failureRedirectUrl: `${window.location.origin}/booking-failed?bookingId=${bookingId}`,
        preferredPaymentMethod: bookingData.paymentMethodDetail || undefined,
      });

      if (invoiceData && invoiceData.invoice_url) {
        // Save booking + invoice for success page to confirm and render receipt
        try {
          const payload = {
            bookingId,
            invoiceId: invoiceData.invoice_id,
            bookingData: {
              fullName: bookingData.fullName,
              email: customerEmail,
              mobile: bookingData.mobile,
              category: bookingData.category,
              service: bookingData.service,
              serviceType: bookingData.serviceType,
              unitType: bookingData.unitType,
              unitSize: bookingData.unitSize,
              plateNo: bookingData.plateNo,
              carModel: bookingData.carModel,
              date: bookingData.date,
              timeSlot: bookingData.timeSlot,
              branch: bookingData.branch,
              totalPrice: bookingData.totalPrice,
              paymentMethod: bookingData.paymentMethod,
            },
          };
          localStorage.setItem("fac_last_booking", JSON.stringify(payload));
          localStorage.setItem(
            "fac_last_invoice_id",
            String(invoiceData.invoice_id),
          );
        } catch (_) {}

        // Redirect to Xendit payment page (same tab)
        toast({
          title: "Redirecting to Payment",
          description:
            "You will be redirected to FACPay to complete your payment",
        });
        setTimeout(() => {
          xenditService.openInvoice(invoiceData.invoice_url);
        }, 800);

        return true;
      } else {
        throw new Error("Failed to create payment invoice");
      }
    } catch (error) {
      console.error("Xendit payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const submitBooking = async () => {
    // Prevent submission if payment method isn't selected — fix for guests receiving receipt immediately
    if (!bookingData.paymentMethod) {
      // Move user back to Payment step (6)
      setCurrentStep(6);
      toast({
        title: "Select payment method",
        description:
          "Please choose a payment method before confirming your booking.",
        variant: "destructive",
      });
      focusFirstInvalidField();
      return;
    }

    if (
      bookingData.paymentMethod === "online" &&
      !bookingData.paymentMethodDetail
    ) {
      setCurrentStep(6);
      toast({
        title: "Select payment channel",
        description:
          "Please select a payment channel (e.g., GCash, Card) before proceeding.",
        variant: "destructive",
      });
      focusFirstInvalidField();
      return;
    }

    // If offline payment method selected (branch / onsite), confirm with user before creating booking
    if (bookingData.paymentMethod !== "online") {
      const offlineLabel =
        bookingData.paymentMethod === "branch"
          ? adminConfig.paymentMethods.branch.name
          : adminConfig.paymentMethods.onsite?.name || "Offline Payment";

      const confirmation = await Swal.fire({
        title: `Confirm ${offlineLabel}`,
        html: `You selected <strong>${offlineLabel}</strong>.<br/>You will pay <strong>₱${bookingData.totalPrice?.toLocaleString() || "0.00"}</strong> at the location. Do you want to continue and create the booking?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Confirm Booking",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f97316",
      });

      if (!confirmation.isConfirmed) {
        return; // user cancelled
      }
    }

    setIsLoading(true);

    try {
      // Prepare booking data for database
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      const bookingPayload: Omit<
        Booking,
        "id" | "createdAt" | "updatedAt" | "confirmationCode"
      > = {
        userId: isGuest ? undefined : userId || undefined,
        guestInfo: isGuest
          ? {
              firstName: bookingData.fullName.split(" ")[0] || "",
              lastName:
                bookingData.fullName.split(" ").slice(1).join(" ") || "",
              email: bookingData.email,
              phone: bookingData.mobile,
            }
          : undefined,
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
        serviceLocation:
          bookingData.serviceType === "home"
            ? bookingData.address
            : bookingData.branch,
        estimatedDuration: getEstimatedDuration(
          bookingData.category,
          bookingData.service,
        ),

        // Pricing
        basePrice: bookingData.basePrice,
        totalPrice: bookingData.totalPrice,
        currency: "PHP",

        // Payment Details
        paymentMethod: bookingData.paymentMethod as any,
        paymentStatus:
          bookingData.paymentMethod === "online" ? "pending" : "pending",
        receiptUrl: bookingData.receiptFile
          ? (() => {
              // Clean up any existing object URL first
              if (receiptObjectUrlRef.current) {
                URL.revokeObjectURL(receiptObjectUrlRef.current);
              }
              // Create new object URL and store reference for cleanup
              const objectUrl = URL.createObjectURL(bookingData.receiptFile);
              receiptObjectUrlRef.current = objectUrl;
              return objectUrl;
            })()
          : undefined,

        // Status
        status: "pending",

        // Additional Info
        notes: bookingData.notes,
        specialRequests: bookingData.notes,

        // Loyalty Points (for registered users)
        pointsEarned: isGuest ? 0 : Math.floor(bookingData.totalPrice / 100), // 1 point per 100 pesos
      };

      // Create booking using Neon database
      console.log("📤 Submitting booking payload:", {
        ...bookingPayload,
        receiptUrl: bookingPayload.receiptUrl ? "[File present]" : undefined,
      });

      const bookingResult = await neonDbClient.createBooking(bookingPayload);
      console.log("📥 Booking response:", bookingResult);

      if (!bookingResult.success || !bookingResult.booking) {
        const errorMsg =
          bookingResult.error || "Failed to create booking. Please try again.";
        console.error("❌ Booking creation failed:", errorMsg);
        throw new Error(errorMsg);
      }
      const createdBooking = bookingResult.booking;

      // Send system notification to admin and manager about new booking
      const customerName = isGuest
        ? `${bookingData.fullName}`
        : "Registered Customer";
      const notificationMessage =
        `New booking received from ${customerName}\n` +
        `Service: ${SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES].name}\n` +
        `Date: ${bookingData.date} at ${bookingData.timeSlot}\n` +
        `Amount: ₱${bookingData.totalPrice.toLocaleString()}\n` +
        `Type: ${isGuest ? "Guest" : "Registered User"}`;

      // Create system notification through API (this happens automatically in the API)

      // Redeem voucher if applied
      if (
        bookingData.voucherCode &&
        bookingData.voucherDiscount &&
        bookingData.voucherDiscount > 0
      ) {
        try {
          const userEmail = isGuest
            ? bookingData.email
            : localStorage.getItem("userEmail") || undefined;
          await neonDbClient.redeemVoucher({
            code: bookingData.voucherCode,
            userEmail,
            bookingId: createdBooking.id,
            discountAmount: bookingData.voucherDiscount,
          });
          // Voucher redeemed (silent)
        } catch (voucherErr) {
          console.warn(
            "⚠️ Voucher redemption failed (non-critical):",
            voucherErr,
          );
        }
      }

      // Trigger Xendit payment if online payment method is selected
      if (bookingData.paymentMethod === "online") {
        const paymentSuccess = await handleXenditPayment(
          createdBooking.id,
          bookingData.totalPrice,
        );
        if (!paymentSuccess) {
          // Payment initialization failed, but booking is created
          toast({
            title: "Booking Created",
            description:
              "Booking created but payment initialization failed. Please contact support.",
            variant: "default",
          });
        }
      }

      // Store completed booking data for receipt
      setCompletedBooking({
        id: createdBooking.id,
        confirmationCode: createdBooking.confirmationCode,
        service:
          SERVICE_CATEGORIES[
            bookingData.category as keyof typeof SERVICE_CATEGORIES
          ].name,
        category: bookingData.category,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        branch: bookingData.branch,
        serviceType: bookingData.serviceType,
        unitType: bookingData.unitType,
        unitSize: bookingData.unitSize,
        plateNumber: bookingData.plateNo,
        vehicleModel: bookingData.carModel,
        totalPrice: bookingData.totalPrice,
        paymentMethod: bookingData.paymentMethod,
        customerName: bookingData.fullName,
        customerEmail: bookingData.email,
        customerPhone: bookingData.mobile,
      });

      // Show receipt modal only for non-online payments; for online we show it on success page after gateway confirmation
      if (bookingData.paymentMethod !== "online") {
        setShowReceiptModal(true);
      }

      notificationManager.success(
        "Booking Confirmed! 🎉",
        `Your booking has been successfully submitted!\n\nBooking ID: ${createdBooking.id}\nConfirmation Code: ${createdBooking.confirmationCode}`,
        { autoClose: 3000 },
      );
    } catch (error) {
      console.error("Booking submission error:", error);

      let errorDescription =
        "There was an error submitting your booking. Please try again.";

      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorDescription =
            "Network connection error. Please check your internet connection and try again.";
        } else if (
          error.message.includes("validation") ||
          error.message.includes("required")
        ) {
          errorDescription =
            "Please fill in all required fields and try again.";
        } else if (
          error.message.includes("database") ||
          error.message.includes("503")
        ) {
          errorDescription =
            "Service temporarily unavailable. Please try again in a few moments.";
        } else if (error.message) {
          errorDescription = error.message;
        }
      }

      toast({
        title: "Booking Failed",
        description: errorDescription,
        variant: "destructive",
      });

      // Also show notification for better visibility
      notificationManager.error("Booking Failed ❌", errorDescription, {
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get estimated duration
  const getEstimatedDuration = (category: string, service: string): number => {
    if (
      category === "carwash" &&
      adminConfig?.pricing?.carwash?.[
        service as keyof typeof adminConfig.pricing.carwash
      ]
    ) {
      const serviceData =
        adminConfig.pricing.carwash[
          service as keyof typeof adminConfig.pricing.carwash
        ];
      const durationStr = serviceData.duration || "60 mins";
      return parseInt(durationStr.replace(/\D/g, "")) || 60;
    }
    return 60; // Default duration
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScheduleStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
          />
        );
      case 2:
        return (
          <UnitStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            isGuest={isGuest}
            savedVehicles={savedVehicles}
            selectedVehicleId={selectedVehicleId}
            setSelectedVehicleId={setSelectedVehicleId}
            showNewVehicleForm={showNewVehicleForm}
            setShowNewVehicleForm={setShowNewVehicleForm}
            isLoadingVehicles={isLoadingVehicles}
            onVehicleSelect={(vehicle: any) => {
              setSelectedVehicleId(vehicle.id);
              updateBookingData("unitType", vehicle.unitType);
              updateBookingData("unitSize", vehicle.unitSize);
              updateBookingData("plateNo", vehicle.plateNumber);
              updateBookingData("carModel", vehicle.vehicleModel);
            }}
            onAddNewVehicle={async (vehicle: any) => {
              const userId = localStorage.getItem("userId");
              if (!userId) return;

              const result = await neonDbClient.addUserVehicle(userId, vehicle);
              if (result.success && result.vehicle) {
                setSavedVehicles([...savedVehicles, result.vehicle]);
                setSelectedVehicleId(result.vehicle.id);
                updateBookingData("unitType", result.vehicle.unitType);
                updateBookingData("unitSize", result.vehicle.unitSize);
                updateBookingData("plateNo", result.vehicle.plateNumber);
                updateBookingData("carModel", result.vehicle.vehicleModel);
                setShowNewVehicleForm(false);
                toast({
                  title: "Vehicle Added",
                  description: "Your vehicle has been saved successfully.",
                });
              } else {
                toast({
                  title: "Error",
                  description: "Failed to save vehicle",
                  variant: "destructive",
                });
              }
            }}
          />
        );
      case 3:
        return (
          <CategoryStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
          />
        );
      case 4:
        return (
          <PackageStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            goBackToStep1={goBackToStep1}
          />
        );
      case 5:
        return (
          <DetailsStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            isGuest={isGuest}
          />
        );
      case 6:
        return (
          <PaymentStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            handleFileUpload={handleFileUpload}
            voucherInput={voucherInput}
            setVoucherInput={setVoucherInput}
            validateVoucherCode={validateVoucherCode}
            removeVoucher={removeVoucher}
            isValidatingVoucher={isValidatingVoucher}
          />
        );
      case 7:
        return (
          <ReviewStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            isGuest={isGuest}
          />
        );
      default:
        return null;
    }
  };

  const handleCloseReceipt = () => {
    setShowReceiptModal(false);

    // Reset form after closing receipt
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
      paymentMethodDetail: undefined,
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
    if (isGuest) {
      navigate("/login?message=booking_created");
    } else {
      navigate("/my-bookings");
    }
  };

  // Swipe gesture support for mobile navigation
  const { ref: swipeRef } = useSwipeNavigation({
    onSwipeRight: () => {
      if (currentStep > 1 && window.innerWidth < 768) {
        prevStep();
      }
    },
    onSwipeLeft: () => {
      if (
        currentStep < STEPS.length &&
        canProceed() &&
        window.innerWidth < 768
      ) {
        nextStep();
      }
    },
    enabled: true,
    threshold: 30,
  });

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Booking Receipt Modal */}
      {completedBooking && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
              Loading receipt...
            </div>
          }
        >
          <BookingReceiptModal
            isOpen={showReceiptModal}
            onClose={handleCloseReceipt}
            bookingData={completedBooking}
          />
        </Suspense>
      )}

      {/* Mobile Bottom Sheet for Booking Summary */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 md:hidden">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base font-bold">
                Booking Summary
              </SheetTitle>
            </SheetHeader>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <BookingSummary
              bookingData={bookingData}
              progressPercentage={progressPercentage}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Container with max width and swipe support */}
      <div className="max-w-7xl mx-auto" ref={swipeRef}>
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar (desktop only) */}
          <div
            className={`
            hidden lg:block lg:sticky top-0 left-0 h-screen w-80 lg:w-80 xl:w-96 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-border/50 z-10 flex-shrink-0
          `}
          >
            <div className="p-4 md:p-6 h-full overflow-y-auto overflow-x-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-black text-foreground">
                  Booking Summary
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden h-10 w-10 rounded-full hover:bg-muted active:scale-95 transition-all"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <BookingSummary
                bookingData={bookingData}
                progressPercentage={progressPercentage}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 min-w-0">
            <div
              ref={contentContainerRef}
              className="p-3 sm:p-4 md:p-6 lg:p-8 pb-44 md:pb-8 h-screen overflow-y-auto"
            >
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
                  <Badge
                    variant="outline"
                    className="text-sm md:text-sm w-fit px-3 py-1 rounded-full"
                  >
                    Step {currentStep} of {STEPS.length}
                  </Badge>
                </div>

                {/* Desktop Stepper */}
                <div className="hidden md:flex items-center space-x-4 overflow-x-auto pb-4">
                  {STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center flex-shrink-0"
                    >
                      <div
                        className={`
                        flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 transition-all
                        ${
                          currentStep === step.id
                            ? "border-fac-orange-500 bg-fac-orange-500 text-white shadow-lg shadow-fac-orange-500/25"
                            : currentStep > step.id
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-border bg-background text-muted-foreground"
                        }
                      `}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6" />
                        ) : (
                          <step.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                        )}
                      </div>
                      <div className="ml-3 min-w-0">
                        <p
                          className={`text-sm lg:text-base font-semibold ${
                            currentStep === step.id
                              ? "text-fac-orange-500"
                              : currentStep > step.id
                                ? "text-green-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {index < STEPS.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-4 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Stepper - App-like Design with BookingProgressBar */}
                <div className="md:hidden space-y-4 mb-6">
                  {/* Enhanced Booking Progress Bar */}
                  <BookingProgressBar
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    estimatedTimeRemaining={300}
                  />

                  {/* Current Step Indicator Card */}
                  <div className="p-4 rounded-2xl border-2 border-blue-500/50 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                        {(() => {
                          const CurrentIcon = STEPS[currentStep - 1].icon;
                          return <CurrentIcon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                          {STEPS[currentStep - 1].title}
                        </span>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {STEPS[currentStep - 1].description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content with Slide Animation */}
              <div className="w-full max-w-4xl">
                <div className="w-full overflow-hidden pb-4 md:pb-6">
                  <div
                    data-step-content
                    tabIndex={-1}
                    className="w-full transition-all duration-500 ease-out focus:outline-none"
                    style={{
                      opacity: 1,
                      animation: `slideIn 0.4s ease-out`,
                    }}
                  >
                    {renderStepContent()}
                  </div>
                </div>
              </div>

              {/* CSS for slide animation */}
              <style>{`
                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateY(8px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes slideUp {
                  from {
                    opacity: 0;
                    transform: translateY(12px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                .slide-up {
                  animation: slideUp 0.3s ease-out;
                }

                .shimmer {
                  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                  background-size: 200% 100%;
                  animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                  0% {
                    background-position: -200% 0;
                  }
                  100% {
                    background-position: 200% 0;
                  }
                }
              `}</style>

              {/* Navigation - Desktop only; mobile uses sticky bottom bar */}
              <div className="hidden md:flex flex-row justify-between items-center gap-4 mt-6 max-w-4xl w-full">
                {/* Back Button - Left side */}
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="min-w-[120px] h-12 text-base font-medium border border-border hover:bg-muted/50 transition-all duration-200 rounded-lg active:scale-95 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {/* Inline step errors (desktop) */}
                {stepErrors.length > 0 && (
                  <div className="mr-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 max-w-md">
                    {stepErrors.slice(0, 3).map((err, idx) => (
                      <div key={idx}>{err}</div>
                    ))}
                  </div>
                )}

                {/* Next/Submit Button - Right side */}
                {currentStep === 7 ? (
                  bookingData.paymentMethod === "online" ? (
                    <FACPayButton
                      amount={bookingData.totalPrice}
                      onPaymentClick={submitBooking}
                      isLoading={isLoading}
                      disabled={!canProceed() || isLoading}
                      className="min-w-[180px] h-12 text-base rounded-lg"
                    />
                  ) : (
                    <Button
                      onClick={submitBooking}
                      disabled={!canProceed() || isLoading}
                      className="min-w-[180px] h-12 text-base font-bold bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg active:scale-95"
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
                  )
                ) : (
                  <Button
                    onClick={() => {
                      setStepErrors([]);
                      nextStep();
                    }}
                    disabled={!canProceed()}
                    className={`min-w-[140px] h-12 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg active:scale-95 ${
                      !canProceed()
                        ? "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white"
                    }`}
                    title={
                      !canProceed()
                        ? `Complete all fields in step ${currentStep} to continue`
                        : "Continue to next step"
                    }
                  >
                    <span className="flex items-center">
                      {!canProceed() ? "Complete Step" : "Next"}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar - Enhanced with Back Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass border-t-2 border-border bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-t-2xl shadow-2xl p-4 space-y-3">
          {/* Progress Info */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                {bookingData.basePrice > 0
                  ? "Total Price"
                  : `Step ${currentStep} of ${STEPS.length}`}
              </p>
              <p className="text-lg font-black text-foreground truncate">
                {bookingData.basePrice > 0
                  ? `₱${(bookingData.totalPrice || 0).toLocaleString()}`
                  : STEPS[currentStep - 1].title}
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

            {/* Inline step errors (mobile) */}
            {stepErrors.length > 0 && (
              <div className="w-full mb-2 p-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                {stepErrors.slice(0, 2).map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}

            {/* Next/Confirm Button */}
            {currentStep === 7 ? (
              bookingData.paymentMethod === "online" ? (
                <FACPayButton
                  amount={bookingData.totalPrice}
                  onPaymentClick={submitBooking}
                  isLoading={isLoading}
                  disabled={!canProceed() || isLoading}
                  className="flex-[1.5] h-12 rounded-xl text-base"
                />
              ) : (
                <Button
                  onClick={submitBooking}
                  disabled={!canProceed() || isLoading}
                  className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg text-base"
                >
                  {isLoading ? "Processing..." : "Confirm Booking"}
                </Button>
              )
            ) : (
              <Button
                onClick={() => {
                  setStepErrors([]);
                  nextStep();
                }}
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
const CategoryStep = ({ bookingData, updateBookingData }: any) => {
  const vehicleType = bookingData.unitType;

  // Filter categories based on vehicle type
  const availableCategories = Object.entries(SERVICE_CATEGORIES).filter(
    ([key, category]: [string, any]) => {
      if (!category.vehicleTypes) return true;
      return category.vehicleTypes.includes(vehicleType);
    },
  );

  return (
    <Card className="glass border-border shadow-xl">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 mr-3 text-fac-orange-500" />
          Select Service Category
        </CardTitle>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Choose the type of service you need for your{" "}
          {vehicleType === "motorcycle" ? "motorcycle" : "car"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {availableCategories.map(([key, category]: [string, any]) => {
            const Icon = category.icon;
            const isSelected = bookingData.category === key;

            return (
              <div
                key={key}
                onClick={() => {
                  updateBookingData("category", key);
                  updateBookingData("service", ""); // Reset service when category changes
                }}
                className={`
                  relative cursor-pointer transition-all duration-300 rounded-xl p-4 md:p-6
                  border-2 hover:scale-[1.02] active:scale-[0.98]
                  ${
                    isSelected
                      ? "border-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950/30 shadow-lg"
                      : "border-border hover:border-fac-orange-300 bg-card"
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-fac-orange-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`bg-gradient-to-br ${category.gradient} rounded-lg p-3 mb-3 inline-block`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-1">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const PackageStep = ({
  bookingData,
  updateBookingData,
  goBackToStep1,
}: any) => {
  // Get selected category info
  const selectedCategory =
    SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES];
  const categoryName = selectedCategory?.name || "Service";

  // Get available packages based on category
  const getPackages = () => {
    if (
      bookingData.category === "carwash" ||
      bookingData.category === "motorwash"
    ) {
      // Show car wash packages
      const allCarwashServices = getCarWashServices();
      return allCarwashServices.filter((service) => service.isActive);
    } else if (bookingData.category === "auto_detailing") {
      return []; // Auto detailing packages will be shown based on pricing
    } else if (bookingData.category === "graphene_coating") {
      return []; // Graphene coating packages will be shown based on pricing
    }
    return [];
  };

  const packages = getPackages();

  return (
    <Card className="glass border-border shadow-xl">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="flex items-center text-xl md:text-2xl">
          <Star className="h-5 w-5 md:h-6 md:w-6 mr-3 text-fac-orange-500" />
          Select {categoryName} Package
        </CardTitle>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Choose the perfect package for your{" "}
          {bookingData.unitType === "motorcycle" ? "motorcycle" : "vehicle"}
          {bookingData.serviceType === "home" && (
            <span className="block text-xs text-orange-600 mt-1">
              Only selected services are available for home service
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg: any) => {
              const price = calculateServicePrice(
                pkg.basePrice,
                bookingData.unitSize,
                bookingData.unitType === "motorcycle"
                  ? bookingData.unitSize
                  : undefined,
              );

              return (
                <div
                  key={pkg.id}
                  className={`relative p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    bookingData.service === pkg.id
                      ? "border-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950/50 shadow-lg"
                      : "border-border hover:border-fac-orange-300 hover:shadow-md"
                  }`}
                  onClick={() => {
                    updateBookingData("service", pkg.id);
                    updateBookingData("basePrice", price);
                  }}
                >
                  {pkg.category === "premium" && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-fac-orange-500 to-red-500 text-white text-xs">
                        Popular
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-bold text-foreground text-sm md:text-base">
                        {pkg.name}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {pkg.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base md:text-lg font-black text-fac-orange-500">
                        ₱{price.toLocaleString()}
                      </p>
                      {bookingData.service === pkg.id && (
                        <div className="flex items-center justify-end mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
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
                    ₱
                    {(() => {
                      const getPrice = () => {
                        if (bookingData.category === "auto_detailing") {
                          return (
                            adminConfig.pricing.autoDetailing[
                              bookingData.unitType as keyof typeof adminConfig.pricing.autoDetailing
                            ]?.[
                              bookingData.unitSize as keyof typeof adminConfig.pricing.autoDetailing.car
                            ] || 0
                          );
                        } else if (
                          bookingData.category === "graphene_coating"
                        ) {
                          return (
                            adminConfig.pricing.grapheneCoating[
                              bookingData.unitType as keyof typeof adminConfig.pricing.grapheneCoating
                            ]?.[
                              bookingData.unitSize as keyof typeof adminConfig.pricing.grapheneCoating.car
                            ] || 0
                          );
                        }
                        return 0;
                      };
                      const price = getPrice();
                      return price.toLocaleString();
                    })()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Price for{" "}
                  {
                    UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]
                      ?.sizes[
                      bookingData.unitSize as keyof typeof UNIT_TYPES.car.sizes
                    ]
                  }
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
      </CardContent>
    </Card>
  );
};

const UnitStep = ({
  bookingData,
  updateBookingData,
  isGuest,
  savedVehicles,
  selectedVehicleId,
  setSelectedVehicleId,
  showNewVehicleForm,
  setShowNewVehicleForm,
  isLoadingVehicles,
  onVehicleSelect,
  onAddNewVehicle,
}: any) => {
  // For new vehicle form
  const [newVehicle, setNewVehicle] = useState({
    unitType: "",
    unitSize: "",
    plateNumber: "",
    vehicleModel: "",
    isDefault: savedVehicles.length === 0, // First vehicle is default
  });

  return (
    <Card className="glass border-border shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Car className="h-6 w-6 mr-3 text-fac-orange-500" />
          Select Your Vehicle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registered users - show saved vehicles */}
        {!isGuest && savedVehicles.length > 0 && !showNewVehicleForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                Your Saved Vehicles
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewVehicleForm(true)}
                className="text-fac-orange-500 hover:text-fac-orange-600"
              >
                + Add New Vehicle
              </Button>
            </div>

            {isLoadingVehicles ? (
              <p className="text-muted-foreground text-center py-4">
                Loading vehicles...
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedVehicles.map((vehicle: any) => (
                  <div
                    key={vehicle.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedVehicleId === vehicle.id
                        ? "border-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950/50 shadow-lg"
                        : "border-border hover:border-fac-orange-300"
                    }`}
                    onClick={() => onVehicleSelect(vehicle)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={vehicle.isDefault ? "default" : "outline"}
                            className="text-xs"
                          >
                            {vehicle.isDefault
                              ? "Default"
                              : UNIT_TYPES[vehicle.unitType]?.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {
                              UNIT_TYPES[vehicle.unitType]?.sizes[
                                vehicle.unitSize
                              ]
                            }
                          </Badge>
                        </div>
                        <p className="font-bold text-foreground">
                          {vehicle.plateNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.vehicleModel}
                        </p>
                      </div>
                      {selectedVehicleId === vehicle.id && (
                        <CheckCircle className="h-5 w-5 text-fac-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show new vehicle form for registered users or all fields for guests */}
        {(isGuest || savedVehicles.length === 0 || showNewVehicleForm) && (
          <div className="space-y-6">
            {!isGuest && savedVehicles.length > 0 && showNewVehicleForm && (
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Add New Vehicle</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewVehicleForm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {Object.entries(UNIT_TYPES).map(([typeKey, type]) => (
              <div key={typeKey} className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                    (showNewVehicleForm
                      ? newVehicle.unitType
                      : bookingData.unitType) === typeKey
                      ? "border-fac-orange-500 bg-gradient-to-r from-fac-orange-50 to-orange-50 dark:from-fac-orange-950/50 dark:to-orange-950/50 shadow-xl"
                      : "border-border/50 bg-white/90 dark:bg-gray-800/90 hover:border-fac-orange-300 hover:shadow-lg hover:bg-fac-orange-50/30 dark:hover:bg-fac-orange-950/30"
                  }`}
                  onClick={() => {
                    if (showNewVehicleForm) {
                      setNewVehicle({
                        ...newVehicle,
                        unitType: typeKey,
                        unitSize: "",
                      });
                    } else {
                      updateBookingData("unitType", typeKey);
                      updateBookingData("unitSize", "");
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-foreground text-xl">
                      {type.name}
                    </h3>
                    {(showNewVehicleForm
                      ? newVehicle.unitType
                      : bookingData.unitType) === typeKey && (
                      <Badge className="bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                        ✓ Selected
                      </Badge>
                    )}
                  </div>
                </div>

                {(showNewVehicleForm
                  ? newVehicle.unitType
                  : bookingData.unitType) === typeKey && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-0 sm:ml-4">
                    {Object.entries(type.sizes).map(([sizeKey, sizeName]) => (
                      <div
                        key={sizeKey}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center active:scale-95 min-h-[80px] flex flex-col justify-center ${
                          (showNewVehicleForm
                            ? newVehicle.unitSize
                            : bookingData.unitSize) === sizeKey
                            ? "border-fac-orange-500 bg-gradient-to-br from-fac-orange-500 to-fac-orange-600 text-white shadow-xl"
                            : "border-border/50 bg-white/90 dark:bg-gray-800/90 hover:border-fac-orange-300 hover:shadow-lg hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950/50"
                        }`}
                        onClick={() => {
                          if (showNewVehicleForm) {
                            setNewVehicle({ ...newVehicle, unitSize: sizeKey });
                          } else {
                            updateBookingData("unitSize", sizeKey);
                          }
                        }}
                      >
                        <p className="font-bold text-base mb-1">{sizeName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Additional vehicle details for new vehicle */}
            {!isGuest &&
              showNewVehicleForm &&
              newVehicle.unitType &&
              newVehicle.unitSize && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label>Plate Number</Label>
                    <Input
                      value={newVehicle.plateNumber}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          plateNumber: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="ABC 1234"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Vehicle Model & Year</Label>
                    <Input
                      value={newVehicle.vehicleModel}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          vehicleModel: e.target.value,
                        })
                      }
                      placeholder="e.g., Toyota Hilux 2024"
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={() => onAddNewVehicle(newVehicle)}
                    disabled={
                      !newVehicle.plateNumber || !newVehicle.vehicleModel
                    }
                    className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                  >
                    Save Vehicle
                  </Button>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ScheduleStep = ({ bookingData, updateBookingData }: any) => {
  const [slotAvailabilityCache, setSlotAvailabilityCache] = useState<
    Record<string, any>
  >({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [garageSettings, setGarageSettings] = useState<any>(null);

  // Fetch garage settings (Manila timezone and hours)
  useEffect(() => {
    const fetchGarageSettings = async () => {
      try {
        const result = await neonDbClient.getGarageSettings();
        if (result.success && result.data) {
          setGarageSettings(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch garage settings:", error);
      }
    };

    fetchGarageSettings();
  }, []);

  // Fetch slot availability for all slots when date or branch changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!bookingData?.date || !bookingData?.branch) {
        setSlotAvailabilityCache({});
        return;
      }

      setLoadingAvailability(true);
      try {
        const slots = getTimeSlots(bookingData.date);
        const availability: Record<string, any> = {};

        // Fetch availability for each slot in parallel
        const promises = slots.map((slot) =>
          neonDbClient
            .getSlotAvailability(bookingData.date, slot, bookingData.branch)
            .then((result) => {
              if (result.success && result.data) {
                availability[slot] = result.data;
              } else {
                // Fallback to default if API fails
                availability[slot] = {
                  isAvailable: true,
                  currentBookings: 0,
                  maxCapacity: 5,
                  availableBays: [1, 2, 3, 4, 5],
                };
              }
            })
            .catch(() => {
              // On error, assume available
              availability[slot] = {
                isAvailable: true,
                currentBookings: 0,
                maxCapacity: 5,
                availableBays: [1, 2, 3, 4, 5],
              };
            }),
        );

        await Promise.all(promises);
        setSlotAvailabilityCache(availability);
      } catch (error) {
        console.error("Failed to fetch slot availability:", error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [bookingData?.date, bookingData?.branch]);

  // Get all slots for the selected date
  const allSlots = bookingData?.date ? getTimeSlots(bookingData.date) : [];

  // Helper function to parse slot time string and convert to 24-hour format
  // Must be defined BEFORE availableSlots useMemo that calls it
  const parseSlotTime = (slotStr: string): { hour: number; minute: number } => {
    try {
      // Handle formats like "1:00 PM", "01:00 PM", "8:00 AM", "13:00"
      const match = slotStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const period = match[3]?.toUpperCase();

        // Convert to 24-hour format if AM/PM is present
        if (period) {
          if (period === "PM" && hour !== 12) {
            hour += 12;
          } else if (period === "AM" && hour === 12) {
            hour = 0;
          }
        }

        return { hour, minute };
      }
      console.warn(`⚠️ Could not parse slot time: ${slotStr}`);
      return { hour: 0, minute: 0 };
    } catch (error) {
      console.error("Error parsing slot time:", error);
      return { hour: 0, minute: 0 };
    }
  };

  // Show all slots for the selected date within operating hours
  // For today, filter out past times. For future dates, show all slots.
  const availableSlots = useMemo(() => {
    if (!bookingData?.date) {
      console.log("🕐 No date selected yet");
      return [];
    }

    // If garage settings not loaded yet, show all slots
    if (!garageSettings) {
      console.log("🕐 Garage settings not yet loaded, showing all slots");
      return allSlots;
    }

    // Check if selected date is today (in Manila timezone)
    const isToday = bookingData.date === garageSettings.currentDate;
    console.log(
      `🕐 Selected date: ${bookingData.date}, Today: ${garageSettings.currentDate}, Is Today: ${isToday}`,
    );

    if (isToday) {
      // Filter out past slots for today
      const currentTime =
        garageSettings.currentHour * 60 + garageSettings.currentMinute; // Convert to minutes
      const filteredSlots = allSlots.filter((slot: string) => {
        // Parse slot time (e.g., "1:00 PM" or "13:00")
        const slotTime = parseSlotTime(slot);
        const slotMinutes = slotTime.hour * 60 + slotTime.minute;
        const isPastTime = slotMinutes <= currentTime;

        if (isPastTime) {
          console.log(
            `⏭️  Hiding past slot: ${slot} (slot: ${slotMinutes}min >= current: ${currentTime}min)`,
          );
        }
        return !isPastTime;
      });

      console.log(
        `🕐 Today: Showing ${filteredSlots.length} future slots out of ${allSlots.length} total:`,
        filteredSlots,
      );
      return filteredSlots;
    } else {
      // For future dates, show all slots
      console.log(
        `🕐 Future date: Showing all ${allSlots.length} slots for ${bookingData.date}:`,
        allSlots,
      );
      return allSlots;
    }
  }, [bookingData?.date, allSlots, garageSettings]);
  const homeServiceConfig = adminConfig?.homeService || {};

  // Load branches from backend and allow admin to add branches
  const [branches, setBranches] = useState<
    { id: string; name: string; address?: string }[]
  >([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const isAdmin =
    localStorage.getItem("userRole") === "admin" ||
    localStorage.getItem("userRole") === "superadmin";

  useEffect(() => {
    const load = async () => {
      setLoadingBranches(true);
      try {
        // Loading branches from database (silent)
        const res = await neonDbClient.getBranches();
        // Branches response (silent)

        if (
          res.success &&
          res.branches &&
          Array.isArray(res.branches) &&
          res.branches.length > 0
        ) {
          const mappedBranches = res.branches.map((b: any) => ({
            id: b.id || b.code || b.name,
            name: b.name,
            address: b.address,
          }));
          // Loaded branches from database
          setBranches(mappedBranches);
        } else {
          console.warn("⚠️ No branches in database, using fallback config");
          // Fallback to local admin config
          const fallbackBranches = (adminConfig.branches || [])
            .filter((b: any) => b.enabled)
            .map((b: any) => ({ id: b.id, name: b.name, address: b.address }));
          setBranches(fallbackBranches);
          // Using fallback branches from config
        }
      } catch (e) {
        // Silently handle error and use fallback - this is expected behavior
        console.warn("⚠️ Using fallback branches (database unavailable)");
        // Fallback to local admin config on error
        const fallbackBranches = (adminConfig.branches || [])
          .filter((b: any) => b.enabled)
          .map((b: any) => ({ id: b.id, name: b.name, address: b.address }));
        setBranches(fallbackBranches);
        // Loaded fallback branches from config
      } finally {
        setLoadingBranches(false);
      }
    };
    load();
  }, []);

  const handleAddBranch = async () => {
    const name = window.prompt("New branch name");
    if (!name) return;
    const code =
      name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6) + String(Date.now()).slice(-2);
    const address = window.prompt("Branch address (optional)") || undefined;
    const city = "Zamboanga City";
    try {
      const resp = await neonDbClient.createBranch({
        name,
        code,
        address,
        city,
      });
      if (resp.success) {
        toast({ title: "Branch created", description: `${name} added.` });
        // reload branches - silently handle errors
        try {
          const res = await neonDbClient.getBranches();
          if (res.success && res.branches) {
            setBranches(
              res.branches.map((b: any) => ({
                id: b.id || b.code || b.name,
                name: b.name,
                address: b.address,
              })),
            );
          }
        } catch {
          // Ignore errors, keep existing branches
        }
      } else {
        toast({
          title: "Failed to create branch",
          description: resp.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Connection error",
        description: "Unable to create branch. Please try again.",
        variant: "destructive",
      });
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
                bookingData.serviceType === "branch"
                  ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 shadow-lg"
                  : "border-border hover:border-fac-orange-300"
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
                  <p className="text-sm text-muted-foreground">
                    Come to our service center
                  </p>
                </div>
              </div>
              {bookingData.serviceType === "branch" && (
                <Badge className="bg-fac-orange-500 text-white text-xs mt-2">
                  Selected
                </Badge>
              )}
            </div>

            {homeServiceConfig.enabled && (
              <div
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  bookingData.serviceType === "home"
                    ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 shadow-lg"
                    : "border-border hover:border-fac-orange-300"
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
                    <p className="text-sm text-muted-foreground">
                      We come to your location
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      +
                      {Math.round(
                        (homeServiceConfig.priceMultiplier - 1) * 100,
                      )}
                      % additional fee
                    </p>
                  </div>
                </div>
                {bookingData.serviceType === "home" && (
                  <Badge className="bg-fac-orange-500 text-white text-xs mt-2">
                    Selected
                  </Badge>
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

          {bookingData.serviceType === "branch" && (
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-semibold">
                  Select Branch
                </Label>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddBranch}
                    className="text-xs"
                  >
                    + Add Branch
                  </Button>
                )}
              </div>
              <Select
                value={bookingData.branch}
                onValueChange={(value) => updateBookingData("branch", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={
                      loadingBranches ? "Loading branches..." : "Choose branch"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {String(branch.name)}
                      {branch.address ? ` - ${branch.address}` : ""}
                    </SelectItem>
                  ))}
                  {branches.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No branches available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {bookingData.serviceType === "home" && (
            <div>
              <Label className="text-foreground font-semibold">
                Service Area
              </Label>
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Available Areas:
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {homeServiceConfig.coverage?.areas?.join(", ") ||
                    "Coverage areas not configured"}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  Minimum {homeServiceConfig.leadTime || 4} hours advance
                  booking required
                </p>
              </div>
            </div>
          )}
        </div>

        {bookingData.date &&
          (bookingData.serviceType === "branch"
            ? bookingData.branch
            : true) && (
            <div>
              <Label className="text-foreground font-semibold">
                Available Time Slots
              </Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {availableSlots.map((slot) => {
                  const slotInfo =
                    slotAvailabilityCache[slot] ||
                    (bookingData?.date && bookingData?.branch
                      ? getSlotAvailability(
                          bookingData.date,
                          slot,
                          bookingData.branch,
                        )
                      : {
                          isAvailable: true,
                          currentBookings: 0,
                          maxCapacity: 5,
                          availableBays: [1, 2, 3, 4, 5],
                        });
                  const isAvailable = slotInfo.isAvailable;
                  const baysAvailable =
                    slotInfo.availableBays?.length ||
                    slotInfo.maxCapacity - slotInfo.currentBookings;

                  return (
                    <Button
                      key={slot}
                      variant={
                        bookingData.timeSlot === slot ? "default" : "outline"
                      }
                      onClick={() =>
                        isAvailable && updateBookingData("timeSlot", slot)
                      }
                      disabled={!isAvailable || loadingAvailability}
                      className={`h-auto py-3 ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{slot}</div>
                        {loadingAvailability ? (
                          <span className="block text-xs text-muted-foreground">
                            Loading...
                          </span>
                        ) : !isAvailable ? (
                          <span className="block text-xs text-red-500 font-medium">
                            Full (All Bays)
                          </span>
                        ) : baysAvailable > 0 ? (
                          <span className="block text-xs text-green-500 font-medium">
                            {baysAvailable} bay{baysAvailable > 1 ? "s" : ""}{" "}
                            left
                          </span>
                        ) : (
                          <span className="block text-xs text-green-500">
                            Available
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
              {availableSlots.length === 0 && (
                <div className="mt-3 p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    ⚠️ No slots available for the selected date. The garage may
                    be closed on this day. Please select another date.
                  </p>
                </div>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
};

const DetailsStep = ({ bookingData, updateBookingData, isGuest }: any) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="glass border-border shadow-xl">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="flex items-center text-xl md:text-2xl">
            <User className="h-5 w-5 md:h-6 md:w-6 mr-3 text-fac-orange-500" />
            Your Information
          </CardTitle>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Please provide your contact and vehicle details
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground font-semibold">
                Full Name *
              </Label>
              <Input
                value={bookingData.fullName}
                onChange={(e) => updateBookingData("fullName", e.target.value)}
                placeholder="Enter your full name"
                className={`mt-1 ${!bookingData.fullName.trim() ? "border-red-500 focus:border-red-500" : ""}`}
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
              <Label className="text-foreground font-semibold">
                Mobile Number *
              </Label>
              <Input
                value={bookingData.mobile}
                onChange={(e) => {
                  // Auto-format mobile number
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.startsWith("0")) value = "63" + value.substring(1);
                  updateBookingData("mobile", value);
                }}
                placeholder="+63 912 345 6789"
                className={`mt-1 ${!bookingData.mobile.trim() || bookingData.mobile.replace(/\D/g, "").length < 10 ? "border-red-500 focus:border-red-500" : ""}`}
                required
              />
              {(!bookingData.mobile.trim() ||
                bookingData.mobile.replace(/\D/g, "").length < 10) && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {!bookingData.mobile.trim()
                    ? "Mobile number is required"
                    : "Please enter a valid mobile number"}
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
                className={`mt-1 ${(isGuest && !bookingData.email.trim()) || (bookingData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)) ? "border-red-500 focus:border-red-500" : ""}`}
                required={isGuest}
              />
              {((isGuest && !bookingData.email.trim()) ||
                (bookingData.email.trim() &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email))) && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {isGuest && !bookingData.email.trim()
                    ? "Email is required for guest bookings"
                    : "Please enter a valid email address"}
                </p>
              )}
            </div>
            <div>
              <Label className="text-foreground font-semibold">
                Plate Number *
              </Label>
              <Input
                value={bookingData.plateNo}
                onChange={(e) =>
                  updateBookingData("plateNo", e.target.value.toUpperCase())
                }
                placeholder="ABC 1234"
                className={`mt-1 ${!bookingData.plateNo.trim() ? "border-red-500 focus:border-red-500" : ""}`}
                required
              />
              {!bookingData.plateNo.trim() && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Plate number is required
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground font-semibold">
                Vehicle Model & Year *
              </Label>
              <Input
                value={bookingData.carModel}
                onChange={(e) => updateBookingData("carModel", e.target.value)}
                placeholder="e.g., Hilux Conquest 2024, Honda Civic 2023, Toyota Vios 2022"
                className={`mt-1 ${!bookingData.carModel.trim() ? "border-red-500 focus:border-red-500" : ""}`}
                required
              />
              {!bookingData.carModel.trim() && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Vehicle model is required
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                💡 Example: "Toyota Hilux Conquest 2024" or "Honda Civic Type R
                2023"
              </p>
            </div>
          </div>

          {/* Address - Only show for Home Service */}
          {bookingData.serviceType === "home" && (
            <div>
              <Label className="text-foreground font-semibold">
                Service Address *
              </Label>
              <Textarea
                value={bookingData.address}
                onChange={(e) => updateBookingData("address", e.target.value)}
                placeholder="Enter your complete address (street, barangay, city, province)"
                className={`mt-2 ${!bookingData.address.trim() || bookingData.address.trim().length < 10 ? "border-red-500 focus:border-red-500" : ""}`}
                rows={3}
                required
              />
              {(!bookingData.address.trim() ||
                bookingData.address.trim().length < 10) && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {!bookingData.address.trim()
                    ? "Address is required for home service"
                    : "Please provide a complete address"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                💡 Provide complete address for accurate service delivery
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentStep = ({
  bookingData,
  updateBookingData,
  handleFileUpload,
  voucherInput,
  setVoucherInput,
  validateVoucherCode,
  removeVoucher,
  isValidatingVoucher,
}: any) => (
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
                <p className="font-bold text-green-700 dark:text-green-300">
                  {bookingData.voucherData?.title}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Code: {bookingData.voucherCode}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Discount: ₱{bookingData.voucherDiscount?.toFixed(2)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeVoucher}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
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
              onKeyPress={(e) => e.key === "Enter" && validateVoucherCode()}
              className="flex-1"
              disabled={isValidatingVoucher}
            />
            <Button
              onClick={validateVoucherCode}
              disabled={isValidatingVoucher || !voucherInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
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
                ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50"
                : "border-border hover:border-fac-orange-300"
            }`}
            onClick={() => updateBookingData("paymentMethod", "branch")}
          >
            <h3 className="font-bold text-foreground">
              {adminConfig.paymentMethods.branch.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {adminConfig.paymentMethods.branch.description}
            </p>
          </div>
        )}

        {adminConfig.paymentMethods.online.enabled && (
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              bookingData.paymentMethod === "online"
                ? "border-fac-orange-500 bg-gradient-to-r from-fac-orange-50 to-orange-50 dark:from-fac-orange-950 dark:to-orange-950"
                : "border-border hover:border-fac-orange-300"
            }`}
            onClick={() => updateBookingData("paymentMethod", "online")}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-fac-orange-500" />
                  FACPay - Online Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Secure payment via Xendit (Cards, GCash, PayMaya)
                </p>
              </div>
              {bookingData.paymentMethod === "online" && (
                <CheckCircle className="h-6 w-6 text-fac-orange-500" />
              )}
            </div>
          </div>
        )}

        {/* On-site payment for home service */}
        {bookingData.serviceType === "home" &&
          adminConfig.paymentMethods.onsite &&
          adminConfig.paymentMethods.onsite.enabled && (
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                bookingData.paymentMethod === "onsite"
                  ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50"
                  : "border-border hover:border-fac-orange-300"
              }`}
              onClick={() => updateBookingData("paymentMethod", "onsite")}
            >
              <h3 className="font-bold text-foreground">
                {adminConfig.paymentMethods.onsite.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {adminConfig.paymentMethods.onsite.description}
              </p>
            </div>
          )}
      </div>

      {bookingData.paymentMethod === "online" &&
        adminConfig.paymentMethods.online.enabled && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-fac-orange-50 to-orange-50 dark:from-fac-orange-950 dark:to-orange-950 border-2 border-fac-orange-200">
            <div className="flex items-start space-x-3">
              <div className="bg-fac-orange-500 rounded-full p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-fac-orange-900 dark:text-fac-orange-100 mb-2">
                  FACPay Payment Gateway
                </h4>
                <div className="space-y-2 text-sm text-fac-orange-800 dark:text-fac-orange-200">
                  <p>
                    ✓ You will be redirected to FACPay to complete your payment
                  </p>
                  <p>
                    ✓ Accept multiple payment methods (Cards, GCash, PayMaya)
                  </p>
                  <p>✓ Secure payment powered by Xendit</p>
                  <div className="mt-3 pt-3 border-t border-fac-orange-200">
                    <p className="font-semibold">
                      Total Amount: ₱{bookingData.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Dynamically load available payment channels from server */}
                <PaymentMethodsSelection
                  bookingData={bookingData}
                  updateBookingData={updateBookingData}
                />
              </div>
            </div>
          </div>
        )}

      {bookingData.paymentMethod === "onsite" &&
        adminConfig.paymentMethods.onsite &&
        adminConfig.paymentMethods.onsite.enabled && (
          <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">
              On-Site Payment
            </h4>
            <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>The crew will collect payment at your location.</p>
              <p>
                <strong>Amount:</strong> ₱
                {bookingData.totalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Please prepare the exact amount. Receipts will be provided by
                the crew.
              </p>
            </div>
          </div>
        )}
    </CardContent>
  </Card>
);

const ReviewStep = ({ bookingData, updateBookingData, isGuest }: any) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Booking Summary */}
      <Card className="glass border-border shadow-xl">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="flex items-center text-xl md:text-2xl">
            <CheckCircle className="h-5 w-5 md:h-6 md:w-6 mr-3 text-fac-orange-500" />
            Review Your Booking
          </CardTitle>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Please review your booking details before confirming
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Details */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-fac-orange-500" />
              Service Information
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Type:</span>
                <span className="font-medium">
                  {bookingData.serviceType === "home"
                    ? "Home Service"
                    : "Branch Visit"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">
                  {SERVICE_CATEGORIES[
                    bookingData.category as keyof typeof SERVICE_CATEGORIES
                  ]?.name || "-"}
                </span>
              </div>
              {bookingData.service && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-medium">{bookingData.service}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">
                  {bookingData.unitType} - {bookingData.unitSize}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-fac-orange-500" />
              Schedule
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{bookingData.timeSlot}</span>
              </div>
              {bookingData.serviceType === "branch" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">{bookingData.branch}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 flex items-center">
              <User className="h-4 w-4 mr-2 text-fac-orange-500" />
              Contact Information
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{bookingData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-medium">{bookingData.mobile}</span>
              </div>
              {bookingData.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{bookingData.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium">
                  {bookingData.carModel} ({bookingData.plateNo})
                </span>
              </div>
              {bookingData.serviceType === "home" && bookingData.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium text-right ml-4">
                    {bookingData.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-fac-orange-500" />
              Payment
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium capitalize">
                  {bookingData.paymentMethod}
                  {bookingData.paymentMethodDetail
                    ? ` — ${bookingData.paymentMethodDetail}`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-bold text-foreground">Total Amount:</span>
                <span className="font-black text-fac-orange-500 text-lg">
                  ₱{bookingData.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="glass border-border shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={bookingData.acceptTerms}
              onCheckedChange={(checked) =>
                updateBookingData("acceptTerms", checked)
              }
            />
            <div className="text-sm">
              <p className="text-foreground font-semibold">
                I accept the Terms and Conditions *
              </p>
              <div className="text-muted-foreground mt-1 space-y-2">
                <p>{adminConfig.terms.termsAndConditions}</p>
                <p>
                  <strong>Cancellation Policy:</strong>{" "}
                  {adminConfig.terms.cancellationPolicy}
                </p>
                {adminConfig.terms.noShowPolicy && (
                  <p>
                    <strong>No-Show Policy:</strong>{" "}
                    {adminConfig.terms.noShowPolicy}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Booking Summary Component
const BookingSummary = ({
  bookingData,
  progressPercentage,
}: {
  bookingData: BookingData;
  progressPercentage: number;
}) => (
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
                {(bookingData.category &&
                  SERVICE_CATEGORIES?.[
                    bookingData.category as keyof typeof SERVICE_CATEGORIES
                  ]?.name) ||
                  "-"}
              </span>
            </div>
            {bookingData.service && bookingData.category === "carwash" && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-foreground text-right">
                  {adminConfig?.pricing?.carwash?.[
                    bookingData.service as keyof typeof adminConfig.pricing.carwash
                  ]?.name || "-"}
                </span>
              </div>
            )}
            {bookingData.unitType && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">
                  {bookingData.unitType
                    ? UNIT_TYPES[
                        bookingData.unitType as keyof typeof UNIT_TYPES
                      ]?.name
                    : "-"}
                  {bookingData.unitSize &&
                    bookingData.unitType &&
                    ` - ${UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]?.sizes?.[bookingData.unitSize as keyof typeof UNIT_TYPES.car] || ""}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground">
            Select a service to see details
          </p>
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
                    if (!bookingData.date) return "-";
                    const date = new Date(bookingData.date);
                    if (isNaN(date.getTime())) return bookingData.date;
                    return date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                  } catch {
                    return bookingData.date || "-";
                  }
                })()}
              </span>
            </div>
            {bookingData.timeSlot && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium text-foreground">
                  {bookingData.timeSlot}
                </span>
              </div>
            )}
            {bookingData.branch && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">
                  {bookingData.branch}
                </span>
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
              <span className="font-medium text-foreground text-right max-w-[60%]">
                {bookingData.fullName}
              </span>
            </div>
            {bookingData.mobile && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-medium text-foreground">
                  {bookingData.mobile}
                </span>
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
              <span className="font-medium text-foreground">
                ₱{(bookingData.basePrice || 0).toLocaleString()}
              </span>
            </div>
            {bookingData.serviceType === "home" &&
              adminConfig?.homeService?.enabled && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Home Service Fee:
                  </span>
                  <span className="font-medium text-orange-600">
                    +₱
                    {(
                      (bookingData.totalPrice || 0) -
                      (bookingData.basePrice || 0) +
                      (bookingData.voucherDiscount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            {bookingData.voucherCode &&
              bookingData.voucherDiscount &&
              bookingData.voucherDiscount > 0 && (
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
                <span className="font-bold text-foreground text-base md:text-lg">
                  Total:
                </span>
                <span className="font-bold text-fac-orange-500 text-lg md:text-xl">
                  ₱{(bookingData.totalPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs md:text-sm text-muted-foreground">
            Price will be calculated based on your selections
          </p>
        )}
      </CardContent>
    </Card>

    {/* Progress Indicator */}
    <Card className="border-border glass">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-foreground">
            Booking Progress
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">
            {progressPercentage || 0}%
          </span>
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
