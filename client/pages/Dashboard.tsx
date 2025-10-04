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
  Home,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationDropdown from "@/components/NotificationDropdown";
import { LogoutModal } from "@/components/ConfirmModal";
import StickyHeader from "@/components/StickyHeader";
import LevelProgress from "@/components/LevelProgress";
import QRScanner from "@/components/QRScanner";
import AdminFeaturesShowcase from "@/components/AdminFeaturesShowcase";
import QRScanSuccessModal from "@/components/QRScanSuccessModal";
import AdBanner from "@/components/AdBanner";
import CreditCardProfile from "@/components/CreditCardProfile";
import { getVisibleAdsForUser, Ad } from "@/utils/adsUtils";
import {
  getCMSContent,
  getMemberPerks,
  initializeCMSData,
} from "@/utils/cmsData";
import { neonDbClient } from "@/services/neonDatabaseService";

interface WashLog {
  id: string;
  service: string;
  date: string;
  status:
    | "completed"
    | "scheduled"
    | "cancelled"
    | "pending"
    | "confirmed"
    | "in-progress";
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

interface QRScanResult {
  type: "branch" | "service" | "customer";
  branchId?: string;
  branchName?: string;
  serviceId?: string;
  customerId?: string;
  timestamp: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"benefits" | "activity">(
    "benefits",
  );
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [dashboardAds, setDashboardAds] = useState<Ad[]>([]);
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  // Get real user data from localStorage
  const userEmail = localStorage.getItem("userEmail") || "";

  // Handle scroll to show refresh button
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowRefreshButton(scrollPosition > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const registeredUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]",
  );
  const currentUser = registeredUsers.find(
    (user: any) => user.email === userEmail,
  );

  // Get user's subscription data or set defaults for new users
  const getUserMembershipData = (): MembershipData => {
    const userSubscription = JSON.parse(
      localStorage.getItem(`subscription_${userEmail}`) || "null",
    );

    if (userSubscription) {
      return userSubscription;
    }

    // Default for new regular members
    return {
      package: "Regular Member",
      daysLeft: 0,
      currentCycleStart: new Date().toISOString().split("T")[0],
      currentCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysLeftInCycle: 30,
      autoRenewal: false,
      remainingWashes: {
        classic: 0,
        vipProMax: 0,
        premium: 0,
      },
      totalWashes: {
        classic: 0,
        vipProMax: 0,
        premium: 0,
      },
    };
  };

  const [membershipData] = useState<MembershipData>(getUserMembershipData());

  // Recent activity items (bookings)
  const [washLogs, setWashLogs] = useState<WashLog[]>([]);

  // Load from backend with fallback to local demo logs
  useEffect(() => {
    const loadActivity = async () => {
      const role = localStorage.getItem("userRole") || "user";
      const email = userEmail;

      // Try backend first
      const connected = neonDbClient.getConnectionStatus();
      if (connected && email) {
        const res = await neonDbClient.getBookings({
          userEmail: email,
          userRole: role,
        });
        if (res.success && res.bookings) {
          const logs: WashLog[] = res.bookings
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((b) => ({
              id: b.id,
              service: b.service || b.category || "Service",
              date: new Date(b.createdAt || b.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              ),
              status: (b.status as any) || "pending",
              amount: b.totalPrice || b.basePrice || 0,
              branch: b.branch || "Unknown",
            }));
          setWashLogs(logs);
          return;
        }
      }

      // Fallback to local logs
      const userLogs = JSON.parse(
        localStorage.getItem(`washLogs_${email}`) || "[]",
      );
      setWashLogs(userLogs);
    };
    loadActivity();
  }, [userEmail]);

  useEffect(() => {
    // Initialize CMS data
    initializeCMSData();

    // Load ads for dashboard page
    if (userEmail) {
      const ads = getVisibleAdsForUser("dashboard", userEmail);
      setDashboardAds(ads);

      // Show popup ad if available and user just logged in
      const shouldShowPopup = localStorage.getItem("justLoggedIn");
      if (shouldShowPopup === "true" && ads.length > 0) {
        setShowPopupAd(true);
        localStorage.removeItem("justLoggedIn");
      }
    }
  }, [userEmail]);

