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
    <MobileLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, John!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationPanel>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-fac-orange-50 hover:bg-fac-orange-100"
              >
                <Bell className="h-5 w-5 text-fac-orange-600" />
              </Button>
            </NotificationPanel>
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-fac-orange-50 hover:bg-fac-orange-100"
              >
                <User className="h-5 w-5 text-fac-orange-600" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Membership Status Card */}
        <Card className="bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-white">
                <Crown className="h-6 w-6 mr-3 text-yellow-300" />
                <div>
                  <p className="text-lg font-bold">{membershipData.package}</p>
                  <p className="text-sm opacity-90">Membership</p>
                </div>
              </CardTitle>
              <div className="text-right">
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <p className="text-xs font-medium">EXPIRES IN</p>
                  <p className="text-lg font-bold">
                    {membershipData.daysLeft} days
                  </p>
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

              {/* Renewal Actions */}
              <div className="space-y-2">
                {urgency === "urgent" && (
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Now
                  </Button>
                )}
                {urgency === "warning" && (
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Early
                  </Button>
                )}
                <Link to="/manage-subscription">
                  <Button
                    variant="outline"
                    className="w-full border-fac-blue-600 text-fac-blue-600"
                  >
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/booking">
            <Card className="bg-white hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="bg-fac-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-fac-orange-600" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Book Wash</p>
                <p className="text-xs text-gray-600">Schedule service</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile">
            <Card className="bg-white hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="bg-fac-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-6 w-6 text-fac-orange-600" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">QR Code</p>
                <p className="text-xs text-gray-600">Quick scan</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Remaining Washes */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-fac-orange-600" />
                <span className="text-lg">Monthly Benefits</span>
              </div>
              <Badge
                variant="outline"
                className="border-fac-orange-200 text-fac-orange-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Resets {formatDate(membershipData.nextResetDate)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Classic Wash */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-fac-orange-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      <Droplets className="h-4 w-4 text-fac-orange-600" />
                    </div>
                    <span className="font-semibold">Classic Wash</span>
                  </div>
                  <span className="text-sm font-bold text-fac-orange-600">
                    {membershipData.remainingWashes.classic === 999
                      ? "∞"
                      : membershipData.remainingWashes.classic}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-fac-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width:
                        membershipData.remainingWashes.classic === 999
                          ? "100%"
                          : `${getProgressPercentage(membershipData.remainingWashes.classic, membershipData.totalWashes.classic)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {membershipData.remainingWashes.classic === 999
                    ? "Unlimited access"
                    : `${membershipData.remainingWashes.classic} of ${membershipData.totalWashes.classic} remaining`}
                </p>
              </div>

              {/* VIP ProMax */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-fac-orange-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      <Crown className="h-4 w-4 text-fac-orange-600" />
                    </div>
                    <span className="font-semibold">VIP ProMax</span>
                  </div>
                  <span className="text-sm font-bold text-fac-orange-600">
                    {membershipData.remainingWashes.vipProMax}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-fac-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${getProgressPercentage(membershipData.remainingWashes.vipProMax, membershipData.totalWashes.vipProMax)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {membershipData.remainingWashes.vipProMax} of{" "}
                  {membershipData.totalWashes.vipProMax} remaining
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
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-fac-orange-600" />
                Recent Activity
              </CardTitle>
              <Link
                to="/booking"
                className="text-fac-orange-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {washLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        log.status === "completed"
                          ? "bg-green-500"
                          : "bg-red-500",
                      )}
                    />
                    <div>
                      <p className="font-medium text-sm">{log.service}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
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
                    className="text-xs"
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-fac-orange-400 to-fac-orange-500 text-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{washLogs.length}</p>
              <p className="text-xs opacity-90">Total Washes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-400 to-green-500 text-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold">
                {
                  washLogs.filter((log) => log.date.startsWith("2024-01"))
                    .length
                }
              </p>
              <p className="text-xs opacity-90">This Month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
