import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Percent, Gift, Calendar, Check, Copy, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";
import { format } from "date-fns";

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validUntil?: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  category?: string;
}

export default function Vouchers() {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [appliedVouchers, setAppliedVouchers] = useState<string[]>([]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vouchers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch vouchers");

      const data = await response.json();
      setVouchers(data.vouchers || []);

      // Load applied vouchers from localStorage
      const saved = localStorage.getItem("appliedVouchers");
      if (saved) {
        setAppliedVouchers(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      toast({
        title: "Error",
        description: "Failed to load vouchers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Success",
      description: "Code copied to clipboard!",
    });
  };

  const handleApplyVoucher = (voucher: Voucher) => {
    if (appliedVouchers.includes(voucher.id)) {
      setAppliedVouchers(appliedVouchers.filter(id => id !== voucher.id));
      toast({
        title: "Removed",
        description: `Voucher removed`,
      });
    } else {
      setAppliedVouchers([...appliedVouchers, voucher.id]);
      localStorage.setItem("appliedVouchers", JSON.stringify([...appliedVouchers, voucher.id]));
      toast({
        title: "Applied",
        description: `Voucher applied! Save ${getDiscountDisplay(voucher)}`,
      });
    }
  };

  const getDiscountDisplay = (voucher: Voucher): string => {
    if (voucher.discountType === "percentage") {
      return `${voucher.discountValue}%`;
    }
    return `$${voucher.discountValue}`;
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || v.category === filterCategory;
    return matchesSearch && matchesCategory && v.isActive;
  });

  const categories = Array.from(new Set(vouchers.map(v => v.category).filter(Boolean)));

  const isExpired = (voucher: Voucher) => {
    if (!voucher.validUntil) return false;
    return new Date(voucher.validUntil) < new Date();
  };

  const getUsagePercentage = (voucher: Voucher) => {
    if (!voucher.usageLimit) return 0;
    return Math.round(((voucher.usedCount || 0) / voucher.usageLimit) * 100);
  };

  const VoucherCard = ({ voucher, isApplied }: { voucher: Voucher; isApplied: boolean }) => {
    const expired = isExpired(voucher);

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg",
          isApplied && "border-primary/50 bg-primary/5",
          expired && "opacity-60"
        )}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header with Discount Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{voucher.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{voucher.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-primary">
                  {getDiscountDisplay(voucher)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {voucher.discountType === "percentage" ? "Off" : "Off"}
                </p>
              </div>
            </div>

            {/* Code */}
            <div className="bg-secondary p-3 rounded-lg flex items-center justify-between">
              <span className="font-mono font-bold text-sm">{voucher.code}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyCode(voucher.code)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {voucher.minPurchase && (
                <div>
                  <p className="text-xs text-muted-foreground">Min Purchase</p>
                  <p className="font-medium">${voucher.minPurchase}</p>
                </div>
              )}
              {voucher.maxDiscount && (
                <div>
                  <p className="text-xs text-muted-foreground">Max Discount</p>
                  <p className="font-medium">${voucher.maxDiscount}</p>
                </div>
              )}
              {voucher.validUntil && (
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className={cn("font-medium", expired && "text-destructive")}>
                    {format(new Date(voucher.validUntil), "MMM d, yyyy")}
                  </p>
                </div>
              )}
              {voucher.usageLimit && (
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p className="font-medium">
                    {voucher.usageLimit - (voucher.usedCount || 0)} left
                  </p>
                </div>
              )}
            </div>

            {/* Usage Bar */}
            {voucher.usageLimit && (
              <div className="space-y-1">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${Math.min(getUsagePercentage(voucher), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {getUsagePercentage(voucher)}% claimed
                </p>
              </div>
            )}

            {/* Status Badges and Button */}
            <div className="flex gap-2 flex-wrap items-center">
              {expired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
              {voucher.category && (
                <Badge variant="outline" className="text-xs capitalize">
                  {voucher.category}
                </Badge>
              )}
              <Button
                onClick={() => handleApplyVoucher(voucher)}
                disabled={expired}
                variant={isApplied ? "default" : "outline"}
                className="ml-auto"
                size="sm"
              >
                {isApplied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Applied
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader title="Vouchers & Promotions" />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          <Input
            placeholder="Search vouchers by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {categories.length > 0 && (
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat || ""}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Applied Vouchers Summary */}
        {appliedVouchers.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-700">
                  {appliedVouchers.length} voucher{appliedVouchers.length !== 1 ? "s" : ""} applied to your booking
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vouchers Grid */}
        {!loading && (
          <>
            {filteredVouchers.length > 0 ? (
              <div className="space-y-4">
                {filteredVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isApplied={appliedVouchers.includes(voucher.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vouchers found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "No active vouchers available right now"}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
