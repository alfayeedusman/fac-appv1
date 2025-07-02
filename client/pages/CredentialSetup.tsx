import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";

export default function CredentialSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: credentials, 2: email verification
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState({
    code: "",
    isVerified: false,
  });

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credentials.password !== credentials.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (credentials.password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    setIsLoading(true);

    // Simulate API call to create credentials
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Move to OTP verification step
    setStep(2);
    setIsLoading(false);
  };

  const handleSendOTP = async () => {
    setIsLoading(true);

    // Simulate sending OTP
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert(
      `OTP sent to ${credentials.email}! For demo purposes, use code: 123456`,
    );
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For demo purposes, accept 123456
    if (otp.code === "123456" || otp.code.length === 6) {
      setOtp((prev) => ({ ...prev, isVerified: true }));

      // Store authentication data
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", credentials.email);
      localStorage.setItem("username", credentials.username);

      setTimeout(() => {
        navigate("/welcome");
      }, 1500);
    } else {
      alert("Invalid OTP code. For demo, use: 123456");
    }

    setIsLoading(false);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: "Weak", color: "red" };
    if (strength <= 3) return { label: "Medium", color: "orange" };
    return { label: "Strong", color: "green" };
  };

  const passwordStrength = getPasswordStrength(credentials.password);

  if (step === 1) {
    return (
      <div className="min-h-screen bg-white">
        <StickyHeader showBack={true} backTo="/signup" title="Setup Account" />

        <div className="px-6 py-8 max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-12 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl font-black text-black tracking-tight mb-2">
              Set Up Your Account
            </h1>
            <p className="text-gray-500 font-medium">
              Create your login credentials
            </p>
          </div>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-center">
                <div className="bg-fac-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-black">
                  Account Credentials
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCredentials} className="space-y-6">
                {/* Username Field */}
                <div>
                  <Label
                    htmlFor="username"
                    className="font-bold text-black mb-2"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={credentials.username}
                      onChange={(e) =>
                        handleCredentialChange("username", e.target.value)
                      }
                      className="pl-10 py-3 text-black font-medium border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500"
                      required
                      minLength={3}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Minimum 3 characters, letters and numbers only
                  </p>
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="font-bold text-black mb-2">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={credentials.email}
                      onChange={(e) =>
                        handleCredentialChange("email", e.target.value)
                      }
                      className="pl-10 py-3 text-black font-medium border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    We'll send a verification code to this email
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <Label
                    htmlFor="password"
                    className="font-bold text-black mb-2"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={credentials.password}
                      onChange={(e) =>
                        handleCredentialChange("password", e.target.value)
                      }
                      className="pl-10 pr-10 py-3 text-black font-medium border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500"
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {credentials.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 flex-1 rounded-full bg-${passwordStrength.color}-200`}
                        >
                          <div
                            className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                            style={{
                              width: `${getPasswordStrength(credentials.password).label === "Weak" ? 33 : getPasswordStrength(credentials.password).label === "Medium" ? 66 : 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold text-${passwordStrength.color}-600`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="font-bold text-black mb-2"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={credentials.confirmPassword}
                      onChange={(e) =>
                        handleCredentialChange(
                          "confirmPassword",
                          e.target.value,
                        )
                      }
                      className="pl-10 pr-10 py-3 text-black font-medium border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
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
                  {credentials.confirmPassword && (
                    <div className="mt-1 flex items-center">
                      {credentials.password === credentials.confirmPassword ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <div className="h-4 w-4 bg-red-500 rounded-full mr-2" />
                      )}
                      <span
                        className={`text-xs font-medium ${credentials.password === credentials.confirmPassword ? "text-green-600" : "text-red-600"}`}
                      >
                        {credentials.password === credentials.confirmPassword
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    credentials.password !== credentials.confirmPassword
                  }
                  className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-4 text-lg rounded-xl"
                >
                  {isLoading ? "SETTING UP..." : "CONTINUE TO VERIFICATION"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Email Verification
  return (
    <div className="min-h-screen bg-white">
      <StickyHeader showBack={true} backTo="/signup" title="Verify Email" />

      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
            alt="Fayeed Auto Care Logo"
            className="h-12 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-500 font-medium">
            Enter the verification code sent to
          </p>
          <p className="text-fac-orange-500 font-bold">{credentials.email}</p>
        </div>

        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${otp.isVerified ? "bg-green-500" : "bg-fac-orange-500"}`}
              >
                {otp.isVerified ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <Shield className="h-6 w-6 text-white" />
                )}
              </div>
              <span className="text-xl font-black text-black">
                {otp.isVerified ? "Email Verified!" : "Email Verification"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!otp.isVerified ? (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <Label htmlFor="otp" className="font-bold text-black mb-2">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp.code}
                    onChange={(e) =>
                      setOtp((prev) => ({
                        ...prev,
                        code: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className="text-center text-2xl font-black py-4 border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500 tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium text-center">
                    For demo purposes, use:{" "}
                    <span className="font-bold text-fac-orange-500">
                      123456
                    </span>
                  </p>
                </div>

                {/* Verify Button */}
                <Button
                  type="submit"
                  disabled={isLoading || otp.code.length !== 6}
                  className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-4 text-lg rounded-xl"
                >
                  {isLoading ? "VERIFYING..." : "VERIFY EMAIL"}
                </Button>

                {/* Resend OTP */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full border-gray-300 text-black hover:bg-gray-50 font-bold py-3 rounded-xl"
                >
                  RESEND CODE
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-green-900 mb-2">
                    Account Created Successfully!
                  </h3>
                  <p className="text-sm text-green-700 font-medium">
                    Your email has been verified. Redirecting to welcome
                    screen...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
