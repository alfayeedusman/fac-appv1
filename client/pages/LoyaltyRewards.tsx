import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Gift, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import StickyHeader from "@/components/StickyHeader";

interface Reward {
  id: string;
  title: string;
  description: string;
  icon?: string;
  pointsCost: number;
  category?: string;
  availability?: "available" | "limited" | "unavailable";
  quantity?: number;
}

interface UserLoyalty {
  currentPoints: number;
}

export default function LoyaltyRewards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"cost" | "cost-desc">("cost");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
    fetchUserLoyalty();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gamification/rewards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch rewards");

      const data = await response.json();
      setRewards(data.rewards || []);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLoyalty = async () => {
    try {
      const response = await fetch("/api/gamification/dashboard/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserLoyalty({
          currentPoints: data.currentPoints || data.loyaltyData?.currentPoints || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching user loyalty:", error);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const response = await fetch("/api/gamification/loyalty/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ rewardId }),
      });

      if (!response.ok) throw new Error("Failed to redeem reward");

      toast({
        title: "Success",
        description: "Reward redeemed successfully!",
      });

      fetchUserLoyalty();
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast({
        title: "Error",
        description: "Failed to redeem reward",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  // Filter and sort rewards
  let filteredRewards = rewards.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "cost") {
    filteredRewards = filteredRewards.sort((a, b) => a.pointsCost - b.pointsCost);
  } else {
    filteredRewards = filteredRewards.sort((a, b) => b.pointsCost - a.pointsCost);
  }

  const categories = Array.from(new Set(rewards.map((r) => r.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader title="Rewards Catalog" />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Current Points */}
        {userLoyalty && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Points</p>
                  <p className="text-3xl font-bold">{userLoyalty.currentPoints.toLocaleString()}</p>
                </div>
                <Gift className="w-12 h-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <Input
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost">Points: Low to High</SelectItem>
                <SelectItem value="cost-desc">Points: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {categories.length > 0 && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat || ""}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rewards Grid */}
        {!loading && (
          <>
            {filteredRewards.length > 0 ? (
              <div className="space-y-3">
                {filteredRewards.map((reward) => {
                  const hasEnoughPoints = userLoyalty && userLoyalty.currentPoints >= reward.pointsCost;

                  return (
                    <Card key={reward.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                              <Gift className="w-6 h-6 text-primary" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{reward.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {reward.description}
                                </p>
                              </div>
                              {reward.availability === "limited" && (
                                <Badge variant="outline" className="whitespace-nowrap">
                                  Limited
                                </Badge>
                              )}
                            </div>

                            {/* Points Cost and Button */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary">
                                  {reward.pointsCost.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground">points</span>
                              </div>

                              <Button
                                onClick={() => handleRedeemReward(reward.id)}
                                disabled={!hasEnoughPoints || redeeming === reward.id || reward.availability === "unavailable"}
                                size="sm"
                              >
                                {redeeming === reward.id ? (
                                  <>
                                    <span className="animate-spin mr-2">⚙️</span>
                                    Redeeming...
                                  </>
                                ) : hasEnoughPoints ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Redeem
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Not Enough
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
