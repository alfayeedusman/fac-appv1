import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, CheckCircle, Star, Shield, X, Clock } from "lucide-react";

interface SimplePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
  subscriptionRequestStatus?: {
    hasRequest: boolean;
    status: string | null;
    request: any | null;
  };
}

export default function SimplePackageModal({
  isOpen,
  onClose,
  onSelectPackage,
  subscriptionRequestStatus,
}: SimplePackageModalProps) {
  const packages = [
    {
      id: "classic",
      name: "Classic",
      price: 500,
      originalPrice: null,
      color: "from-blue-500 to-cyan-500",
      icon: <Shield className="h-6 w-6" />,
      features: [
        "4 classic wash sessions",
        "Basic member benefits",
        "Online booking access",
        "Customer support",
      ],
    },
    {
      id: "vip-silver",
      name: "VIP Silver",
      price: 1050,
      originalPrice: 1500,
      discount: "30% OFF",
      color: "from-purple-500 to-pink-500",
      icon: <Star className="h-6 w-6" />,
      features: [
        "8 classic wash sessions",
        "2 VIP ProMax sessions",
        "Member discounts",
        "Priority support",
        "Loyalty points",
      ],
    },
    {
      id: "vip-gold",
      name: "VIP Gold",
      price: 2100,
      originalPrice: 3000,
      discount: "30% OFF",
      popular: true,
      color: "from-fac-orange-500 to-yellow-500",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Unlimited classic washes",
        "5 VIP ProMax sessions",
        "1 Premium wash session",
        "Priority booking",
        "Exclusive benefits",
        "Premium support",
      ],
    },
  ];

  const isPending =
    subscriptionRequestStatus?.hasRequest &&
    subscriptionRequestStatus?.status === "pending";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Choose Your Package
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
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Pending Request Warning */}
          {isPending && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Payment Under Review
                    </h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      You have a pending payment request
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative cursor-pointer transition-all hover:scale-105 ${
                  pkg.popular
                    ? "border-fac-orange-500 ring-2 ring-fac-orange-500/20"
                    : "border-border hover:border-fac-orange-300"
                }`}
                onClick={() => !isPending && onSelectPackage(pkg.id)}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-fac-orange-500 text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      POPULAR
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-3 rounded-full bg-gradient-to-r ${pkg.color} text-white`}
                    >
                      {pkg.icon}
                    </div>
                  </div>

                  {/* Package Name */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {pkg.name}
                  </h3>

                  {/* Pricing */}
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">
                          ₱{pkg.originalPrice.toLocaleString()}
                        </span>
                        <Badge className="bg-red-500 text-white text-xs">
                          {pkg.discount}
                        </Badge>
                      </div>
                    )}
                    <div className="text-2xl font-bold text-fac-orange-500">
                      ₱{pkg.price.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">per month</p>
                    {pkg.originalPrice && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        Save ₱{(pkg.originalPrice - pkg.price).toLocaleString()}
                        /month
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {pkg.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-left"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <Button
                    onClick={() => !isPending && onSelectPackage(pkg.id)}
                    disabled={isPending}
                    className={`w-full ${
                      pkg.popular
                        ? "bg-gradient-to-r from-fac-orange-500 to-yellow-500 hover:from-fac-orange-600 hover:to-yellow-600 text-white"
                        : "bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Under Review
                      </>
                    ) : (
                      `Select ${pkg.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Special Offer */}
          <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  🎉 Special Launch Offer
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Get 30% off on VIP packages for your first 3 months!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
