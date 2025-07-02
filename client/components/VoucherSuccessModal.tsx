import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Gift, Percent, ShoppingCart } from "lucide-react";

interface VoucherSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode: string;
  voucherTitle: string;
  discountValue: number;
  discountType: "percentage" | "fixed";
}

export default function VoucherSuccessModal({
  isOpen,
  onClose,
  voucherCode,
  voucherTitle,
  discountValue,
  discountType,
}: VoucherSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500 p-4 rounded-full animate-bounce">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Voucher Applied Successfully! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Voucher Details Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {voucherTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Code:{" "}
                  <span className="font-mono font-bold">{voucherCode}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Discount Applied:
              </span>
              <Badge className="bg-green-500 text-white text-lg px-3 py-1">
                <Percent className="h-4 w-4 mr-1" />
                {discountType === "percentage"
                  ? `${discountValue}% OFF`
                  : `₱${discountValue} OFF`}
              </Badge>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Your discount is now active!
            </p>
            <p className="text-sm text-muted-foreground">
              You can now use this discount during checkout. The voucher has
              been added to your cart.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-semibold"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>

            <Button variant="outline" onClick={onClose} className="w-full">
              View All Vouchers
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
