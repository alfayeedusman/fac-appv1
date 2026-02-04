import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Percent,
  Clock,
  CheckCircle,
  Copy,
  Calendar,
  Heart,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";
import StickyHeader from "@/components/StickyHeader";
import ConfirmModal from "@/components/ConfirmModal";
import VoucherSuccessModal from "@/components/VoucherSuccessModal";
import QRScanner from "@/components/QRScanner";
import { useQRScanner } from "@/hooks/useQRScanner";
import { supabaseDbClient } from "@/services/supabaseDatabaseService";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [voucherToRemove, setVoucherToRemove] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedVoucherData, setAppliedVoucherData] = useState<Voucher | null>(
    null,
  );

  const { showQRScanner, openQRScanner, closeQRScanner, handleScanSuccess } =
    useQRScanner();

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(true);

  useEffect(() => {
    const loadVouchers = async () => {
      setLoadingVouchers(true);
      const result = await supabaseDbClient.getVouchers({
        audience: "registered",
        status: "active",
      });
      if (result.success && result.vouchers) {
        const mapped = result.vouchers.map(
          (v: any) =>
            ({
              id: v.id,
              code: v.code,
              title: v.title,
              description: v.description || "",
              discountType:
                v.discount_type === "percentage" ? "percentage" : "fixed",
              discountValue: v.discount_value,
              minAmount: v.minimum_amount,
              category: "general",
              status:
                v.is_active &&
                (!v.valid_until || new Date(v.valid_until) >= new Date())
                  ? "available"
                  : "expired",
              validUntil: v.valid_until
                ? new Date(v.valid_until).toISOString().split("T")[0]
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            }) as Voucher,
        );
        setAvailableVouchers(mapped);
      }
      setLoadingVouchers(false);
    };
    loadVouchers();
  }, []);

  // Load applied vouchers from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("activatedVouchers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAppliedVouchers(parsed);
        }
      } catch {}
    }
  }, []);

  // Save applied vouchers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("activatedVouchers", JSON.stringify(appliedVouchers));
  }, [appliedVouchers]);

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
          `Voucher ${voucherCode} activated successfully! 🎉\nDiscount: ${voucher.discountType === "percentage" ? `${voucher.discountValue}% OFF` : `₱${voucher.discountValue} OFF`}`,
        );
      } else {
        alert(`Invalid or expired voucher code: ${voucherCode} ❌`);
      }

      setRedeeming(false);
    }, 500);
  };

  const handleApplyVoucher = (voucher: Voucher) => {
    if (appliedVouchers.includes(voucher.code)) {
      alert(`Voucher ${voucher.code} is already activated! ✅`);
      return;
    }

    setAppliedVouchers((prev) => [...prev, voucher.code]);
    setAppliedVoucherData(voucher);
    setShowSuccessModal(true);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "wash":
        return "🚗";
      case "subscription":
        return "⭐";
      default:
        return "🎁";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-y-auto pb-24">
      <StickyHeader showBack={true} title="Vouchers" alwaysVisible />

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/6 w-96 h-96 rounded-full bg-purple-500/[0.03] blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/6 w-80 h-80 rounded-full bg-fac-orange-500/[0.03] blur-2xl"></div>
      </div>

      <div className="px-4 sm:px-6 pt-24 pb-8 max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto relative z-10">
        {/* Clean Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-fac-orange-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Vouchers & Deals
          </h1>
          <p className="text-sm text-muted-foreground">
            Save more on every booking
          </p>
        </div>

        {/* Voucher Input Card */}
        <Card className="glass border-border shadow-lg mb-6 hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-fac-orange-500" />
              Enter Voucher Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter code (e.g. SAVE20)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleRedeemVoucher()}
                className="flex-1 font-mono"
              />
              <Button
                onClick={handleRedeemVoucher}
                disabled={!voucherCode.trim() || redeeming}
                className="bg-gradient-to-r from-fac-orange-500 to-purple-600 hover:from-fac-orange-600 hover:to-purple-700 text-white font-semibold"
              >
                {redeeming ? "..." : "Apply"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activated Vouchers */}
        {appliedVouchers.length > 0 && (
          <Card className="glass bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800 mb-6 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5 mr-2" />
                Activated Vouchers ({appliedVouchers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {appliedVouchers.map((code) => {
                const voucher = availableVouchers.find((v) => v.code === code);
                return voucher ? (
                  <div
                    key={code}
                    className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-foreground">
                        {voucher.title}
                      </span>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      {voucher.discountType === "percentage"
                        ? `${voucher.discountValue}% OFF`
                        : `₱${voucher.discountValue} OFF`}
                    </Badge>
                  </div>
                ) : null;
              })}
            </CardContent>
          </Card>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {loadingVouchers
              ? "Loading..."
              : `Available Offers (${availableVouchers.filter((v) => v.status === "available").length})`}
          </h2>
        </div>

        {/* Vouchers List */}
        <div className="space-y-4">
          {loadingVouchers ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-fac-orange-500 mb-4"></div>
              <p className="text-muted-foreground">Loading vouchers...</p>
            </div>
          ) : availableVouchers.length === 0 ? (
            <Card className="glass border-border text-center py-16">
              <CardContent>
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No vouchers available
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check back later for exciting offers!
                </p>
              </CardContent>
            </Card>
          ) : (
            availableVouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className={cn(
                  "glass border-border shadow-sm transition-all duration-200",
                  voucher.status === "available"
                    ? "hover:shadow-lg hover-lift"
                    : "opacity-60",
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {getCategoryIcon(voucher.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-bold text-foreground mb-1 line-clamp-1">
                            {voucher.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {voucher.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            voucher.status === "available"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            "text-xs flex-shrink-0",
                            voucher.status === "available" &&
                              "bg-green-500 hover:bg-green-600",
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

                      {/* Discount Badge & Min Amount */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="secondary" className="font-semibold">
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
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-foreground flex-1">
                          {voucher.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyVoucherCode(voucher.code)}
                          className="h-8 w-8 p-0"
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Expiry */}
                      <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Valid until {formatDate(voucher.validUntil)}
                        </span>
                      </div>

                      {/* Action Button */}
                      {voucher.status === "available" && (
                        <div className="mt-3">
                          {appliedVouchers.includes(voucher.code) ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 py-2 px-3 rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                  Activated
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() =>
                                  handleRemoveVoucher(voucher.code)
                                }
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="w-full bg-gradient-to-r from-fac-orange-500 to-purple-600 hover:from-fac-orange-600 hover:to-purple-700 text-white font-semibold"
                              onClick={() => handleApplyVoucher(voucher)}
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Activate Voucher
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />

      {/* QR Scanner */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={closeQRScanner}
        onScan={handleScanSuccess}
      />

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={confirmRemoveVoucher}
        title="Remove Voucher"
        description={`Are you sure you want to remove voucher "${voucherToRemove}"? You can activate it again later.`}
        confirmText="Yes, Remove"
        cancelText="Keep Voucher"
        type="warning"
      />

      {appliedVoucherData && (
        <VoucherSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          voucherCode={appliedVoucherData.code}
          voucherTitle={appliedVoucherData.title}
          discountValue={appliedVoucherData.discountValue}
          discountType={appliedVoucherData.discountType}
          onBookNow={() => {
            setShowSuccessModal(false);
            navigate("/booking");
          }}
        />
      )}
    </div>
  );
}
