import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Percent,
  Clock,
  CheckCircle,
  Plus,
  Copy,
  Star,
  Calendar,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import StickyHeader from "@/components/StickyHeader";
import ConfirmModal from "@/components/ConfirmModal";

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minAmount?: number;
  validUntil: string;
  status: "available" | "used" | "expired";
  category: "wash" | "subscription" | "general";
}

export default function Voucher() {
  const [voucherCode, setVoucherCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [voucherToRemove, setVoucherToRemove] = useState<string>("");

  const [availableVouchers] = useState<Voucher[]>([
    {
      id: "1",
      code: "WELCOME20",
      title: "Welcome Bonus",
      description: "Get 20% off your first wash service",
      discountType: "percentage",
      discountValue: 20,
      minAmount: 500,
      validUntil: "2024-02-29",
      status: "available",
      category: "wash",
    },
    {
      id: "2",
      code: "SAVE200",
      title: "Premium Upgrade",
      description: "Save ₱200 on any subscription upgrade",
      discountType: "fixed",
      discountValue: 200,
      validUntil: "2024-03-15",
      status: "available",
      category: "subscription",
    },
    {
      id: "3",
      code: "LOYALTY50",
      title: "Loyalty Reward",
      description: "50% off VIP ProMax wash - Member exclusive",
      discountType: "percentage",
      discountValue: 50,
      validUntil: "2024-02-15",
      status: "used",
      category: "wash",
    },
  ]);

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) return;

    setRedeeming(true);
    // Simulate API call
    setTimeout(() => {
      const voucher = availableVouchers.find(
        (v) => v.code === voucherCode && v.status === "available",
      );

      if (voucher) {
        setAppliedVouchers((prev) => [...prev, voucher.code]);
        setVoucherCode("");
        alert(
          `Voucher ${voucherCode} redeemed successfully! 🎉\nDiscount: ${voucher.discountType === "percentage" ? `${voucher.discountValue}% OFF` : `₱${voucher.discountValue} OFF`}`,
        );
      } else {
        alert(`Invalid or expired voucher code: ${voucherCode} ❌`);
      }

      setRedeeming(false);
    }, 1500);
  };

  const handleApplyVoucher = (voucher: Voucher) => {
    if (appliedVouchers.includes(voucher.code)) {
      alert(`Voucher ${voucher.code} is already applied! ✅`);
      return;
    }

    setAppliedVouchers((prev) => [...prev, voucher.code]);
    alert(
      `Voucher ${voucher.code} applied successfully! 🎉\nYou can now use this discount during checkout.`,
    );
  };

  const handleRemoveVoucher = (voucherCode: string) => {
    setVoucherToRemove(voucherCode);
    setShowRemoveModal(true);
  };

  const confirmRemoveVoucher = () => {
    setAppliedVouchers((prev) =>
      prev.filter((code) => code !== voucherToRemove),
    );
    setShowRemoveModal(false);
    setVoucherToRemove("");
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Voucher code ${code} copied to clipboard! 📋`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "wash":
        return <span className="text-blue-500">🚗</span>;
      case "subscription":
        return <span className="text-purple-500">👑</span>;
      default:
        return <span className="text-green-500">🎁</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader showBack={true} title="Vouchers" />

      {/* Header */}
      <div className="bg-card border-b p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-fac-orange-500 p-2 rounded-xl">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vouchers</h1>
                <p className="text-sm text-muted-foreground">
                  Redeem your rewards
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Redeem Section */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                onClick={handleRedeemVoucher}
                disabled={!voucherCode.trim() || redeeming}
                className="bg-fac-orange-500 hover:bg-fac-orange-600"
              >
                {redeeming ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Applied Vouchers */}
      {appliedVouchers.length > 0 && (
        <div className="max-w-md mx-auto px-4 pt-4">
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Applied Vouchers ({appliedVouchers.length})
                </h3>
              </div>
              <div className="space-y-2">
                {appliedVouchers.map((code) => {
                  const voucher = availableVouchers.find(
                    (v) => v.code === code,
                  );
                  return voucher ? (
                    <div
                      key={code}
                      className="flex items-center justify-between bg-white dark:bg-green-900 rounded-lg p-2"
                    >
                      <div>
                        <span className="font-medium text-sm">
                          {voucher.title}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {code}
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        {voucher.discountType === "percentage"
                          ? `${voucher.discountValue}% OFF`
                          : `₱${voucher.discountValue} OFF`}
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vouchers List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Available Vouchers (
          {availableVouchers.filter((v) => v.status === "available").length})
        </div>

        {availableVouchers.map((voucher) => (
          <Card
            key={voucher.id}
            className={cn(
              "border shadow-sm transition-all duration-200",
              voucher.status === "available"
                ? "bg-card hover:shadow-md"
                : "bg-muted/50 opacity-75",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {getCategoryIcon(voucher.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {voucher.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {voucher.description}
                    </p>

                    {/* Discount Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-700">
                        <Percent className="h-3 w-3 mr-1" />
                        {voucher.discountType === "percentage"
                          ? `${voucher.discountValue}% OFF`
                          : `₱${voucher.discountValue} OFF`}
                      </Badge>
                      {voucher.minAmount && (
                        <Badge variant="outline" className="text-xs">
                          Min ₱{voucher.minAmount}
                        </Badge>
                      )}
                    </div>

                    {/* Voucher Code */}
                    <div className="flex items-center space-x-2 mt-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {voucher.code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyVoucherCode(voucher.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    className={cn(
                      "text-xs",
                      voucher.status === "available"
                        ? "bg-green-100 text-green-700"
                        : voucher.status === "used"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700",
                    )}
                  >
                    {voucher.status === "available" && (
                      <Gift className="h-3 w-3 mr-1" />
                    )}
                    {voucher.status === "used" && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {voucher.status === "expired" && (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {voucher.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Expiry Info */}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="h-3 w-3" />
                <span>Valid until {formatDate(voucher.validUntil)}</span>
              </div>

              {voucher.status === "available" && (
                <div className="mt-3 space-y-2">
                  {appliedVouchers.includes(voucher.code) ? (
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-green-500 text-green-600 bg-green-50"
                        disabled
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Applied to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleRemoveVoucher(voucher.code)}
                      >
                        Remove from Cart
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                      onClick={() => handleApplyVoucher(voucher)}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Apply Voucher
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {availableVouchers.filter((v) => v.status === "available").length ===
          0 && (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vouchers available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later for new rewards!
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
