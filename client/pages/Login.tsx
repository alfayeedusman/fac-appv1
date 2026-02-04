import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import { authService } from "@/services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.login({ email, password });

      if (result.success && result.user) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("justLoggedIn", "true");

        setTimeout(() => {
          if (
            result.user.role === "admin" ||
            result.user.role === "superadmin"
          ) {
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
          } else {
            navigate("/dashboard");
          }
        }, 500);
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err: any) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=200"
            alt="Fayeed Auto Care"
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <Card className="border border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Lock className="h-5 w-5 mr-2 text-fac-orange-500" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-fac-orange-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-4"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-fac-orange-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-4 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white py-4 font-bold rounded-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            {/* Test Accounts Info */}
            <div className="mt-8 p-4 bg-muted rounded-lg text-sm">
              <p className="font-bold text-foreground mb-3">Test Accounts:</p>
              <div className="space-y-2 text-muted-foreground text-xs">
                <div>
                  <p className="font-semibold text-foreground">Admin:</p>
                  <p>superadmin@fayeedautocare.com</p>
                  <p>SuperAdmin2024!</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">User:</p>
                  <p>premium.customer1@example.com</p>
                  <p>password123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-4">
          <Link to="/">
            <Button variant="ghost" className="w-full flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
