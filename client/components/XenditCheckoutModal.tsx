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
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-fac-orange-500 to-orange-600 text-white p-6 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="bg-white/20 rounded-full p-3">
                <CreditCard className="h-6 w-6" />
              </div>
              Complete Payment
            </DialogTitle>
            <p className="text-sm text-orange-100 mt-2">
              Booking ID: <span className="font-mono font-bold">{bookingId}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isCheckingStatus}
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Status Indicator */}
          {(isCheckingStatus || paymentStatus) && (
            <div className="px-6 pt-4">
              {paymentStatus === "success" ? (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">
                      Payment Successful! ✅
                    </p>
                    <p className="text-sm text-green-700">
                      Generating your booking receipt...
                    </p>
                  </div>
                </div>
              ) : paymentStatus === "failed" ? (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">
                      Payment Failed ❌
                    </p>
                    <p className="text-sm text-red-700">
                      Please try again or contact support
                    </p>
                  </div>
                </div>
              ) : isCheckingStatus ? (
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2 animate-spin">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">
                      Verifying Payment...
                    </p>
                    <p className="text-sm text-blue-700">
                      Please wait while we process your payment
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Payment Iframe or Error State */}
          {paymentStatus === null && (
            <>
              {invoiceUrl ? (
                <div className="flex-1 overflow-auto bg-gray-50 border-t border-gray-200 m-6 rounded-lg shadow-sm">
                  <iframe
                    src={invoiceUrl}
                    className="w-full h-full border-0"
                    title="Xendit Payment Checkout"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center m-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center px-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 font-semibold mb-1">
                      Payment Page Unavailable
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      We couldn't load the payment page. Please try opening it in a
                      new tab or contact support.
                    </p>
                    {invoiceUrl && (
                      <Button
                        onClick={() => window.open(invoiceUrl, "_blank")}
                        className="bg-fac-orange-500 hover:bg-fac-orange-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Payment in New Tab
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions Card */}
              <div className="px-6 pb-6">
                <Card className="border-l-4 border-l-fac-orange-500 bg-gradient-to-r from-orange-50 to-amber-50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="bg-fac-orange-100 rounded-full p-2 flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-fac-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">
                          How to Pay
                        </h4>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                          <li>Choose your preferred payment method below</li>
                          <li>Fill in your payment details securely</li>
                          <li>Complete the transaction</li>
                          <li>We'll verify and show your booking receipt</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Footer Actions */}
          {paymentStatus === null && (
            <div className="px-6 pb-6 border-t bg-gray-50 flex gap-3">
              {invoiceUrl && (
                <Button
                  onClick={() => window.open(invoiceUrl, "_blank")}
                  variant="outline"
                  className="flex-1 border-fac-orange-300 hover:bg-fac-orange-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isCheckingStatus}
              >
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Close"
                )}
              </Button>
            </div>
          )}

          {/* Success/Failure Actions */}
          {paymentStatus === "success" && (
            <div className="px-6 pb-6 border-t bg-green-50">
              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                View Receipt & Booking Details
              </Button>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="px-6 pb-6 border-t bg-red-50 space-y-2">
              <Button
                onClick={() => {
                  setPaymentStatus(null);
                  setPollCount(0);
                  onPaymentFailed?.();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Try Another Payment Method
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
