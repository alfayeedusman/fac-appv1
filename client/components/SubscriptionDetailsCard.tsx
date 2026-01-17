import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  RefreshCw,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";

interface SubscriptionDetailsCardProps {
  customerId: string;
  customerName: string;
  subscriptionStatus: "free" | "basic" | "premium" | "vip";
  subscriptionExpiry?: string;
  renewalDate?: string;
  cycleCount?: number;
  autoRenew?: boolean;
  paymentMethod?: string;
  amount?: number;
  onRenewalClick?: () => void;
  onManageClick?: () => void;
  compact?: boolean;
}

export const SubscriptionDetailsCard = ({
  customerId,
  customerName,
  subscriptionStatus,
  subscriptionExpiry,
  renewalDate,
  cycleCount = 1,
  autoRenew = false,
  paymentMethod = "card",
  amount = 0,
  onRenewalClick,
  onManageClick,
  compact = false,
}: SubscriptionDetailsCardProps) => {
  const daysUntilRenewal = renewalDate
    ? differenceInDays(new Date(renewalDate), new Date())
    : null;

  const getStatusIcon = () => {
    if (daysUntilRenewal === null) return null;
    if (daysUntilRenewal <= 0)
      return (
        <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
      );
    if (daysUntilRenewal <= 7)
      return (
        <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />
      );
    if (daysUntilRenewal <= 30)
      return <Clock className="h-5 w-5 text-orange-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground">
            Subscription
          </div>
          <SubscriptionStatusBadge
            subscriptionType={subscriptionStatus}
            daysUntilRenewal={daysUntilRenewal || undefined}
            showIcon={true}
            size="sm"
          />
        </div>

        {renewalDate && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Renewal Date:</span>
            <span className="font-medium">{format(new Date(renewalDate), "MMM d, yyyy")}</span>
          </div>
        )}

        {cycleCount > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cycle:</span>
            <Badge variant="outline" className="text-xs">
              #{cycleCount}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription Details</CardTitle>
          {getStatusIcon()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subscription Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Status</div>
          <SubscriptionStatusBadge
            subscriptionType={subscriptionStatus}
            daysUntilRenewal={daysUntilRenewal || undefined}
            showIcon={true}
            size="md"
          />
        </div>

        {/* Cycle Information */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Billing Cycle</div>
            <div className="text-lg font-bold text-blue-600">#{cycleCount}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Auto-Renew</div>
            <Badge
              variant={autoRenew ? "default" : "secondary"}
              className={autoRenew ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {autoRenew ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>

        {/* Renewal Information */}
        {renewalDate && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Next Renewal</span>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-6">
              <div>
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="font-semibold">
                  {format(new Date(renewalDate), "MMM d, yyyy")}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Days Left</div>
                <div
                  className={`font-semibold ${
                    daysUntilRenewal! <= 0
                      ? "text-red-600"
                      : daysUntilRenewal! <= 7
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {daysUntilRenewal! <= 0 ? "Expired" : `${daysUntilRenewal}d`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {amount > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Payment Method</span>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-6">
              <div>
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="font-semibold text-green-600">
                  ₱{amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Method</div>
                <Badge variant="outline">
                  {paymentMethod === "card"
                    ? "💳 Card"
                    : paymentMethod === "ewallet"
                      ? "📱 E-Wallet"
                      : "🏦 Bank"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t">
          {onRenewalClick && (
            <Button
              size="sm"
              onClick={onRenewalClick}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Renew Now
            </Button>
          )}
          {onManageClick && (
            <Button size="sm" variant="outline" onClick={onManageClick}>
              <Zap className="h-3 w-3 mr-1.5" />
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetailsCard;
