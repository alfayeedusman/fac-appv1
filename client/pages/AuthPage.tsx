import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, LogIn, ArrowLeft } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";
import { AuthRegister } from "@/components/AuthRegister";
import { AuthEmailVerification } from "@/components/AuthEmailVerification";
import { AuthForgotPassword } from "@/components/AuthForgotPassword";
import { AuthResetPassword } from "@/components/AuthResetPassword";
import { AuthSocialLogin } from "@/components/AuthSocialLogin";
import { AuthMFASetup } from "@/components/AuthMFASetup";

type AuthMode = "login" | "register" | "verify-email" | "forgot-password" | "reset-password";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Check for auth callback parameters
  useEffect(() => {
    const type = searchParams.get("type");
    const token = searchParams.get("token");

    if (type === "email") {
      setMode("verify-email");
    } else if (type === "recovery" && token) {
      setMode("reset-password");
      setResetToken(token);
    }

    // Check if user is already logged in
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      navigate("/");
    }
  }, [searchParams, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await supabaseAuthService.signIn({
        email,
        password,
      });

      if (result.success) {
        notificationManager.success(
          "Welcome Back!",
          `Logged in as ${email}`
        );
        navigate("/");
      } else {
        const errorMessage = result.message || "Login failed";
        setError(errorMessage);
        notificationManager.error("Login Failed", errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <AuthRegister
          onSuccess={(registeredEmail) => {
            setEmail(registeredEmail);
            setMode("verify-email");
          }}
          onSwitchToLogin={() => {
            setEmail("");
            setPassword("");
            setMode("login");
          }}
        />
      </div>
    );
  }

  if (mode === "verify-email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <AuthEmailVerification
          email={email}
          onSuccess={() => {
            setMode("login");
            setEmail("");
            setPassword("");
          }}
          onBackToRegister={() => {
            setEmail("");
            setPassword("");
            setMode("register");
          }}
        />
      </div>
    );
  }

  if (mode === "forgot-password") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <AuthForgotPassword
          onBackToLogin={() => {
            setEmail("");
            setPassword("");
            setMode("login");
          }}
        />
      </div>
    );
  }

  if (mode === "reset-password" && resetToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <AuthResetPassword
          token={resetToken}
          onSuccess={() => {
            setMode("login");
            setEmail("");
            setPassword("");
          }}
          onBackToLogin={() => {
            setMode("login");
            setEmail("");
            setPassword("");
          }}
        />
      </div>
    );
  }

  // Login Mode (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
              <LogIn className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-sm text-gray-600">Sign in to your account</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={error ? "border-red-500" : ""}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={error ? "border-red-500" : ""}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setEmail("");
                  setPassword("");
                  setError("");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              New users: Create an account above. You'll receive an email to verify your address.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