  const getRenewalUrgency = () => {
    if (membershipData.daysLeft <= 7) return "urgent";
    if (membershipData.daysLeft <= 14) return "warning";
    return "normal";
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    if (total === 999) return 100; // Unlimited
    return ((total - remaining) / total) * 100;
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleScanComplete = (result: string) => {
    // Process QR scan result
    const scanData: QRScanResult = {
      type: "branch",
      branchId: "tumaga-001",
      branchName: "Tumaga Hub",
      timestamp: new Date().toISOString(),
    };

    setScanResult(scanData);
    setShowQRScanner(false);
    setShowScanSuccess(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleAdDismiss = (adId: string) => {
    setDashboardAds((prev) => prev.filter((ad) => ad.id !== adId));
    setShowPopupAd(false);
  };

  // Status and color system
  const isRegularMember = membershipData.package === "Regular Member";
  const hasActiveSubscription =
    membershipData.package !== "Regular Member" && membershipData.daysLeft > 0;
  const isVipGold = membershipData.package === "VIP Gold Ultimate";

  // Color system: Red = Not subscribed, Green = Subscribed, Orange = Premium VIP
  const getStatusColor = () => {
    if (isRegularMember || !hasActiveSubscription) return "red";
    if (isVipGold && hasActiveSubscription) return "orange";
    return "green";
  };

  const statusColor = getStatusColor();
  const statusText = isRegularMember
    ? "Not Subscribed"
    : hasActiveSubscription
      ? "Active"
      : "Expired";

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden pb-20">
      <StickyHeader showBack={false} title="Dashboard" />

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-fac-orange-500/[0.02] blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-blue-500/[0.02] blur-2xl"></div>
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto relative z-10">
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Hey,{" "}
                <span className="text-fac-orange-500">
                  {currentUser?.fullName?.split(" ")[0] ||
                    userEmail.split("@")[0]}
                </span>
                !
              </h1>
              <p className="text-sm text-muted-foreground">
                {getCMSContent("home_greeting_text")?.content ||
                  "Ready for your next wash?"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {/* Admin Access Button - Show for admin/superadmin users */}
            {(localStorage.getItem("userRole") === "admin" ||
              localStorage.getItem("userRole") === "superadmin") && (
              <Link to="/admin-dashboard">
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}

            {/* Notification Only */}
            <NotificationDropdown />
          </div>
        </div>

        {/* Futuristic Regular Member Upgrade Reminder */}
        {isRegularMember && (
          <Card className="glass border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50/80 to-orange-50/80 dark:from-red-950/50 dark:to-orange-950/50 mb-6 animate-fade-in-up animate-delay-100 relative overflow-hidden hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-red-800 dark:text-red-200">
                      Regular Member
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-300 font-medium">
                      Upgrade to unlock premium services!
                    </p>
                  </div>
                </div>
                <Link to="/manage-subscription">
                  <Button className="bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-bold hover-lift">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="glass rounded-lg p-4">
                <h4 className="font-black text-red-800 dark:text-red-200 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-fac-orange-500" />
                  🌟 Unlock Premium Benefits:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-red-700 dark:text-red-300">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />{" "}
                    Monthly car washes
                  </div>
                  <div className="flex items-center text-red-700 dark:text-red-300">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> VIP
                    services
                  </div>
                  <div className="flex items-center text-red-700 dark:text-red-300">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />{" "}
                    Priority booking
                  </div>
                  <div className="flex items-center text-red-700 dark:text-red-300">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />{" "}
                    Exclusive discounts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Ads */}
        {dashboardAds.length > 0 && (
          <div className="mb-6">
            {dashboardAds.map((ad) => (
              <AdBanner
                key={ad.id}
                ad={ad}
                userEmail={userEmail}
                variant="banner"
                onDismiss={handleAdDismiss}
                className="mb-4"
              />
            ))}
          </div>
        )}

        {/* Membership Status Card */}
        <Card className="border shadow-sm mb-6 relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 w-1 h-full ${
              statusColor === "red"
                ? "bg-red-500"
                : statusColor === "orange"
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
          ></div>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-xl ${
                    statusColor === "red"
                      ? "bg-red-500"
                      : statusColor === "orange"
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                >
                  {statusColor === "red" ? (
                    <User className="h-6 w-6 text-white" />
                  ) : statusColor === "orange" ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-foreground">
                    {membershipData.package}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        statusColor === "red"
                          ? "bg-red-500"
                          : statusColor === "orange"
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <p
                      className={`text-sm font-semibold ${
                        statusColor === "red"
                          ? "text-red-600"
                          : statusColor === "orange"
                            ? "text-orange-600"
                            : "text-green-600"
                      }`}
                    >
                      {statusText}
                    </p>
                  </div>
                </div>
              </div>
              {hasActiveSubscription && (
                <div
                  className={`rounded-lg px-3 py-2 border self-start sm:self-auto ${
                    statusColor === "orange"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    EXPIRES IN
                  </p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${
                      statusColor === "orange"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {membershipData.daysLeft}
                  </p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!hasActiveSubscription ? (
              <div className="text-center py-4">
                <p className="text-red-600 font-semibold mb-4">
                  No active subscription
                </p>
                <Link to="/manage-subscription">
                  <Button className="bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-bold w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    Activate Subscription
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground text-sm font-medium">
                        Classic
                      </span>
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Car className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">
                          {membershipData.remainingWashes.classic === 999
                            ? "∞"
                            : membershipData.remainingWashes.classic}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          /
                          {membershipData.totalWashes.classic === 999
                            ? "∞"
                            : membershipData.totalWashes.classic}
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(
                          membershipData.remainingWashes.classic,
                          membershipData.totalWashes.classic,
                        )}
                        className="h-3 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground text-sm font-medium">
                        VIP ProMax
                      </span>
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">
                          {membershipData.remainingWashes.vipProMax}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          /{membershipData.totalWashes.vipProMax}
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(
                          membershipData.remainingWashes.vipProMax,
                          membershipData.totalWashes.vipProMax,
                        )}
                        className="h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/booking" className="flex-1">
                    <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-xl">
                      <Car className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                  <Link to="/my-bookings" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 py-3 rounded-xl"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      My Bookings
                    </Button>
                  </Link>
                  <Link to="/manage-subscription" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-fac-orange-500 text-fac-orange-600 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 font-bold py-3 rounded-xl"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level Progress */}
        {/* Admin Features Showcase - Only for admin users */}
        {(localStorage.getItem("userRole") === "admin" ||
          localStorage.getItem("userRole") === "superadmin") && (
          <div className="mb-8 animate-fade-in-up animate-delay-150">
            <AdminFeaturesShowcase />
          </div>
        )}

        <div className="mb-6 animate-fade-in-up animate-delay-200">
          <LevelProgress
            userId={userEmail}
            compact={true}
            showDetails={false}
          />
        </div>

        {/* Clean Tabs */}
        <div className="mb-6">
          <div className="bg-muted rounded-lg p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab("benefits")}
                className={cn(
                  "flex items-center justify-center py-3 px-4 text-sm font-medium rounded-md transition-all",
                  activeTab === "benefits"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Benefits
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={cn(
                  "flex items-center justify-center py-3 px-4 text-sm font-medium rounded-md transition-all",
                  activeTab === "activity"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <History className="h-4 w-4 mr-2" />
                Recent Activity
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "benefits" && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-foreground">
                <div className="bg-fac-orange-500 p-3 rounded-xl mr-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                Membership Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* Wash Cycle Progress Bars */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Monthly Wash Cycles
                </h3>

                {/* Classic Wash Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          Classic Wash
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Basic premium service
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {membershipData.remainingWashes.classic === 999
                          ? "∞"
                          : `${membershipData.remainingWashes.classic}/${membershipData.totalWashes.classic}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {membershipData.remainingWashes.classic === 999
                          ? "Unlimited"
                          : "remaining"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        membershipData.remainingWashes.classic === 999
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 w-full"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width:
                          membershipData.remainingWashes.classic === 999
                            ? "100%"
                            : `${getProgressPercentage(
                                membershipData.remainingWashes.classic,
                                membershipData.totalWashes.classic,
                              )}%`,
                      }}
                    ></div>
                  </div>
                  {membershipData.remainingWashes.classic === 999 && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-bold">
                        MAX LEVEL - UNLIMITED
                      </span>
                      <Star className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* VIP ProMax Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          VIP ProMax
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Premium luxury service
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {membershipData.remainingWashes.vipProMax === 999
                          ? "∞"
                          : `${membershipData.remainingWashes.vipProMax}/${membershipData.totalWashes.vipProMax}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {membershipData.remainingWashes.vipProMax === 999
                          ? "Unlimited"
                          : "remaining"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        membershipData.remainingWashes.vipProMax === 999
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 w-full"
                          : "bg-purple-500"
                      }`}
                      style={{
                        width:
                          membershipData.remainingWashes.vipProMax === 999
                            ? "100%"
                            : `${getProgressPercentage(
                                membershipData.remainingWashes.vipProMax,
                                membershipData.totalWashes.vipProMax,
                              )}%`,
                      }}
                    ></div>
                  </div>
                  {membershipData.remainingWashes.vipProMax === 999 && (
                    <div className="flex items-center justify-center space-x-2 text-purple-600">
                      <Crown className="h-4 w-4" />
                      <span className="text-sm font-bold">
                        MAX LEVEL - UNLIMITED
                      </span>
                      <Crown className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Premium Wash Progress */}
                {membershipData.totalWashes.premium > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-fac-orange-500 p-2 rounded-lg">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">
                            Premium Elite
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Ultimate luxury experience
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {membershipData.remainingWashes.premium === 999
                            ? "∞"
                            : `${membershipData.remainingWashes.premium}/${membershipData.totalWashes.premium}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {membershipData.remainingWashes.premium === 999
                            ? "Unlimited"
                            : "remaining"}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          membershipData.remainingWashes.premium === 999
                            ? "bg-gradient-to-r from-fac-orange-500 to-yellow-500 w-full"
                            : "bg-fac-orange-500"
                        }`}
                        style={{
                          width:
                            membershipData.remainingWashes.premium === 999
                              ? "100%"
                              : `${getProgressPercentage(
                                  membershipData.remainingWashes.premium,
                                  membershipData.totalWashes.premium,
                                )}%`,
                        }}
                      ></div>
                    </div>
                    {membershipData.remainingWashes.premium === 999 && (
                      <div className="flex items-center justify-center space-x-2 text-fac-orange-600">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-bold">
                          MAX LEVEL - UNLIMITED
                        </span>
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Benefits */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Member Perks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getMemberPerks()
                    .filter((perk) => perk.enabled)
                    .map((perk) => {
                      const iconMap = {
                        Calendar,
                        Shield,
                        Crown,
                        Star,
                        Gift,
                        Sparkles,
                      };
                      const IconComponent =
                        iconMap[perk.icon as keyof typeof iconMap] || Star;

                      return (
                        <div
                          key={perk.id}
                          className="flex items-center space-x-3 bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors"
                        >
                          <IconComponent
                            className={`h-5 w-5 text-${perk.color}`}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {perk.title}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-foreground">
                <div className="bg-blue-500 p-3 rounded-xl mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {washLogs.length > 0 ? (
                <div className="space-y-4">
                  {washLogs.slice(0, 3).map((log, index) => (
                    <div
                      key={log.id}
                      className="bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              log.status === "completed"
                                ? "bg-green-500"
                                : log.status === "scheduled"
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                          <div>
                            <p className="font-bold text-foreground">
                              {log.service}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.branch} • {log.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <Badge
                            variant={
                              log.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className={cn(
                              "font-bold mb-1",
                              log.status === "completed" &&
                                "bg-green-500 text-white",
                              log.status === "scheduled" &&
                                "bg-blue-500 text-white",
                            )}
                          >
                            {log.status}
                          </Badge>
                          <p className="text-sm font-bold text-foreground">
                            ₱{log.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link to="/history">
                      <Button
                        variant="outline"
                        className="glass hover-lift font-bold"
                      >
                        <History className="h-4 w-4 mr-2" />
                        View All History
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-fac-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    No Recent Activity
                  </h3>
                  <p className="text-muted-foreground mb-6 px-4">
                    Book your first wash to get started!
                  </p>
                  <Link to="/booking">
                    <Button className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Your First Wash
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation onQRScan={handleQRScan} />

      {/* Scroll-based Refresh Button */}
      {showRefreshButton && (
        <div className="fixed bottom-24 right-6 z-40">
          <Button
            onClick={() => window.location.reload()}
            className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white rounded-full p-3 shadow-lg"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      )}

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={(result) => {
          setScanResult(result);
          setShowQRScanner(false);
          setShowScanSuccess(true);
        }}
      />

      <QRScanSuccessModal
        isOpen={showScanSuccess}
        onClose={() => setShowScanSuccess(false)}
        scanResult={scanResult}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      {/* Popup Ad */}
      {showPopupAd && dashboardAds.length > 0 && (
        <AdBanner
          ad={dashboardAds[0]}
          userEmail={userEmail}
          variant="popup"
          onDismiss={handleAdDismiss}
        />
      )}
    </div>
  );
}
