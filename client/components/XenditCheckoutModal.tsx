import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
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
  const [networkErrors, setNetworkErrors] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const maxPolls = 240;
  const maxNetworkErrors = 5; // Stop polling after 5 consecutive network errors

  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    let pollInterval: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      if (pollCount >= maxPolls) {
        console.log("⏱️ Poll timeout reached");
        return;
      }

      try {
        // Try with relative URL first (simpler, usually works)
        let apiUrl = `/api/neon/payment/xendit/invoice-status/${encodeURIComponent(invoiceId)}`;
        console.log(`📍 Attempting to check payment status...`);
        console.log(`🆔 Invoice ID: ${invoiceId}`);
        console.log(`🔗 API URL: ${apiUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        let res;
        try {
          res = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "same-origin",
            signal: controller.signal,
          });
        } catch (fetchError) {
          // If relative URL fails, try with full URL as fallback
          console.warn("Relative URL failed, trying full URL...", fetchError);
          const baseUrl = window.location.origin;
          apiUrl = `${baseUrl}/api/neon/payment/xendit/invoice-status/${encodeURIComponent(invoiceId)}`;
          console.log(`🔗 Fallback API URL: ${apiUrl}`);

          res = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            signal: controller.signal,
          });
        }

        clearTimeout(timeoutId);
        console.log(`📡 Response status: ${res.status} ${res.statusText}`);

        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Payment status response:`, data);
          setNetworkErrors(0); // Reset error counter on success

          const status = (
            data.status ||
            data.invoice?.status ||
            ""
          ).toUpperCase();

          console.log(`📊 Invoice status: ${status}`);

          if (status === "PAID" || status === "SETTLED") {
            console.log("✅ Payment successful!");
            setIsCheckingStatus(false);
            setPaymentStatus("success");
            clearInterval(pollInterval);
            toast({
              title: "Payment Successful! ✅",
              description: "Processing your booking confirmation...",
            });
            if (onPaymentSuccess) {
              onPaymentSuccess(data);
            }
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
              description: "Your payment was not processed. Please try again.",
              variant: "destructive",
            });
            if (onPaymentFailed) {
              onPaymentFailed();
            }
            return;
          }
        } else {
          // Handle non-ok responses
          console.warn(`⚠️ API returned status ${res.status}`);
          if (res.status === 404) {
            console.error("Invoice not found - may not be created yet");
          } else if (res.status === 500) {
            console.error("Server error - API may be down");
          } else {
            const errorText = await res.text().catch(() => "No error details");
            console.error(`API Error: ${res.status} - ${errorText}`);
          }
        }
      } catch (error: any) {
        // Track network errors
        const newErrorCount = networkErrors + 1;
        setNetworkErrors(newErrorCount);

        if (error?.name === "AbortError") {
          console.warn(
            `⏱️ Request timeout after 15s - continuing to retry (${newErrorCount}/${maxNetworkErrors})`,
          );
        } else {
          const errorMsg = error?.message || String(error);
          console.error(
            `❌ Error checking payment status (${newErrorCount}/${maxNetworkErrors}): ${errorMsg}`,
          );
          console.error("Error details:", {
            name: error?.name,
            message: error?.message,
            status: error?.status,
            type: typeof error,
          });
        }

        // Stop polling after too many network errors
        if (newErrorCount >= maxNetworkErrors) {
          console.error(
            `⛔ Stopped polling after ${newErrorCount} consecutive network errors. Giving up.`,
          );
          clearInterval(pollInterval);
          setIsCheckingStatus(false);

          // Show helpful error message
          toast({
            title: "Connection Issue",
            description:
              "Unable to verify payment status. Please try opening payment in a new tab to check manually.",
            variant: "destructive",
          });

          return;
        }
      }

      setPollCount((prev) => prev + 1);
    };

    checkPaymentStatus();
    pollInterval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(pollInterval);
  }, [
    isOpen,
    invoiceId,
    pollCount,
    maxPolls,
    networkErrors,
    maxNetworkErrors,
    onPaymentSuccess,
    onPaymentFailed,
    onClose,
  ]);

  useEffect(() => {
    if (isOpen) {
      setPollCount(0);
      setIsCheckingStatus(true);
    }
  }, [isOpen]);

  // Success state - full screen confirmation
  if (paymentStatus === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">Payment Successful</DialogTitle>
          <div className="text-center space-y-4 py-12">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4 animate-bounce">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-green-600">
              Payment Successful!
            </h2>
            <p className="text-gray-600 text-lg">
              Your booking has been confirmed
            </p>
            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="text-xl font-bold text-gray-900 font-mono">
                {bookingId}
              </p>
            </div>
            <p className="text-sm text-gray-500 pt-4">
              Preparing your receipt...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (paymentStatus === "failed") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Payment Failed</DialogTitle>
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
            <p className="text-gray-600">
              We couldn't process your payment. Please try again with a
              different payment method.
            </p>
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => {
                  setPaymentStatus(null);
                  setPollCount(0);
                  onPaymentFailed?.();
                }}
                className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white h-12 text-base"
              >
                Try Again
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-12 text-base"
              >
                Go Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main payment modal - professional spacious layout
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 border-0 shadow-2xl">
        <DialogTitle className="sr-only">
          Secure Payment - Xendit Checkout
        </DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header - Minimal and clean */}
          <div className="px-8 py-6 border-b bg-gradient-to-r from-fac-orange-50 to-orange-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Secure Payment
                </h2>
                <p className="text-gray-500 mt-1">
                  Complete your booking payment
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isCheckingStatus}
                className="h-10 w-10 rounded-full text-gray-600 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Booking info bar */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Booking ID
                </p>
                <p className="text-lg font-bold font-mono text-gray-900">
                  {bookingId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </p>
                <p className="text-lg font-bold text-blue-600 flex items-center justify-end gap-1">
                  <span className="inline-block h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Processing
                </p>
              </div>
            </div>
          </div>

          {/* Main content - Payment form gets all the space */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {invoiceUrl ? (
              <>
                {/* Payment iframe - prominent and spacious */}
                <div className="flex-1 relative bg-white">
                  <iframe
                    src={invoiceUrl}
                    className="w-full h-full border-0"
                    title="Secure Payment Checkout"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                  />

                  {/* Verifying overlay - subtle */}
                  {isCheckingStatus && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
                        <div className="flex justify-center mb-4">
                          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          Verifying Payment
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Please wait while we process your payment...
                        </p>
                        {networkErrors > 0 && (
                          <p className="text-xs text-orange-600 mt-4">
                            Network attempt {networkErrors}/{maxNetworkErrors}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
                <div className="text-center max-w-md">
                  <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Unable to Load Payment Page
                  </h3>
                  <p className="text-gray-600 mb-6">
                    There was an issue loading the payment gateway. Please try
                    opening it in a new tab.
                  </p>
                  {invoiceUrl && (
                    <Button
                      onClick={() => window.open(invoiceUrl, "_blank")}
                      className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white h-12"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Payment Page
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Clean action bar - always accessible */}
          {paymentStatus === null && (
            <div className="px-8 py-4 border-t bg-gray-50 flex gap-3 justify-end">
              {invoiceUrl && (
                <Button
                  onClick={() => window.open(invoiceUrl, "_blank")}
                  variant="outline"
                  className="h-11"
                  title="Open payment in a new tab"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="h-11"
                title="Close this modal"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
