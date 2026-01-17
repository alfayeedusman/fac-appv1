import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Car,
  Package,
  CreditCard,
  Settings,
  TrendingUp,
  Zap,
  DollarSign,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function AdminFeaturesShowcase() {
  const features = [
    {
      title: "Car Wash Service System",
      description: "Dynamic pricing with vehicle-based multipliers",
      icon: <Car className="h-6 w-6" />,
      link: "/inventory-management",
      linkText: "Manage Services",
      features: [
        "Vehicle Type Pricing (Sedan 1x, SUV 1.3x, Van 1.5x, Pickup 1.4x, Motorcycle 0.6x)",
        "Motorcycle Subtypes (Small 0.8x, Medium 1x, Big Bike 1.3x)",
        "Service Categories (Basic, Premium, Luxury)",
        "Dynamic Feature Management",
      ],
      badge: "New",
      badgeColor: "bg-green-500",
    },
    {
      title: "Enhanced POS System",
      description: "Professional point-of-sale with service integration",
      icon: <CreditCard className="h-6 w-6" />,
      link: "/pos",
      linkText: "Open POS",
      features: [
        "Car Wash Service Selector",
        "Real-time Vehicle-based Pricing",
        "Customer ID Points Tracking",
        "Clean White/Orange/Black Theme",
        "Kiosk Mode Available",
      ],
      badge: "Enhanced",
      badgeColor: "bg-blue-500",
    },
    {
      title: "Inventory Management",
      description: "Complete stock control with service management",
      icon: <Package className="h-6 w-6" />,
      link: "/inventory-management",
      linkText: "Manage Inventory",
      features: [
        "Physical Product Management",
        "Car Wash Services Tab",
        "Stock Movement Tracking",
        "Supplier Management",
        "Low Stock Alerts",
      ],
      badge: "Updated",
      badgeColor: "bg-orange-500",
    },
    {
      title: "User Management System",
      description: "Role-based access control",
      icon: <Users className="h-6 w-6" />,
      link: "/admin-user-management",
      linkText: "Manage Users",
      features: [
        "Admin, Cashier, Inventory Manager Roles",
        "Permission-based Access",
        "Employee ID Tracking",
        "Department Management",
        "Activity Monitoring",
      ],
      badge: "New",
      badgeColor: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 New Admin Features Available!
        </h2>
        <p className="text-gray-600">
          Access the admin dashboard to explore these powerful new tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-white border-gray-200 hover:shadow-lg transition-all duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-lg">
                      {feature.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <Badge className={`${feature.badgeColor} text-white`}>
                  {feature.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1">
                  {feature.features.map((item, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <Link to={feature.link}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Zap className="h-4 w-4 mr-2" />
                    {feature.linkText}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Complete Business Solution
              </h3>
            </div>
            <p className="text-gray-700 max-w-2xl mx-auto">
              From customer management to inventory control, POS transactions to
              service pricing - everything you need to run your car wash
              business efficiently.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/admin-dashboard">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  <Settings className="h-4 w-4 mr-2" />
                  Access Admin Dashboard
                </Button>
              </Link>
              <Link to="/pos">
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Try POS System
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
