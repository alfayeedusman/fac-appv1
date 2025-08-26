import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Ad, dismissAd } from "@/utils/adsUtils";

interface AdBannerProps {
  ad: Ad;
  userEmail: string;
  onDismiss?: (adId: string) => void;
  className?: string;
  variant?: "popup" | "banner" | "inline";
}

export default function AdBanner({
  ad,
  userEmail,
  onDismiss,
  className,
  variant = "popup",
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (variant === "popup") {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [variant]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissAd(ad.id, userEmail);
    onDismiss?.(ad.id);
  };

  if (!isVisible) return null;

  const PopupWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in-0">
      <div
        className={cn(
          "w-full max-w-lg transform transition-all duration-300",
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100",
        )}
      >
        {children}
      </div>
    </div>
  );

  const BannerWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={cn("w-full", className)}>{children}</div>
  );

  const Wrapper = variant === "popup" ? PopupWrapper : BannerWrapper;

  return (
    <Wrapper>
      <Card
        className={cn(
          "relative overflow-hidden border-2",
          variant === "popup" &&
            "shadow-2xl border-fac-orange-200 dark:border-fac-orange-800",
          variant === "banner" &&
            "border-fac-blue-200 dark:border-fac-blue-800",
          variant === "inline" && "border-gray-200 dark:border-gray-800",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black shadow-sm"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-0">
          {ad.imageUrl && ad.imageUrl.trim() !== "" && (
            <div className="relative h-32 sm:h-40 overflow-hidden">
              <img
                src={ad.imageUrl}
                alt={ad.title || "Advertisement"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn(`Failed to load ad image: ${ad.imageUrl}`);
                  e.currentTarget.style.display = "none";
                  // Show fallback content
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex items-center justify-center h-full bg-muted">
                        <p class="text-muted-foreground text-sm">Image unavailable</p>
                      </div>
                    `;
                  }
                }}
                onLoad={() => {
                  console.log(`Successfully loaded ad image: ${ad.imageUrl}`);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-12">
                <h3 className="text-white font-bold text-lg leading-tight">
                  {ad.title}
                </h3>
              </div>
            </div>
          )}

          <div className={cn("p-4", !ad.imageUrl && "pt-8")}>
            {!ad.imageUrl && (
              <h3 className="font-bold text-lg mb-3 text-foreground pr-8">
                {ad.title}
              </h3>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {ad.content}
            </p>

            {variant === "popup" && (
              <div className="flex gap-2">
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600"
                  onClick={handleDismiss}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Learn More
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        {/* Decorative gradient border for popup variant */}
        {variant === "popup" && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-fac-orange-500 via-purple-500 to-fac-blue-500 p-[2px] pointer-events-none">
            <div className="h-full w-full rounded-lg bg-background" />
          </div>
        )}
      </Card>
    </Wrapper>
  );
}
