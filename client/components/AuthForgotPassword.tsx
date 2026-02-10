import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";

interface AuthForgotPasswordProps {
  onBackToLogin?: () => void;
  onSuccess?: () => void;
}

export const AuthForgotPassword: React.FC<AuthForgotPasswordProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await supabaseAuthService.requestPasswordReset(email);

      if (result.success) {
        setIsSubmitted(true);
        notificationManager.success(
          "Email Sent",
          "Check your email for password reset instructions"
        );
      } else {
        setError(result.message || "Failed to send reset email");
        notificationManager.error("Error", result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. Please check your email and follow the instructions to reset your password.
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                The reset link expires in 24 hours. If you don't receive an email, check your spam folder.
              </p>
            </div>
            <Button
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Forgot Password?</CardTitle>
            <p className="text-sm text-gray-600">Reset your password easily</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              A password reset link will be sent to your email. Check your inbox and spam folder.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t">
          <button
            onClick={onBackToLogin}
            className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
