import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Car,
  User,
  MapPin,
  CreditCard,
  Sparkles,
  Zap,
  Shield,
  CheckCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import RegistrationSuccessModal from "@/components/RegistrationSuccessModal";
import { authService } from "@/services/authService";

interface SignUpFormData {
  fullName: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  carUnit: string;
  carPlateNumber: string;
  carType: string;
  branchLocation: string;
  packageToAvail: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    carUnit: "",
    carPlateNumber: "",
    carType: "",
    branchLocation: "",
    packageToAvail: "regular",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+?63|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = "Contact number is required";
      } else if (!validatePhone(formData.contactNumber)) {
        newErrors.contactNumber =
          "Please enter a valid Philippine phone number";
      }

      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      } else if (formData.address.trim().length < 10) {
        newErrors.address = "Please provide a complete address";
      }
    }

    if (step === 2) {
      if (!formData.carUnit.trim()) {
        newErrors.carUnit = "Car model is required";
      }

      if (!formData.carPlateNumber.trim()) {
        newErrors.carPlateNumber = "Plate number is required";
      } else if (
        !/^[A-Z0-9\s]{6,8}$/.test(
          formData.carPlateNumber.toUpperCase().replace(/\s/g, ""),
        )
      ) {
        newErrors.carPlateNumber =
          "Please enter a valid plate number (e.g., ABC 1234)";
      }

      if (!formData.carType) {
        newErrors.carType = "Vehicle type is required";
      }

      if (!formData.branchLocation) {
        newErrors.branchLocation = "Preferred branch is required";
      }
    }

    if (step === 3) {
      if (!formData.packageToAvail) {
        newErrors.packageToAvail = "Please select a package";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Registration form submitted');

    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);

    console.log('✅ Validation results:', {
      step1: isStep1Valid,
      step2: isStep2Valid,
      step3: isStep3Valid
    });

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      console.error('❌ Validation failed:', errors);
      toast({
        title: 'Please Complete All Fields',
        description: 'Fill in all required fields correctly before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        branchLocation: formData.branchLocation || 'Tumaga',
        role: 'user' as const,
        carUnit: formData.carUnit,
        carPlateNumber: formData.carPlateNumber,
        carType: formData.carType,
      };

      console.log('📤 Sending registration request for:', payload.email);
      const result = await authService.register(payload);
      console.log('📥 Registration response:', result);

      if (result.success) {
        console.log('✅ Registration successful!');
        toast({
          title: 'Welcome to FAC! 🎉',
          description: 'Your account has been created successfully. You can now book car wash services!'
        });
        setShowSuccessModal(true);
      } else {
        console.error('❌ Registration failed:', result.error);
        toast({
          title: 'Registration Failed',
          description: result.error || 'Please check your details and try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('��� Registration error:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to server. Please check your internet connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  const branches = ["Tumaga", "Boalan"];

  const packages = [
    {
      value: "regular",
      label: "Regular Member",
      price: "Free",
      description: "Basic app access for wash monitoring",
      features: [
        "Wash monitoring",
        "History logs",
        "Voucher access",
        "Basic notifications",
      ],
      gradient: "from-gray-500 to-gray-600",
    },
    {
      value: "classic",
      label: "Classic Pro",
      price: "₱500/month",
      description: "4 professional wash sessions",
      features: [
        "Smart exterior cleaning",
        "Basic protection",
        "Mobile alerts",
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      value: "vip-silver",
      label: "VIP Silver Elite",
      price: "₱1,500/month",
      description: "Premium wash + advanced care",
      features: [
        "8 premium sessions",
        "Interior deep clean",
        "Paint protection",
        "Priority booking",
      ],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      value: "vip-gold",
      label: "VIP Gold Ultimate",
      price: "₱3,000/month",
      description: "Unlimited luxury experience",
      features: [
        "Unlimited classic washes",
        "5 VIP ProMax sessions",
        "1 Premium detail",
        "Concierge service",
        "VIP lounge access",
      ],
      gradient: "from-fac-orange-500 to-yellow-500",
      popular: true,
    },
  ];

  const nextStep = () => {
    console.log(`🔄 Attempting to move from step ${currentStep} to ${currentStep + 1}`);
    const isValid = validateStep(currentStep);
    console.log(`✅ Step ${currentStep} validation:`, isValid);

    if (!isValid) {
      console.error(`❌ Step ${currentStep} validation failed:`, JSON.stringify(errors, null, 2));
      const errorMessages = Object.values(errors).filter(Boolean).join(', ');
      toast({
        title: 'Please Complete This Step',
        description: errorMessages || 'Fill in all required fields before continuing.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      console.log(`✅ Moved to step ${currentStep + 1}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log(`⬅️ Moved back to step ${currentStep - 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">{/* Removed StickyHeader - using custom navigation */}

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-gradient-to-r from-fac-orange-500/5 to-purple-500/5 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/5 to-fac-orange-500/5 blur-2xl"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1">
          <ThemeToggle />
        </div>
      </div>

      <div className="px-6 py-8 max-w-md mx-auto relative z-10">
        {/* Modern Header */}
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full glass hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground mb-2">
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                Fayeed Auto Care
              </span>
            </h1>
            <h2 className="text-xl font-black text-foreground">
              Join{" "}
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                FAC 2025
              </span>
            </h2>
            <p className="text-muted-foreground font-medium">
              Step into the future of car care
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  currentStep >= step
                    ? "bg-gradient-to-r from-fac-orange-500 to-purple-600 text-white scale-110"
                    : "glass text-muted-foreground"
                }`}
              >
                {currentStep > step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step
                )}
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  currentStep >= step
                    ? "bg-gradient-to-r from-fac-orange-500 to-purple-600"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <Card className="glass border-border shadow-2xl hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-xl">
                    <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    Personal Details
                  </CardTitle>
                  <CardDescription className="text-muted-foreground ml-16">
                    Let's get to know you better
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="fullName"
                        className="text-foreground font-semibold"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        required
                        className={`py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                          errors.fullName
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="email"
                        className="text-foreground font-semibold flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2 text-fac-orange-500" />
                        Email Address *
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-fac-orange-500 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          required
                          className={`pl-12 py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                            errors.email
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="password"
                        className="text-foreground font-semibold flex items-center"
                      >
                        <Lock className="h-4 w-4 mr-2 text-fac-orange-500" />
                        Password *
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-fac-orange-500 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          required
                          className={`pl-12 pr-12 py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                            errors.password
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-muted/50"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-foreground font-semibold flex items-center"
                      >
                        <Lock className="h-4 w-4 mr-2 text-fac-orange-500" />
                        Confirm Password *
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-fac-orange-500 transition-colors" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          required
                          className={`pl-12 pr-12 py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                            errors.confirmPassword
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-muted/50"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="contactNumber"
                        className="text-foreground font-semibold"
                      >
                        Contact Number *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground font-bold bg-muted px-2 py-1 rounded border-r border-border">
                          +63
                        </div>
                        <Input
                          id="contactNumber"
                          type="tel"
                          placeholder="912 345 6789"
                          value={formData.contactNumber
                            .replace("+63", "")
                            .replace(/^\s+/, "")}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^\d\s]/g,
                              "",
                            );
                            handleInputChange(
                              "contactNumber",
                              `+63${value ? " " + value : ""}`,
                            );
                          }}
                          required
                          className={`pl-16 py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                            errors.contactNumber
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.contactNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.contactNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="address"
                        className="text-foreground font-semibold"
                      >
                        Address *
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Complete address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        required
                        className={`py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                          errors.address
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Vehicle Information */}
          {currentStep === 2 && (
            <div>
              <Card className="glass border-border shadow-2xl hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-xl">
                    <div className="gradient-secondary w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    Vehicle Details
                  </CardTitle>
                  <CardDescription className="text-muted-foreground ml-16">
                    Tell us about your ride
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="carUnit"
                        className="text-foreground font-semibold"
                      >
                        Car Model *
                      </Label>
                      <Input
                        id="carUnit"
                        type="text"
                        placeholder="e.g., Toyota Camry 2024"
                        value={formData.carUnit}
                        onChange={(e) =>
                          handleInputChange("carUnit", e.target.value)
                        }
                        required
                        className={`py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                          errors.carUnit
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      {errors.carUnit && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.carUnit}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="carPlateNumber"
                        className="text-foreground font-semibold"
                      >
                        Plate Number *
                      </Label>
                      <Input
                        id="carPlateNumber"
                        type="text"
                        placeholder="e.g., ABC 1234"
                        value={formData.carPlateNumber}
                        onChange={(e) =>
                          handleInputChange("carPlateNumber", e.target.value)
                        }
                        required
                        className={`py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300 focus:scale-[1.02] ${
                          errors.carPlateNumber
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      {errors.carPlateNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.carPlateNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="carType"
                        className="text-foreground font-semibold"
                      >
                        Vehicle Type *
                      </Label>
                      <Select
                        value={formData.carType}
                        onValueChange={(value) =>
                          handleInputChange("carType", value)
                        }
                      >
                        <SelectTrigger className="py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/90 border-border">
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="pickup">Pickup Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="branchLocation"
                        className="text-foreground font-semibold"
                      >
                        Preferred Hub *
                      </Label>
                      <Select
                        value={formData.branchLocation}
                        onValueChange={(value) =>
                          handleInputChange("branchLocation", value)
                        }
                      >
                        <SelectTrigger className="py-4 bg-background/50 border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300">
                          <SelectValue placeholder="Choose your preferred hub" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/90 border-border">
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch}
                              value={branch.toLowerCase()}
                            >
                              {branch} Hub
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Package Selection */}
          {currentStep === 3 && (
            <div>
              <Card className="glass border-border shadow-2xl hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-xl">
                    <div className="gradient-futuristic w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    Choose Your Plan
                  </CardTitle>
                  <CardDescription className="text-muted-foreground ml-16">
                    Select the perfect package for your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.value}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
                          formData.packageToAvail === pkg.value
                            ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 scale-105"
                            : "border-border glass hover:border-fac-orange-300"
                        } ${pkg.popular ? "ring-2 ring-fac-orange-500/30" : ""}`}
                        onClick={() =>
                          handleInputChange("packageToAvail", pkg.value)
                        }
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="gradient-primary px-4 py-1 rounded-full text-white text-xs font-bold shadow-lg">
                              MOST POPULAR
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-black text-foreground text-lg">
                              {pkg.label}
                            </h3>
                            <p className="text-2xl font-black text-fac-orange-500">
                              {pkg.price}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              formData.packageToAvail === pkg.value
                                ? "border-fac-orange-500 bg-fac-orange-500"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.packageToAvail === pkg.value && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                          {pkg.description}
                        </p>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center text-sm text-foreground"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="glass border-border text-foreground hover:bg-accent font-bold py-3 px-6 rounded-xl transition-all duration-300 hover-lift"
              >
                Previous
              </Button>
            )}
            <div className="flex-1"></div>
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="btn-futuristic py-3 px-8 rounded-xl font-bold"
              >
                Next Step
                <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="btn-futuristic py-3 px-8 rounded-xl font-bold relative overflow-hidden group"
                disabled={isSubmitting || !formData.packageToAvail}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    PROCESSING...
                  </div>
                ) : (
                  <span className="flex items-center">
                    JOIN THE FUTURE
                    <Zap className="h-5 w-5 ml-2 group-hover:scale-125 transition-transform" />
                  </span>
                )}
              </Button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-fac-orange-500 font-semibold hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-muted-foreground text-sm">
              Need to set up credentials?{" "}
              <Link
                to="/credential-setup"
                className="text-purple-500 font-semibold hover:underline transition-colors"
              >
                Credential Setup
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Registration Success Modal */}
      <RegistrationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinueToLogin={handleContinueToLogin}
        userEmail={formData.email}
        packageType={formData.packageToAvail}
      />
    </div>
  );
}
