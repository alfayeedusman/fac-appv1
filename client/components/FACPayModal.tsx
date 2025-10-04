import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle, Loader2, Shield } from "lucide-react";
import { xenditService } from "@/services/xenditService";
import { notificationManager } from "./NotificationModal";
import FACPayButton from "./FACPayButton";

interface FACPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  selectedPlan: string;
  planPrice: number;
  onPaymentSuccess?: () => void;
  paymentType: "subscription" | "upgrade" | "renewal";
}

export default function FACPayModal({
  isOpen,
  onClose,
  currentPlan,
  selectedPlan,
  planPrice,
  onPaymentSuccess,
  paymentType = "upgrade",
}: FACPayModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFACPayment = async () => {
    setIsProcessing(true);

    try {
      const userEmail = localStorage.getItem("userEmail") || "";
      const userName = localStorage.getItem("userFullName") || userEmail.split("@")[0];
      
      const externalId = `${paymentType.toUpperCase()}_${selectedPlan.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`;
      
      const invoiceData = await xenditService.createInvoice({
        amount: planPrice,
        externalId,
        customerName: userName,
        customerEmail: userEmail,
        description: `${paymentType === 'renewal' ? 'Renewal' : 'Upgrade'} to ${selectedPlan} plan`,
        successRedirectUrl: `${window.location.origin}/manage-subscription?payment=success&plan=${encodeURIComponent(selectedPlan)}`,
        failureRedirectUrl: `${window.location.origin}/manage-subscription?payment=failed`,
      });

      if (invoiceData && invoiceData.invoice_url) {
        notificationManager.success(
          "Redirecting to FACPay! 💳",
          `You will be redirected to FACPay to complete your ${paymentType === 'renewal' ? 'renewal' : 'upgrade'} to ${selectedPlan}.`,
          { autoClose: 2000 }
        );

        // Small delay to show the notification before redirect
        setTimeout(() => {
          xenditService.openInvoice(invoiceData.invoice_url);
        }, 1500);

        // Store pending payment info
        localStorage.setItem('pending_payment', JSON.stringify({
          type: paymentType,
          plan: selectedPlan,
          amount: planPrice,
          externalId,
          timestamp: new Date().toISOString(),
        }));

        onClose();

        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error("Failed to create payment invoice");
      }
    } catch (error: any) {
      console.error("FACPay error:", error);
      notificationManager.error(
        "Payment Error",
        error.message || "Failed to initialize payment. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <CreditCard className="h-6 w-6 mr-3 text-fac-orange-500" />
            {paymentType === 'renewal' ? 'Renew Plan' : 'Upgrade Plan'} with FACPay
          </DialogTitle>
          <DialogDescription>
            Secure payment powered by Xendit
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
                  {paymentType === 'renewal' ? 'Renewing:' : 'Upgrading To:'}
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

          {/* Security Info */}
          <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Secure Payment
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your payment is processed securely through Xendit. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Accepted Payment Methods:</p>
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
          <FACPayButton
            amount={planPrice}
            onPaymentClick={handleFACPayment}
            isLoading={isProcessing}
            disabled={isProcessing}
            className="rounded-xl"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
