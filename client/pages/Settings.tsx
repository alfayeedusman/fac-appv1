import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Smartphone,
  CreditCard,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Edit,
  Lock,
  Globe,
  Moon,
  Sun,
  Trash2,
  Download,
  Star,
  MessageSquare,
} from "lucide-react";

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: "toggle" | "navigate" | "button";
  value?: boolean;
  route?: string;
  onClick?: () => void;
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const userProfile = {
    name: "John Dela Cruz",
    email: "john.delacruz@email.com",
    membershipLevel: "VIP Gold",
    joinDate: "January 2024",
  };

  const accountSettings: SettingsSection[] = [
    {
      id: "profile",
      title: "Edit Profile",
      description: "Update your personal information",
      icon: Edit,
      action: "navigate",
      route: "/profile",
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Password, biometric, and privacy settings",
      icon: Shield,
      action: "navigate",
      route: "/security-settings",
    },
    {
      id: "payment",
      title: "Payment Methods",
      description: "Manage cards and billing information",
      icon: CreditCard,
      action: "navigate",
      route: "/payment-settings",
    },
  ];

  const appSettings: SettingsSection[] = [
    {
      id: "notifications",
      title: "Notifications",
      description: "Push notifications and alerts",
      icon: Bell,
      action: "toggle",
      value: notifications,
      onClick: () => setNotifications(!notifications),
    },
    {
      id: "darkMode",
      title: "Dark Mode",
      description: "Switch to dark theme",
      icon: darkMode ? Moon : Sun,
      action: "toggle",
      value: darkMode,
      onClick: () => setDarkMode(!darkMode),
    },
    {
      id: "biometric",
      title: "Biometric Login",
      description: "Use fingerprint or face unlock",
      icon: Smartphone,
      action: "toggle",
      value: biometric,
      onClick: () => setBiometric(!biometric),
    },
    {
      id: "autoSync",
      title: "Auto Sync",
      description: "Automatically sync data",
      icon: Download,
      action: "toggle",
      value: autoSync,
      onClick: () => setAutoSync(!autoSync),
    },
  ];

  const supportSettings: SettingsSection[] = [
    {
      id: "help",
      title: "Help Center",
      description: "FAQs and support articles",
      icon: HelpCircle,
      action: "navigate",
      route: "/help",
    },
    {
      id: "contact",
      title: "Contact Support",
      description: "Get help from our team",
      icon: MessageSquare,
      action: "navigate",
      route: "/contact-support",
    },
    {
      id: "rate",
      title: "Rate FAC App",
      description: "Share your feedback",
      icon: Star,
      action: "button",
      onClick: () => alert("Opening app store rating..."),
    },
    {
      id: "about",
      title: "About",
      description: "App version and legal information",
      icon: Info,
      action: "navigate",
      route: "/about",
    },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      // Handle logout logic
      alert("Logging out...");
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      alert("Account deletion requested...");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderSettingItem = (setting: SettingsSection) => {
    const Icon = setting.icon;

    return (
      <div
        key={setting.id}
        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer"
        onClick={setting.onClick}
      >
        <div className="flex items-center space-x-4">
          <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-black text-sm">{setting.title}</h3>
            <p className="text-xs text-gray-500 font-medium">
              {setting.description}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {setting.action === "toggle" && (
            <Switch
              checked={setting.value}
              onCheckedChange={setting.onClick}
              className="data-[state=checked]:bg-fac-orange-500"
            />
          )}
          {setting.action === "navigate" && (
            <Link to={setting.route || "#"}>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          )}
          {setting.action === "button" && (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/dashboard" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-black" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight">
                Settings
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Manage your account
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-fac-orange-500 text-white text-lg font-black">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-black text-black">
                  {userProfile.name}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  {userProfile.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-fac-orange-500 text-white font-bold">
                    {userProfile.membershipLevel}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    Since {userProfile.joinDate}
                  </span>
                </div>
              </div>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Edit className="h-4 w-4 text-fac-orange-500" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {accountSettings.map(renderSettingItem)}
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <SettingsIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {appSettings.map(renderSettingItem)}
          </CardContent>
        </Card>

        {/* Support & Information */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {supportSettings.map(renderSettingItem)}
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-black">Quick Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <Link to="/notification-settings">
                <Card className="bg-gray-50 border border-gray-200 hover:bg-white hover:shadow-sm transition-all">
                  <CardContent className="p-4 text-center">
                    <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-black text-black text-sm">
                      Notifications
                    </p>
                    <p className="text-xs text-gray-500">Manage alerts</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/manage-subscription">
                <Card className="bg-gray-50 border border-gray-200 hover:bg-white hover:shadow-sm transition-all">
                  <CardContent className="p-4 text-center">
                    <div className="bg-black w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-black text-black text-sm">
                      Subscription
                    </p>
                    <p className="text-xs text-gray-500">Manage plan</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Logout & Danger Zone */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-8">
          <CardContent className="p-6 space-y-4">
            <Button
              onClick={handleLogout}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-4 rounded-xl"
            >
              <LogOut className="h-5 w-5 mr-2" />
              LOGOUT
            </Button>

            <Separator className="my-4" />

            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50 font-black py-4 rounded-xl"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              DELETE ACCOUNT
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center mb-8">
          <p className="text-xs text-gray-400 font-medium">FAC App v2.1.0</p>
          <p className="text-xs text-gray-400 font-medium">
            © 2024 Fayeed Auto Care
          </p>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-black"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/booking"
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-black"
          >
            <SettingsIcon className="h-5 w-5" />
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
            className="flex flex-col items-center justify-center space-y-1 bg-fac-orange-50 text-fac-orange-500"
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="text-xs font-bold">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
