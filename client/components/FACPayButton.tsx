import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    setIsProcessing(true);

    // Show loading popup
    Swal.fire({
      title: "Opening Payment Gateway",
      html: '<div class="flex flex-col items-center"><div class="spinner mb-4"></div><p>Please wait a few seconds...</p></div>',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Close the loading popup
    Swal.close();

    // Call the actual payment handler
    onPaymentClick();

    setIsProcessing(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading || isProcessing}
      size={size}
      variant={variant}
      className={cn(
        "bg-gradient-to-r from-fac-orange-500 via-orange-600 to-fac-orange-700",
        "hover:from-fac-orange-600 hover:via-orange-700 hover:to-fac-orange-800",
        "text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300",
        "border-0 relative overflow-hidden group",
        fullWidth && "w-full",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

      {isLoading || isProcessing ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          {isProcessing ? "Opening Gateway..." : "Processing..."}
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5 mr-2" />
          <span className="relative z-10">
            FACPay
            {amount > 0 && ` - ₱${amount.toLocaleString()}`}
          </span>
        </>
      )}
    </Button>
  );
}
