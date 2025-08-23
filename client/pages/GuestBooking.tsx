import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import StepperBooking from "@/components/StepperBooking";

interface GuestBookingData {
  // Guest Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Booking Information
  service: string;
  vehicleType: string;
  motorcycleType?: string;
  date: string;
  time: string;
  branch: string;
  notes: string;
}

export default function GuestBooking() {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<GuestBookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    vehicleType: "sedan",
    date: "",
    time: "",
    branch: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  const services = [
    {
      id: "classic",
      name: "Classic Wash",
      price: "₱250",
      duration: "30 mins",
      description: "Smart exterior cleaning with quality optimization",
      features: [
        "Professional wash system",
        "Exterior cleaning",
        "Tire shine",
        "Basic protection",
      ],
      gradient: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "vip-promax",
      name: "VIP ProMax",
      price: "₱450",
      duration: "60 mins",
      description: "Premium wash with advanced care systems",
      features: [
        "Premium wash",
        "Interior deep clean",
        "Paint protection",
        "Wax application",
        "Dashboard treatment",
      ],
      gradient: "from-purple-500 to-pink-500",
      popular: true,
    },
    {
      id: "premium-detail",
      name: "Premium Detail",
      price: "₱750",
      duration: "90 mins",
      description: "Ultimate luxury detailing experience",
      features: [
        "Complete exterior detail",
        "Full interior restoration",
        "Ceramic coating",
        "Engine bay clean",
        "Leather conditioning",
        "Paint correction",
      ],
      gradient: "from-fac-orange-500 to-yellow-500",
      popular: false,
    },
  ];

  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const branches = [
    {
      id: "tumaga",
      name: "Tumaga Hub",
      address: "Main Street, Tumaga District",
      features: ["Premium Wash Bay", "VIP Lounge", "Express Service"],
    },
    {
      id: "boalan",
      name: "Boalan Hub",
      address: "Commercial Center, Boalan",
      features: ["Premium Bay", "Customer Lounge", "Full Service"],
    },
  ];

  const handleInputChange = (field: keyof GuestBookingData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate guest information
    if (!bookingData.firstName.trim()) {
      notificationManager.error(
        "First Name Required",
        "Please enter your first name.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.lastName.trim()) {
      notificationManager.error(
        "Last Name Required",
        "Please enter your last name.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.email.trim()) {
      notificationManager.error(
        "Email Required",
        "Please enter your email address.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!validateEmail(bookingData.email)) {
      notificationManager.error(
        "Invalid Email",
        "Please enter a valid email address.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.phone.trim()) {
      notificationManager.error(
        "Phone Required",
        "Please enter your phone number.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!validatePhone(bookingData.phone)) {
      notificationManager.error(
        "Invalid Phone",
        "Please enter a valid phone number.",
        { autoClose: 3000 },
      );
      return;
    }

    // Validate booking information
    if (!selectedService) {
      notificationManager.error(
        "Service Required",
        "Please select a service before booking.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.vehicleType) {
      notificationManager.error(
        "Vehicle Type Required",
        "Please select your vehicle type.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.date) {
      notificationManager.error(
        "Date Required",
        "Please select your preferred date.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.time) {
      notificationManager.error(
        "Time Required",
        "Please select your preferred time.",
        { autoClose: 3000 },
      );
      return;
    }

    if (!bookingData.branch) {
      notificationManager.error(
        "Branch Required",
        "Please select your preferred branch.",
        { autoClose: 3000 },
      );
      return;
    }

    // Set the selected service when confirming booking
    const selectedServiceData = services.find((s) => s.id === selectedService);
    if (selectedServiceData) {
      setBookingData((prev) => ({
        ...prev,
        service: selectedServiceData.name,
      }));
    }
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    setShowBookingModal(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save guest booking to local storage
    const selectedServiceData = services.find((s) => s.id === selectedService);
    
    const newGuestBooking = {
      id: `GUEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "guest",
      guestInfo: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
      },
      service: selectedServiceData?.name || selectedService,
      vehicleType: bookingData.vehicleType,
      motorcycleType: bookingData.motorcycleType,
      date: bookingData.date,
      time: bookingData.time,
      branch: bookingData.branch,
      notes: bookingData.notes,
      price: selectedServiceData?.price || "₱250",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save to guest bookings
    const existingGuestBookings = JSON.parse(
      localStorage.getItem("guestBookings") || "[]"
    );
    existingGuestBookings.push(newGuestBooking);
    localStorage.setItem("guestBookings", JSON.stringify(existingGuestBookings));

    notificationManager.success(
      "Guest Booking Confirmed! 🚀",
      `Your booking has been confirmed successfully!\n\nBooking ID: ${newGuestBooking.id}\nGuest: ${bookingData.firstName} ${bookingData.lastName}\nEmail: ${bookingData.email}\nService: ${newGuestBooking.service}\nVehicle: ${newGuestBooking.vehicleType}${newGuestBooking.motorcycleType ? ` (${newGuestBooking.motorcycleType})` : ""}\nDate: ${newGuestBooking.date}\nTime: ${newGuestBooking.time}\nBranch: ${newGuestBooking.branch}\n\nWe'll send confirmation details to your email.`,
      { autoClose: 5000 },
    );

    setIsSubmitting(false);

    // Reset form
    setBookingData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      vehicleType: "sedan",
      date: "",
      time: "",
      branch: "",
      notes: "",
    });
    setSelectedService("");

    // Auto-navigate to login after 5 seconds with suggestion to create account
    setTimeout(() => {
      notificationManager.info(
        "Create Account for More Features! 💡",
        "Sign up to track your bookings, earn loyalty points, and get exclusive offers!",
        { autoClose: 4000 },
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }, 5000);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden pb-20">
      <StickyHeader showBack={true} title="Guest Booking" />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl animate-float animate-delay-300"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in-up">
          <Link to="/login" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full glass hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="gradient-primary p-3 rounded-xl animate-pulse-glow">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">
                Guest{" "}
                <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                  Booking
                </span>
              </h1>
              <p className="text-muted-foreground font-medium">
                Book without creating an account
              </p>
            </div>
          </div>
        </div>

        {/* Guest Info Banner */}
        <Card className="glass border-border shadow-lg mb-8 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-foreground">Quick Guest Booking</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Book instantly without creating an account. You'll receive confirmation via email.{" "}
              <Link to="/signup" className="text-fac-orange-500 hover:underline font-semibold">
                Sign up
              </Link>{" "}
              for tracking, loyalty points, and exclusive offers!
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Guest Information */}
          <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-2xl">
                <div className="gradient-primary p-3 rounded-xl mr-4 animate-pulse-glow">
                  <User className="h-6 w-6 text-white" />
                </div>
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-foreground font-semibold">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={bookingData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    required
                    className="mt-2 py-4 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-foreground font-semibold">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={bookingData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    required
                    className="mt-2 py-4 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-foreground font-semibold">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 z-10" />
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="mt-2 py-4 pl-12 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-foreground font-semibold">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 z-10" />
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+63 912 345 6789"
                      required
                      className="mt-2 py-4 pl-12 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-200">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-2xl">
                <div className="gradient-primary p-3 rounded-xl mr-4 animate-pulse-glow">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                Choose Your Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
                      selectedService === service.id
                        ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 scale-105"
                        : "border-border glass hover:border-fac-orange-300"
                    } ${service.popular ? "ring-2 ring-fac-orange-500/30" : ""}`}
                    onClick={() => {
                      setSelectedService(service.id);
                    }}
                  >
                    {service.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="gradient-primary px-4 py-1 rounded-full text-white text-xs font-bold shadow-lg animate-pulse-glow">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`bg-gradient-to-r ${service.gradient} p-3 rounded-xl animate-pulse-glow`}
                        >
                          {service.id === "classic" && (
                            <Car className="h-6 w-6 text-white" />
                          )}
                          {service.id === "vip-promax" && (
                            <Crown className="h-6 w-6 text-white" />
                          )}
                          {service.id === "premium-detail" && (
                            <Star className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-foreground text-xl">
                            {service.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-fac-orange-500">
                          {service.price}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-foreground"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Type Selection */}
          <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-2xl">
                <div className="gradient-primary p-3 rounded-xl mr-4 animate-pulse-glow">
                  <Car className="h-6 w-6 text-white" />
                </div>
                Select Your Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleSelector
                value={{
                  vehicleType: bookingData.vehicleType,
                  motorcycleType: bookingData.motorcycleType,
                }}
                onChange={(value) =>
                  setBookingData({
                    ...bookingData,
                    vehicleType: value.vehicleType,
                    motorcycleType: value.motorcycleType,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-400">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-2xl">
                <div className="gradient-secondary p-3 rounded-xl mr-4 animate-pulse-glow">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Schedule Your Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="text-foreground font-semibold">
                    Select Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    min={getMinDate()}
                    value={bookingData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                    className="mt-2 py-4 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-foreground font-semibold">
                    Select Time
                  </Label>
                  <Select
                    value={bookingData.time}
                    onValueChange={(value) => handleInputChange("time", value)}
                  >
                    <SelectTrigger className="mt-2 py-4 bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300">
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/90 backdrop-blur-sm border-border">
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branch Selection */}
          <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-500">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-2xl">
                <div className="gradient-futuristic p-3 rounded-xl mr-4 animate-pulse-glow">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                Choose Your Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
                      bookingData.branch === branch.name
                        ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50"
                        : "border-border glass hover:border-fac-orange-300"
                    }`}
                    onClick={() => handleInputChange("branch", branch.name)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-foreground text-lg">
                          {branch.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {branch.address}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          bookingData.branch === branch.name
                            ? "border-fac-orange-500 bg-fac-orange-500"
                            : "border-muted-foreground"
                        }`}
                      >
                        {bookingData.branch === branch.name && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {branch.features.map((feature, index) => (
                        <Badge
                          key={index}
                          className="bg-muted text-muted-foreground text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Notes */}
          <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-600">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground text-2xl">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl mr-4 animate-pulse-glow">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                Special Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes" className="text-foreground font-semibold">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={bookingData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any special requests or areas of concern for your vehicle..."
                  className="mt-2 min-h-[100px] bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="animate-fade-in-up animate-delay-700">
            <Button
              type="submit"
              className="btn-futuristic w-full py-6 text-xl rounded-2xl font-black relative overflow-hidden group"
              disabled={
                isSubmitting ||
                !bookingData.firstName.trim() ||
                !bookingData.lastName.trim() ||
                !bookingData.email.trim() ||
                !bookingData.phone.trim() ||
                !selectedService ||
                !bookingData.vehicleType ||
                !bookingData.date ||
                !bookingData.time ||
                !bookingData.branch
              }
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  PROCESSING GUEST BOOKING...
                </div>
              ) : (
                <span className="relative z-10 flex items-center justify-center">
                  CONFIRM GUEST BOOKING
                  <Zap className="h-6 w-6 ml-3 group-hover:scale-125 transition-transform duration-300" />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="text-center mt-8 animate-fade-in-up animate-delay-800">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-foreground font-semibold">
                Guest Booking Protection
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free cancellation up to 2 hours before your appointment •
              Email confirmation will be sent • No account required
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-fac-orange-50 to-purple-50 dark:from-fac-orange-950/50 dark:to-purple-950/50 rounded-xl border border-fac-orange-200">
              <p className="text-sm text-foreground font-medium">
                💡 <strong>Want more features?</strong>{" "}
                <Link to="/signup" className="text-fac-orange-500 hover:underline">
                  Create an account
                </Link>{" "}
                to track bookings, earn loyalty points, and get exclusive offers!
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={confirmBooking}
        title="Confirm Your Guest Booking"
        description={`Please confirm your booking details:

Guest: ${bookingData.firstName} ${bookingData.lastName}
Email: ${bookingData.email}
Phone: ${bookingData.phone}

Service: ${services.find((s) => s.id === selectedService)?.name || selectedService}
Vehicle: ${bookingData.vehicleType}${bookingData.motorcycleType ? ` (${bookingData.motorcycleType})` : ""}
Date: ${bookingData.date}
Time: ${bookingData.time}
Branch: ${bookingData.branch}

Proceed with this booking?`}
        confirmText="Yes, Book Now"
        cancelText="Review Details"
        type="info"
      />
    </div>
  );
}
