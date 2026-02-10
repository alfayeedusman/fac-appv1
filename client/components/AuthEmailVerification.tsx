import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail, CheckCircle } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";

interface AuthEmailVerificationProps {
  email: string;
  onSuccess?: () => void;
  onBackToRegister?: () => void;
}

export const AuthEmailVerification: React.FC<AuthEmailVerificationProps> = ({
  email,
  onSuccess,
  onBackToRegister,
}) => {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState("");

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpCode || otpCode.length < 6) {
      setError("Please enter a valid OTP code");
      return;
    }

    setIsLoading(true);

    try {
      const result = await supabaseAuthService.verifyEmail(email, otpCode);

      if (result.success) {
        setIsVerified(true);
        notificationManager.success(
          "Email Verified!",
          "Your email has been verified successfully. You can now log in."
        );

        // Redirect after 2 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        setError(result.message || "Verification failed. Please try again.");
        notificationManager.error("Verification Failed", result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      const result = await supabaseAuthService.resendVerificationEmail(email);

      if (result.success) {
        notificationManager.success(
          "Email Sent",
          "A new verification email has been sent to your inbox."
        );
        setResendCountdown(60); // 60 second cooldown
      } else {
        notificationManager.error("Failed to Resend", result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend email";
      notificationManager.error("Error", errorMessage);
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <Button
            onClick={onSuccess}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Verify Your Email</CardTitle>
            <p className="text-sm text-gray-600">Enter the code sent to your email</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Email Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">Verification code sent to:</p>
          <p className="text-lg font-semibold text-gray-900">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {/* OTP Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Check your email (including spam folder) for the verification code.
            </p>
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        {/* Resend Button */}
        <div className="text-center pt-4 border-t space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>
          <Button
            onClick={handleResendEmail}
            disabled={resendCountdown > 0}
            variant="outline"
            className="w-full"
          >
            {resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : "Resend Code"}
          </Button>
        </div>

        {/* Back to Register */}
        <div className="text-center pt-2">
          <button
            onClick={onBackToRegister}
            className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
          >
            Back to Registration
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
