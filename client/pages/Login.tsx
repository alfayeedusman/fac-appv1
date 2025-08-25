import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  Zap,
  Crown,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for auto-login on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoLogin = urlParams.get("auto");
    const userEmail = urlParams.get("email");

    // Auto-login for superadmin
    if (autoLogin === "true" && userEmail === "fffayeed@gmail.com") {
      setFormData({
        email: "fffayeed@gmail.com",
        password: "Fayeed22beats"
      });

      // Trigger auto-login after a short delay
      setTimeout(() => {
        const event = new Event('submit');
        document.querySelector('form')?.dispatchEvent(event);
      }, 1000);
    }
  }, []);

  // Auto-login function for superadmin
  const triggerAutoLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", "fffayeed@gmail.com");
    localStorage.setItem("userRole", "superadmin");
    localStorage.setItem("justLoggedIn", "true");
    localStorage.setItem("hasSeenWelcome", "true"); // Bypass welcome screen
    localStorage.setItem(`welcomed_fffayeed@gmail.com`, "true"); // Mark user as welcomed

    toast({
      title: "Auto-Login Successful! 🎉",
      description: "Welcome back, Superadmin!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    setTimeout(() => {
      navigate("/admin-dashboard");
    }, 1000);
  };

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

    // Simulate API call with modern loading
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Secure database validation - only allow registered users
    const validUsers = [
      { email: "admin@fac.com", password: "admin123", role: "admin" },
      { email: "superadmin@fac.com", password: "super123", role: "superadmin" },
      { email: "fffayeed@gmail.com", password: "Fayeed22beats", role: "superadmin" },
      { email: "manager@fayeedautocare.com", password: "manager123", role: "manager" },
      { email: "juan.cruz@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "maria.santos@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "carlos.mendoza@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "ana.reyes@fayeedautocare.com", password: "crew123", role: "crew" },
      { email: "user@fac.com", password: "user123", role: "user" },
      { email: "demo@fac.com", password: "demo123", role: "user" },
      { email: "fayeedtest@g.com", password: "test101", role: "user" },
    ];

    // Get saved registration data
    const savedRegistrations = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );
    const allValidUsers = [...validUsers, ...savedRegistrations];

    // Find matching user
    const authenticatedUser = allValidUsers.find(
      (user) =>
        user.email === formData.email && user.password === formData.password,
    );

    if (authenticatedUser) {
      // Clear any cached user-specific data to prevent data leakage
      const keysToCheck = Object.keys(localStorage);
      keysToCheck.forEach((key) => {
        if (key.startsWith("subscription_") || key.startsWith("washLogs_")) {
          // Only keep data for the current user
          if (!key.includes(authenticatedUser.email)) {
            localStorage.removeItem(key);
          }
        }
      });

      // Successful login
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", authenticatedUser.email);
      localStorage.setItem("userRole", authenticatedUser.role);

      // Success notification
      toast({
        title: "Login Successful! 🎉",
        description: `Welcome back, ${authenticatedUser.email}!`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Set splash screen flag and navigate
      localStorage.setItem("justLoggedIn", "true");

      // Check if this is a returning user or first time
      const hasCompletedWelcome = localStorage.getItem(
        `welcomed_${authenticatedUser.email}`,
      );

      setTimeout(() => {
        if (
          authenticatedUser.role === "admin" ||
          authenticatedUser.role === "superadmin"
        ) {
          // Set welcome flags for admin users to bypass welcome screen
          localStorage.setItem("hasSeenWelcome", "true");
          localStorage.setItem(`welcomed_${authenticatedUser.email}`, "true");
          navigate("/admin-dashboard");
        } else if (authenticatedUser.role === "manager") {
          navigate("/manager-dashboard");
        } else if (authenticatedUser.role === "crew") {
          navigate("/crew-dashboard");
        } else if (authenticatedUser.role === "cashier") {
          navigate("/pos");
        } else if (authenticatedUser.role === "inventory_manager") {
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
      // Failed login
      toast({
        title: "Login Failed",
        description:
          "Invalid email or password. Please check your credentials.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };


  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">{/* Removed StickyHeader - using custom navigation */}

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-fac-orange-500/5 to-purple-500/5 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/5 to-fac-orange-500/5 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl animate-float animate-delay-300"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      {/* Header with Logo */}
      <div className="text-center py-12 px-6 relative z-10">
        <div>
          <div className="mb-6">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to your Fayeed Auto Care account
          </p>
        </div>
      </div>

      {/* Futuristic Login Form */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full relative z-10">
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-center">
              <div className="bg-fac-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Sign In</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-8">
              {/* Email Field with Icons */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="font-bold text-foreground text-sm flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2 text-fac-orange-500" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-fac-orange-500 transition-colors z-10" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-12 py-4 text-foreground font-medium border-border focus:border-fac-orange-500 focus:ring-fac-orange-500 bg-white/90 backdrop-blur-sm rounded-xl transition-all duration-300 focus:scale-[1.02]"
                    required
                  />
                </div>
              </div>

              {/* Password Field with Icons */}
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="font-bold text-foreground text-sm flex items-center"
                >
                  <Lock className="h-4 w-4 mr-2 text-fac-orange-500" />
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-fac-orange-500 transition-colors z-10" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-12 pr-12 py-4 text-foreground font-medium border-border focus:border-fac-orange-500 focus:ring-fac-orange-500 bg-white/90 backdrop-blur-sm rounded-xl transition-all duration-300 focus:scale-[1.02]"
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

              {/* Modern Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-futuristic w-full py-4 text-lg rounded-xl font-black relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-3"></div>
                    AUTHENTICATING...
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    SIGN IN
                    <Zap className="h-5 w-5 ml-3 group-hover:scale-125 transition-transform duration-300" />
                  </span>
                )}
              </Button>


              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-fac-orange-500 hover:text-fac-orange-600"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center mt-8 animate-fade-in-up animate-delay-500">
          <div className="glass rounded-2xl p-4">
            <p className="text-muted-foreground font-medium">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-fac-orange-500 font-black hover:text-fac-orange-600 transition-colors hover:underline"
              >
                Join the Future
              </Link>
            </p>
          </div>
        </div>

        {/* Guest Booking Option */}
        <Card className="mt-8 glass border-border animate-fade-in-up animate-delay-600">
          <CardContent className="p-6">
            <h3 className="font-black text-foreground text-base mb-4 flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-fac-orange-500" />
              Quick Access
            </h3>
            <div className="space-y-3">
              <Link to="/guest-booking">
                <Button
                  variant="outline"
                  className="w-full border-fac-orange-200 text-fac-orange-600 hover:bg-fac-orange-50 font-bold py-3 rounded-xl transition-all group"
                >
                  <span className="text-lg mr-2">📅</span>
                  Book as Guest
                  <span className="text-lg ml-2">→</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-6 relative z-10">
        <div className="glass rounded-2xl p-4 max-w-sm mx-auto animate-fade-in-up animate-delay-700">
          <p className="text-xs text-muted-foreground font-medium">
© 2025 Fayeed Auto Care. Made with love by FDigitals
          </p>
        </div>
      </div>
    </div>
  );
}
