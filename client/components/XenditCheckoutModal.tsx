import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface XenditCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceUrl: string;
  invoiceId: string;
  bookingId: string;
  onPaymentSuccess?: (invoiceData: any) => void;
  onPaymentFailed?: () => void;
}

export default function XenditCheckoutModal({
  isOpen,
  onClose,
  invoiceUrl,
  invoiceId,
  bookingId,
  onPaymentSuccess,
  onPaymentFailed,
}: XenditCheckoutModalProps) {
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const maxPolls = 240; // Check for 20 minutes (240 * 5 seconds)

  // Check payment status periodically
  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    let pollInterval: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      if (pollCount >= maxPolls) {
        console.log("⏱️ Poll timeout reached");
        return;
      }

      try {
        const res = await fetch(
          `/api/neon/payment/xendit/invoice-status/${invoiceId}`,
        );
        if (res.ok) {
          const data = await res.json();
          const status = (
            data.status ||
            data.invoice?.status ||
            ""
          ).toUpperCase();

          console.log(`📊 Xendit status check ${pollCount + 1}: ${status}`);

          if (status === "PAID" || status === "SETTLED") {
            console.log("✅ Payment successful!");
            setIsCheckingStatus(false);
            setPaymentStatus("success");
            clearInterval(pollInterval);

            // Show success toast
            toast({
              title: "Payment Successful! ✅",
              description: "Processing your booking confirmation...",
            });

            // Notify parent component
            if (onPaymentSuccess) {
              onPaymentSuccess(data);
            }

            // Close modal after delay to show success message
            setTimeout(() => {
              onClose();
            }, 2000);
            return;
          } else if (status === "EXPIRED" || status === "FAILED") {
            console.log("❌ Payment failed or expired");
            clearInterval(pollInterval);
            setIsCheckingStatus(false);
            setPaymentStatus("failed");

            toast({
              title: "Payment Failed",
              description:
                "Your payment was not processed. Please try again.",
              variant: "destructive",
            });

            if (onPaymentFailed) {
              onPaymentFailed();
            }
            return;
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }

      // Continue polling
      setPollCount((prev) => prev + 1);
    };

    // Start polling immediately and then every 5 seconds
    checkPaymentStatus();
    pollInterval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(pollInterval);
  }, [isOpen, invoiceId, pollCount, maxPolls, onPaymentSuccess, onPaymentFailed, onClose]);

  // Reset polling when modal opens
  useEffect(() => {
    if (isOpen) {
      setPollCount(0);
      setIsCheckingStatus(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between mb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-2">
              💳
            </div>
            Complete Your Payment
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {invoiceUrl ? (
            <div className="flex-1 overflow-auto bg-gray-50 rounded-lg border border-gray-200">
              <iframe
                src={invoiceUrl}
                className="w-full h-full border-0"
                title="Xendit Payment Checkout"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">Invoice URL Not Available</p>
                <p className="text-sm text-gray-600">Please try closing this and creating a new booking.</p>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> The payment page is embedded above. Complete your
              payment to automatically proceed. We'll verify it and show your
              booking receipt.
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => window.open(invoiceUrl, "_blank")}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Payment...
                </>
              ) : (
                "Close"
              )}
            </Button>
          </div>

          {isCheckingStatus && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Verifying payment status... (Check #{pollCount + 1})
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
