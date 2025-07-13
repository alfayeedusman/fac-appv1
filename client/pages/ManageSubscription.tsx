import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Shield,
  Clock,
  Gift,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";
import PaymentUploadModal from "@/components/PaymentUploadModal";
import PackageSelectionModal from "@/components/PackageSelectionModal";
import { getUserSubscriptionStatus } from "@/utils/subscriptionApprovalData";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  period: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon: React.ReactNode;
  savings?: number;
}

export default function ManageSubscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("vip-gold");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1); // Start with VIP Gold (popular)
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

  useEffect(() => {
    refreshSubscriptionStatus();
  }, [userEmail]);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "classic",
      name: "Classic",
      price: 500,
      period: "Monthly",
      color: "from-blue-500 to-cyan-500",
      icon: <Shield className="h-8 w-8" />,
      features: [
        "4 classic wash sessions",
        "Basic member benefits",
        "Online booking access",
        "Customer support",
      ],
    },
    {
      id: "vip-gold",
      name: "VIP Gold",
      price: 2100,
      originalPrice: 3000,
      discount: "30% OFF",
      period: "Monthly",
      popular: true,
      color: "from-fac-orange-500 to-yellow-500",
      icon: <Crown className="h-8 w-8" />,
      savings: 900,
      features: [
        "Unlimited classic washes",
        "5 VIP ProMax sessions",
        "1 Premium wash session",
        "Priority booking",
        "Exclusive benefits",
        "Premium support",
      ],
    },
    {
      id: "vip-silver",
      name: "VIP Silver",
      price: 1050,
      originalPrice: 1500,
      discount: "30% OFF",
      period: "Monthly",
      color: "from-purple-500 to-pink-500",
      icon: <Star className="h-8 w-8" />,
      savings: 450,
      features: [
        "8 classic wash sessions",
        "2 VIP ProMax sessions",
        "Member discounts",
        "Priority support",
        "Loyalty points",
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Show package selection modal
    setShowPackageModal(true);
  };

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => (prev + 1) % subscriptionPlans.length);
  };

  const handleSwipeRight = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + subscriptionPlans.length) % subscriptionPlans.length,
    );
  };

  const currentPlan = subscriptionPlans[currentIndex];
  const isRegularMember =
    !userSubscription || userSubscription.package === "Regular Member";

  return (
    <div className="min-h-screen bg-background theme-transition pb-20">
      <StickyHeader showBack={true} title="Choose Package" />

      <div className="px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Choose Your Perfect Plan
          </h1>
          <p className="text-muted-foreground">
            Unlock premium car care services with our flexible packages
          </p>
        </div>

        {/* Current Subscription Status */}
        {!isRegularMember && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Current Plan: {userSubscription.package}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Active until{" "}
                    {new Date(
                      userSubscription.currentCycleEnd,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Request Status */}
        {subscriptionRequestStatus.hasRequest &&
          subscriptionRequestStatus.status === "pending" && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Payment Under Review
                    </h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Your payment request is being processed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Package Cards - Swipable */}
        <div className="relative mb-8">
          {/* Package Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {subscriptionPlans.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-fac-orange-500 w-8"
                    : "bg-muted w-2"
                }`}
              />
            ))}
          </div>

          {/* Main Package Card */}
          <div className="flex justify-center">
            <Card
              className={`w-full max-w-sm mx-4 overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                currentPlan.popular
                  ? "border-fac-orange-500 shadow-lg shadow-fac-orange-500/20"
                  : "border-border"
              }`}
            >
              {/* Popular Badge */}
              {currentPlan.popular && (
                <div className="bg-gradient-to-r from-fac-orange-500 to-yellow-500 text-white text-center py-2 px-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-bold text-sm">MOST POPULAR</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              )}

              <CardContent className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-4 rounded-full bg-gradient-to-r ${currentPlan.color} text-white mb-4`}
                  >
                    {currentPlan.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {currentPlan.name}
                  </h2>

                  {/* Pricing */}
                  <div className="space-y-1">
                    {currentPlan.originalPrice && (
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg text-muted-foreground line-through">
                          ₱{currentPlan.originalPrice.toLocaleString()}
                        </span>
                        <Badge className="bg-red-500 text-white text-xs">
                          {currentPlan.discount}
                        </Badge>
                      </div>
                    )}
                    <div className="text-3xl font-bold text-fac-orange-500">
                      ₱{currentPlan.price.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">
                      per {currentPlan.period.toLowerCase()}
                    </p>
                    {currentPlan.savings && (
                      <p className="text-green-600 font-semibold text-sm">
                        Save ₱{currentPlan.savings.toLocaleString()} per month!
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPlan(currentPlan.id)}
                  disabled={
                    subscriptionRequestStatus.hasRequest &&
                    subscriptionRequestStatus.status === "pending"
                  }
                  className={`w-full py-3 font-semibold transition-all ${
                    currentPlan.popular
                      ? "bg-gradient-to-r from-fac-orange-500 to-yellow-500 hover:from-fac-orange-600 hover:to-yellow-600 text-white"
                      : "bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                  }`}
                >
                  {subscriptionRequestStatus.hasRequest &&
                  subscriptionRequestStatus.status === "pending" ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Under Review
                    </>
                  ) : (
                    <>
                      <span>Select {currentPlan.name}</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Buttons - Mobile */}
          <div className="flex justify-between items-center mt-6 px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeRight}
              className="rounded-full"
            >
              ←
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} of {subscriptionPlans.length}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeLeft}
              className="rounded-full"
            >
              →
            </Button>
          </div>
        </div>

        {/* All Plans Overview - Horizontal Scroll */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            All Plans
          </h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin">
            {subscriptionPlans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`min-w-[240px] cursor-pointer transition-all hover:scale-105 ${
                  index === currentIndex ? "ring-2 ring-fac-orange-500" : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${plan.color} text-white`}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {plan.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ₱{plan.price.toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                  {plan.popular && (
                    <Badge className="bg-fac-orange-500 text-white text-xs">
                      Popular
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Info */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Gift className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Special Launch Offer
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Get 30% off on VIP packages for your first 3 months. Limited
                  time offer!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />

      {/* Package Selection Modal */}
      <PackageSelectionModal
        isOpen={showPackageModal}
        onClose={() => {
          setShowPackageModal(false);
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 1000);
        }}
        onSelectPackage={(packageType) => {
          setShowPackageModal(false);
          // Handle package selection logic here
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
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 1000);
        }}
        currentPlan={userSubscription?.package || "regular"}
        selectedPlan={selectedPlan}
        planPrice={currentPlan.price}
        onStatusUpdate={() => {
          refreshSubscriptionStatus();
        }}
      />
    </div>
  );
}
