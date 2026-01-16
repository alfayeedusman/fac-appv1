import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Bell,
  Mail,
  Phone,
  Eye,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { neonDbClient } from "@/services/neonDatabaseService";
import { toast } from "@/hooks/use-toast";
import SubscriptionStatusBadge from "@/components/SubscriptionStatusBadge";
import SubscriptionDetailsCard from "@/components/SubscriptionDetailsCard";
import XenditPaymentModal from "@/components/XenditPaymentModal";

interface SubscriptionWithCustomer {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  packageId: string;
  packageName: string;
  status: "active" | "paused" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  renewalDate: string;
  finalPrice: number;
  xenditPlanId?: string;
  paymentMethod?: "card" | "ewallet" | "bank_transfer";
  autoRenew: boolean;
  daysUntilRenewal: number;
  cycleCount: number;
}

interface PaymentFees {
  card: number; // percentage
  ewallet: number;
  bank_transfer: number;
}

const XENDIT_FEES: PaymentFees = {
  card: 2.9, // 2.9% + Rp 2.000
  ewallet: 2.0, // 2% + Rp 1.000
  bank_transfer: 3.0, // 3% + Rp 2.500
};

const ActiveSubscriptionsManager = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithCustomer[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionWithCustomer | null>(null);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [isEndpointAvailable, setIsEndpointAvailable] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      console.log("📋 Loading active subscriptions...");

      // Fetch subscriptions from database
      if (!neonDbClient.getSubscriptions) {
        console.error("❌ getSubscriptions method not available");
        setIsEndpointAvailable(false);
        setSubscriptions([]);
        return;
      }

      const result = await neonDbClient.getSubscriptions({ status: "active" });
      console.log("📋 Subscriptions result:", result);

      if (result?.success === false) {
        console.warn("⚠️ Subscription fetch returned success: false", result.error);
        setIsEndpointAvailable(false);
        setSubscriptions([]);
        return;
      }

      if (result?.success && result.subscriptions && Array.isArray(result.subscriptions)) {
        // Map subscriptions to include customer and cycle info
        const mappedSubs = result.subscriptions
          .filter((sub: any) => sub.status === "active")
          .map((sub: any) => {
            const renewalDate = new Date(sub.renewalDate || sub.endDate);
            const today = new Date();
            const daysUntilRenewal = differenceInDays(renewalDate, today);

            return {
              id: sub.id,
              customerId: sub.userId,
              customerName: `Customer ${sub.userId?.substring(0, 8) || "Unknown"}`,
              customerEmail: `user.${sub.userId?.substring(0, 6)}@example.com` || "",
              packageId: sub.packageId,
              packageName: `Package ${sub.packageId?.substring(0, 6) || "Unknown"}`,
              status: sub.status,
              startDate: sub.startDate,
              endDate: sub.endDate || sub.renewalDate,
              renewalDate: sub.renewalDate,
              finalPrice: typeof sub.finalPrice === "number" ? sub.finalPrice : parseFloat(sub.finalPrice || "0"),
              xenditPlanId: sub.xenditPlanId,
              paymentMethod: sub.paymentMethod || "card",
              autoRenew: sub.autoRenew !== false,
              daysUntilRenewal,
              cycleCount: sub.cycleCount || 1,
            };
          });

        console.log("✅ Mapped subscriptions:", mappedSubs.length);
        setSubscriptions(mappedSubs);
        setIsEndpointAvailable(true);
      } else {
        console.warn("⚠️ Invalid subscriptions response:", result);
        setIsEndpointAvailable(false);
        setSubscriptions([]);
      }
    } catch (error: any) {
      console.error("❌ Error loading subscriptions:", error?.message || error);
      setIsEndpointAvailable(false);
      setSubscriptions([]);

      if (error?.message?.includes("JSON")) {
        toast({
          title: "Connection Issue",
          description: "Failed to load subscription data. The endpoint may not be available.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRenewalWithFees = (
    amount: number,
    paymentMethod: string = "card",
  ) => {
    const feePercentage = XENDIT_FEES[paymentMethod as keyof PaymentFees] || 2.9;
    const platformFee = Math.round((amount * feePercentage) / 100 * 100) / 100;
    const totalAmount = amount + platformFee;

    return {
      originalAmount: amount,
      platformFee,
      totalAmount,
      feePercentage,
    };
  };

  const handleSetupXenditPlan = async (sub: SubscriptionWithCustomer) => {
    try {
      setSelectedSubscription(sub);
      // TODO: Integrate with Xendit subscription API
      toast({
        title: "Ready",
        description: "Xendit API key needed. Please add your key in settings.",
      });
      setIsSetupDialogOpen(true);
    } catch (error) {
      console.error("Error setting up plan:", error);
      toast({
        title: "Error",
        description: "Failed to setup Xendit plan",
        variant: "destructive",
      });
    }
  };

  const handleManualRenewal = async (sub: SubscriptionWithCustomer) => {
    try {
      setSelectedSubscription(sub);
      setIsRenewalDialogOpen(true);
    } catch (error) {
      console.error("Error preparing renewal:", error);
      toast({
        title: "Error",
        description: "Failed to prepare renewal",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string, daysUntilRenewal: number) => {
    if (daysUntilRenewal <= 0) return "bg-red-100 text-red-800";
    if (daysUntilRenewal <= 7) return "bg-yellow-100 text-yellow-800";
    if (daysUntilRenewal <= 30) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusIcon = (daysUntilRenewal: number) => {
    if (daysUntilRenewal <= 0)
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (daysUntilRenewal <= 7)
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    if (daysUntilRenewal <= 30)
      return <Clock className="h-4 w-4 text-orange-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const filteredSubscriptions =
    paymentMethodFilter === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.paymentMethod === paymentMethodFilter);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            {subscriptions.length} active plans • Manage renewals and auto-pay
          </p>
        </div>
        <Button
          onClick={loadSubscriptions}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="card">Credit Card</SelectItem>
            <SelectItem value="ewallet">E-Wallet</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions List */}
      {!isEndpointAvailable && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Subscription data unavailable
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Unable to load subscription information. Please check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="h-[600px] w-full border rounded-lg">
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin mb-4">
                  <RefreshCw className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Loading subscriptions...</p>
              </div>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">{isEndpointAvailable ? "No active subscriptions" : "Unable to load subscriptions"}</p>
              </div>
            </div>
          ) : (
            filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Customer Info */}
                    <div className="col-span-2">
                      <div className="space-y-2">
                        <div className="font-bold text-foreground text-base">
                          {subscription.customerName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {subscription.customerEmail}
                        </div>
                        <div className="text-sm font-medium text-cyan-600 flex items-center gap-1">
                          <span>📦</span>
                          {subscription.packageName}
                        </div>
                        <SubscriptionStatusBadge
                          subscriptionType={subscription.paymentMethod as any}
                          showIcon={false}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Cycle & Status */}
                    <div className="col-span-1">
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Cycle</div>
                        <Badge variant="outline" className="font-mono">
                          Cycle {subscription.cycleCount}
                        </Badge>
                        <div
                          className={`text-xs font-semibold mt-2 px-2 py-1 rounded ${getStatusColor(
                            subscription.status,
                            subscription.daysUntilRenewal,
                          )}`}
                        >
                          {subscription.daysUntilRenewal} days
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="col-span-1">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Renewal
                        </div>
                        <div className="text-sm font-medium">
                          {format(
                            new Date(subscription.renewalDate),
                            "MMM d, yyyy",
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Amount: ₱{subscription.finalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Auto-Renew & Method */}
                    <div className="col-span-1">
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Auto-Renew
                        </div>
                        <Badge
                          variant={subscription.autoRenew ? "default" : "secondary"}
                          className={
                            subscription.autoRenew
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                        >
                          {subscription.autoRenew ? "Enabled" : "Disabled"}
                        </Badge>
                        <div className="text-xs mt-2 font-medium">
                          {subscription.paymentMethod === "card"
                            ? "💳 Card"
                            : subscription.paymentMethod === "ewallet"
                              ? "📱 E-Wallet"
                              : "🏦 Bank"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="space-y-2">
                        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => setSelectedSubscription(subscription)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Subscription Details</DialogTitle>
                              <DialogDescription>
                                View complete subscription information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSubscription && (
                              <div className="space-y-4">
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border">
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">
                                      Customer
                                    </div>
                                    <div className="font-bold text-lg">
                                      {selectedSubscription.customerName}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Mail className="h-4 w-4" />
                                      {selectedSubscription.customerEmail}
                                    </div>
                                  </div>
                                </div>

                                <SubscriptionDetailsCard
                                  customerId={selectedSubscription.customerId}
                                  customerName={selectedSubscription.customerName}
                                  subscriptionStatus={selectedSubscription.paymentMethod as any}
                                  renewalDate={selectedSubscription.renewalDate}
                                  cycleCount={selectedSubscription.cycleCount}
                                  autoRenew={selectedSubscription.autoRenew}
                                  paymentMethod={selectedSubscription.paymentMethod}
                                  amount={selectedSubscription.finalPrice}
                                  compact={false}
                                />
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="w-full bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => handleSetupXenditPlan(subscription)}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Setup
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Setup Xendit Auto-Renewal
                              </DialogTitle>
                              <DialogDescription>
                                Configure automatic renewal for{" "}
                                {selectedSubscription?.customerName}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSubscription && (
                              <XenditSetupForm
                                subscription={selectedSubscription}
                                onSuccess={() => {
                                  setIsSetupDialogOpen(false);
                                  loadSubscriptions();
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => handleManualRenewal(subscription)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Renew Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manual Renewal</DialogTitle>
                              <DialogDescription>
                                Process renewal payment for{" "}
                                {selectedSubscription?.customerName}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSubscription && (
                              <ManualRenewalForm
                                subscription={selectedSubscription}
                                onSuccess={() => {
                                  setIsRenewalDialogOpen(false);
                                  loadSubscriptions();
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Fee Structure Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Fee Structure (Charged to Customers)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Credit Card</div>
              <div className="font-semibold text-blue-600">
                {XENDIT_FEES.card}% + Rp 2.000
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">E-Wallet</div>
              <div className="font-semibold text-blue-600">
                {XENDIT_FEES.ewallet}% + Rp 1.000
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Bank Transfer</div>
              <div className="font-semibold text-blue-600">
                {XENDIT_FEES.bank_transfer}% + Rp 2.500
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const XenditSetupForm = ({
  subscription,
  onSuccess,
}: {
  subscription: SubscriptionWithCustomer;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      console.log("🔧 Setting up Xendit subscription plan...");

      const response = await fetch(
        "/api/neon/subscription/xendit/create-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: subscription.id,
            customerId: subscription.customerId,
            amount: subscription.finalPrice,
            paymentMethod: subscription.paymentMethod,
            interval: "MONTHLY", // Can be DAILY, WEEKLY, MONTHLY, YEARLY
            intervalCount: 1,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create plan");
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Xendit subscription plan created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error setting up plan:", error);
      toast({
        title: "Error",
        description: "Failed to setup Xendit plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
        <p className="font-medium">
          Customer: {subscription.customerName}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Email: {subscription.customerEmail}
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Amount per Cycle</div>
        <div className="text-lg font-bold">
          ₱{subscription.finalPrice.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
          Payment Method: {subscription.paymentMethod}
        </div>
      </div>

      <Button
        onClick={handleSetup}
        disabled={loading}
        className="w-full bg-cyan-600 hover:bg-cyan-700"
      >
        {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
        Create Xendit Plan
      </Button>
    </div>
  );
};

const ManualRenewalForm = ({
  subscription,
  onSuccess,
}: {
  subscription: SubscriptionWithCustomer;
  onSuccess: () => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState(
    subscription.paymentMethod || "card",
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const calculateFees = (amount: number, method: string) => {
    const feePercentage = XENDIT_FEES[method as keyof PaymentFees] || 2.9;
    const platformFee = Math.round((amount * feePercentage) / 100 * 100) / 100;
    return {
      platformFee,
      total: amount + platformFee,
    };
  };

  const fees = calculateFees(subscription.finalPrice, paymentMethod);

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded text-sm">
        <p className="font-medium">{subscription.customerName}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {subscription.packageName}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Method</label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">💳 Credit Card</SelectItem>
            <SelectItem value="ewallet">📱 E-Wallet</SelectItem>
            <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subscription Amount:</span>
          <span className="font-medium">
            ₱{subscription.finalPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm text-orange-600">
          <span>Xendit Fee ({XENDIT_FEES[paymentMethod as keyof PaymentFees]}%):</span>
          <span className="font-medium">₱{fees.platformFee.toLocaleString()}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total Charge:</span>
          <span>₱{fees.total.toLocaleString()}</span>
        </div>
      </div>

      <Button
        onClick={() => setShowPaymentModal(true)}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Process Renewal via Xendit
      </Button>

      {/* Xendit Payment Modal */}
      <XenditPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={() => {
          toast({
            title: "Success! 🎉",
            description: "Subscription renewed successfully",
          });
          onSuccess();
        }}
        type="subscription"
        id={subscription.id}
        amount={fees.total}
        customerEmail={subscription.customerEmail}
        customerName={subscription.customerName}
        description={`Renewal - ${subscription.packageName} (Cycle ${subscription.cycleCount + 1})`}
        paymentMethod={paymentMethod as any}
      />
    </div>
  );
};

export default ActiveSubscriptionsManager;
