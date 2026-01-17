import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { xenditPaymentService } from "@/services/xenditPaymentService";
import { toast } from "@/hooks/use-toast";

interface XenditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  type: "booking" | "subscription";
  id: string; // booking ID or subscription ID
  amount: number;
  customerEmail: string;
  customerName: string;
  description: string;
  paymentMethod?: "card" | "ewallet" | "bank_transfer";
}

export default function XenditPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  type,
  id,
  amount,
  customerEmail,
  customerName,
  description,
}: XenditPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus("processing");
      setErrorMessage("");

      console.log(`💳 Processing ${type} payment for ${id}`);

      // Create invoice based on type
      let invoiceResult;
      if (type === "booking") {
        invoiceResult = await xenditPaymentService.createBookingInvoice({
          bookingId: id,
          amount,
          customerEmail,
          customerName,
          description,
        });
      } else {
        invoiceResult = await xenditPaymentService.createSubscriptionInvoice({
          subscriptionId: id,
          amount,
          customerEmail,
          customerName,
          description,
        });
      }

      if (!invoiceResult.success || !invoiceResult.invoice_url) {
        throw new Error(
          invoiceResult.error || "Failed to create payment invoice",
        );
      }

      console.log("✅ Invoice created:", invoiceResult.invoice_id);

      // Open payment popup
      const popup = xenditPaymentService.openPaymentPopup(
        invoiceResult.invoice_url,
        () => {
          setPaymentStatus("success");
          onPaymentSuccess();
        },
        () => {
          setPaymentStatus("pending");
        },
      );

      if (!popup) {
        throw new Error(
          "Failed to open payment popup. Please check browser settings.",
        );
      }

      // Poll for payment status
      const isPaid = await xenditPaymentService.pollPaymentStatus(type, id);

      if (isPaid) {
        setPaymentStatus("success");
        toast({
          title: "Payment Successful! 🎉",
          description: `Your ${type} payment has been processed successfully.`,
        });

        // Call success callback
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      } else {
        setPaymentStatus("failed");
        setErrorMessage("Payment confirmation timeout. Please check your email.");
      }
    } catch (error: any) {
      console.error(`❌ ${type} payment error:`, error);
      setPaymentStatus("failed");
      setErrorMessage(error.message || "Payment failed. Please try again.");

      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (paymentStatus === "pending" || paymentStatus === "failed") {
      onClose();
      setPaymentStatus("pending");
      setErrorMessage("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Secure Payment</DialogTitle>
          <DialogDescription>
            Complete your payment securely through Xendit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₱{amount.toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground pt-3 border-t space-y-1">
                <p>
                  <strong>Description:</strong> {description}
                </p>
                <p>
                  <strong>Customer:</strong> {customerName}
                </p>
                <p>
                  <strong>Email:</strong> {customerEmail}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Messages */}
          {paymentStatus === "processing" && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                Processing your payment... Please complete payment in the popup
                window.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Your {type} has been confirmed.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "failed" && errorMessage && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Methods Info */}
          {paymentStatus === "pending" && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Credit/Debit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm">E-Wallets (GCash, PayMaya)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Bank Transfer</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading || paymentStatus === "processing"}
              className="flex-1"
            >
              {paymentStatus === "success" ? "Close" : "Cancel"}
            </Button>
            {paymentStatus === "pending" && (
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            )}
            {paymentStatus === "success" && (
              <Button
                onClick={() => {
                  onPaymentSuccess();
                  onClose();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Continue
              </Button>
            )}
            {paymentStatus === "failed" && (
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Retrying..." : "Try Again"}
              </Button>
            )}
          </div>

          {/* Footer Info */}
          <p className="text-xs text-center text-muted-foreground">
            Your payment is secure and encrypted. Powered by Xendit.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
