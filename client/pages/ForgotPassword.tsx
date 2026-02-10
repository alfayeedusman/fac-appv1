import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Zap,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { supabaseAuthService } from "@/services/supabaseAuthService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });

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

    try {
      // Use Supabase Auth to request password reset
      const result = await supabaseAuthService.requestPasswordReset(formData.email);

      if (result.success) {
        toast({
          title: "Password Reset Email Sent! 📧",
          description: "Check your email for a link to reset your password",
          variant: "default",
        });
        // Show success message
        setStep("sent");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send password reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStepInfo = () => {
    switch (step) {
      case "email":
        return {
          title: "Forgot Password",
          subtitle: "Enter your email to receive a password reset link",
          badge: "Password Recovery",
        };
      case "sent":
        return {
          title: "Email Sent",
          subtitle: "Check your email for a password reset link",
          badge: "Check Email",
        };
    }
  };

  const stepInfo = getStepInfo();

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
        <Link to="/login">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-xl p-3 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 transition-all animate-fade-in-up"
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
                {stepInfo.badge}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              {stepInfo.title.split(" ")[0]}{" "}
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                {stepInfo.title.split(" ")[1]}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {stepInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 px-6 pb-8 max-w-md mx-auto w-full relative z-10">
          <Card className="glass border-border/50 shadow-xl animate-fade-in-up animate-delay-200">
            <CardHeader className="pb-6">
              <CardTitle className="text-center">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r flex items-center justify-center mx-auto mb-4 ${step === "sent" ? "from-green-500 to-green-600" : "from-fac-orange-500 to-fac-orange-600"}`}>
                  {step === "email" && <Mail className="h-7 w-7 text-white" />}
                  {step === "sent" && <CheckCircle className="h-7 w-7 text-white" />}
                </div>
                <span className="text-xl font-bold text-foreground">
                  {step === "email" && "Enter Email"}
                  {step === "sent" && "Check Email"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Step */}
              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white border-0 hover-lift group transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner mr-3"></div>
                        Sending Email...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Send Reset Link
                        <Zap className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                      </span>
                    )}
                  </Button>
                </form>
              )}

              {/* Success Step */}
              {step === "sent" && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">Email Sent!</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to:
                    </p>
                    <p className="text-base font-medium text-fac-orange-600">
                      {formData.email}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <span className="font-bold">📧 Next Step:</span> Click the link in the email to reset your password. The link will expire in 24 hours.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full py-4 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white border-0 hover-lift group transition-all duration-300"
                  >
                    <span className="flex items-center justify-center">
                      <ArrowLeft className="h-5 w-5 mr-2 rotate-180" />
                      Back to Login
                      <Zap className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform duration-300" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back to Login */}
          <div className="text-center mt-8 animate-fade-in-up animate-delay-400">
            <div className="glass rounded-2xl p-4 border border-border/50">
              <p className="text-muted-foreground font-medium mb-3">
                Remember your password?
              </p>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full py-3 text-sm font-bold rounded-xl border-2 hover:bg-fac-orange-50 hover:border-fac-orange-200 dark:hover:bg-fac-orange-950 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-6 relative z-10">
          <div className="glass rounded-2xl p-4 max-w-sm mx-auto animate-fade-in-up animate-delay-500">
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
