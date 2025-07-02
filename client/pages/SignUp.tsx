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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For now, just log the data and redirect
    console.log("Form submitted:", formData);
    alert("Registration successful! Welcome to Fayeed Auto Care!");
    setIsSubmitting(false);
  };

  const carTypes = ["Sedan", "SUV", "Pickup", "Hatchback", "Van", "Truck"];

  const branches = ["Tumaga", "Boalan"];

  const packages = [
    {
      value: "classic",
      label: "Classic - ₱500/month",
      description: "Basic wash package",
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
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
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
              <h1 className="text-2xl font-bold text-fac-blue-900">Join FAC</h1>
              <p className="text-fac-blue-700">
                Create your Fayeed Auto Care account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-fac-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="+63 9XX XXX XXXX"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  required
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-fac-blue-600" />
                Vehicle Information
              </CardTitle>
              <CardDescription>Details about your car</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="carUnit">Car Unit *</Label>
                <Input
                  id="carUnit"
                  type="text"
                  placeholder="e.g., Toyota Vios 2020"
                  value={formData.carUnit}
                  onChange={(e) => handleInputChange("carUnit", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="carPlateNumber">Car Plate Number *</Label>
                <Input
                  id="carPlateNumber"
                  type="text"
                  placeholder="e.g., ABC 1234"
                  value={formData.carPlateNumber}
                  onChange={(e) =>
                    handleInputChange("carPlateNumber", e.target.value)
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="carType">Car Type *</Label>
                <Select
                  value={formData.carType}
                  onValueChange={(value) => handleInputChange("carType", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your car type" />
                  </SelectTrigger>
                  <SelectContent>
                    {carTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Service Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-fac-blue-600" />
                Service Preferences
              </CardTitle>
              <CardDescription>
                Choose your preferred branch and package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="branchLocation">Preferred Branch *</Label>
                <Select
                  value={formData.branchLocation}
                  onValueChange={(value) =>
                    handleInputChange("branchLocation", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your preferred branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch.toLowerCase()}>
                        {branch} Branch
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="packageToAvail">Membership Package *</Label>
                <Select
                  value={formData.packageToAvail}
                  onValueChange={(value) =>
                    handleInputChange("packageToAvail", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose your membership package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.value} value={pkg.value}>
                        <div>
                          <div className="font-medium">{pkg.label}</div>
                          <div className="text-sm text-gray-500">
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
            <Card className="border-fac-gold-200 bg-fac-gold-50">
              <CardHeader>
                <CardTitle className="flex items-center text-fac-gold-700">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.packageToAvail === "vip-gold" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fac-gold-800">
                      VIP Gold Package - ₱3,000/month
                    </h4>
                    <ul className="text-sm text-fac-gold-700 space-y-1">
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
                    <h4 className="font-semibold text-fac-gold-800">
                      VIP Silver Package - ₱1,500/month
                    </h4>
                    <ul className="text-sm text-fac-gold-700 space-y-1">
                      <li>• 8 classic wash sessions</li>
                      <li>• 2 VIP ProMax wash sessions</li>
                      <li>• Member discounts</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                )}
                {formData.packageToAvail === "classic" && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-fac-gold-800">
                      Classic Package - ₱500/month
                    </h4>
                    <ul className="text-sm text-fac-gold-700 space-y-1">
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
            className="w-full bg-fac-blue-600 hover:bg-fac-blue-700 text-white py-4 text-lg font-semibold rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/profile"
              className="text-fac-blue-600 font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
