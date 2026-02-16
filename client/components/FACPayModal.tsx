import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle, Loader2, Shield, Upload, AlertTriangle } from "lucide-react";
import { xenditService } from "@/services/xenditService";
import { notificationManager } from "./NotificationModal";
import FACPayButton from "./FACPayButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PaymentMethod {
  id: string;
  label: string;
}

interface FACPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  selectedPlan: string;
  planPrice: number;
  onPaymentSuccess?: () => void;
  paymentType: "subscription" | "upgrade" | "renewal";
  paymentMethods?: PaymentMethod[];
  selectedPaymentMethod?: string;
  onPaymentMethodChange?: (method: string) => void;
}

export default function FACPayModal({
  isOpen,
  onClose,
  currentPlan,
  selectedPlan,
  planPrice,
  onPaymentSuccess,
  paymentType = "upgrade",
  paymentMethods = [],
  selectedPaymentMethod = "card",
  onPaymentMethodChange,
}: FACPayModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(selectedPaymentMethod);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Update selected method when prop changes
  useEffect(() => {
    if (selectedPaymentMethod) {
      setSelectedMethod(selectedPaymentMethod);
    }
  }, [selectedPaymentMethod]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const isOfflinePayment = selectedMethod === "pay_at_counter" || selectedMethod === "offline";

  const handleFACPayment = async () => {
    if (isOfflinePayment) {
      if (!receiptFile) {
        notificationManager.warning(
          "Missing Receipt",
          "Please upload a payment receipt for offline payment methods.",
        );
        return;
      }
    }

    setIsProcessing(true);

    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const userName =
        localStorage.getItem("userFullName") || userEmail.split("@")[0];

      if (isOfflinePayment) {
        // For offline payments, store the receipt and payment details
        const formData = new FormData();
        formData.append("file", receiptFile);
        formData.append("planType", selectedPlan);
        formData.append("amount", planPrice.toString());
        formData.append("paymentMethod", selectedMethod);
        formData.append("email", userEmail);

        const response = await fetch("/api/upload-payment-receipt", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          notificationManager.success(
            "Receipt Submitted! 📸",
            `Your payment receipt has been submitted. We'll verify and process your ${paymentType} shortly.`,
            { autoClose: 3000 },
          );
          onClose();
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        } else {
          throw new Error("Failed to upload receipt");
        }
      } else {
        // For online payments, use FACPay/Xendit
        const externalId = `${paymentType.toUpperCase()}_${selectedPlan.replace(/\s+/g, "_").toUpperCase()}_${Date.now()}`;

        const invoiceData = await xenditService.createInvoice({
          amount: planPrice,
          externalId,
          customerName: userName,
          customerEmail: userEmail,
          description: `${paymentType === "renewal" ? "Renewal" : "Upgrade"} to ${selectedPlan} plan`,
          successRedirectUrl: `${window.location.origin}/manage-subscription?payment=success&plan=${encodeURIComponent(selectedPlan)}`,
          failureRedirectUrl: `${window.location.origin}/manage-subscription?payment=failed`,
        });

        if (invoiceData && invoiceData.invoice_url) {
          notificationManager.success(
            "Redirecting to FACPay! 💳",
            `You will be redirected to complete your ${paymentType === "renewal" ? "renewal" : "upgrade"} to ${selectedPlan}.`,
            { autoClose: 2000 },
          );

          // Small delay to show the notification before redirect
          setTimeout(() => {
            xenditService.openInvoice(invoiceData.invoice_url);
          }, 1500);

          // Store pending payment info
          localStorage.setItem(
            "pending_payment",
            JSON.stringify({
              type: paymentType,
              plan: selectedPlan,
              amount: planPrice,
              externalId,
              timestamp: new Date().toISOString(),
            }),
          );

          onClose();

          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        } else {
          throw new Error("Failed to create payment invoice");
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      notificationManager.error(
        "Payment Error",
        error.message || "Failed to process payment. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <CreditCard className="h-6 w-6 mr-3 text-fac-orange-500" />
            {paymentType === "renewal" ? "Renew Plan" : "Upgrade Plan"}
          </DialogTitle>
          <DialogDescription>
            {isOfflinePayment ? "Upload payment receipt" : "Secure payment powered by Xendit"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Details */}
          <div className="bg-gradient-to-r from-fac-orange-50 to-purple-50 dark:from-fac-orange-950 dark:to-purple-950 rounded-xl p-6 border border-fac-orange-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Plan:
                </p>
                <p className="font-bold text-foreground capitalize text-lg">
                  {currentPlan}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  {paymentType === "renewal" ? "Renewing:" : "Upgrading To:"}
                </p>
                <p className="font-bold text-fac-orange-600 capitalize text-lg">
                  {selectedPlan}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-fac-orange-200">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Total Amount:</p>
                <p className="text-2xl font-bold text-foreground">
                  ₱{planPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="font-semibold">
              Select Payment Method
            </Label>
            <Select value={selectedMethod} onValueChange={(value) => {
              setSelectedMethod(value);
              if (onPaymentMethodChange) {
                onPaymentMethodChange(value);
              }
              setReceiptFile(null); // Reset receipt when changing payment method
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Offline Payment - Receipt Upload */}
          {isOfflinePayment && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Upload Payment Receipt
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a clear photo or screenshot of your payment receipt
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Button variant="outline" type="button" asChild>
                    <Label htmlFor="receipt-upload" className="cursor-pointer">
                      Choose File
                    </Label>
                  </Button>
                </div>
              </div>

              {receiptFile && (
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        {receiptFile.name}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Important Notice
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      Please ensure your receipt clearly shows the payment amount, reference number, and date for faster processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Online Payment - Security Info */}
          {!isOfflinePayment && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your payment is processed securely through Xendit. We never
                      store your card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Available Payment Methods:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Credit/Debit Card
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    GCash
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    PayMaya
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Bank Transfer
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl"
          >
            Cancel
          </Button>
          {isOfflinePayment ? (
            <Button
              onClick={handleFACPayment}
              disabled={!receiptFile || isProcessing}
              className="rounded-xl bg-fac-orange-500 hover:bg-fac-orange-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Receipt
                </>
              )}
            </Button>
          ) : (
            <FACPayButton
              amount={planPrice}
              onPaymentClick={handleFACPayment}
              isLoading={isProcessing}
              disabled={isProcessing}
              className="rounded-xl"
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
