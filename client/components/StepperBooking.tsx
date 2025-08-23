import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { notificationManager } from "@/components/NotificationModal";
import { getAdminConfig, generateTimeSlots, isSlotAvailable } from "@/utils/adminConfig";

interface BookingData {
  // Service Selection
  category: string; // "carwash", "auto_detailing", "graphene_coating"
  service: string; // specific service type
  
  // Unit Selection
  unitType: string; // "car" or "motorcycle"
  unitSize: string; // sedan/suv/pickup etc for cars, regular/medium/big for motorcycles
  
  // Customer Details
  fullName: string;
  mobile: string;
  email: string;
  plateNo: string;
  address: string;
  
  // Schedule
  date: string;
  timeSlot: string;
  branch: string;
  
  // Payment
  paymentMethod: string; // "branch" or "online"
  receiptFile: File | null;
  
  // Terms
  acceptTerms: boolean;
  
  // Computed
  basePrice: number;
  totalPrice: number;
}

interface StepperBookingProps {
  isGuest?: boolean;
}

const STEPS = [
  { id: 1, title: "Service", icon: Sparkles, description: "Choose your service" },
  { id: 2, title: "Unit", icon: Car, description: "Select vehicle type" },
  { id: 3, title: "Schedule", icon: Calendar, description: "Pick date & time" },
  { id: 4, title: "Payment", icon: CreditCard, description: "Payment method" },
  { id: 5, title: "Review", icon: CheckCircle, description: "Confirm booking" },
];

// Load admin configuration
const adminConfig = getAdminConfig();

