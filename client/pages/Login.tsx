import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  Zap,
  ArrowLeft,
  CheckCircle,
  Calendar,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { authService } from "@/services/authService";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Connection check happens in background during login attempt
  // No need to check on mount as it may cause false errors

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Input validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Login Failed",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

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

    try {
      // Attempt login directly - connection issues will be handled by the auth service
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success && result.user) {
        // Set authentication flags
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("justLoggedIn", "true");

        // Check if this is a returning user
        const hasCompletedWelcome = localStorage.getItem(
          `welcomed_${result.user.email}`,
        );

        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${result.user.email}`,
        });

        setTimeout(() => {
          if (
            result.user.role === "admin" ||
            result.user.role === "superadmin"
          ) {
            // Set welcome flags for admin users to bypass welcome screen
            localStorage.setItem("hasSeenWelcome", "true");
            localStorage.setItem(`welcomed_${result.user.email}`, "true");
            navigate("/admin-dashboard");
          } else if (result.user.role === "manager") {
            navigate("/manager-dashboard");
          } else if (result.user.role === "dispatcher") {
            navigate("/dispatcher-dashboard");
          } else if (result.user.role === "crew") {
            navigate("/crew-dashboard");
          } else if (result.user.role === "cashier") {
            navigate("/pos");
          } else if (result.user.role === "inventory_manager") {
            navigate("/inventory-management");
          } else if (hasCompletedWelcome) {
            // Returning user - go straight to dashboard
            navigate("/dashboard");
          } else {
            // New user - show welcome flow
            localStorage.setItem("showSplashScreen", "true");
            navigate("/welcome");
          }
        }, 1000);
      } else {
        // Login failed with specific error message
        let description =
          result.error ||
          "Invalid email or password. Please check your credentials and try again.";

        // Provide additional helpful context
        if (
          result.error?.includes("Invalid") ||
          result.error?.includes("credentials")
        ) {
          description =
            "Invalid email or password. Please check your credentials and try again.";
        } else if (result.error?.includes("disabled")) {
          description =
            "Your account has been disabled. Please contact support.";
        } else if (
          result.error?.includes("service") ||
          result.error?.includes("503")
        ) {
          description =
            "Service temporarily unavailable. Please try again in a few moments.";
        } else if (
          result.error?.includes("connect") ||
          result.error?.includes("network") ||
          result.error?.includes("internet")
        ) {
          description =
            "Unable to connect to the server. Please check your internet connection and try again.";
        }

        toast({
          title: "Login Failed",
          description,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      let title = "Login Failed";
      let description = "An unexpected error occurred. Please try again.";

      // Check if it's a network/connection error
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("network") ||
        error.message?.includes("connection") ||
        error.name === "TypeError" // Network error
      ) {
        title = "Connection Error";
        description =
          "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.message?.includes("timeout")) {
        title = "Connection Timeout";
        description = "The server took too long to respond. Please try again.";
      } else if (error.message?.includes("CORS")) {
        title = "Access Error";
        description =
          "Unable to connect to the authentication service. Please try again.";
      }

      // Use requestAnimationFrame to defer toast to next frame to avoid React reconciliation conflicts
      requestAnimationFrame(() => {
        toast({
          title,
          description,
          variant: "destructive",
        });
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-xl animate-float animate-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-2xl animate-breathe"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-500/6 to-blue-500/6 blur-lg animate-float animate-delay-500"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-xl p-3 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Header Section */}
        <div className="text-center py-12 px-6 relative z-10">
          <div className="animate-fade-in-up">
            <div className="mb-8 relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                alt="Fayeed Auto Care Logo"
                className="h-16 w-auto mx-auto mb-4 drop-shadow-lg"
              />
              <Badge className="bg-fac-orange-100 text-fac-orange-700 dark:bg-fac-orange-900 dark:text-fac-orange-200 mb-4">
                Member Login
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              Welcome{" "}
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                Back
              </span>
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Sign in to access your account and manage your bookings
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 px-6 pb-8 max-w-md mx-auto w-full relative z-10">
          <Card className="glass border-border/50 shadow-xl animate-fade-in-up animate-delay-200">
            <CardHeader className="pb-6">
              <CardTitle className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Sign In
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="font-bold text-foreground text-sm flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-2 text-fac-orange-500" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-fac-orange-500 transition-colors z-10" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-12 py-4 text-foreground font-medium border-border focus:border-fac-orange-500 focus:ring-fac-orange-500 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="password"
                    className="font-bold text-foreground text-sm flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2 text-fac-orange-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-fac-orange-500 transition-colors z-10" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-12 pr-12 py-4 text-foreground font-medium border-border focus:border-fac-orange-500 focus:ring-fac-orange-500 rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-lg"
                      required
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
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-fac-orange-500 hover:text-fac-orange-600 transition-colors hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white border-0 hover-lift group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Sign In
                      <Zap className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign Up Section */}
          <div className="text-center mt-8 animate-fade-in-up animate-delay-400">
            <div className="glass rounded-2xl p-6 border border-border/50">
              <p className="text-muted-foreground font-medium mb-4">
                Don't have an account yet?
              </p>
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="w-full py-3 text-sm font-bold rounded-xl border-2 hover:bg-fac-orange-50 hover:border-fac-orange-200 dark:hover:bg-fac-orange-950 transition-all duration-300"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Guest Booking Option */}
          <Card className="mt-6 glass border-border/50 shadow-md animate-fade-in-up animate-delay-500">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-bold text-foreground text-base mb-2 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 mr-2 text-blue-500" />
                  Quick Booking
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need service right away? Book instantly without an account
                </p>
                <Link to="/guest-booking">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold py-3 rounded-xl transition-all duration-300 group"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book as Guest
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-6 relative z-10">
          <div className="glass rounded-2xl p-4 max-w-sm mx-auto animate-fade-in-up animate-delay-600">
            <p className="text-xs text-muted-foreground font-medium">
              © 2026 Fayeed Auto Care
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by{" "}
              <span className="font-medium text-fac-orange-600">Fdigitals</span>
              <span className="inline-block ml-1 animate-pulse">🧡</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
