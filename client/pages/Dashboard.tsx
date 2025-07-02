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
} from "lucide-react";
import { cn } from "@/lib/utils";
import MobileLayout from "@/components/MobileLayout";
import NotificationPanel from "@/components/NotificationPanel";

interface WashLog {
  id: string;
  date: string;
  time: string;
  branch: string;
  service: string;
  status: "completed" | "cancelled";
}

interface MembershipData {
  package: string;
  startDate: string;
  expiryDate: string;
  daysLeft: number;
  currentCycleStart: string;
  currentCycleEnd: string;
  daysLeftInCycle: number;
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
  autoRenewal: boolean;
  nextResetDate: string;
}

export default function Dashboard() {
  const [membershipData, setMembershipData] = useState<MembershipData>({
    package: "VIP Gold",
    startDate: "2024-01-01",
    expiryDate: "2024-02-01",
    daysLeft: 8,
    currentCycleStart: "2024-01-01",
    currentCycleEnd: "2024-02-01",
    daysLeftInCycle: 8,
    remainingWashes: {
      classic: 999, // Unlimited
      vipProMax: 3,
      premium: 0, // Used this month
    },
    totalWashes: {
      classic: 999, // Unlimited
      vipProMax: 5,
      premium: 1,
    },
    autoRenewal: true,
    nextResetDate: "2024-02-01",
  });

  const [washLogs, setWashLogs] = useState<WashLog[]>([
    {
      id: "1",
      date: "2024-01-25",
      time: "10:30 AM",
      branch: "Tumaga",
      service: "VIP ProMax",
      status: "completed",
    },
    {
      id: "2",
      date: "2024-01-22",
      time: "2:15 PM",
      branch: "Boalan",
      service: "Classic Wash",
      status: "completed",
    },
    {
      id: "3",
      date: "2024-01-18",
      time: "9:45 AM",
      branch: "Tumaga",
      service: "Classic Wash",
      status: "completed",
    },
    {
      id: "4",
      date: "2024-01-15",
      time: "4:20 PM",
      branch: "Boalan",
      service: "Premium Wash",
      status: "completed",
    },
    {
      id: "5",
      date: "2024-01-12",
      time: "11:00 AM",
      branch: "Tumaga",
      service: "Classic Wash",
      status: "completed",
    },
  ]);

  const getRenewalUrgency = () => {
    if (membershipData.daysLeft <= 3) return "urgent";
    if (membershipData.daysLeft <= 7) return "warning";
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
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Welcome back, John!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationPanel>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
              >
                <Bell className="h-5 w-5 text-black" />
              </Button>
            </NotificationPanel>
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
              >
                <User className="h-5 w-5 text-black" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Membership Status Card */}
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-fac-orange-500 p-3 rounded-xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xl font-black text-black">
                    {membershipData.package}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    Membership Plan
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    EXPIRES IN
                  </p>
                  <p className="text-2xl font-black text-fac-orange-500">
                    {membershipData.daysLeft}
                  </p>
                  <p className="text-xs font-medium text-gray-500">days</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiry Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Cycle:</span>
                  <span className="font-semibold text-sm">
                    {formatDate(membershipData.currentCycleStart)} -{" "}
                    {formatDate(membershipData.currentCycleEnd)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cycle Resets In:</span>
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 text-fac-blue-500 mr-1" />
                    <span className="font-semibold text-fac-blue-600">
                      {membershipData.daysLeftInCycle} days
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Auto-renewal:</span>
                  <div className="flex items-center">
                    {membershipData.autoRenewal ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm">
                      {membershipData.autoRenewal ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  {urgency === "urgent" && (
                    <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew Now
                    </Button>
                  )}
                  {urgency === "warning" && (
                    <Button className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold rounded-lg">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew Early
                    </Button>
                  )}
                  <Link to="/manage-subscription" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-black hover:bg-gray-50 font-bold rounded-lg"
                    >
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/booking">
            <Card className="bg-white border border-gray-100 hover:shadow-lg hover:border-fac-orange-500 transition-all group">
              <CardContent className="p-6 text-center">
                <div className="bg-black w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-fac-orange-500 transition-colors">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <p className="font-black text-black mb-2">Book Wash</p>
                <p className="text-xs text-gray-500 font-medium">
                  Schedule service
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile">
            <Card className="bg-white border border-gray-100 hover:shadow-lg hover:border-fac-orange-500 transition-all group">
              <CardContent className="p-6 text-center">
                <div className="bg-black w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-fac-orange-500 transition-colors">
                  <QrCode className="h-7 w-7 text-white" />
                </div>
                <p className="font-black text-black mb-2">QR Code</p>
                <p className="text-xs text-gray-500 font-medium">Quick scan</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Remaining Washes */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black text-black">
                  Monthly Benefits
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-gray-300 text-gray-600 font-bold"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Resets {formatDate(membershipData.nextResetDate)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Classic Wash */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                      <Droplets className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-black">Classic Wash</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-fac-orange-500">
                      {membershipData.remainingWashes.classic === 999
                        ? "∞"
                        : membershipData.remainingWashes.classic}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                  <div
                    className="bg-fac-orange-500 h-3 rounded-full transition-all"
                    style={{
                      width:
                        membershipData.remainingWashes.classic === 999
                          ? "100%"
                          : `${getProgressPercentage(membershipData.remainingWashes.classic, membershipData.totalWashes.classic)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-3">
                  {membershipData.remainingWashes.classic === 999
                    ? "UNLIMITED ACCESS"
                    : `${membershipData.remainingWashes.classic} OF ${membershipData.totalWashes.classic} REMAINING`}
                </p>
              </div>

              {/* VIP ProMax */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-black">VIP ProMax</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-fac-orange-500">
                      {membershipData.remainingWashes.vipProMax}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                  <div
                    className="bg-fac-orange-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${getProgressPercentage(membershipData.remainingWashes.vipProMax, membershipData.totalWashes.vipProMax)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-3">
                  {membershipData.remainingWashes.vipProMax} OF{" "}
                  {membershipData.totalWashes.vipProMax} REMAINING
                </p>
              </div>

              {/* Premium Wash */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-fac-orange-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      <Gift className="h-4 w-4 text-fac-orange-600" />
                    </div>
                    <span className="font-semibold">Premium Wash</span>
                  </div>
                  <span className="text-sm font-bold text-fac-orange-600">
                    {membershipData.remainingWashes.premium}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-fac-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${getProgressPercentage(membershipData.remainingWashes.premium, membershipData.totalWashes.premium)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {membershipData.remainingWashes.premium} of{" "}
                  {membershipData.totalWashes.premium} remaining
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="bg-fac-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-fac-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-medium">Monthly Reset System:</span>
                </div>
                <p className="text-xs text-fac-blue-600 mt-1">
                  Unused washes expire at cycle end. All benefits reset to full
                  amount on {formatDate(membershipData.nextResetDate)}.
                </p>
              </div>
              <Link to="/booking">
                <Button className="w-full bg-fac-blue-600 hover:bg-fac-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Wash
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-black">Recent Activity</span>
              </CardTitle>
              <Link
                to="/booking"
                className="text-fac-orange-500 text-sm font-bold hover:text-fac-orange-600"
              >
                VIEW ALL
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {washLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full",
                        log.status === "completed"
                          ? "bg-green-500"
                          : "bg-red-500",
                      )}
                    />
                    <div>
                      <p className="font-black text-black text-sm">
                        {log.service}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
                        <span>{formatDate(log.date)}</span>
                        <span>•</span>
                        <span>{log.time}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {log.branch}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      log.status === "completed" ? "default" : "destructive"
                    }
                    className={cn(
                      "text-xs font-bold",
                      log.status === "completed"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200",
                    )}
                  >
                    {log.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-fac-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-black text-black mb-1">
                {washLogs.length}
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                TOTAL WASHES
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-black w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-black text-black mb-1">
                {
                  washLogs.filter((log) => log.date.startsWith("2024-01"))
                    .length
                }
              </p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                THIS MONTH
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center space-y-1 bg-fac-orange-50 text-fac-orange-500"
          >
            <Crown className="h-5 w-5" />
            <span className="text-xs font-bold">Home</span>
          </Link>
          <Link
            to="/booking"
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-black"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Booking</span>
          </Link>
          <Link
            to="/manage-subscription"
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-black"
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs font-medium">Plans</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-black"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
