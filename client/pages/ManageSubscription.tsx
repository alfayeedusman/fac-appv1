import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Star,
  Calendar,
  CreditCard,
  Gift,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";

interface SubscriptionPlan {
  id: string;
  name: string;
  basePrice: number;
  features: string[];
  popular?: boolean;
}

interface LockInOption {
  id: string;
  period: string;
  months: number;
  discount: number;
  discountLabel: string;
  savings: number;
}

interface CurrentSubscription {
  plan: string;
  price: number;
  startDate: string;
  endDate: string;
  lockInPeriod: string;
  autoRenewal: boolean;
  status: "active" | "expiring" | "cancelled";
}

export default function ManageSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string>("vip-gold");
  const [selectedLockIn, setSelectedLockIn] = useState<string>("flexible");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const currentSubscription: CurrentSubscription = {
    plan: "VIP Gold",
    price: 3000,
    startDate: "2024-01-01",
    endDate: "2024-02-01",
    lockInPeriod: "Monthly (Flexible)",
    autoRenewal: true,
    status: "active",
  };

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "classic",
      name: "Classic",
      basePrice: 500,
      features: [
        "4 classic wash sessions per month",
        "Basic member benefits",
        "Online booking access",
        "Customer support",
        "Monthly reset of all benefits",
      ],
    },
    {
      id: "vip-silver",
      name: "VIP Silver",
      basePrice: 1500,
      features: [
        "8 classic wash sessions per month",
        "2 VIP ProMax wash sessions per month",
        "Member discounts",
        "Priority support",
        "Loyalty points earning",
        "Monthly reset of all benefits",
      ],
    },
    {
      id: "vip-gold",
      name: "VIP Gold",
      basePrice: 3000,
      popular: true,
      features: [
        "Unlimited classic wash sessions per month",
        "5 VIP ProMax wash sessions per month",
        "1 Premium wash session per month",
        "Priority booking",
        "Exclusive member benefits",
        "Premium customer support",
        "Maximum loyalty points",
        "Monthly reset of all benefits",
      ],
    },
  ];

  const lockInOptions: LockInOption[] = [
    {
      id: "flexible",
      period: "Monthly (Flexible)",
      months: 1,
      discount: 0,
      discountLabel: "No Discount",
      savings: 0,
    },
    {
      id: "3months",
      period: "3 Months Lock-in",
      months: 3,
      discount: 10,
      discountLabel: "10% OFF",
      savings: 0,
    },
    {
      id: "6months",
      period: "6 Months Lock-in",
      months: 6,
      discount: 20,
      discountLabel: "20% OFF",
      savings: 0,
    },
    {
      id: "1year",
      period: "1 Year Lock-in",
      months: 12,
      discount: 30,
      discountLabel: "30% OFF",
      savings: 0,
    },
  ];

  const calculatePrice = (planId: string, lockInId: string) => {
    const plan = subscriptionPlans.find((p) => p.id === planId);
    const lockIn = lockInOptions.find((l) => l.id === lockInId);
    if (!plan || !lockIn) return { monthly: 0, total: 0, savings: 0 };

    const basePrice = plan.basePrice;
    const discountedPrice = basePrice * (1 - lockIn.discount / 100);
    const totalPrice = discountedPrice * lockIn.months;
    const originalTotal = basePrice * lockIn.months;
    const savings = originalTotal - totalPrice;

    return {
      monthly: Math.round(discountedPrice),
      total: Math.round(totalPrice),
      savings: Math.round(savings),
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const selectedPlanData = subscriptionPlans.find((p) => p.id === selectedPlan);
  const selectedLockInData = lockInOptions.find((l) => l.id === selectedLockIn);
  const pricing = calculatePrice(selectedPlan, selectedLockIn);

  const handleRenewal = () => {
    alert(
      `Subscription renewed!\nPlan: ${selectedPlanData?.name}\nLock-in: ${selectedLockInData?.period}\nTotal: ₱${pricing.total}`,
    );
  };

  const handleCancellation = () => {
    alert("Subscription cancelled. It will remain active until the end date.");
    setShowCancelDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-fac-blue-900">
                Manage Subscription
              </h1>
              <p className="text-fac-blue-700">
                Renew, upgrade, or cancel your membership
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Plan</TabsTrigger>
            <TabsTrigger value="renew">Renew / Upgrade</TabsTrigger>
          </TabsList>

          {/* Current Subscription Tab */}
          <TabsContent value="current" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-fac-gold-500" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Active Plan
                      </label>
                      <div className="flex items-center mt-1">
                        <Crown className="h-4 w-4 text-fac-gold-500 mr-2" />
                        <span className="text-lg font-semibold">
                          {currentSubscription.plan}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Monthly Price
                      </label>
                      <p className="text-lg font-semibold text-fac-blue-600">
                        ₱{currentSubscription.price.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Lock-in Period
                      </label>
                      <p className="text-lg font-semibold">
                        {currentSubscription.lockInPeriod}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Billing Period
                      </label>
                      <p className="text-gray-900">
                        {formatDate(currentSubscription.startDate)} -{" "}
                        {formatDate(currentSubscription.endDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <Badge className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Auto-renewal
                      </label>
                      <div className="flex items-center mt-1">
                        <Shield className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-700 font-semibold">
                          Enabled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600 text-white">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew Subscription
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-fac-orange-500 text-fac-orange-600 hover:bg-fac-orange-50"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Renew/Upgrade Tab */}
          <TabsContent value="renew" className="space-y-6">
            {/* Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={cn(
                        "relative border rounded-lg p-4 cursor-pointer transition-all",
                        selectedPlan === plan.id
                          ? "border-fac-blue-600 bg-fac-blue-50"
                          : "border-gray-200 hover:border-fac-blue-300",
                        plan.popular && "ring-2 ring-fac-gold-400",
                      )}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-fac-gold-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      )}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <p className="text-2xl font-bold text-fac-blue-600">
                          ₱{plan.basePrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lock-in Period Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-fac-blue-600" />
                  Choose Lock-in Period
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Save more with longer lock-in periods
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lockInOptions.map((option) => {
                    const price = calculatePrice(selectedPlan, option.id);
                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all relative",
                          selectedLockIn === option.id
                            ? "border-fac-blue-600 bg-fac-blue-50"
                            : "border-gray-200 hover:border-fac-blue-300",
                          option.discount > 0 && "ring-1 ring-green-300",
                        )}
                        onClick={() => setSelectedLockIn(option.id)}
                      >
                        {option.discount > 0 && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                            <Gift className="h-3 w-3 mr-1" />
                            {option.discountLabel}
                          </Badge>
                        )}
                        <div className="text-center">
                          <h4 className="font-semibold mb-2">
                            {option.period}
                          </h4>
                          <p className="text-xl font-bold text-fac-blue-600">
                            ₱{price.monthly.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">per month</p>
                          {option.months > 1 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-semibold">
                                Total: ₱{price.total.toLocaleString()}
                              </p>
                              {price.savings > 0 && (
                                <p className="text-xs text-green-600 font-semibold">
                                  Save ₱{price.savings.toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Renewal Summary */}
            <Card className="border-fac-blue-200 bg-fac-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-fac-blue-600" />
                  Renewal Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Selected Plan
                      </label>
                      <p className="text-lg font-semibold">
                        {selectedPlanData?.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Lock-in Period
                      </label>
                      <p className="text-lg font-semibold">
                        {selectedLockInData?.period}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Monthly Price
                      </label>
                      <p className="text-xl font-bold text-fac-blue-600">
                        ₱{pricing.monthly.toLocaleString()}
                      </p>
                    </div>
                    {selectedLockInData?.months &&
                      selectedLockInData.months > 1 && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Total Amount
                            </label>
                            <p className="text-xl font-bold text-fac-blue-600">
                              ₱{pricing.total.toLocaleString()}
                            </p>
                          </div>
                          {pricing.savings > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Your Savings
                              </label>
                              <p className="text-xl font-bold text-green-600">
                                ₱{pricing.savings.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="bg-fac-blue-100 p-3 rounded-lg">
                      <div className="flex items-center text-sm text-fac-blue-700 mb-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          Monthly Reset System
                        </span>
                      </div>
                      <p className="text-xs text-fac-blue-600">
                        All package benefits reset to full amount at the start
                        of each billing cycle. Unused washes from previous
                        months do not carry over.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-fac-blue-600 hover:bg-fac-blue-700 py-4 text-lg"
                      onClick={handleRenewal}
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Confirm Renewal - ₱{pricing.total.toLocaleString()}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lock-in Terms */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Important Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-orange-700">
                  <div>
                    <h5 className="font-semibold mb-2">
                      Monthly Reset Policy:
                    </h5>
                    <p>
                      • All package benefits (wash sessions) reset to full
                      amount at the start of each monthly billing cycle
                    </p>
                    <p>
                      • Unused washes from previous months do{" "}
                      <strong>NOT</strong> carry over
                    </p>
                    <p>
                      • Each billing cycle is independent - benefits are
                      consumed once per month only
                    </p>
                  </div>

                  <div className="pt-2 border-t border-orange-200">
                    <h5 className="font-semibold mb-2">Lock-in Terms:</h5>
                    <p>
                      • <strong>3-Month Lock-in:</strong> Minimum commitment of
                      3 months. Early cancellation incurs 50% penalty.
                    </p>
                    <p>
                      • <strong>6-Month Lock-in:</strong> Minimum commitment of
                      6 months. Early cancellation incurs 60% penalty.
                    </p>
                    <p>
                      • <strong>1-Year Lock-in:</strong> Minimum commitment of
                      12 months. Early cancellation incurs 70% penalty.
                    </p>
                    <p>
                      • <strong>Flexible Plan:</strong> Cancel anytime with 30
                      days notice, no penalty.
                    </p>
                  </div>

                  <p className="pt-2 border-t border-orange-200">
                    <strong>Note:</strong> Lock-in discounts are applied
                    upfront. Penalties are calculated based on remaining months
                    in the commitment period.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
