import { useState, useEffect } from "react";
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
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";
import PaymentUploadModal from "@/components/PaymentUploadModal";
import PackageSelectionModal from "@/components/PackageSelectionModal";
import SubscriptionSubmission from "@/components/SubscriptionSubmission";
import {
  getUserSubscriptionStatus,
  getSubscriptionRequests,
} from "@/utils/subscriptionApprovalData";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showSubscriptionSubmission, setShowSubscriptionSubmission] =
    useState(false);
  const [currentPlan, setCurrentPlan] = useState("regular");
  const [subscriptionRequestStatus, setSubscriptionRequestStatus] = useState<{
    hasRequest: boolean;
    status: string | null;
    request: any | null;
  }>({ hasRequest: false, status: null, request: null });

  // Get real user data
  const userEmail = localStorage.getItem("userEmail") || "";
  const userSubscription = JSON.parse(
    localStorage.getItem(`subscription_${userEmail}`) || "null",
  );

  // Function to refresh subscription status
  const refreshSubscriptionStatus = () => {
    const status = getUserSubscriptionStatus(userEmail);
    setSubscriptionRequestStatus(status);
  };

  // Load subscription request status
  useEffect(() => {
    refreshSubscriptionStatus();
  }, [userEmail]);

  // Add focus event listener to refresh when page becomes visible
  useEffect(() => {
    const handleFocus = () => {
      refreshSubscriptionStatus();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        refreshSubscriptionStatus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [userEmail]);

  const currentSubscription: CurrentSubscription = {
    plan: userSubscription?.package || "Regular Member",
    price:
      userSubscription?.package === "Classic Pro"
        ? 500
        : userSubscription?.package === "VIP Silver Elite"
          ? 1500
          : userSubscription?.package === "VIP Gold Ultimate"
            ? 3000
            : 0,
    startDate:
      userSubscription?.currentCycleStart ||
      new Date().toISOString().split("T")[0],
    endDate:
      userSubscription?.currentCycleEnd ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    lockInPeriod: "Monthly (Flexible)",
    autoRenewal: userSubscription?.autoRenewal || false,
    status:
      userSubscription?.package !== "Regular Member" &&
      userSubscription?.daysLeft > 0
        ? "active"
        : "inactive",
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
    // Only allow renewal for active subscribers
    if (
      currentSubscription.status === "active" &&
      currentSubscription.plan !== "Regular Member"
    ) {
      setCurrentPlan(currentSubscription.plan.toLowerCase().replace(" ", "_"));
      setShowPaymentModal(true);
    }
  };

  const handleUpgrade = () => {
    // Show package selection modal for upgrades
    setShowPackageModal(true);
  };

  const handlePackageSelection = (packageId: string) => {
    setSelectedPlan(packageId);
    setCurrentPlan(currentSubscription.plan.toLowerCase().replace(" ", "_"));
    setShowPaymentModal(true);
  };

  const handleCancellation = () => {
    alert("Subscription cancelled. It will remain active until the end date.");
    setShowCancelDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100 pb-20">
      <StickyHeader showBack={true} title="Manage Plans" />

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

                {/* Payment Status Section */}
                {subscriptionRequestStatus.hasRequest && (
                  <div className="mt-6 p-4 border-orange-200 bg-orange-50 dark:bg-orange-950/30 rounded-xl border">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Payment Request Status
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          Request ID:
                        </span>
                        <p className="font-mono text-orange-900 dark:text-orange-100">
                          {subscriptionRequestStatus.request?.id}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          Package:
                        </span>
                        <p className="font-semibold text-orange-900 dark:text-orange-100">
                          {subscriptionRequestStatus.request?.packageType}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          Amount:
                        </span>
                        <p className="font-semibold text-orange-900 dark:text-orange-100">
                          {
                            subscriptionRequestStatus.request?.paymentDetails
                              ?.amount
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          Status:
                        </span>
                        <Badge
                          className={`ml-2 ${
                            subscriptionRequestStatus.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : subscriptionRequestStatus.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : subscriptionRequestStatus.status ===
                                    "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {subscriptionRequestStatus.status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {subscriptionRequestStatus.request?.reviewNotes && (
                      <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          Admin Notes:
                        </span>
                        <p className="text-orange-900 dark:text-orange-100 mt-1 text-sm">
                          {subscriptionRequestStatus.request.reviewNotes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <Link to="/payment-history">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          View Payment History
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Payment & Upgrade History */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Payment & Upgrade History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const allRequests = getSubscriptionRequests();
                      const userId = `user_${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
                      const userRequests = allRequests
                        .filter((req) => req.userId === userId)
                        .sort(
                          (a, b) =>
                            new Date(b.submissionDate).getTime() -
                            new Date(a.submissionDate).getTime(),
                        );

                      if (userRequests.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <div className="bg-muted/30 p-6 rounded-full w-fit mx-auto mb-4">
                              <CreditCard className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              No Payment History
                            </h3>
                            <p className="text-muted-foreground">
                              You haven't submitted any payment requests yet.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {userRequests.map((request, index) => (
                            <div
                              key={request.id}
                              className="p-4 border rounded-lg bg-background/50"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      request.status === "approved"
                                        ? "bg-green-100 dark:bg-green-900/30"
                                        : request.status === "pending"
                                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                                          : request.status === "rejected"
                                            ? "bg-red-100 dark:bg-red-900/30"
                                            : "bg-blue-100 dark:bg-blue-900/30"
                                    }`}
                                  >
                                    {request.status === "approved" ? (
                                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : request.status === "pending" ? (
                                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    ) : request.status === "rejected" ? (
                                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    ) : (
                                      <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-foreground">
                                      {request.packageType}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {index === 0
                                        ? "Latest Request"
                                        : `Request #${userRequests.length - index}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">
                                    {request.paymentDetails.amount}
                                  </p>
                                  <Badge
                                    className={`${
                                      request.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : request.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : request.status === "rejected"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {request.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-muted-foreground">
                                    Request ID:
                                  </span>
                                  <p className="font-mono text-foreground">
                                    {request.id}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">
                                    Payment Method:
                                  </span>
                                  <p className="capitalize text-foreground">
                                    {request.paymentMethod.replace("_", " ")}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-muted-foreground">
                                    Submitted:
                                  </span>
                                  <p className="text-foreground">
                                    {new Date(
                                      request.submissionDate,
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>

                              {request.reviewNotes && (
                                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                                  <span className="text-sm font-medium text-foreground">
                                    Admin Notes:
                                  </span>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {request.reviewNotes}
                                  </p>
                                </div>
                              )}

                              {request.reviewedBy && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Reviewed by {request.reviewedBy} on{" "}
                                  {new Date(
                                    request.reviewedDate!,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="text-center pt-4">
                            <Link to="/payment-history">
                              <Button variant="outline" className="w-full">
                                <CreditCard className="h-4 w-4 mr-2" />
                                View Complete Payment History
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  {(() => {
                    const isRegularMember =
                      currentSubscription.plan === "Regular Member";
                    const isActive =
                      currentSubscription.status === "active" &&
                      !isRegularMember;
                    const isExpired =
                      currentSubscription.status === "inactive" &&
                      !isRegularMember;

                    return (
                      <>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {isRegularMember
                              ? "Choose Your Package"
                              : isActive
                                ? "Manage Subscription"
                                : "Reactivate Account"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {isRegularMember
                              ? "Select a package to unlock premium services"
                              : isActive
                                ? "Renew or upgrade your current plan"
                                : "Your subscription has expired. Choose a package to continue"}
                          </p>
                        </div>

                        {isRegularMember ? (
                          // Regular member - show package selection or pending status
                          subscriptionRequestStatus.hasRequest &&
                          subscriptionRequestStatus.status === "pending" ? (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200 mb-4">
                              <div className="flex items-center mb-4">
                                <Clock className="h-6 w-6 text-yellow-500 mr-3" />
                                <div>
                                  <h4 className="font-bold text-yellow-800">
                                    Payment Under Review
                                  </h4>
                                  <p className="text-sm text-yellow-600">
                                    Your payment request is being processed
                                  </p>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3"
                                disabled
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Waiting for Approval
                              </Button>
                            </div>
                          ) : subscriptionRequestStatus.hasRequest &&
                            subscriptionRequestStatus.status === "rejected" ? (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200 mb-4">
                              <div className="flex items-center mb-4">
                                <XCircle className="h-6 w-6 text-red-500 mr-3" />
                                <div>
                                  <h4 className="font-bold text-red-800">
                                    Payment Request Rejected
                                  </h4>
                                  <p className="text-sm text-red-600">
                                    You can submit a new payment request
                                  </p>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-bold py-3"
                                onClick={handleUpgrade}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                              </Button>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200 mb-4">
                              <div className="flex items-center mb-4">
                                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                                <div>
                                  <h4 className="font-bold text-red-800">
                                    Regular Member
                                  </h4>
                                  <p className="text-sm text-red-600">
                                    Choose a package to unlock premium services
                                  </p>
                                </div>
                              </div>
                              <Button
                                className="w-full bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-bold py-3"
                                onClick={handleUpgrade}
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Choose Package
                              </Button>
                            </div>
                          )
                        ) : isExpired ? (
                          // Expired subscription - show reactivation
                          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200 mb-4">
                            <div className="flex items-center mb-4">
                              <XCircle className="h-6 w-6 text-orange-500 mr-3" />
                              <div>
                                <h4 className="font-bold text-orange-800">
                                  Subscription Expired
                                </h4>
                                <p className="text-sm text-orange-600">
                                  Reactivate your subscription to continue
                                </p>
                              </div>
                            </div>
                            <Button
                              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3"
                              onClick={handleUpgrade}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Reactivate Now
                            </Button>
                          </div>
                        ) : (
                          // Active subscription - show renew and upgrade
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3"
                              onClick={handleRenewal}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Confirm Renewal
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-fac-orange-500 text-fac-orange-600 hover:bg-fac-orange-50 py-3"
                              onClick={handleUpgrade}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              Upgrade Plan
                            </Button>
                          </div>
                        )}
                      </>
                    );
                  })()}
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

                  <div className="pt-6 mt-6 border-t border-gray-200 space-y-6">
                    <div className="bg-fac-blue-100 p-4 rounded-xl border border-fac-blue-200">
                      <div className="flex items-center text-sm text-fac-blue-700 mb-2">
                        <RefreshCw className="h-5 w-5 mr-3" />
                        <span className="font-semibold text-base">
                          Monthly Reset System
                        </span>
                      </div>
                      <p className="text-sm text-fac-blue-600 leading-relaxed">
                        All package benefits reset to full amount at the start
                        of each billing cycle. Unused washes from previous
                        months do not carry over.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center text-sm text-green-700 mb-2">
                        <Shield className="h-5 w-5 mr-3" />
                        <span className="font-semibold text-base">
                          Auto-Renewal Active
                        </span>
                      </div>
                      <p className="text-sm text-green-600 leading-relaxed">
                        Your subscription will automatically renew on the expiry
                        date. You can manage this setting anytime in your
                        account preferences.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-fac-blue-600 hover:bg-fac-blue-700 py-4 text-lg"
                      onClick={() => setShowSubscriptionSubmission(true)}
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

      <BottomNavigation />

      {/* Package Selection Modal */}
      <PackageSelectionModal
        isOpen={showPackageModal}
        onClose={() => {
          setShowPackageModal(false);
          // Refresh subscription status after package selection
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 1000);
        }}
        onSelectPackage={(packageType) => {
          handlePackageSelection(packageType);
          // Refresh subscription status after package selection
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 1000);
        }}
      />

      {/* Payment Upload Modal */}
      <PaymentUploadModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          // Refresh subscription status after payment upload
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 1000);
        }}
        currentPlan={currentPlan}
        selectedPlan={selectedPlan}
        planPrice={pricing.total}
        onStatusUpdate={() => {
          // Refresh subscription status immediately when payment is submitted
          refreshSubscriptionStatus();
        }}
      />

      {/* Subscription Submission Modal */}
      <SubscriptionSubmission
        isOpen={showSubscriptionSubmission}
        onClose={() => {
          setShowSubscriptionSubmission(false);
          // Refresh subscription status after submission
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 1000);
        }}
        userEmail={userEmail}
        userName={userEmail.split("@")[0]}
      />
    </div>
  );
}
