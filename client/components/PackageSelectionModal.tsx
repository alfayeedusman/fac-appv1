import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Crown,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

interface Package {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  color: string;
}

interface PackageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (packageId: string) => void;
}

export default function PackageSelectionModal({
  isOpen,
  onClose,
  onSelectPackage,
}: PackageSelectionModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [currentPackageIndex, setCurrentPackageIndex] = useState<number>(1); // Start with middle package (VIP Silver)

  // Admin-set packages
  const packages: Package[] = [
    {
      id: "classic",
      name: "Classic Pro",
      price: 500,
      features: [
        "4 classic wash sessions per month",
        "Basic member benefits",
        "Online booking access",
        "Customer support",
        "Monthly reset of all benefits",
      ],
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "vip-silver",
      name: "VIP Silver Elite",
      price: 1500,
      features: [
        "8 classic wash sessions per month",
        "2 VIP ProMax wash sessions per month",
        "Member discounts",
        "Priority support",
        "Loyalty points earning",
        "Monthly reset of all benefits",
      ],
      color: "from-gray-400 to-gray-600",
    },
    {
      id: "vip-gold",
      name: "VIP Gold Ultimate",
      price: 3000,
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
      color: "from-yellow-400 to-yellow-600",
    },
  ];

  const handleSwipeLeft = () => {
    setCurrentPackageIndex((prev) => Math.min(prev + 1, packages.length - 1));
  };

  const handleSwipeRight = () => {
    setCurrentPackageIndex((prev) => Math.max(prev - 1, 0));
  };

  const { swipeHandlers, swipeState } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 50,
  });

  useEffect(() => {
    if (isOpen) {
      setCurrentPackageIndex(1);
      setSelectedPackage("");
    }
  }, [isOpen]);

  const handleSelectPackage = () => {
    if (selectedPackage) {
      onSelectPackage(selectedPackage);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold text-foreground">
            <Crown className="h-7 w-7 mr-3 text-fac-orange-500" />
            Choose Your Package
          </DialogTitle>
          <DialogDescription>
            Select the perfect package that fits your car care needs
          </DialogDescription>
        </DialogHeader>

        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 py-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105",
                selectedPackage === pkg.id
                  ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 scale-105"
                  : "border-border hover:border-fac-orange-300",
                pkg.popular && "ring-2 ring-fac-orange-500/30",
              )}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-fac-orange-500 to-purple-600 text-white px-4 py-1 font-bold">
                    <Star className="h-3 w-3 mr-1" />
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center mx-auto mb-4 animate-pulse-glow`}
                >
                  {pkg.id === "classic" ? (
                    <Star className="h-8 w-8 text-white" />
                  ) : pkg.id === "vip-silver" ? (
                    <Sparkles className="h-8 w-8 text-white" />
                  ) : (
                    <Crown className="h-8 w-8 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">
                  {pkg.name}
                </h3>
                <div className="text-3xl font-black text-fac-orange-500 mb-1">
                  ₱{pkg.price.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center",
                    selectedPackage === pkg.id
                      ? "border-fac-orange-500 bg-fac-orange-500"
                      : "border-muted-foreground",
                  )}
                >
                  {selectedPackage === pkg.id && (
                    <CheckCircle className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipeable Carousel */}
        <div className="md:hidden py-6">
          <div className="relative">
            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-black/90 shadow-lg"
              onClick={handleSwipeRight}
              disabled={currentPackageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-black/90 shadow-lg"
              onClick={handleSwipeLeft}
              disabled={currentPackageIndex === packages.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Swipeable container */}
            <div className="overflow-hidden rounded-2xl" {...swipeHandlers}>
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(-${currentPackageIndex * 100}%)`,
                }}
              >
                {packages.map((pkg, index) => (
                  <div key={pkg.id} className="w-full flex-shrink-0 px-4">
                    <div
                      className={cn(
                        "relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                        selectedPackage === pkg.id
                          ? "border-fac-orange-500 bg-fac-orange-50/50 dark:bg-fac-orange-950/50 scale-105"
                          : "border-border",
                        pkg.popular && "ring-2 ring-fac-orange-500/30",
                        index === currentPackageIndex && "scale-105",
                        swipeState.isSwiping && "transition-none",
                      )}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-fac-orange-500 to-purple-600 text-white px-4 py-1 font-bold">
                            <Star className="h-3 w-3 mr-1" />
                            MOST POPULAR
                          </Badge>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center mx-auto mb-4 animate-pulse-glow`}
                        >
                          {pkg.id === "classic" ? (
                            <Star className="h-8 w-8 text-white" />
                          ) : pkg.id === "vip-silver" ? (
                            <Sparkles className="h-8 w-8 text-white" />
                          ) : (
                            <Crown className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2">
                          {pkg.name}
                        </h3>
                        <div className="text-3xl font-black text-fac-orange-500 mb-1">
                          ₱{pkg.price.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          per month
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        {pkg.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-start text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center",
                            selectedPackage === pkg.id
                              ? "border-fac-orange-500 bg-fac-orange-500"
                              : "border-muted-foreground",
                          )}
                        >
                          {selectedPackage === pkg.id && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center mt-4 gap-2">
              {packages.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    index === currentPackageIndex
                      ? "bg-fac-orange-500 w-6"
                      : "bg-muted-foreground/30",
                  )}
                  onClick={() => setCurrentPackageIndex(index)}
                />
              ))}
            </div>

            {/* Swipe hint */}
            {!swipeState.isSwiping && (
              <div className="text-center mt-3">
                <p className="text-xs text-muted-foreground">
                  👆 Swipe left or right to browse packages
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSelectPackage}
            disabled={!selectedPackage}
            className="bg-gradient-to-r from-fac-orange-500 to-purple-600 hover:from-fac-orange-600 hover:to-purple-700 text-white rounded-xl font-bold"
          >
            <Crown className="h-4 w-4 mr-2" />
            Continue with Selected Package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
