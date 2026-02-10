import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chrome, Github, Facebook, Loader } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { notificationManager } from "@/components/NotificationModal";

interface AuthSocialLoginProps {
  onLoading?: (isLoading: boolean) => void;
}

export const AuthSocialLogin: React.FC<AuthSocialLoginProps> = ({ onLoading }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"google" | "github" | "facebook" | null>(null);

  const handleSocialLogin = async (provider: "google" | "github" | "facebook") => {
    setIsLoading(true);
    setActiveProvider(provider);

    if (onLoading) {
      onLoading(true);
    }

    try {
      let result;

      switch (provider) {
        case "google":
          result = await supabaseAuthService.signInWithGoogle();
          break;
        case "github":
          result = await supabaseAuthService.signInWithGitHub();
          break;
        case "facebook":
          result = await supabaseAuthService.signInWithFacebook();
          break;
      }

      if (!result.success) {
        notificationManager.error("Login Failed", result.message);
      }
      // Success case: Supabase will handle redirect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Social login failed";
      notificationManager.error("Error", errorMessage);
    } finally {
      setIsLoading(false);
      setActiveProvider(null);
      if (onLoading) {
        onLoading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 text-center font-medium">Continue with</p>

      <div className="grid grid-cols-3 gap-3">
        {/* Google Login */}
        <Button
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          variant="outline"
          className="flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          {activeProvider === "google" && isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="h-5 w-5 text-blue-600" />
          )}
          <span className="text-xs font-medium">Google</span>
        </Button>

        {/* GitHub Login */}
        <Button
          onClick={() => handleSocialLogin("github")}
          disabled={isLoading}
          variant="outline"
          className="flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          {activeProvider === "github" && isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-5 w-5 text-gray-800" />
          )}
          <span className="text-xs font-medium">GitHub</span>
        </Button>

        {/* Facebook Login */}
        <Button
          onClick={() => handleSocialLogin("facebook")}
          disabled={isLoading}
          variant="outline"
          className="flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          {activeProvider === "facebook" && isLoading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Facebook className="h-5 w-5 text-blue-700" />
          )}
          <span className="text-xs font-medium">Facebook</span>
        </Button>
      </div>
    </div>
  );
};
