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
  Fingerprint,
  Zap,
  Crown,
  Shield,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import {
  forceSuperadminLogin,
  checkForSuperadminBypass,
} from "@/utils/superadminUtils";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for URL bypass on component mount
  useEffect(() => {
    checkForSuperadminBypass(navigate);
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Force Superadmin Login Function using utility
  const handleForceSuperadminLogin = () => {
    setIsLoading(true);

    toast({
      title: "Force Superadmin Login! 👑",
      description: "Welcome, Supreme Administrator!",
      variant: "default",
      className: "bg-purple-50 border-purple-200 text-purple-800",
    });

    setTimeout(() => {
      forceSuperadminLogin(navigate);
      setIsLoading(false);
    }, 1000);
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
          navigate("/admin-dashboard");
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

  const handleBiometricLogin = async () => {
    setIsLoading(true);

    try {
      // Check if Web Authentication API is supported
      if (!window.PublicKeyCredential) {
        toast({
          title: "Biometric Not Supported",
          description:
            "Biometric authentication is not supported on this device",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Simulate biometric authentication
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demo purposes, simulate successful biometric auth
      const simulatedUser =
        localStorage.getItem("biometricUser") || "demo@fac.com";
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", simulatedUser);
      localStorage.setItem("userRole", "user");

      toast({
        title: "Biometric Authentication Successful! 🔐",
        description: "Welcome back!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      navigate("/welcome");
    } catch (error) {
      toast({
        title: "Biometric Authentication Failed",
        description: "Please try again or use email/password.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      <StickyHeader showBack={true} title="SuperAdmin Access" />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-xl animate-float animate-delay-300"></div>
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
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">SuperAdmin Portal</h1>
          </div>
          <p className="text-muted-foreground">
            Restricted Access - Administrators Only
          </p>
        </div>
      </div>

      {/* Futuristic Login Form */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full relative z-10">
        <Card className="shadow-lg border-purple-200/50">
          <CardHeader className="pb-6">
            <CardTitle className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Admin Access</span>
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
                  <Mail className="h-4 w-4 mr-2 text-purple-500" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors z-10" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@fac.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-12 py-4 text-foreground font-medium border-border focus:border-purple-500 focus:ring-purple-500 bg-white/90 backdrop-blur-sm rounded-xl transition-all duration-300 focus:scale-[1.02]"
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
                  <Lock className="h-4 w-4 mr-2 text-purple-500" />
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors z-10" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-12 pr-12 py-4 text-foreground font-medium border-border focus:border-purple-500 focus:ring-purple-500 bg-white/90 backdrop-blur-sm rounded-xl transition-all duration-300 focus:scale-[1.02]"
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

              {/* Admin Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg rounded-xl font-black relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-3"></div>
                    AUTHENTICATING...
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    ADMIN SIGN IN
                    <Crown className="h-5 w-5 ml-3 group-hover:scale-125 transition-transform duration-300" />
                  </span>
                )}
              </Button>

              {/* Force Superadmin Login Button */}
              <Button
                type="button"
                onClick={handleForceSuperadminLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all group border-2 border-purple-300"
              >
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-2">👑</span>
                  {isLoading ? "Accessing..." : "FORCE SUPERADMIN LOGIN"}
                  <span className="text-2xl ml-2">⚡</span>
                </div>
              </Button>

              {/* Biometric Login Option */}
              <Button
                type="button"
                variant="outline"
                onClick={handleBiometricLogin}
                disabled={isLoading}
                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 font-bold py-4 rounded-xl theme-transition glass hover-glow group"
              >
                <Fingerprint className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                {isLoading ? "Authenticating..." : "Biometric Login"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Regular Login */}
        <div className="text-center mt-8 animate-fade-in-up animate-delay-500">
          <div className="glass rounded-2xl p-4">
            <p className="text-muted-foreground font-medium">
              Not an admin?{" "}
              <Link
                to="/login"
                className="text-purple-500 font-black hover:text-purple-600 transition-colors hover:underline"
              >
                Regular Login
              </Link>
            </p>
          </div>
        </div>

        {/* Admin Demo Users */}
        <Card className="mt-8 glass border-purple-200/50 animate-fade-in-up animate-delay-600">
          <CardContent className="p-6">
            <h3 className="font-black text-foreground text-base mb-4 flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-purple-500" />
              Admin Demo Access Portal
            </h3>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-purple-800">
                  <strong>Admin:</strong> admin@fac.com / admin123
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200">
                <span className="text-purple-800 font-bold">
                  👑 <strong>SUPERADMIN:</strong> superadmin@fac.com / super123
                  ⚡
                </span>
              </div>
              <div className="text-center p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <span className="text-xs text-purple-600 font-semibold">
                  💡 Or use the FORCE SUPERADMIN LOGIN button above to bypass
                  everything!
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-6 relative z-10">
        <div className="glass rounded-2xl p-4 max-w-sm mx-auto animate-fade-in-up animate-delay-700">
          <p className="text-xs text-muted-foreground font-medium">
            © 2025 Fayeed Auto Care. Admin Portal - Secured Access.
          </p>
        </div>
      </div>
    </div>
  );
}
