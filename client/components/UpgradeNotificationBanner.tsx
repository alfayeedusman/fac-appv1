import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Crown, X, AlertCircle, Sparkles } from "lucide-react";

interface UpgradeNotificationBannerProps {
  className?: string;
}

export default function UpgradeNotificationBanner({
  className = "",
}: UpgradeNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Get user subscription status
  const userEmail = localStorage.getItem("userEmail") || "";
  const userSubscription = JSON.parse(
    localStorage.getItem(`subscription_${userEmail}`) || "null",
  );
  const isRegularMember =
    userSubscription?.package === "Regular Member" || !userSubscription;
  const isSubscribed = userSubscription?.daysLeft > 0;

  // Only show for regular members or inactive subscriptions
  if (!isRegularMember && isSubscribed) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <Card
      className={`bg-gradient-to-r from-red-50 to-orange-50 border-red-200 animate-fade-in-up ${className}`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="bg-red-500 p-2 rounded-lg animate-pulse">
            {isRegularMember ? (
              <AlertCircle className="h-5 w-5 text-white" />
            ) : (
              <Crown className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-800">
              {isRegularMember ? "Upgrade Your Account!" : "Reactivate Account"}
            </h4>
            <p className="text-sm text-red-600">
              {isRegularMember
                ? "Unlock premium services with our subscription plans"
                : "Your subscription has expired. Reactivate to continue"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/manage-subscription">
            <Button
              size="sm"
              className="bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-bold"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isRegularMember ? "Upgrade" : "Activate"}
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="text-red-500 hover:text-red-600 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
