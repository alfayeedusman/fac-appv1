import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Calendar,
  Car,
  Droplets,
  Crown,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  User,
  Bell,
  RefreshCw,
  QrCode,
  Gift,
  CreditCard,
  Zap,
  Sparkles,
  Star,
  Shield,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

interface WashLog {
  id: string;
  service: string;
  date: string;
  status: "completed" | "scheduled" | "cancelled";
  amount: number;
  branch: string;
}

interface MembershipData {
  package: string;
  daysLeft: number;
  currentCycleStart: string;
  currentCycleEnd: string;
  daysLeftInCycle: number;
  autoRenewal: boolean;
  remainingWashes: {
    classic: number;
    vipProMax: number;
    premium: number;
  };
  totalWashes: {
    classic: number;
    vipProMax: number;
    premium: number;
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"benefits" | "activity">(
    "benefits",
  );

  const [membershipData] = useState<MembershipData>({
    package: "VIP Gold Ultimate",
    daysLeft: 28,
    currentCycleStart: "2024-01-01",
    currentCycleEnd: "2024-01-31",
    daysLeftInCycle: 15,
    autoRenewal: true,
    remainingWashes: {
      classic: 999,
      vipProMax: 3,
      premium: 1,
    },
    totalWashes: {
      classic: 999,
      vipProMax: 5,
      premium: 1,
    },
  });

  const [washLogs] = useState<WashLog[]>([
    {
      id: "1",
      service: "VIP ProMax Wash",
      date: "2024-01-15",
      status: "completed",
      amount: 0,
      branch: "Tumaga Hub",
    },
    {
      id: "2",
      service: "Classic AI Wash",
      date: "2024-01-10",
      status: "completed",
      amount: 0,
      branch: "Boalan Hub",
    },
    {
      id: "3",
      service: "Premium Detail",
      date: "2024-01-05",
      status: "completed",
      amount: 0,
      branch: "Tumaga Hub",
    },
  ]);

  const getRenewalUrgency = () => {
    if (membershipData.daysLeft <= 7) return "urgent";
    if (membershipData.daysLeft <= 14) return "warning";
    return "normal";
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    if (total === 999) return 100; // Unlimited
    return ((total - remaining) / total) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const urgency = getRenewalUrgency();

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-fac-orange-500/3 to-purple-500/3 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/3 to-fac-orange-500/3 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-xl animate-float animate-delay-300"></div>
      </div>

      <div className="px-6 py-8 max-w-md mx-auto relative z-10">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                alt="Fayeed Auto Care Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Hey, <span className="text-fac-orange-500">John</span>!
              </h1>
              <p className="text-sm text-muted-foreground">
                Ready for your next wash? ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Premium Membership Status Card */}
        <Card className="bg-card border shadow-md mb-6 animate-fade-in-up animate-delay-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-fac-orange-500 p-3 rounded-xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {membershipData.package}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Premium Member
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-fac-orange-50 dark:bg-fac-orange-950 rounded-xl px-3 py-2 border border-fac-orange-200 dark:border-fac-orange-800">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    EXPIRES IN
                  </p>
                  <p className="text-2xl font-bold text-fac-orange-500">
                    {membershipData.daysLeft}
                  </p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">
                      Cycle Resets
                    </span>
                    <RefreshCw className="h-4 w-4 text-fac-orange-500" />
                  </div>
                  <p className="font-semibold text-foreground">
                    {membershipData.daysLeftInCycle} days
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">
                      Auto-Renewal
                    </span>
                    {membershipData.autoRenewal ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="font-semibold text-foreground">
                    {membershipData.autoRenewal ? "Active" : "Disabled"}
                  </p>
                </div>
              </div>
              <Link to="/manage-subscription">
                <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-semibold rounded-lg py-2">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions with Modern Design */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/booking" className="animate-fade-in-up animate-delay-200">
            <Card className="bg-card border shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="bg-fac-orange-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-foreground mb-1">Book Wash</p>
                <p className="text-xs text-muted-foreground">
                  Schedule service
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile" className="animate-fade-in-up animate-delay-300">
            <Card className="bg-card border shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-foreground mb-1">Smart QR</p>
                <p className="text-xs text-muted-foreground">Instant access</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabbed Content */}
        <Card className="bg-card border shadow-md mb-6 animate-fade-in-up animate-delay-400">
          {/* Tab Headers */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("benefits")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "benefits"
                  ? "border-b-2 border-fac-orange-500 text-fac-orange-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Benefits</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "activity"
                  ? "border-b-2 border-fac-orange-500 text-fac-orange-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Recent Activity</span>
              </div>
            </button>
          </div>

          <CardContent className="p-4">
            {activeTab === "benefits" && (
              <div className="space-y-4">
                {/* Classic Unlimited */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Droplets className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">
                        AI Classic
                      </span>
                    </div>
                    <Badge className="bg-green-500 text-white text-xs">
                      UNLIMITED
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ∞ Unlimited AI-powered washes this month
                  </p>
                </div>

                {/* VIP ProMax */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">
                        VIP ProMax
                      </span>
                    </div>
                    <Badge className="bg-purple-500 text-white text-xs">
                      {membershipData.remainingWashes.vipProMax} LEFT
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${getProgressPercentage(
                          membershipData.remainingWashes.vipProMax,
                          membershipData.totalWashes.vipProMax,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {membershipData.remainingWashes.vipProMax} of{" "}
                    {membershipData.totalWashes.vipProMax} premium washes
                  </p>
                </div>

                {/* Premium Detail */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-fac-orange-500 p-2 rounded-lg">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">
                        Premium Detail
                      </span>
                    </div>
                    <Badge className="bg-fac-orange-500 text-white text-xs">
                      {membershipData.remainingWashes.premium} LEFT
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-fac-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${getProgressPercentage(
                          membershipData.remainingWashes.premium,
                          membershipData.totalWashes.premium,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {membershipData.remainingWashes.premium} luxury detail
                    remaining
                  </p>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-3">
                {washLogs.slice(0, 3).map((log, index) => (
                  <div
                    key={log.id}
                    className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-fac-orange-500 p-2 rounded-lg">
                          <Car className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {log.service}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{formatDate(log.date)}</span>
                            <span>•</span>
                            <span>{log.branch}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-600">
            <CardContent className="p-8 text-center">
              <div className="gradient-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">
                {washLogs.length}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                TOTAL WASHES
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-700">
            <CardContent className="p-8 text-center">
              <div className="gradient-secondary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">
                {
                  washLogs.filter(
                    (log) =>
                      new Date(log.date).getMonth() === new Date().getMonth(),
                  ).length
                }
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                THIS MONTH
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Background Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="grid grid-cols-5 items-center h-14">
              <Link
                to="/booking"
                className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-fac-orange-500 transition-colors"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Book</span>
              </Link>

              <Link
                to="/manage-subscription"
                className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-fac-orange-500 transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Plans</span>
              </Link>

              {/* Floating Home Button */}
              <div className="flex justify-center">
                <Link
                  to="/dashboard"
                  className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform -translate-y-3 transition-all duration-300 hover:scale-105"
                >
                  <Crown className="h-6 w-6" />
                </Link>
              </div>

              <Link
                to="/history"
                className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-fac-orange-500 transition-colors"
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs">History</span>
              </Link>

              <Link
                to="/profile"
                className="flex flex-col items-center justify-center space-y-1 text-gray-400 hover:text-fac-orange-500 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Home Button Background Circle */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"></div>
      </div>
    </div>
  );
}
