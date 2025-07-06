import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  QrCode,
  Calendar,
  Car,
  MapPin,
  Star,
  CreditCard,
  User,
  Bell,
  Settings,
  History,
  Gift,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for Flutter-style customer interface
const mockUserData = {
  fullName: "John Doe",
  email: "john@example.com",
  membershipType: "VIP Silver Elite",
  loyaltyPoints: 1250,
  totalBookings: 15,
  totalSpent: 6750,
  thisMonthBookings: 3,
  remainingWashes: 999,
  remainingCredits: 1200,
};

const mockServices = [
  {
    id: 1,
    name: "Quick Wash",
    price: 250,
    duration: "20 mins",
    description: "Basic exterior wash and dry",
    features: ["Exterior wash", "Basic drying"],
  },
  {
    id: 2,
    name: "Classic Wash",
    price: 450,
    duration: "45 mins",
    description: "Complete wash with interior cleaning",
    features: ["Exterior wash & wax", "Interior vacuum"],
  },
  {
    id: 3,
    name: "Premium Wash",
    price: 850,
    duration: "90 mins",
    description: "Full service with detailing",
    features: ["Complete detail", "Interior deep clean"],
  },
];

export default function FlutterCustomerApp() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const tabs = [
    { icon: Car, label: "Home" },
    { icon: Calendar, label: "Bookings" },
    { icon: History, label: "History" },
    { icon: User, label: "Profile" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const HomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {mockUserData.fullName}
          </h1>
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">3</span>
          </div>
        </div>
      </div>

      {/* Membership Card */}
      <Card className="bg-gradient-to-br from-gray-400 to-gray-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">
                {mockUserData.membershipType}
              </h3>
              <p className="text-gray-200">Unlimited washes</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>₱{mockUserData.remainingCredits} credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span>{mockUserData.loyaltyPoints} points</span>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              View Details
            </Button>
            <Button
              variant="outline"
              className="bg-white text-gray-600 hover:bg-gray-100"
            >
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setIsScanning(!isScanning)}
            className={cn(
              "h-20 flex-col gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
              isScanning && "animate-pulse",
            )}
          >
            <QrCode className="w-6 h-6" />
            <span>{isScanning ? "Scanning..." : "Scan QR"}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-blue-200 hover:bg-blue-50"
          >
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Book Service</span>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-yellow-200 hover:bg-yellow-50"
          >
            <Gift className="w-6 h-6 text-yellow-600" />
            <span>Vouchers</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-green-200 hover:bg-green-50"
          >
            <Settings className="w-6 h-6 text-green-600" />
            <span>Support</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {mockUserData.totalBookings}
              </p>
              <p className="text-sm text-gray-600">Total Services</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {mockUserData.thisMonthBookings}
              </p>
              <p className="text-sm text-gray-600">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CreditCard className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                ₱{mockUserData.totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {mockUserData.loyaltyPoints}
              </p>
              <p className="text-sm text-gray-600">Loyalty Points</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Services */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Services</h3>
        <div className="space-y-3">
          {mockServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{service.name}</h4>
                  <Badge variant="secondary">₱{service.price}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {service.duration}
                  </span>
                  <Button size="sm">Book Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const BookingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Bookings</h2>
        <Button size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold">Classic Wash</h4>
              <p className="text-sm text-gray-600">Fayeed Auto Care - Tumaga</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Dec 7, 2024 • 10:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              <span>Sedan • ABC 123</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold text-orange-600">₱450</span>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No more upcoming bookings</p>
        <Button className="mt-4">Book a Service</Button>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Service History</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">Premium Wash</h4>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Completed
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Nov 28, 2024</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold">{mockUserData.fullName}</h2>
        <p className="text-gray-600">{mockUserData.email}</p>
        <Badge className="mt-2 bg-gray-100 text-gray-800">
          {mockUserData.membershipType}
        </Badge>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span>Jan 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Services</span>
                <span>{mockUserData.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loyalty Points</span>
                <span>{mockUserData.loyaltyPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Account Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Gift className="w-4 h-4 mr-2" />
            My Vouchers
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return <HomeTab />;
      case 1:
        return <BookingsTab />;
      case 2:
        return <HistoryTab />;
      case 3:
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-orange-600">
              Fayeed Auto Care
            </h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">{renderTabContent()}</div>

      {/* QR Scanner Floating Button */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2">
        <Button
          onClick={() => setIsScanning(!isScanning)}
          className={cn(
            "w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg",
            isScanning && "animate-pulse bg-orange-600",
          )}
        >
          <QrCode className="w-6 h-6" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto">
          <div className="flex">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setSelectedTab(index)}
                className={cn(
                  "flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-colors",
                  selectedTab === index
                    ? "text-orange-600"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QR Scanner Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-64 h-64 border-4 border-orange-500 border-dashed rounded-lg flex items-center justify-center mb-4 animate-pulse">
              <QrCode className="w-16 h-16 text-orange-500" />
            </div>
            <p className="text-white text-lg mb-4">Scanning for QR Code...</p>
            <Button
              onClick={() => setIsScanning(false)}
              variant="outline"
              className="bg-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
