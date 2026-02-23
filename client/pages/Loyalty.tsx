import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Gift, Zap, Flame, Crown, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints?: number;
  discountPercentage: number;
  icon: string;
  color: string;
  benefits: string[];
}

interface LoyaltyProgress {
  currentPoints: number;
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  percentToNextTier: number;
  lifetimePoints: number;
  totalWashes: number;
  consecutiveMonths: number;
}

const TIER_ICONS: Record<string, any> = {
  bronze: Flame,
  silver: Zap,
  gold: Crown,
  platinum: Zap,
};

const TIER_COLORS: Record<string, string> = {
  bronze: "bg-amber-100 text-amber-900 border-amber-200",
  silver: "bg-slate-100 text-slate-900 border-slate-200",
  gold: "bg-yellow-100 text-yellow-900 border-yellow-200",
  platinum: "bg-purple-100 text-purple-900 border-purple-200",
};

export default function Loyalty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyProgress | null>(null);

  useEffect(() => {
    fetchLoyaltyProgress();
  }, []);

  const fetchLoyaltyProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gamification/dashboard/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch loyalty data");

      const data = await response.json();
      setLoyaltyData(data.loyaltyData || data);
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
      toast({
        title: "Error",
        description: "Failed to load loyalty information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <StickyHeader title="Loyalty & Rewards" />
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <StickyHeader title="Loyalty & Rewards" />
        <div className="max-w-2xl mx-auto p-4">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">Failed to load loyalty data</p>
              <Button onClick={fetchLoyaltyProgress} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const TierIcon = TIER_ICONS[loyaltyData.currentTier.name.toLowerCase()] || Crown;

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader title="Loyalty & Rewards" />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Tier Display */}
        <Card className={cn("border-2", TIER_COLORS[loyaltyData.currentTier.name.toLowerCase()])}>
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <TierIcon className="w-16 h-16 opacity-80" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{loyaltyData.currentTier.name}</h2>
                <p className="text-sm opacity-75">Member Tier</p>
              </div>

              {/* Discount Badge */}
              <div className="inline-block">
                <Badge variant="secondary" className="text-base py-1">
                  {loyaltyData.currentTier.discountPercentage}% Discount
                </Badge>
              </div>

              {/* Tier Benefits */}
              <div className="pt-2 space-y-2">
                {loyaltyData.currentTier.benefits.map((benefit, idx) => (
                  <p key={idx} className="text-sm">
                    ✓ {benefit}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Current Points */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Points</p>
                <div className="text-5xl font-bold text-primary">
                  {loyaltyData.currentPoints.toLocaleString()}
                </div>
              </div>

              {/* Progress to Next Tier */}
              {loyaltyData.nextTier && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress to {loyaltyData.nextTier.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {loyaltyData.pointsToNextTier.toLocaleString()} points needed
                    </span>
                  </div>
                  <Progress
                    value={loyaltyData.percentToNextTier}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {Math.round(loyaltyData.percentToNextTier)}% complete
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{loyaltyData.totalWashes}</p>
                <p className="text-xs text-muted-foreground">Total Washes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{loyaltyData.consecutiveMonths}</p>
                <p className="text-xs text-muted-foreground">Months</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Gift className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{loyaltyData.lifetimePoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Lifetime</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/loyalty/rewards")}
            className="w-full"
            variant="default"
          >
            <Gift className="w-4 h-4 mr-2" />
            View Rewards
          </Button>
          <Button
            onClick={() => navigate("/loyalty/history")}
            className="w-full"
            variant="outline"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>
    </div>
  );
}
