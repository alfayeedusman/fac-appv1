import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, Share, Tag } from "lucide-react";

interface VoucherCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode: string;
  voucherTitle: string;
  discountValue: number;
  discountType: "percentage" | "fixed";
  expiryDate?: string;
}

export default function VoucherCopyModal({
  isOpen,
  onClose,
  voucherCode,
  voucherTitle,
  discountValue,
  discountType,
  expiryDate,
}: VoucherCopyModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = voucherCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Fayeed Auto Care Voucher",
      text: `Use voucher code ${voucherCode} for ${discountType === "percentage" ? `${discountValue}% OFF` : `₱${discountValue} OFF`} at Fayeed Auto Care!`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-fac-orange-500 to-purple-600 p-4 rounded-full animate-pulse">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
            Voucher Ready! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Voucher Card */}
          <div className="bg-gradient-to-br from-fac-orange-50 to-purple-100 dark:from-fac-orange-950 dark:to-purple-900 rounded-2xl p-6 border-2 border-dashed border-fac-orange-300 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4">
                <Tag className="h-16 w-16 text-fac-orange-500 transform rotate-12" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Gift className="h-12 w-12 text-purple-500 transform -rotate-12" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {voucherTitle}
                  </h3>
                  <Badge className="bg-gradient-to-r from-fac-orange-500 to-purple-600 text-white mt-1">
                    {discountType === "percentage"
                      ? `${discountValue}% OFF`
                      : `₱${discountValue} OFF`}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Voucher Code</p>
                  <p className="text-2xl font-black text-fac-orange-600 font-mono tracking-wider">
                    {voucherCode}
                  </p>
                </div>
              </div>

              {expiryDate && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Valid until: {expiryDate}</span>
                  <span>Fayeed Auto Care</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              How to use:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Copy the voucher code above</li>
              <li>• Apply it during booking or payment</li>
              <li>• Enjoy your discount!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCopy}
              className="bg-gradient-to-r from-fac-orange-500 to-orange-600 hover:from-fac-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 rounded-xl"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
