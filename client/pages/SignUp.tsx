import { useState } from "react";
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
import { Link } from "react-router-dom";
import { ArrowLeft, Car, User, MapPin, CreditCard } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface SignUpFormData {
  fullName: string;
  address: string;
  email: string;
  contactNumber: string;
  carUnit: string;
  carPlateNumber: string;
  carType: string;
  branchLocation: string;
  packageToAvail: string;
}

export default function SignUp() {
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    address: "",
    email: "",
    contactNumber: "",
    carUnit: "",
    carPlateNumber: "",
    carType: "",
    branchLocation: "",
    packageToAvail: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Store form data for demo purposes
    localStorage.setItem("signUpData", JSON.stringify(formData));

    alert(
      "Registration submitted successfully! Admin will review your application.",
    );

    setIsSubmitting(false);
  };

  const branches = ["Tumaga", "Boalan"];

  const packages = [
    {
      value: "classic",
      label: "Classic - ₱500/month",
      description: "4 wash sessions per month",
    },
    {
      value: "vip-silver",
      label: "VIP Silver - ₱1,500/month",
      description: "Premium wash + extras",
    },
    {
      value: "vip-gold",
      label: "VIP Gold - ₱3,000/month",
      description: "Unlimited classic + 5 VIP ProMax + 1 Premium",
    },
  ];

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Join FAC</h1>
              <p className="text-muted-foreground">
                Create your Fayeed Auto Care account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-card border-border theme-transition">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <User className="h-5 w-5 mr-2 text-fac-orange-500" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-foreground">
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
                  className="mt-1 bg-background border-border text-foreground theme-transition"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-foreground">
                  Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className="mt-1 bg-background border-border text-foreground theme-transition"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="mt-1 bg-background border-border text-foreground theme-transition"
                />
              </div>

              <div>
                <Label htmlFor="contactNumber" className="text-foreground">
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter your contact number"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  required
                  className="mt-1 bg-background border-border text-foreground theme-transition"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card className="bg-card border-border theme-transition">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Car className="h-5 w-5 mr-2 text-fac-orange-500" />
                Vehicle Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell us about your vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="carUnit" className="text-foreground">
                  Car Unit/Model *
                </Label>
                <Input
                  id="carUnit"
                  type="text"
                  placeholder="e.g., Toyota Camry 2020"
                  value={formData.carUnit}
                  onChange={(e) => handleInputChange("carUnit", e.target.value)}
                  required
                  className="mt-1 bg-background border-border text-foreground theme-transition"
                />
              </div>

              <div>
                <Label htmlFor="carPlateNumber" className="text-foreground">
                  Car Plate Number *
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
                  className="mt-1 bg-background border-border text-foreground theme-transition"
                />
              </div>

              <div>
                <Label htmlFor="carType" className="text-foreground">
                  Car Type *
                </Label>
                <Select
                  value={formData.carType}
                  onValueChange={(value) => handleInputChange("carType", value)}
                >
                  <SelectTrigger className="mt-1 bg-background border-border text-foreground theme-transition">
                    <SelectValue placeholder="Select your car type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="pickup">Pickup Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Service Preferences */}
          <Card className="bg-card border-border theme-transition">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <MapPin className="h-5 w-5 mr-2 text-fac-orange-500" />
                Service Preferences
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose your preferred branch and package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="branchLocation" className="text-foreground">
                  Preferred Branch *
                </Label>
                <Select
                  value={formData.branchLocation}
                  onValueChange={(value) =>
                    handleInputChange("branchLocation", value)
                  }
                >
                  <SelectTrigger className="mt-1 bg-background border-border text-foreground theme-transition">
                    <SelectValue placeholder="Select your preferred branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch.toLowerCase()}>
                        {branch} Branch
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="packageToAvail" className="text-foreground">
                  Membership Package *
                </Label>
                <Select
                  value={formData.packageToAvail}
                  onValueChange={(value) =>
                    handleInputChange("packageToAvail", value)
                  }
                >
                  <SelectTrigger className="mt-1 bg-background border-border text-foreground theme-transition">
                    <SelectValue placeholder="Choose your membership package" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.value} value={pkg.value}>
                        <div>
                          <div className="font-medium text-foreground">
                            {pkg.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          {formData.packageToAvail && (
            <Card className="border-fac-orange-200 bg-fac-orange-50 dark:border-fac-orange-800 dark:bg-fac-orange-950 theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center text-fac-orange-700 dark:text-fac-orange-300">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.packageToAvail === "vip-gold" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fac-orange-800 dark:text-fac-orange-200">
                      VIP Gold Package - ₱3,000/month
                    </h4>
                    <ul className="text-sm text-fac-orange-700 dark:text-fac-orange-300 space-y-1">
                      <li>• Unlimited classic wash sessions</li>
                      <li>• 5 VIP ProMax wash sessions</li>
                      <li>• 1 Premium wash session</li>
                      <li>• Priority booking</li>
                      <li>• Exclusive member benefits</li>
                    </ul>
                  </div>
                )}
                {formData.packageToAvail === "vip-silver" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fac-orange-800 dark:text-fac-orange-200">
                      VIP Silver Package - ₱1,500/month
                    </h4>
                    <ul className="text-sm text-fac-orange-700 dark:text-fac-orange-300 space-y-1">
                      <li>• 8 classic wash sessions</li>
                      <li>• 2 VIP ProMax wash sessions</li>
                      <li>• Member discounts</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                )}
                {formData.packageToAvail === "classic" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fac-orange-800 dark:text-fac-orange-200">
                      Classic Package - ₱500/month
                    </h4>
                    <ul className="text-sm text-fac-orange-700 dark:text-fac-orange-300 space-y-1">
                      <li>• 4 classic wash sessions</li>
                      <li>• Basic member benefits</li>
                      <li>• Online booking access</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING DETAILS..." : "SUBMIT REGISTRATION"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-fac-orange-500 font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
