import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Car,
  QrCode,
  Crown,
  Star,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Smartphone,
  Zap,
  CheckCircle,
  Settings,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import VehicleSelector from "@/components/VehicleSelector";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";
import PremiumMembershipCard from "@/components/PremiumMembershipCard";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  carUnit: string;
  plateNumber: string;
  vehicleType: string;
  motorcycleType?: string;
  membershipType: string;
  joinDate: string;
  profilePicture?: string;
}

export default function Profile() {
  // Get real user data from localStorage
  const userEmail = localStorage.getItem("userEmail") || "";
  const registeredUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]",
  );
  const currentUser = registeredUsers.find(
    (user: any) => user.email === userEmail,
  );
  const signUpData = JSON.parse(localStorage.getItem("signUpData") || "{}");
  const userSubscription = JSON.parse(
    localStorage.getItem(`subscription_${userEmail}`) || "null",
  );

  const getUserProfile = (): UserProfile => {
    return {
      name: currentUser?.fullName || signUpData.fullName || "User",
      email: currentUser?.email || userEmail,
      phone: signUpData.contactNumber || "+63 XXX XXX XXXX",
      carUnit: signUpData.carUnit || "Not specified",
      plateNumber: signUpData.carPlateNumber || "XXX XXXX",
      vehicleType: signUpData.carType || "sedan",
      membershipType: userSubscription?.package || "Regular Member",
      joinDate:
        currentUser?.registeredAt?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
    };
  };

  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const membershipData = {
    level: "VIP Gold Ultimate",
    tier: "Premium",
    perks: [
      "Unlimited washes",
      "VIP concierge service",
      "Premium lounge access",
      "Priority booking",
      "Exclusive member events",
    ],
    nextReward: "Platinum Status",
    pointsToNext: 250,
    currentPoints: 1750,
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // Here you would typically save to backend
    alert("Profile updated successfully! 🚀");
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const generateQRData = () => {
    return `FAC-MEMBER:${profile.email}:${profile.plateNumber}:${profile.membershipType}`;
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden pb-20">
      <StickyHeader showBack={true} title="Profile" />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-fac-orange-500/5 to-purple-500/5 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/5 to-fac-orange-500/5 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/8 to-pink-500/8 blur-xl animate-float animate-delay-300"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in-up">
          <Link to="/dashboard" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full glass hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="gradient-primary p-3 rounded-xl animate-pulse-glow">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">
                My{" "}
                <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>
              <p className="text-muted-foreground font-medium">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="glass border-border shadow-2xl mb-8 animate-fade-in-up animate-delay-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/5 to-purple-500/5"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fac-orange-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-background border-2 border-border hover:bg-accent"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                {/* Profile Info */}
                <div>
                  <h2 className="text-2xl font-black text-foreground">
                    {profile.name}
                  </h2>
                  <p className="text-muted-foreground font-medium">
                    {profile.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-fac-orange-500 text-white font-bold animate-pulse-glow">
                      <Crown className="h-3 w-3 mr-1" />
                      {profile.membershipType}
                    </Badge>
                    <Badge className="bg-green-500 text-white font-bold">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      VERIFIED
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="glass hover-lift w-10 h-10 p-0"
                variant="outline"
                size="icon"
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* QR Code Card */}
        <Card className="glass border-border shadow-2xl mb-8 animate-fade-in-up animate-delay-200">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-2xl">
              <div className="gradient-secondary p-3 rounded-xl mr-4 animate-pulse-glow">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              Smart QR Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="glass rounded-2xl p-8 mb-6 mx-auto max-w-sm">
                {/* QR Code Placeholder */}
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-foreground to-muted-foreground rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                  {/* Simulated QR code pattern */}
                  <div className="absolute inset-4 bg-background rounded-lg">
                    <div className="grid grid-cols-8 gap-1 p-2 h-full">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${
                            Math.random() > 0.5
                              ? "bg-foreground"
                              : "bg-transparent"
                          } rounded-sm`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/10 to-purple-500/10 animate-shimmer"></div>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Scan at any FAC location for instant access
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="glass rounded-xl p-4">
                  <Smartphone className="h-5 w-5 text-fac-orange-500 mx-auto mb-2" />
                  <p className="font-bold text-foreground">Contactless</p>
                  <p className="text-muted-foreground">Entry & Payment</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <Zap className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                  <p className="font-bold text-foreground">Instant</p>
                  <p className="text-muted-foreground">Service Start</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Membership Card */}
        <Card className="glass border-border shadow-2xl mb-8 animate-fade-in-up animate-delay-250">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-2xl">
              <div className="gradient-primary p-3 rounded-xl mr-4 animate-pulse-glow">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              Digital Membership Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumMembershipCard
              userName={profile.name}
              email={profile.email}
              membershipType={
                profile.membershipType.toLowerCase().includes("regular")
                  ? "regular"
                  : profile.membershipType.toLowerCase().includes("classic")
                    ? "classic"
                    : profile.membershipType.toLowerCase().includes("silver")
                      ? "vip_silver"
                      : "vip_gold"
              }
              memberSince={new Date(profile.joinDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  year: "numeric",
                },
              )}
              expiryDate={
                userSubscription?.currentCycleEnd
                  ? new Date(
                      userSubscription.currentCycleEnd,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"
              }
              membershipNumber={`FAC${userEmail
                .replace(/[^0-9]/g, "")
                .slice(0, 6)
                .padStart(6, "0")}`}
              remainingWashes={userSubscription?.remainingWashes?.classic || 0}
              totalWashes={userSubscription?.totalWashes?.classic || 0}
            />
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="glass border-border shadow-2xl mb-8 animate-fade-in-up animate-delay-300">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-2xl">
              <div className="gradient-futuristic p-3 rounded-xl mr-4 animate-pulse-glow">
                <Settings className="h-6 w-6 text-white" />
              </div>
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="font-bold text-foreground">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        name: e.target.value,
                      })
                    }
                    className="mt-2 glass border-border rounded-xl"
                  />
                ) : (
                  <div className="mt-2 p-3 glass rounded-xl text-foreground font-medium">
                    {profile.name}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="font-bold text-foreground">
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        email: e.target.value,
                      })
                    }
                    className="mt-2 glass border-border rounded-xl"
                  />
                ) : (
                  <div className="mt-2 p-3 glass rounded-xl text-foreground font-medium">
                    {profile.email}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="font-bold text-foreground">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        phone: e.target.value,
                      })
                    }
                    className="mt-2 glass border-border rounded-xl"
                  />
                ) : (
                  <div className="mt-2 p-3 glass rounded-xl text-foreground font-medium">
                    {profile.phone}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="joinDate" className="font-bold text-foreground">
                  Member Since
                </Label>
                <div className="mt-2 p-3 glass rounded-xl text-foreground font-medium">
                  {new Date(profile.joinDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <Car className="h-5 w-5 mr-2 text-fac-orange-500" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="carUnit"
                    className="font-bold text-foreground"
                  >
                    Car Model
                  </Label>
                  {isEditing ? (
                    <Input
                      id="carUnit"
                      value={editedProfile.carUnit}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          carUnit: e.target.value,
                        })
                      }
                      className="mt-2 glass border-border rounded-xl"
                    />
                  ) : (
                    <div className="mt-2 p-3 glass rounded-xl text-foreground font-medium">
                      {profile.carUnit}
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="plateNumber"
                    className="font-bold text-foreground"
                  >
                    Plate Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="plateNumber"
                      value={editedProfile.plateNumber}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          plateNumber: e.target.value,
                        })
                      }
                      className="mt-2 glass border-border rounded-xl"
                    />
                  ) : (
                    <div className="mt-2 p-3 glass rounded-xl text-foreground font-medium">
                      {profile.plateNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Type Selector */}
              <div className="mt-6">
                <Label className="font-bold text-foreground mb-4 block">
                  Vehicle Type
                </Label>
                {isEditing ? (
                  <VehicleSelector
                    value={{
                      vehicleType: editedProfile.vehicleType,
                      motorcycleType: editedProfile.motorcycleType,
                    }}
                    onChange={(value) =>
                      setEditedProfile({
                        ...editedProfile,
                        vehicleType: value.vehicleType,
                        motorcycleType: value.motorcycleType,
                      })
                    }
                  />
                ) : (
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-fac-orange-500 p-2 rounded-lg">
                        <Car className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {profile.vehicleType.charAt(0).toUpperCase() +
                            profile.vehicleType.slice(1)}
                        </div>
                        {profile.motorcycleType && (
                          <div className="text-sm text-muted-foreground">
                            {profile.motorcycleType === "small"
                              ? "Small Motor (≤150cc)"
                              : profile.motorcycleType === "medium"
                                ? "Medium Motor (151-400cc)"
                                : "Big Bike (≥401cc)"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-4 pt-6">
                <Button
                  onClick={handleSave}
                  className="btn-futuristic flex-1 py-3 rounded-xl font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 glass py-3 rounded-xl font-bold"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership Benefits */}
        <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-400">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-2xl">
              <div className="bg-gradient-to-r from-yellow-500 to-fac-orange-500 p-3 rounded-xl mr-4 animate-pulse-glow">
                <Crown className="h-6 w-6 text-white" />
              </div>
              Membership Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Membership Level */}
              <div className="text-center">
                <div className="glass rounded-2xl p-6 mb-4">
                  <h3 className="text-2xl font-black text-foreground mb-2">
                    {membershipData.level}
                  </h3>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-fac-orange-500 text-white font-bold text-sm px-4 py-2">
                    {membershipData.tier} Tier
                  </Badge>
                </div>
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-1 gap-3">
                {membershipData.perks.map((perk, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 glass rounded-xl p-4"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground font-medium">{perk}</span>
                  </div>
                ))}
              </div>

              {/* Loyalty Progress */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-foreground">
                    Progress to {membershipData.nextReward}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {membershipData.pointsToNext} points needed
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-fac-orange-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (membershipData.currentPoints /
                          (membershipData.currentPoints +
                            membershipData.pointsToNext)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Current Points:{" "}
                  {membershipData.currentPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
