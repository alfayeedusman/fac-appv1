import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Smartphone, Mail, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo purposes, accept any email/password
    if (formData.email && formData.password) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", formData.email);
      navigate("/welcome");
    } else {
      alert("Please fill in all fields");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <div className="text-center py-8 px-6">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
          alt="Fayeed Auto Care Logo"
          className="h-16 w-auto mx-auto mb-4"
        />
        <h1 className="text-3xl font-black text-black tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-500 font-medium">Sign in to your FAC account</p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-center">
              <div className="bg-fac-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-black">Sign In</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 py-3 text-black font-medium border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="font-bold text-black mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10 pr-10 py-3 text-black font-medium border-gray-300 focus:border-fac-orange-500 focus:ring-fac-orange-500"
                    required
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
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-fac-orange-500 hover:text-fac-orange-600"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-4 text-lg rounded-xl"
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </Button>

              {/* Biometric Login Option */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 text-black hover:bg-gray-50 font-bold py-4 rounded-xl"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Use Biometric Login
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 font-medium">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-fac-orange-500 font-black hover:text-fac-orange-600"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Users */}
        <Card className="mt-8 bg-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <h3 className="font-black text-black text-sm mb-3">Demo Access:</h3>
            <p className="text-xs text-gray-600 font-medium">
              Use any email and password to sign in for demo purposes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-6">
        <p className="text-xs text-gray-400 font-medium">
          © 2024 Fayeed Auto Care. All rights reserved.
        </p>
      </div>
    </div>
  );
}