const SERVICE_CATEGORIES = {
  carwash: {
    name: "Car Wash",
    icon: Car,
    gradient: "from-blue-500 to-cyan-500",
    services: adminConfig.pricing.carwash,
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
  const dayOfWeek = new Date(date).toLocaleLowerCase('en-us', { weekday: 'long' });
  return generateTimeSlots(dayOfWeek);
};

export default function StepperBooking({ isGuest = false }: StepperBookingProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    category: "",
    service: "",
    unitType: "",
    unitSize: "",
    fullName: "",
    mobile: "",
    email: "",
    plateNo: "",
    address: "",
    date: "",
    timeSlot: "",
    branch: "",
    paymentMethod: "",
    receiptFile: null,
    acceptTerms: false,
    basePrice: 0,
    totalPrice: 0,
  });

  // Calculate price when service/unit changes
  useEffect(() => {
    calculatePrice();
  }, [bookingData.category, bookingData.service, bookingData.unitType, bookingData.unitSize]);

  const calculatePrice = () => {
    let price = 0;

    if (bookingData.category === "carwash" && bookingData.service) {
      price = adminConfig.pricing.carwash[bookingData.service as keyof typeof adminConfig.pricing.carwash]?.price || 0;
    } else if (bookingData.category === "auto_detailing" && bookingData.unitType && bookingData.unitSize) {
      price = adminConfig.pricing.autoDetailing[bookingData.unitType as keyof typeof adminConfig.pricing.autoDetailing]?.[bookingData.unitSize as keyof typeof adminConfig.pricing.autoDetailing.car] || 0;
    } else if (bookingData.category === "graphene_coating" && bookingData.unitType && bookingData.unitSize) {
      price = adminConfig.pricing.grapheneCoating[bookingData.unitType as keyof typeof adminConfig.pricing.grapheneCoating]?.[bookingData.unitSize as keyof typeof adminConfig.pricing.grapheneCoating.car] || 0;
    }

    setBookingData(prev => ({
      ...prev,
      basePrice: price,
      totalPrice: price, // Add any additional fees here later
    }));
  };

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Service
        return !!(bookingData.category && bookingData.service);
      case 2: // Unit
        return !!(bookingData.unitType && bookingData.unitSize);
      case 3: // Schedule
        return !!(bookingData.date && bookingData.timeSlot && bookingData.branch);
      case 4: // Payment
        const paymentValid = !!bookingData.paymentMethod;
        const receiptValid = bookingData.paymentMethod === "branch" || !!bookingData.receiptFile;
        return paymentValid && receiptValid;
      case 5: // Review
        const customerValid = !!(bookingData.fullName && bookingData.mobile && bookingData.address);
        return customerValid && bookingData.acceptTerms;
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

  const submitBooking = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingId = `${isGuest ? 'GUEST' : 'USER'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const completeBooking = {
        id: bookingId,
        ...bookingData,
        type: isGuest ? "guest" : "registered",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      
      // Save booking
      const storageKey = isGuest ? "guestBookings" : "userBookings";
      const existingBookings = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existingBookings.push(completeBooking);
      localStorage.setItem(storageKey, JSON.stringify(existingBookings));
      
      notificationManager.success(
        "Booking Confirmed! 🎉",
        `Your booking has been successfully submitted!\n\nBooking ID: ${bookingId}\nService: ${SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES].name}\nTotal: ₱${bookingData.totalPrice.toLocaleString()}\n\nYou will receive confirmation shortly.`,
        { autoClose: 5000 }
      );
      
      // Navigate based on user type
      setTimeout(() => {
        if (isGuest) {
          navigate("/login");
        } else {
          navigate("/my-bookings");
        }
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceStep bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 2:
        return <UnitStep bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 3:
        return <ScheduleStep bookingData={bookingData} updateBookingData={updateBookingData} />;
      case 4:
        return <PaymentStep bookingData={bookingData} updateBookingData={updateBookingData} handleFileUpload={handleFileUpload} />;
      case 5:
        return <ReviewStep bookingData={bookingData} updateBookingData={updateBookingData} isGuest={isGuest} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:sticky top-0 left-0 h-screen w-80 bg-card border-r z-50 lg:z-10
          transform transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Booking Summary</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <BookingSummary bookingData={bookingData} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Mobile Sidebar Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowSidebar(true)}
              className="lg:hidden mb-6"
            >
              <Menu className="h-4 w-4 mr-2" />
              View Summary
            </Button>

            {/* Stepper Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-black text-foreground">
                  {isGuest ? "Guest " : ""}Booking
                </h1>
                <Badge variant="outline" className="text-sm">
                  Step {currentStep} of 5
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${currentStep === step.id 
                        ? 'border-fac-orange-500 bg-fac-orange-500 text-white' 
                        : currentStep > step.id 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-border bg-background text-muted-foreground'
                      }
                    `}>
                      {currentStep > step.id ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className={`text-sm font-semibold ${
                        currentStep === step.id ? 'text-fac-orange-500' : 
                        currentStep > step.id ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-4 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="max-w-2xl">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 max-w-2xl">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {currentStep === 5 ? (
                <Button
                  onClick={submitBooking}
                  disabled={!canProceed() || isLoading}
                  className="btn-futuristic flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="btn-futuristic flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
const ServiceStep = ({ bookingData, updateBookingData }: any) => (
  <Card className="glass border-border shadow-xl">
    <CardHeader>
      <CardTitle className="flex items-center text-2xl">
        <Sparkles className="h-6 w-6 mr-3 text-fac-orange-500" />
        Choose Your Service
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {Object.entries(SERVICE_CATEGORIES).map(([categoryKey, category]) => (
        <div
          key={categoryKey}
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover-lift ${
            bookingData.category === categoryKey
              ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50'
              : 'border-border glass hover:border-fac-orange-300'
          }`}
          onClick={() => {
            updateBookingData("category", categoryKey);
            updateBookingData("service", ""); // Reset service when category changes
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`bg-gradient-to-r ${category.gradient} p-3 rounded-xl`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-lg">{category.name}</h3>
                {category.description && (
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                )}
              </div>
            </div>
          </div>
          
          {bookingData.category === categoryKey && categoryKey === "carwash" && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Select wash type:</p>
              {Object.entries(category.services).map(([serviceKey, service]) => (
                <div
                  key={serviceKey}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    bookingData.service === serviceKey
                      ? 'border-fac-orange-500 bg-fac-orange-50 dark:bg-fac-orange-950'
                      : 'border-border hover:border-fac-orange-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBookingData("service", serviceKey);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-foreground">{service.name}</h4>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                      <p className="text-xs text-muted-foreground">{service.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-fac-orange-500">₱{service.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {bookingData.category === categoryKey && categoryKey !== "carwash" && (
            <div className="mt-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  ✓ Selected - Price will be calculated based on your vehicle type in the next step
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
);

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
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              bookingData.unitType === typeKey
                ? 'border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50'
                : 'border-border hover:border-fac-orange-300'
            }`}
            onClick={() => {
              updateBookingData("unitType", typeKey);
              updateBookingData("unitSize", ""); // Reset size when type changes
            }}
          >
            <h3 className="font-bold text-foreground text-lg">{type.name}</h3>
          </div>
          
          {bookingData.unitType === typeKey && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-4">
              {Object.entries(type.sizes).map(([sizeKey, sizeName]) => {
                const getPrice = () => {
                  if (bookingData.category === "auto_detailing") {
                    return DETAILING_PRICES[typeKey as keyof typeof DETAILING_PRICES]?.[sizeKey as keyof typeof DETAILING_PRICES.car] || 0;
                  } else if (bookingData.category === "graphene_coating") {
                    return COATING_PRICES[typeKey as keyof typeof COATING_PRICES]?.[sizeKey as keyof typeof COATING_PRICES.car] || 0;
                  }
                  return 0;
                };
                
                return (
                  <div
                    key={sizeKey}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                      bookingData.unitSize === sizeKey
                        ? 'border-fac-orange-500 bg-fac-orange-500 text-white'
                        : 'border-border hover:border-fac-orange-300'
                    }`}
                    onClick={() => updateBookingData("unitSize", sizeKey)}
                  >
                    <p className="font-semibold text-sm">{sizeName}</p>
                    {bookingData.category !== "carwash" && (
                      <p className="text-xs opacity-75">₱{getPrice().toLocaleString()}</p>
                    )}
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
  const availableSlots = bookingData.date ? getTimeSlots(bookingData.date) : [];

  return (
    <Card className="glass border-border shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="h-6 w-6 mr-3 text-fac-orange-500" />
          Schedule Your Visit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="text-foreground font-semibold">Select Date</Label>
            <Input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={bookingData.date}
              onChange={(e) => updateBookingData("date", e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-foreground font-semibold">Select Branch</Label>
            <Select value={bookingData.branch} onValueChange={(value) => updateBookingData("branch", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose branch" />
              </SelectTrigger>
              <SelectContent>
                {adminConfig.branches.filter(branch => branch.enabled).map((branch) => (
                  <SelectItem key={branch.id} value={branch.name}>
                    {branch.name} - {branch.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {bookingData.date && (
          <div>
            <Label className="text-foreground font-semibold">Available Time Slots</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {availableSlots.map((slot) => {
                const isAvailable = isSlotAvailable(bookingData.date, slot, bookingData.branch);
                return (
                  <Button
                    key={slot}
                    variant={bookingData.timeSlot === slot ? "default" : "outline"}
                    onClick={() => isAvailable && updateBookingData("timeSlot", slot)}
                    disabled={!isAvailable}
                    className={`h-auto py-3 ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {slot}
                    {!isAvailable && (
                      <span className="block text-xs text-red-500">Full</span>
                    )}
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

const PaymentStep = ({ bookingData, updateBookingData, handleFileUpload }: any) => (
  <Card className="glass border-border shadow-xl">
    <CardHeader>
      <CardTitle className="flex items-center text-2xl">
        <CreditCard className="h-6 w-6 mr-3 text-fac-orange-500" />
        Payment Method
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
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
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-foreground font-semibold">Mobile Number *</Label>
            <Input
              value={bookingData.mobile}
              onChange={(e) => updateBookingData("mobile", e.target.value)}
              placeholder="+63 912 345 6789"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-foreground font-semibold">Email</Label>
            <Input
              type="email"
              value={bookingData.email}
              onChange={(e) => updateBookingData("email", e.target.value)}
              placeholder="your.email@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-foreground font-semibold">Plate Number</Label>
            <Input
              value={bookingData.plateNo}
              onChange={(e) => updateBookingData("plateNo", e.target.value)}
              placeholder="ABC 1234"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label className="text-foreground font-semibold">Address *</Label>
          <Textarea
            value={bookingData.address}
            onChange={(e) => updateBookingData("address", e.target.value)}
            placeholder="Enter your complete address"
            className="mt-1"
          />
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
            <p className="text-muted-foreground mt-1">
              I agree to the terms and conditions. No cancellation within 2 hours of appointment time.
              Payment terms and service policies apply.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Booking Summary Component
const BookingSummary = ({ bookingData }: { bookingData: BookingData }) => (
  <div className="space-y-4">
    <Card className="border-border">
      <CardContent className="p-4">
        <h4 className="font-bold text-foreground mb-3">Service Details</h4>
        {bookingData.category && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium text-foreground">
                {SERVICE_CATEGORIES[bookingData.category as keyof typeof SERVICE_CATEGORIES]?.name || '-'}
              </span>
            </div>
            {bookingData.service && bookingData.category === "carwash" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-foreground">
                  {SERVICE_CATEGORIES.carwash.services[bookingData.service as keyof typeof SERVICE_CATEGORIES.carwash.services]?.name || '-'}
                </span>
              </div>
            )}
            {bookingData.unitType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium text-foreground">
                  {UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]?.name} 
                  {bookingData.unitSize && ` - ${UNIT_TYPES[bookingData.unitType as keyof typeof UNIT_TYPES]?.sizes[bookingData.unitSize as keyof typeof UNIT_TYPES.car] || ''}`}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    
    {bookingData.date && (
      <Card className="border-border">
        <CardContent className="p-4">
          <h4 className="font-bold text-foreground mb-3">Schedule</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium text-foreground">{bookingData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium text-foreground">{bookingData.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branch:</span>
              <span className="font-medium text-foreground">{bookingData.branch}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
    
    <Card className="border-border">
      <CardContent className="p-4">
        <h4 className="font-bold text-foreground mb-3">Price Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Price:</span>
            <span className="font-medium text-foreground">₱{bookingData.basePrice.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-foreground">Total:</span>
              <span className="font-bold text-fac-orange-500 text-lg">₱{bookingData.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
