import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Car,
  Navigation,
  Activity,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Truck,
  RefreshCw,
  Crown,
  UserPlus,
  Maximize2,
  Minimize2,
  Download,
  Layers,
  Settings,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import RealTimeMap from "@/components/RealTimeMap";
import ThemeToggle from "@/components/ThemeToggle";
import AdminNotificationDropdown from "@/components/AdminNotificationDropdown";

interface LocationData {
  id: string;
  type: "customer" | "crew";
  name: string;
  lat: number;
  lng: number;
  status: "online" | "offline" | "busy" | "available";
  lastUpdate: string;
  metadata?: {
    totalBookings?: number;
    lastBooking?: string;
    customerRating?: number;
    loyaltyLevel?: "bronze" | "silver" | "gold" | "platinum";
    totalSpent?: number;
    averageServiceValue?: number;
    serviceFrequency?: "low" | "medium" | "high" | "vip";
    preferredServices?: string[];
    lastServiceDate?: string;
    customerRank?: number;
    rankCategory?: "new" | "regular" | "loyal" | "vip" | "champion";
    monthlyVisits?: number;
    currentAssignments?: number;
    completedJobs?: number;
    crewRating?: number;
    groupId?: string;
    groupName?: string;
  };
}

export default function AdminFACMap() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check authentication on mount and whenever storage changes
  useEffect(() => {
    const checkAuth = () => {
      const role = localStorage.getItem("userRole");
      const email = localStorage.getItem("userEmail");

      console.log("🔐 Auth check - Role:", role, "Email:", email);

      if (!role || !email) {
        console.log("❌ No auth found, redirecting to login");
        navigate("/login");
        return;
      }

      if (role !== "admin" && role !== "superadmin") {
        console.log("❌ Insufficient permissions, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("✅ Auth valid, setting role:", role);
      setUserRole(role);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no valid role
  if (!userRole) {
    return null;
  }

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab="fac-map"
        onTabChange={(tab) => {
          if (tab === "fac-map") return; // Already on this page
          navigate(`/admin-dashboard`);
        }}
        userRole={userRole}
        notificationCount={0}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="mb-8 ml-12 lg:ml-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="bg-gradient-to-r from-fac-orange-500 to-red-500 p-3 rounded-xl">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  FAC MAP
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Real-time location tracking and heat map visualization
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <AdminNotificationDropdown />
                <Button
                  onClick={() => navigate("/admin-crew-management")}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Manage Crew</span>
                </Button>
                <ThemeToggle />
                <Button onClick={refreshData} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Live Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Total Crew
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      20
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                      Online Crew
                    </p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">
                      18
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                      Busy Crew
                    </p>
                    <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      12
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Car className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Customers
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      50
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-950 dark:to-indigo-900 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-indigo-500 p-2 rounded-lg">
                    <Navigation className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      Active
                    </p>
                    <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
                      47
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-950 dark:to-emerald-900 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      Available
                    </p>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      8
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Tier Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950 dark:to-yellow-900 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                      Champions
                    </p>
                    <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                      5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950 dark:to-red-900 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                      VIP
                    </p>
                    <p className="text-xl font-bold text-red-900 dark:text-red-100">
                      12
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Loyal
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      18
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <UserPlus className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Regular
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      10
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-gray-500 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      New
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Heat Map */}
          <div
            className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}
          >
            <Card className="glass border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-fac-orange-500 to-red-500 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        Live Location Heat Map
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time crew and customer tracking
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => navigate("/admin-crew-management")}
                      variant="outline"
                      className="font-semibold"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Manage Crew
                    </Button>
                    <Button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      variant="outline"
                      size="sm"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={
                    isFullscreen ? "h-[calc(100vh-200px)]" : "h-[700px]"
                  }
                >
                  <RealTimeMap
                    onCrewSelect={(crew) => console.log("Selected crew:", crew)}
                    onCustomerSelect={(customer) =>
                      console.log("Selected customer:", customer)
                    }
                    height={isFullscreen ? "calc(100vh - 200px)" : "700px"}
                    showCustomers={true}
                    showCrew={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Map Controls and Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Map Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={refreshData}
                    className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button
                    onClick={() => navigate("/admin-crew-management")}
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Crew Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Online</span>
                      </div>
                      <Badge className="bg-green-500 text-white">18 Crew</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Busy</span>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        12 Crew
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Customers</span>
                      </div>
                      <Badge className="bg-purple-500 text-white">
                        47 Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Crew Member 5</p>
                        <p className="text-xs text-gray-500">
                          Status: Online • 2min ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Crew Member 8</p>
                        <p className="text-xs text-gray-500">
                          Status: Busy • 5min ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Customer 15</p>
                        <p className="text-xs text-gray-500">
                          VIP • Active • 8min ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
