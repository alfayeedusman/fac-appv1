import { useState, useEffect } from "react";
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
  Star,
  Shield,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SwipeablePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
  subscriptionRequestStatus?: {
    hasRequest: boolean;
    status: string | null;
    request: any | null;
  };
}

export default function SwipeablePackageModal({
  isOpen,
  onClose,
  onSelectPackage,
  subscriptionRequestStatus,
}: SwipeablePackageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with VIP Gold (popular)
  const [startX, setStartX] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const packages = [
    {
      id: "classic",
      name: "Classic",
      price: 500,
      originalPrice: null,
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
      popular: true,
      color: "from-fac-orange-500 to-yellow-500",
      icon: <Crown className="h-8 w-8" />,
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
      color: "from-purple-500 to-pink-500",
      icon: <Star className="h-8 w-8" />,
      features: [
        "8 classic wash sessions",
        "2 VIP ProMax sessions",
        "Member discounts",
        "Priority support",
        "Loyalty points",
      ],
    },
  ];

  const isPending =
    subscriptionRequestStatus?.hasRequest &&
    subscriptionRequestStatus?.status === "pending";

  const currentPackage = packages[currentIndex];

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % packages.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = startX - endX;

    // Minimum swipe distance to trigger navigation
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextSlide(); // Swipe left - next slide
      } else {
        prevSlide(); // Swipe right - previous slide
      }
    }

    setStartX(null);
  };

  // Mouse handlers for desktop dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!startX) return;

    const endX = e.clientX;
    const deltaX = startX - endX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setStartX(null);
  };

  // Reset to VIP Gold when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(1);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
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
          <p className="text-muted-foreground text-sm text-left">
            Swipe left or right to browse packages
          </p>
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

          {/* Package Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {packages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-fac-orange-500 w-8"
                    : "bg-muted w-2"
                }`}
                disabled={isAnimating}
              />
            ))}
          </div>

          {/* Swipeable Package Container */}
          <div className="relative mb-6">
            <Card
              className={`transition-all duration-300 cursor-grab active:cursor-grabbing ${
                currentPackage.popular
                  ? "border-fac-orange-500 ring-2 ring-fac-orange-500/20"
                  : "border-border"
              } ${isAnimating ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              {/* Popular Badge */}
              {currentPackage.popular && (
                <div className="bg-gradient-to-r from-fac-orange-500 to-yellow-500 text-white text-center py-3 px-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-bold text-sm">MOST POPULAR</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              )}

              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`p-4 rounded-full bg-gradient-to-r ${currentPackage.color} text-white`}
                  >
                    {currentPackage.icon}
                  </div>
                </div>

                {/* Package Name */}
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {currentPackage.name}
                </h3>

                {/* Pricing */}
                <div className="mb-6">
                  {currentPackage.originalPrice && (
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-lg text-muted-foreground line-through">
                        ₱{currentPackage.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-red-500 text-white text-xs">
                        {currentPackage.discount}
                      </Badge>
                    </div>
                  )}
                  <div className="text-3xl font-bold text-fac-orange-500">
                    ₱{currentPackage.price.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">per month</p>
                  {currentPackage.originalPrice && (
                    <p className="text-green-600 font-semibold text-sm mt-2">
                      Save ₱
                      {(
                        currentPackage.originalPrice - currentPackage.price
                      ).toLocaleString()}
                      /month
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {currentPackage.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 text-left"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  onClick={() =>
                    !isPending && onSelectPackage(currentPackage.id)
                  }
                  disabled={isPending}
                  className={`w-full py-3 font-semibold transition-all ${
                    currentPackage.popular
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
                    `Select ${currentPackage.name}`
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              disabled={isAnimating}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={isAnimating}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Package Counter */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} of {packages.length} packages
            </p>
          </div>

          {/* All Packages Quick View */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Quick Compare
            </h4>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className={`min-w-[140px] cursor-pointer transition-all hover:scale-105 ${
                    index === currentIndex
                      ? "ring-2 ring-fac-orange-500 border-fac-orange-500"
                      : "border-border"
                  }`}
                  onClick={() => goToSlide(index)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex justify-center mb-2">
                      <div
                        className={`p-1.5 rounded-lg bg-gradient-to-r ${pkg.color} text-white`}
                      >
                        {pkg.icon}
                      </div>
                    </div>
                    <h4 className="font-semibold text-xs text-foreground">
                      {pkg.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      ₱{pkg.price.toLocaleString()}
                    </p>
                    {pkg.popular && (
                      <Badge className="bg-fac-orange-500 text-white text-xs mt-1">
                        Popular
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Special Offer */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
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
