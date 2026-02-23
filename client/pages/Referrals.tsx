import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Share2,
  Copy,
  Gift,
  TrendingUp,
  User,
  Check,
  Facebook,
  MessageCircle,
  Mail,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  rewardsEarned: number;
}

interface ReferralHistory {
  id: string;
  referredUserEmail?: string;
  status: "pending" | "completed" | "expired";
  rewardValue?: number;
  createdAt: string;
  completedAt?: string;
}

export default function Referrals() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch referral code
      const codeResponse = await fetch("/api/referrals/my-code", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (codeResponse.ok) {
        const codeData = await codeResponse.json();
        setReferralCode(codeData.code || null);
      }

      // Fetch stats
      const statsResponse = await fetch("/api/referrals/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch history
      const historyResponse = await fetch("/api/referrals/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.referrals || []);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const response = await fetch("/api/referrals/generate-code", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate code");

      const data = await response.json();
      setReferralCode(data.code);
      toast({
        title: "Success",
        description: "Referral code generated successfully!",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: "Failed to generate referral code",
        variant: "destructive",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleShare = (platform: string) => {
    const text = `Join me on FAC! Use my referral code ${referralCode} to get exclusive rewards.`;
    const url = window.location.origin;

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      email: `mailto:?subject=Join FAC&body=${encodeURIComponent(text)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <StickyHeader title="Referral Program" />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Referral Code Card */}
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-2">Your Referral Code</h2>
                  {referralCode ? (
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-lg border-2 border-primary">
                        <p className="text-4xl font-bold text-primary tracking-widest">
                          {referralCode}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleCopyCode(referralCode)}
                        className="w-full"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Generate your unique referral code to start earning rewards
                      </p>
                      <Button onClick={handleGenerateCode} disabled={generatingCode} className="w-full">
                        {generatingCode ? "Generating..." : "Generate Referral Code"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Buttons */}
        {referralCode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share Your Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleShare("whatsapp")}
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("facebook")}
                  size="sm"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("twitter")}
                  size="sm"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("email")}
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {loading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-3xl font-bold">{stats.totalReferrals}</p>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Check className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-3xl font-bold">{stats.completedReferrals}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <User className="w-8 h-8 text-orange-600 mx-auto" />
                  <p className="text-3xl font-bold">{stats.pendingReferrals}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Gift className="w-8 h-8 text-purple-600 mx-auto" />
                  <p className="text-3xl font-bold">{Math.round(stats.rewardsEarned)}</p>
                  <p className="text-xs text-muted-foreground">Rewards</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral History</CardTitle>
            <CardDescription>
              {history.length === 0
                ? "You haven't referred anyone yet"
                : `${history.length} referral${history.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {ref.referredUserEmail || "Pending user"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ref.status === "completed" && (
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                      {ref.status === "pending" && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                      {ref.rewardValue && (
                        <p className="font-semibold text-sm text-primary">
                          +{ref.rewardValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Start referring to earn rewards!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
