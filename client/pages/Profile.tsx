import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Car,
  Crown,
  QrCode,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Settings,
  Copy,
  Check,
  Star,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  memberSince: string;
  profileImage?: string;
}

interface VehicleInfo {
  carUnit: string;
  carPlateNumber: string;
  carType: string;
  color: string;
}

interface MembershipInfo {
  package: string;
  status: "active" | "expiring" | "expired";
  startDate: string;
  expiryDate: string;
  autoRenewal: boolean;
  branchPreference: string;
}

export default function Profile() {
  const [userProfile] = useState<UserProfile>({
    id: "FAC-2024-0001",
    fullName: "John Dela Cruz",
    email: "john.delacruz@email.com",
    contactNumber: "+63 912 345 6789",
    address: "123 Veteran Avenue, Tumaga, Zamboanga City",
    memberSince: "2024-01-01",
    profileImage: undefined,
  });

  const [vehicleInfo] = useState<VehicleInfo>({
    carUnit: "Toyota Vios 2020",
    carPlateNumber: "ABC 1234",
    carType: "Sedan",
    color: "White",
  });

  const [membershipInfo] = useState<MembershipInfo>({
    package: "VIP Gold",
    status: "active",
    startDate: "2024-01-01",
    expiryDate: "2024-02-01",
    autoRenewal: true,
    branchPreference: "Tumaga",
  });

  const [qrCodeCopied, setQrCodeCopied] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const copyQrCode = () => {
    navigator.clipboard.writeText(userProfile.id);
    setQrCodeCopied(true);
    setTimeout(() => setQrCodeCopied(false), 2000);
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "expiring":
        return "bg-orange-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-fac-blue-900">Profile</h1>
              <p className="text-fac-blue-700">Your FAC account details</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-fac-blue-600 text-white text-lg font-semibold">
                    {getInitials(userProfile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile.fullName}
                  </h2>
                  <p className="text-gray-600">Member ID: {userProfile.id}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      Member since {formatDate(userProfile.memberSince)}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">{userProfile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {userProfile.contactNumber}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-700">{userProfile.address}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-fac-blue-600" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Car Unit
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {vehicleInfo.carUnit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Plate Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {vehicleInfo.carPlateNumber}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Car Type
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {vehicleInfo.carType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Color
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {vehicleInfo.color}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-fac-gold-500" />
                Membership Status
              </div>
              <Badge
                className={cn(
                  "text-white",
                  getMembershipStatusColor(membershipInfo.status),
                )}
              >
                {membershipInfo.status.charAt(0).toUpperCase() +
                  membershipInfo.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Current Package
                  </label>
                  <div className="flex items-center mt-1">
                    <Crown className="h-4 w-4 text-fac-gold-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      {membershipInfo.package}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Preferred Branch
                  </label>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 text-fac-blue-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">
                      {membershipInfo.branchPreference}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Membership Period
                  </label>
                  <p className="text-gray-900">
                    {formatDate(membershipInfo.startDate)} -{" "}
                    {formatDate(membershipInfo.expiryDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Auto Renewal
                  </label>
                  <div className="flex items-center mt-1">
                    {membershipInfo.autoRenewal ? (
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span
                      className={cn(
                        "font-semibold",
                        membershipInfo.autoRenewal
                          ? "text-green-700"
                          : "text-gray-500",
                      )}
                    >
                      {membershipInfo.autoRenewal ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-fac-blue-600" />
              Your QR Code
            </CardTitle>
            <p className="text-sm text-gray-600">
              Show this QR code at any FAC branch for quick service
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              {/* QR Code Display */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <QrCode className="h-24 w-24 text-gray-400 mb-4" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      QR Code Preview
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {userProfile.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Info */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Scan this code at any branch to:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Log your visit
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Redeem services
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Track history
                  </Badge>
                </div>
              </div>

              {/* Copy ID Button */}
              <Button
                variant="outline"
                className="w-full max-w-xs"
                onClick={copyQrCode}
              >
                {qrCodeCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Member ID
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/dashboard">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <Crown className="h-6 w-6 mb-1 text-fac-blue-600" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link to="/booking">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <Calendar className="h-6 w-6 mb-1 text-fac-blue-600" />
                  <span>Book Service</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-16 flex-col">
                <Settings className="h-6 w-6 mb-1 text-fac-blue-600" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
