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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch packages from API when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/supabase/packages");
      const data = await response.json();

      if (data.success && data.packages) {
        const fetchedPackages = data.packages.map((pkg: any, index: number) => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price || 0,
          originalPrice: null,
          color: index === 0 ? "from-blue-500 to-cyan-500" :
                 index === 1 ? "from-fac-orange-500 to-yellow-500" :
                 "from-purple-500 to-pink-500",
          icon: index === 0 ? <Shield className="h-8 w-8" /> :
                index === 1 ? <Crown className="h-8 w-8" /> :
                <Star className="h-8 w-8" />,
          features: pkg.features ? JSON.parse(typeof pkg.features === 'string' ? pkg.features : JSON.stringify(pkg.features)) : [],
          popular: pkg.isFeatured || index === 1,
          isActive: pkg.isActive !== false,
        }));
        setPackages(fetchedPackages);
        // Find popular package or default to 0
        const popularIndex = fetchedPackages.findIndex(p => p.popular);
        setCurrentIndex(popularIndex >= 0 ? popularIndex : 0);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      // Set default fallback packages
      setPackages([
        {
          id: "classic",
          name: "Classic",
          price: 500,
          color: "from-blue-500 to-cyan-500",
          icon: <Shield className="h-8 w-8" />,
          features: ["4 classic wash sessions", "Basic benefits"],
        },
        {
          id: "vip-gold",
          name: "VIP Gold",
          price: 3000,
          color: "from-fac-orange-500 to-yellow-500",
          icon: <Crown className="h-8 w-8" />,
          features: ["Unlimited sessions", "Premium support"],
          popular: true,
        },
        {
          id: "vip-silver",
          name: "VIP Silver",
          price: 1500,
          color: "from-purple-500 to-pink-500",
          icon: <Star className="h-8 w-8" />,
          features: ["8 sessions", "Priority support"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isPending =
    subscriptionRequestStatus?.hasRequest &&
    subscriptionRequestStatus?.status === "pending";

  const currentPackage = packages.length > 0 ? packages[currentIndex] : null;

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
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] p-0 gap-0 overflow-y-auto">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            Choose Your Package
          </DialogTitle>
          <p className="text-muted-foreground text-sm text-left">
            Swipe left or right to browse packages
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 overflow-y-auto">
          {/* Loading State with Skeleton Loaders */}
          {loading && !currentPackage && (
            <div className="space-y-4 sm:space-y-6">
              {/* Indicators Skeleton */}
              <div className="flex justify-center space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
                    style={{ width: i === 2 ? "32px" : "8px" }}
                  />
                ))}
              </div>

              {/* Package Card Skeleton */}
              <Card className="border-gray-200 dark:border-gray-700">
                {/* Popular Badge Skeleton */}
                <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />

                <CardContent className="p-4 sm:p-6 lg:p-8">
                  {/* Icon Skeleton */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </div>

                  {/* Title Skeleton */}
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4 sm:mb-6 w-3/4 mx-auto" />

                  {/* Price Skeleton */}
                  <div className="space-y-2 mb-6 sm:mb-8">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-2/3 mx-auto" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/3 mx-auto" />
                  </div>

                  {/* Features Skeleton */}
                  <div className="space-y-3 mb-6 sm:mb-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex-1" />
                      </div>
                    ))}
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Request Warning */}
          {isPending && currentPackage && (
            <Card className="mb-4 sm:mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
              <CardContent className="p-3 sm:p-4">
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

          {currentPackage && (
            <>
          {/* Package Indicators */}
          <div className="flex justify-center space-x-2 mb-4 sm:mb-6">
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
          <div className="relative mb-4 sm:mb-6">
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
                <div className="bg-gradient-to-r from-fac-orange-500 to-yellow-500 text-white text-center py-2 sm:py-3 px-3 sm:px-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-bold text-xs sm:text-sm">
                      MOST POPULAR
                    </span>
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                </div>
              )}

              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className={`p-3 sm:p-4 rounded-full bg-gradient-to-r ${currentPackage.color} text-white`}
                  >
                    {currentPackage.icon}
                  </div>
                </div>

                {/* Package Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  {currentPackage.name}
                </h3>

                {/* Pricing */}
                <div className="mb-4 sm:mb-6">
                  {currentPackage.originalPrice && (
                    <div className="flex items-center justify-center space-x-2 mb-1 sm:mb-2">
                      <span className="text-sm sm:text-lg text-muted-foreground line-through">
                        ₱{currentPackage.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-red-500 text-white text-xs">
                        {currentPackage.discount}
                      </Badge>
                    </div>
                  )}
                  <div className="text-2xl sm:text-3xl font-bold text-fac-orange-500">
                    ₱{currentPackage.price.toLocaleString()}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    per month
                  </p>
                  {currentPackage.originalPrice && (
                    <p className="text-green-600 font-semibold text-xs sm:text-sm mt-1 sm:mt-2">
                      Save ₱
                      {(
                        currentPackage.originalPrice - currentPackage.price
                      ).toLocaleString()}
                      /month
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {currentPackage.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 sm:space-x-3 text-left"
                    >
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <Button
                  onClick={() =>
                    !isPending && onSelectPackage(currentPackage.id)
                  }
                  disabled={isPending}
                  className={`w-full py-2 sm:py-3 text-sm sm:text-base font-semibold transition-all ${
                    currentPackage.popular
                      ? "bg-gradient-to-r from-fac-orange-500 to-yellow-500 hover:from-fac-orange-600 hover:to-yellow-600 text-white"
                      : "bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                  }`}
                >
                  {isPending ? (
                    <>
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="text-xs sm:text-sm">Under Review</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm">
                      Select {currentPackage.name}
                    </span>
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
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={isAnimating}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Package Counter */}
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {currentIndex + 1} of {packages.length} packages
            </p>
          </div>

          {/* All Packages Quick View */}
          <div className="mb-3 sm:mb-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">
              Quick Compare
            </h4>
            <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 scrollbar-thin">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className={`min-w-[100px] sm:min-w-[120px] cursor-pointer transition-all hover:scale-105 ${
                    index === currentIndex
                      ? "ring-2 ring-fac-orange-500 border-fac-orange-500"
                      : "border-border"
                  }`}
                  onClick={() => goToSlide(index)}
                >
                  <CardContent className="p-2 sm:p-3 text-center">
                    <div className="flex justify-center mb-1 sm:mb-2">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg bg-gradient-to-r ${pkg.color} text-white`}
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
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 text-sm sm:text-base">
                  🎉 Special Launch Offer
                </h4>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">
                  Get 30% off on VIP packages for your first 3 months!
                </p>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
