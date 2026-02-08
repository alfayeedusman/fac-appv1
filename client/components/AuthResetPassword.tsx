import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, CheckCircle } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";

interface AuthResetPasswordProps {
  token: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const AuthResetPassword: React.FC<AuthResetPasswordProps> = ({
  token,
  onSuccess,
  onBackToLogin,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      notificationManager.error("Validation Error", "Please check your password fields");
      return;
    }

    setIsLoading(true);

    try {
      const result = await supabaseAuthService.resetPassword(token, password);

      if (result.success) {
        setIsReset(true);
        notificationManager.success(
          "Password Reset Successful",
          "Your password has been reset. You can now log in with your new password."
        );
      } else {
        notificationManager.error("Reset Failed", result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Password reset failed";
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button
            onClick={onBackToLogin}
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
            <Lock className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Reset Password</CardTitle>
            <p className="text-sm text-gray-600">Enter your new password</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>At least 6 characters</li>
                <li>Mix of uppercase and lowercase letters</li>
                <li>Include numbers or special characters</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t">
          <button
            onClick={onBackToLogin}
            className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
