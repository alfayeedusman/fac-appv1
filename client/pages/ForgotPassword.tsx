import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Simulated OTP for demo purposes
  const [generatedOTP, setGeneratedOTP] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if email exists in registered users
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );
    const userExists = registeredUsers.find(
      (user: any) => user.email === formData.email,
    );

    if (!userExists) {
      toast({
        title: "Email Not Found",
        description: "This email address is not registered with us",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);

    // Simulate sending OTP (in real app, this would be sent via email/SMS)
    setTimeout(() => {
      toast({
        title: "OTP Sent! 📧",
        description: `For demo purposes, your OTP is: ${otp}`,
        variant: "default",
      });
      setStep("otp");
      setIsLoading(false);
    }, 2000);
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.otp !== generatedOTP) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP sent to your email",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "OTP Verified! ✅",
      description: "Please set your new password",
      variant: "default",
    });
    setStep("reset");
    setIsLoading(false);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update password in localStorage
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );
    const userIndex = registeredUsers.findIndex(
      (user: any) => user.email === formData.email,
    );

    if (userIndex !== -1) {
      registeredUsers[userIndex].password = formData.newPassword;
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

      toast({
        title: "Password Reset Successfully! 🎉",
        description: "You can now login with your new password",
        variant: "default",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }

    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader showBack={true} title="Reset Password" />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="text-center py-12 px-6">
        <div className="mb-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
            alt="Fayeed Auto Care Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {step === "email" &&
            "Enter your email to receive a verification code"}
          {step === "otp" && "Enter the 6-digit code sent to your email"}
          {step === "reset" && "Create a new secure password"}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-center">
              <div className="bg-fac-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                {step === "email" && <Mail className="h-6 w-6 text-white" />}
                {step === "otp" && <Shield className="h-6 w-6 text-white" />}
                {step === "reset" && <Lock className="h-6 w-6 text-white" />}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={(e) => handleInputChange("otp", e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Code sent to {formData.email}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep("email")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Email
                  </Button>
                </div>
              </form>
            )}

            {/* Password Reset Step */}
            {step === "reset" && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        handleInputChange("newPassword", e.target.value)
                      }
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-fac-orange-500 hover:text-fac-orange-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1 inline" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
