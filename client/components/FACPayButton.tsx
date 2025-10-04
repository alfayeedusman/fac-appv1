import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FACPayButtonProps {
  amount: number;
  onPaymentClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  fullWidth?: boolean;
}

export default function FACPayButton({
  amount,
  onPaymentClick,
  isLoading = false,
  disabled = false,
  className,
  size = "default",
  variant = "default",
  fullWidth = false,
}: FACPayButtonProps) {
  return (
    <Button
      onClick={onPaymentClick}
      disabled={disabled || isLoading}
      size={size}
      variant={variant}
      className={cn(
        "bg-gradient-to-r from-fac-orange-500 via-orange-600 to-fac-orange-700",
        "hover:from-fac-orange-600 hover:via-orange-700 hover:to-fac-orange-800",
        "text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300",
        "border-0 relative overflow-hidden group",
        fullWidth && "w-full",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5 mr-2" />
          <span className="relative z-10">
            Pay with FACPay
            {amount > 0 && ` - ₱${amount.toLocaleString()}`}
          </span>
        </>
      )}
    </Button>
  );
}
