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
  Plus,
  Copy,
  Star,
  Calendar,
  Tag,
  Heart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import StickyHeader from "@/components/StickyHeader";
import ConfirmModal from "@/components/ConfirmModal";
import VoucherSuccessModal from "@/components/VoucherSuccessModal";
import QRScanner from "@/components/QRScanner";
import { useQRScanner } from "@/hooks/useQRScanner";
import { neonDbClient } from "@/services/neonDatabaseService";
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
      const result = await neonDbClient.getVouchers({ audience: 'registered', status: 'active' });
      if (result.success && result.vouchers) {
        const mapped = result.vouchers.map((v: any) => ({
          id: v.id,
          code: v.code,
          title: v.title,
          description: v.description || '',
          discountType: v.discount_type === 'percentage' ? 'percentage' : 'fixed',
          discountValue: v.discount_value,
          minAmount: v.minimum_amount,
          category: 'general',
          status: v.is_active && (!v.valid_until || new Date(v.valid_until) >= new Date()) ? 'available' : 'expired',
          validUntil: v.valid_until ? new Date(v.valid_until).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        } as Voucher));
        setAvailableVouchers(mapped);
      }
      setLoadingVouchers(false);
    };
    loadVouchers();
  }, []);

  // Load applied vouchers from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('activatedVouchers');
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
    localStorage.setItem('activatedVouchers', JSON.stringify(appliedVouchers));
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
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader showBack={true} title="Vouchers" />

      {/* Header Section */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-4">
        <div className="bg-gradient-to-r from-fac-orange-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center space-x-4">
            <Gift className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Vouchers</h1>
              <p className="text-sm text-muted-foreground">
                Save more on every booking
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-4 flex space-x-2">
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
              {redeeming ? "..." : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Applied Vouchers */}
      {appliedVouchers.length > 0 && (
        <div className="max-w-md mx-auto px-4 pt-4">
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Activated Vouchers ({appliedVouchers.length})
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {appliedVouchers.map((code) => {
                const voucher = availableVouchers.find(
                  (v) => v.code === code,
                );
                return voucher ? (
                  <div
                    key={code}
                    className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {voucher.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500 text-white">
                        {voucher.discountType === "percentage"
                          ? `${voucher.discountValue}% OFF`
                          : `₱${voucher.discountValue} OFF`}
                      </Badge>
                    </div>
                  </div>
                ) : null;
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vouchers List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          {loadingVouchers ? 'Loading...' : `Available Vouchers (${availableVouchers.filter((v) => v.status === "available").length})`}
        </div>

        {loadingVouchers ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading vouchers...</p>
          </div>
        ) : availableVouchers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vouchers available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later for exciting offers!
            </p>
          </div>
        ) : (
          availableVouchers.map((voucher) => (
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
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getCategoryIcon(voucher.category)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {voucher.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {voucher.description}
                    </p>

                    {/* Discount Badge */}
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
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
                        size="icon"
                        variant="ghost"
                        onClick={() => copyVoucherCode(voucher.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
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

                {/* Expiry */}
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>Valid until {formatDate(voucher.validUntil)}</span>
                </div>

                {voucher.status === "available" && (
                  <div className="mt-3 space-y-2">
                    {appliedVouchers.includes(voucher.code) ? (
                      <div className="space-y-2">
                        <Badge className="bg-green-500 text-white w-full justify-center py-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activated
                        </Badge>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleRemoveVoucher(voucher.code)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Voucher
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
                        onClick={() => handleApplyVoucher(voucher)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Activate Voucher
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
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
            navigate('/booking');
          }}
        />
      )}
    </div>
  );
}
