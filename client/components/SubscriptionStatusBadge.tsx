import { Badge } from "@/components/ui/badge";
import { Crown, Zap, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface SubscriptionStatusBadgeProps {
  status: string;
  subscriptionType?: "free" | "basic" | "premium" | "vip";
  daysUntilRenewal?: number;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SubscriptionStatusBadge = ({
  status,
  subscriptionType = "free",
  daysUntilRenewal,
  showIcon = true,
  size = "md",
}: SubscriptionStatusBadgeProps) => {
  const getColor = () => {
    if (daysUntilRenewal !== undefined) {
      if (daysUntilRenewal <= 0) return "bg-red-100 text-red-800 border-red-300";
      if (daysUntilRenewal <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-300";
      if (daysUntilRenewal <= 30)
        return "bg-orange-100 text-orange-800 border-orange-300";
    }

    switch (subscriptionType) {
      case "vip":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "free":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getLabel = () => {
    if (daysUntilRenewal !== undefined) {
      if (daysUntilRenewal <= 0) return "Expired";
      if (daysUntilRenewal <= 7) return `Expires in ${daysUntilRenewal}d`;
      if (daysUntilRenewal <= 30)
        return `Renews in ${daysUntilRenewal}d`;
    }

    switch (subscriptionType) {
      case "vip":
        return "VIP Gold";
      case "premium":
        return "VIP Silver";
      case "basic":
        return "Basic Plan";
      case "free":
        return "Free Account";
      default:
        return "Account";
    }
  };

  const getIcon = () => {
    if (daysUntilRenewal !== undefined) {
      if (daysUntilRenewal <= 0)
        return <AlertCircle className={`h-${size === "sm" ? 3 : 4} w-${size === "sm" ? 3 : 4}`} />;
      if (daysUntilRenewal <= 7)
        return <AlertCircle className={`h-${size === "sm" ? 3 : 4} w-${size === "sm" ? 3 : 4}`} />;
      if (daysUntilRenewal <= 30)
        return <Clock className={`h-${size === "sm" ? 3 : 4} w-${size === "sm" ? 3 : 4}`} />;
      return <CheckCircle className={`h-${size === "sm" ? 3 : 4} w-${size === "sm" ? 3 : 4}`} />;
    }

    switch (subscriptionType) {
      case "vip":
        return <Crown className={`h-${size === "sm" ? 3 : 4} w-${size === "sm" ? 3 : 4}`} />;
      case "premium":
        return <Zap className={`h-${size === "sm" ? 3 : 4} w-${size === "sm" ? 3 : 4}`} />;
      default:
        return null;
    }
  };

  const paddingClass = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 border-2 font-semibold ${getColor()} ${paddingClass}`}
    >
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

export default SubscriptionStatusBadge;
