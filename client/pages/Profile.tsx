import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
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
  Trophy,
  CreditCard,
} from "lucide-react";
import VehicleSelector from "@/components/VehicleSelector";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";
import PremiumMembershipCard from "@/components/PremiumMembershipCard";
import LevelProgress from "@/components/LevelProgress";
import UserQRCode from "@/components/UserQRCode";

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

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
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
    <div className="min-h-screen bg-background pb-28">
      <StickyHeader showBack={true} title="Profile" alwaysVisible />


      <div className="px-4 pt-24 pb-8 max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-fac-orange-500 flex items-center justify-center mx-auto mb-2">
            <User className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Overview Card */}
        <Card className="border shadow-sm mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-fac-orange-500 flex items-center justify-center">
                    {profile.profilePicture && profile.profilePicture.trim() !== "" ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile picture"
                        className="w-full h-full rounded-2xl object-cover"
                        onError={(e) => {
                          console.warn(`Failed to load profile picture: ${profile.profilePicture}`);
                          // Replace with User icon
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                          }
                        }}
                      />
                    ) : (
                      <User className="h-8 w-8 text-white" />
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
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile.name}
                  </h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <MembershipBadge membershipType={profile.membershipType} />
                    <Badge className="bg-green-500 text-white font-bold">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      VERIFIED
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="w-10 h-10 p-0"
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
        <Card className="border shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-xl sm:text-2xl">
              <div className="bg-fac-orange-500 p-3 rounded-xl mr-4">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              Smart QR Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="bg-muted rounded-2xl p-6 mb-6 mx-auto max-w-sm">
                {/* Real QR Code Component */}
                <div className="flex flex-col items-center">
                  <UserQRCode
                    data={generateQRData()}
                    size={200}
                    className="mb-4"
                  />
                  <p className="text-sm text-muted-foreground font-medium">
                    Scan at any FAC location for instant access
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted rounded-xl p-4">
                  <Smartphone className="h-5 w-5 text-fac-orange-500 mx-auto mb-2" />
                  <p className="font-bold text-foreground">Contactless</p>
                  <p className="text-muted-foreground">Entry & Payment</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <Zap className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                  <p className="font-bold text-foreground">Instant</p>
                  <p className="text-muted-foreground">Service Start</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Membership Card */}
        <Card className="border shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-xl sm:text-2xl">
              <div className="bg-fac-orange-500 p-3 rounded-xl mr-4">
                <Star className="h-6 w-6 text-white" />
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

        {/* Gamification Progress */}
        <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-400">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-xl sm:text-2xl">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl mr-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LevelProgress userId={userEmail} showDetails={true} />
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground text-xl sm:text-2xl">
              <div className="bg-fac-orange-500 p-3 rounded-xl mr-4">
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
                    className="mt-2 rounded-xl"
                  />
                ) : (
                  <div className="mt-2 p-3 bg-muted rounded-xl text-foreground font-medium">
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
                    className="mt-2 rounded-xl"
                  />
                ) : (
                  <div className="mt-2 p-3 bg-muted rounded-xl text-foreground font-medium">
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
                    className="mt-2 rounded-xl"
                  />
                ) : (
                  <div className="mt-2 p-3 bg-muted rounded-xl text-foreground font-medium">
                    {profile.phone}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="joinDate" className="font-bold text-foreground">
                  Member Since
                </Label>
                <div className="mt-2 p-3 bg-muted rounded-xl text-foreground font-medium">
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
                      className="mt-2 rounded-xl"
                    />
                  ) : (
                    <div className="mt-2 p-3 bg-muted rounded-xl text-foreground font-medium">
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
                      className="mt-2 rounded-xl"
                    />
                  ) : (
                    <div className="mt-2 p-3 bg-muted rounded-xl text-foreground font-medium">
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
                  <div className="bg-muted rounded-xl p-4">
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
                  className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white flex-1 py-3 rounded-xl font-bold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 py-3 rounded-xl font-bold"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership Benefits */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-foreground text-xl font-bold">
              <div className="bg-fac-orange-500 p-3 rounded-xl mr-4">
                <Crown className="h-6 w-6 text-white" />
              </div>
              Membership Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-6">
              {/* Membership Level Display */}
              <div className="text-center py-4">
                <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl p-6 mx-auto max-w-sm border border-fac-orange-500/20">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {profile.membershipType}
                  </h3>
                  <Badge className="bg-fac-orange-500 text-black font-bold text-sm px-4 py-2 tracking-wide">
                    PREMIUM TIER
                  </Badge>
                </div>
              </div>

              {/* Benefits Grid - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2 sm:px-0">
                <div className="flex items-center space-x-4 bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors">
                  <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">
                      Unlimited Washes
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Monthly access to all services
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors">
                  <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">
                      VIP Concierge
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Personal service assistance
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors">
                  <div className="bg-purple-500 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">
                      Premium Lounge
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Exclusive waiting area access
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-muted rounded-xl p-4 hover:bg-muted/80 transition-colors">
                  <div className="bg-fac-orange-500 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">
                      Priority Booking
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Skip the line privileges
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Perks */}
              <div className="bg-gradient-to-r from-fac-orange-500/10 to-yellow-500/10 rounded-xl p-4 border border-fac-orange-500/20">
                <h4 className="font-bold text-foreground mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-fac-orange-500" />
                  Exclusive Member Perks
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-fac-orange-500 rounded-full"></div>
                    <span>Free vehicle inspections monthly</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-fac-orange-500 rounded-full"></div>
                    <span>Complimentary air fresheners</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-fac-orange-500 rounded-full"></div>
                    <span>Exclusive event invitations</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Button */}
        <Card className="glass border-border shadow-2xl animate-fade-in-up animate-delay-500">
          <CardContent className="p-6">
            <Link to="/payment-history" className="block">
              <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-4 rounded-xl">
                <CreditCard className="h-5 w-5 mr-2" />
                View Payment History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
