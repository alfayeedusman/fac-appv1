import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Upload, CreditCard, CheckCircle, Loader } from "lucide-react";
import { addSubscriptionRequest } from "@/utils/subscriptionApprovalData";
import { notificationManager } from "./NotificationModal";

interface PaymentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  selectedPlan: string;
  planPrice: number;
}

export default function PaymentUploadModal({
  isOpen,
  onClose,
  currentPlan,
  selectedPlan,
  planPrice,
}: PaymentUploadModalProps) {
  const [formData, setFormData] = useState({
    planType: selectedPlan,
    paymentMethod: "",
    amount: planPrice.toString(),
    referenceNumber: "",
    notes: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: "gcash", label: "GCash" },
    { value: "paymaya", label: "PayMaya" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "over_counter", label: "Over the Counter" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentMethod || !receiptFile || !formData.referenceNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and upload receipt",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create payment request
    const paymentRequest = {
      id: Date.now().toString(),
      userId: localStorage.getItem("userEmail"),
      currentPlan,
      upgradeToPlan: selectedPlan,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      receiptFileName: receiptFile.name,
      notes: formData.notes,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    // Save to localStorage (simulate database)
    const existingRequests = JSON.parse(
      localStorage.getItem("paymentRequests") || "[]",
    );
    existingRequests.push(paymentRequest);
    localStorage.setItem("paymentRequests", JSON.stringify(existingRequests));

    // Create admin notification
    const adminNotification = {
      id: Date.now().toString(),
      type: "payment_request",
      title: "New Upgrade Payment Request",
      message: `${paymentRequest.userId} submitted payment for ${selectedPlan} upgrade`,
      timestamp: new Date(),
      read: false,
      paymentRequestId: paymentRequest.id,
      actionRequired: true,
    };

    const existingNotifications = JSON.parse(
      localStorage.getItem("adminNotifications") || "[]",
    );
    existingNotifications.unshift(adminNotification);
    localStorage.setItem(
      "adminNotifications",
      JSON.stringify(existingNotifications),
    );

    setIsSubmitting(false);

    toast({
      title: "Payment Submitted Successfully! 🎉",
      description: "Your upgrade request has been submitted for admin approval",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    onClose();

    // Reset form
    setFormData({
      planType: selectedPlan,
      paymentMethod: "",
      amount: planPrice.toString(),
      referenceNumber: "",
      notes: "",
    });
    setReceiptFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-foreground">
            <CreditCard className="h-6 w-6 mr-3 text-fac-orange-500" />
            Upgrade Payment Submission
          </DialogTitle>
          <DialogDescription>
            Submit your payment details and receipt for plan upgrade approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Details */}
          <div className="bg-gradient-to-r from-fac-orange-50 to-purple-50 dark:from-fac-orange-950 dark:to-purple-950 rounded-xl p-4 border border-fac-orange-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upgrading From:
                </p>
                <p className="font-bold text-foreground capitalize">
                  {currentPlan}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Upgrading To:
                </p>
                <p className="font-bold text-fac-orange-600 capitalize">
                  {selectedPlan}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label htmlFor="paymentMethod" className="font-semibold">
              Payment Method *
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, paymentMethod: value }))
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="font-semibold">
              Amount Paid *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount paid"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="rounded-xl"
              required
            />
          </div>

          {/* Reference Number */}
          <div className="space-y-3">
            <Label htmlFor="referenceNumber" className="font-semibold">
              Reference Number *
            </Label>
            <Input
              id="referenceNumber"
              type="text"
              placeholder="Transaction/Reference number"
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  referenceNumber: e.target.value,
                }))
              }
              className="rounded-xl"
              required
            />
          </div>

          {/* Receipt Upload */}
          <div className="space-y-3">
            <Label htmlFor="receipt" className="font-semibold">
              Payment Receipt *
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Label htmlFor="receipt" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  {receiptFile
                    ? `Selected: ${receiptFile.name}`
                    : "Click to upload receipt image"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="font-semibold">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="rounded-xl"
              rows={3}
            />
          </div>
        </form>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-fac-orange-500 to-purple-600 hover:from-fac-orange-600 hover:to-purple-700 text-white rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
