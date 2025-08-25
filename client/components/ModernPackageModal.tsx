import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Crown,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Shield,
  Clock,
  Gift,
  X,
} from "lucide-react";

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

interface ModernPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
  subscriptionRequestStatus?: {
    hasRequest: boolean;
    status: string | null;
    request: any | null;
  };
}

export default function ModernPackageModal({
  isOpen,
  onClose,
  onSelectPackage,
  subscriptionRequestStatus,
}: ModernPackageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with VIP Gold (popular)

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
    onSelectPackage(planId);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Choose Your Perfect Plan
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Unlock premium car care services with our flexible packages
          </p>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Pending Request Status */}
          {subscriptionRequestStatus?.hasRequest &&
            subscriptionRequestStatus?.status === "pending" && (
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
          <div className="flex justify-center mb-6">
            <Card
              className={`w-full max-w-sm overflow-hidden border-2 transition-all duration-300 ${
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
                    subscriptionRequestStatus?.hasRequest &&
                    subscriptionRequestStatus?.status === "pending"
                  }
                  className={`w-full py-3 font-semibold transition-all ${
                    currentPlan.popular
                      ? "bg-gradient-to-r from-fac-orange-500 to-yellow-500 hover:from-fac-orange-600 hover:to-yellow-600 text-white"
                      : "bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                  }`}
                >
                  {subscriptionRequestStatus?.hasRequest &&
                  subscriptionRequestStatus?.status === "pending" ? (
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

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-6">
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

          {/* All Plans Overview - Horizontal Scroll */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              All Plans
            </h3>
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
              {subscriptionPlans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`min-w-[180px] cursor-pointer transition-all hover:scale-105 ${
                    index === currentIndex ? "ring-2 ring-fac-orange-500" : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`p-1.5 rounded-lg bg-gradient-to-r ${plan.color} text-white`}
                      >
                        {plan.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
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
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Gift className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-1">
                    Special Launch Offer
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Get 30% off on VIP packages for your first 3 months. Limited
                    time offer!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
