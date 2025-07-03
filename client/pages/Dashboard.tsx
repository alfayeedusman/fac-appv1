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
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNavigation from "@/components/BottomNavigation";
import NotificationDropdown from "@/components/NotificationDropdown";
import { LogoutModal } from "@/components/ConfirmModal";
import StickyHeader from "@/components/StickyHeader";
import QRScanner from "@/components/QRScanner";
import QRScanSuccessModal from "@/components/QRScanSuccessModal";
import AdBanner from "@/components/AdBanner";
import { getVisibleAdsForUser, Ad } from "@/utils/adsUtils";

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

  // Get real user data from localStorage
  const userEmail = localStorage.getItem("userEmail") || "";
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

  // Get user-specific wash logs
  const getUserWashLogs = (): WashLog[] => {
    const userLogs = JSON.parse(
      localStorage.getItem(`washLogs_${userEmail}`) || "[]",
    );
    return userLogs;
  };

  const [washLogs] = useState<WashLog[]>(getUserWashLogs());

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
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100 pb-20">
      <StickyHeader showBack={false} title="Dashboard" />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-gradient-to-r from-fac-orange-500/3 to-purple-500/3 blur-3xl animate-breathe"></div>
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
                Hey,{" "}
                <span className="text-fac-orange-500">
                  {currentUser?.fullName?.split(" ")[0] ||
                    userEmail.split("@")[0]}
                </span>
                !
              </h1>
              <p className="text-sm text-muted-foreground">
                Ready for your next wash? ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <NotificationDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutModal(true)}
              className="rounded-full hover:bg-muted hover:text-red-500 transition-colors"
              title="Logout"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Regular Member Upgrade Reminder */}
        {isRegularMember && (
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mb-6 animate-fade-in-up animate-delay-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-500 p-3 rounded-xl animate-pulse">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-800">
                      Regular Member
                    </p>
                    <p className="text-sm text-red-600">
                      Upgrade to unlock premium services!
                    </p>
                  </div>
                </div>
                <Link to="/manage-subscription">
                  <Button className="bg-gradient-to-r from-fac-orange-500 to-red-500 hover:from-fac-orange-600 hover:to-red-600 text-white font-bold animate-pulse">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white/50 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-2">
                  🌟 Unlock Premium Benefits:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />{" "}
                    Monthly car washes
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> VIP
                    services
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />{" "}
                    Priority booking
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />{" "}
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
        <Card
          className={`border shadow-md mb-6 animate-fade-in-up animate-delay-200 ${
            statusColor === "red"
              ? "bg-red-50 border-red-200"
              : statusColor === "orange"
                ? "bg-orange-50 border-orange-200"
                : "bg-green-50 border-green-200"
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
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
                  <p className="text-xl font-bold text-foreground">
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
                  className={`rounded-xl px-3 py-2 border ${
                    statusColor === "orange"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    EXPIRES IN
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      statusColor === "orange"
                        ? "text-orange-500"
                        : "text-green-500"
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">
                        Classic
                      </span>
                      <Car className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {membershipData.remainingWashes.classic === 999
                            ? "∞"
                            : membershipData.remainingWashes.classic}
                        </span>
                        <span className="text-xs text-muted-foreground">
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
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">
                        VIP ProMax
                      </span>
                      <Crown className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {membershipData.remainingWashes.vipProMax}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{membershipData.totalWashes.vipProMax}
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(
                          membershipData.remainingWashes.vipProMax,
                          membershipData.totalWashes.vipProMax,
                        )}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Link to="/booking">
                    <Button className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white flex-1 mr-2">
                      <Car className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                  <Link to="/manage-subscription">
                    <Button
                      variant="outline"
                      className="border-fac-orange-500 text-fac-orange-600 hover:bg-fac-orange-50 flex-1 ml-2"
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

        {/* Rest of the dashboard content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="glass border-border shadow-xl animate-fade-in-up animate-delay-300">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Zap className="h-5 w-5 mr-2 text-fac-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover-lift"
                  onClick={handleQRScan}
                >
                  <QrCode className="h-6 w-6 text-fac-orange-500" />
                  <span className="text-sm font-medium">Scan QR</span>
                </Button>
                <Link to="/booking">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 w-full hover-lift"
                  >
                    <Calendar className="h-6 w-6 text-blue-500" />
                    <span className="text-sm font-medium">Book Service</span>
                  </Button>
                </Link>
                <Link to="/voucher">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 w-full hover-lift"
                  >
                    <Gift className="h-6 w-6 text-purple-500" />
                    <span className="text-sm font-medium">Vouchers</span>
                  </Button>
                </Link>
                <Link to="/history">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 w-full hover-lift"
                  >
                    <History className="h-6 w-6 text-green-500" />
                    <span className="text-sm font-medium">History</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {washLogs.length > 0 && (
            <Card className="glass border-border shadow-xl animate-fade-in-up animate-delay-400">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {washLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 glass rounded-xl hover-lift"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            log.status === "completed"
                              ? "bg-green-500"
                              : log.status === "scheduled"
                                ? "bg-blue-500"
                                : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium text-foreground">
                            {log.service}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.branch}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {log.date}
                        </p>
                        <Badge
                          variant={
                            log.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation onQRScan={handleQRScan} />

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanComplete={handleScanComplete}
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
