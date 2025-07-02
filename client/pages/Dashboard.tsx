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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export default function Dashboard() {
  const [membershipData, setMembershipData] = useState<MembershipData>({
    package: "VIP Gold",
    startDate: "2024-01-01",
    expiryDate: "2024-02-01",
    daysLeft: 8,
    remainingWashes: {
      classic: 999, // Unlimited
      vipProMax: 3,
      premium: 1,
    },
    totalWashes: {
      classic: 999, // Unlimited
      vipProMax: 5,
      premium: 1,
    },
    autoRenewal: true,
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
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-fac-blue-900">Dashboard</h1>
            <p className="text-fac-blue-700">Welcome back, John!</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Membership Status Card */}
        <Card className="mb-6 border-l-4 border-l-fac-blue-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-fac-gold-500" />
                {membershipData.package} Membership
              </CardTitle>
              <Badge
                className={cn(
                  "text-white",
                  urgency === "urgent" && "bg-red-500",
                  urgency === "warning" && "bg-orange-500",
                  urgency === "normal" && "bg-green-500",
                )}
              >
                {membershipData.daysLeft} days left
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiry Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expires on:</span>
                  <span className="font-semibold">
                    {formatDate(membershipData.expiryDate)}
                  </span>
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

        {/* Remaining Washes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-fac-blue-600" />
              Remaining Washes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Classic Wash */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Classic Wash</span>
                  <span className="text-sm text-gray-600">
                    {membershipData.remainingWashes.classic === 999
                      ? "Unlimited"
                      : `${membershipData.remainingWashes.classic} left`}
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

              {/* VIP ProMax */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">VIP ProMax</span>
                  <span className="text-sm text-gray-600">
                    {membershipData.remainingWashes.vipProMax} of{" "}
                    {membershipData.totalWashes.vipProMax} left
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

              {/* Premium Wash */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Premium Wash</span>
                  <span className="text-sm text-gray-600">
                    {membershipData.remainingWashes.premium} of{" "}
                    {membershipData.totalWashes.premium} left
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(
                    membershipData.remainingWashes.premium,
                    membershipData.totalWashes.premium,
                  )}
                  className="h-2"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
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
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-fac-blue-600" />
                Recent Car Wash Logs
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {washLogs.slice(0, 4).map((log) => (
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center p-4">
            <div className="bg-fac-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Car className="h-6 w-6 text-fac-blue-600" />
            </div>
            <p className="text-2xl font-bold text-fac-blue-900">
              {washLogs.length}
            </p>
            <p className="text-sm text-gray-600">Total Washes</p>
          </Card>

          <Card className="text-center p-4">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">
              {washLogs.filter((log) => log.date.startsWith("2024-01")).length}
            </p>
            <p className="text-sm text-gray-600">This Month</p>
          </Card>

          <Card className="text-center p-4">
            <div className="bg-fac-gold-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Crown className="h-6 w-6 text-fac-gold-600" />
            </div>
            <p className="text-2xl font-bold text-fac-gold-700">150</p>
            <p className="text-sm text-gray-600">Loyalty Points</p>
          </Card>

          <Card className="text-center p-4">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">2</p>
            <p className="text-sm text-gray-600">Branches Visited</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/booking">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <Calendar className="h-6 w-6 mb-1" />
                  <span>Book Wash</span>
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <User className="h-6 w-6 mb-1" />
                  <span>QR Code</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
