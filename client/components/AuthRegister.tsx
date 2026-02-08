import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Mail, Lock, User, Phone, MapPin, Building } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";

interface AuthRegisterProps {
  onSuccess?: (email: string) => void;
  onSwitchToLogin?: () => void;
}

export const AuthRegister: React.FC<AuthRegisterProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    contactNumber: "",
    address: "",
    branchLocation: "default",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.fullName) newErrors.fullName = "Full name is required";

    // Validate phone number (Philippine format) - optional but if provided, must be valid
    if (formData.contactNumber) {
      // Accept formats: +63 9XX XXX XXXX, 09XX XXX XXXX, +639XXXXXXXXXX, 09XXXXXXXXXX
      const phoneRegex = /^(\+63|0)?9\d{9}$/;
      const cleanedPhone = formData.contactNumber.replace(/[\s\-()]/g, "");
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.contactNumber = "Please enter a valid Philippine phone number (e.g., 09XX XXX XXXX or +63 9XX XXX XXXX)";
      }
    }

    // Validate address - optional but if provided, must not be empty or just whitespace
    if (formData.address && !formData.address.trim()) {
      newErrors.address = "Please provide a complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notificationManager.error("Validation Error", "Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      const result = await supabaseAuthService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        branchLocation: formData.branchLocation,
        role: "user",
      });

      if (result.success) {
        notificationManager.success(
          "Registration Successful",
          "A verification email has been sent to your inbox. Please verify your email to continue."
        );

        if (onSuccess) {
          onSuccess(formData.email);
        }
      } else {
        notificationManager.error("Registration Failed", result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Create Account</CardTitle>
            <p className="text-sm text-gray-600">Sign up to get started</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="tel"
                placeholder="+63 9XX XXX XXXX"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>

          {/* Branch Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Location
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={formData.branchLocation}
                onChange={(e) =>
                  setFormData({ ...formData, branchLocation: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="default">Select a branch</option>
                <option value="manila">Manila</option>
                <option value="cebu">Cebu</option>
                <option value="davao">Davao</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              📧 A verification email will be sent to your inbox. Please verify your email before logging in.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Log In
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
