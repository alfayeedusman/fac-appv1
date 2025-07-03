import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Star,
  Sparkles,
  QrCode,
  Download,
  Share,
  CreditCard,
  Calendar,
  Shield,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserQRCode from "./UserQRCode";

interface CreditCardProfileProps {
  userProfile: {
    name: string;
    email: string;
    membershipType: string;
    joinDate: string;
    plateNumber?: string;
  };
  membershipData: {
    package: string;
    daysLeft: number;
    remainingWashes: {
      classic: number;
      vipProMax: number;
      premium: number;
    };
  };
}

export default function CreditCardProfile({
  userProfile,
  membershipData,
}: CreditCardProfileProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const getMembershipIcon = () => {
    switch (membershipData.package) {
      case "VIP Gold Ultimate":
        return <Crown className="h-6 w-6" />;
      case "VIP Silver Elite":
        return <Sparkles className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getMembershipColor = () => {
    switch (membershipData.package) {
      case "VIP Gold Ultimate":
        return "from-yellow-400 via-yellow-500 to-orange-500";
      case "VIP Silver Elite":
        return "from-gray-300 via-gray-400 to-gray-600";
      default:
        return "from-blue-400 via-blue-500 to-blue-600";
    }
  };

  const getStatusColor = () => {
    const hasActiveSubscription =
      membershipData.package !== "Regular Member" &&
      membershipData.daysLeft > 0;
    const isVipGold = membershipData.package === "VIP Gold Ultimate";

    if (!hasActiveSubscription) return "text-red-500";
    if (isVipGold) return "text-orange-500";
    return "text-green-500";
  };

  const generateQRData = () => {
    return JSON.stringify({
      userId: userProfile.email,
      name: userProfile.name,
      membership: membershipData.package,
      plateNumber: userProfile.plateNumber,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="relative preserve-3d transition-all duration-700"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front Side */}
        <Card
          className={cn(
            "relative h-56 p-6 bg-gradient-to-br text-white overflow-hidden cursor-pointer",
            getMembershipColor(),
            "backface-hidden",
          )}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white/30"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full border-2 border-white/20"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border border-white/10 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {getMembershipIcon()}
              <span className="text-sm font-medium opacity-90">
                Fayeed Auto Care
              </span>
            </div>
            <CreditCard className="h-6 w-6 opacity-80" />
          </div>

          {/* Member Info */}
          <div className="relative z-10 space-y-3">
            <div>
              <p className="text-2xl font-bold tracking-wide">
                {userProfile.name}
              </p>
              <p className="text-sm opacity-80">{membershipData.package}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm font-medium">
                  {new Date(userProfile.joinDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs opacity-70 uppercase tracking-wider">
                  Status
                </p>
                <div className="flex items-center space-x-1">
                  <CheckCircle className={cn("h-4 w-4", getStatusColor())} />
                  <p className="text-sm font-medium">
                    {membershipData.daysLeft > 0 ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <div className="text-xs opacity-80">
              {userProfile.plateNumber && (
                <span>Vehicle: {userProfile.plateNumber}</span>
              )}
            </div>
            <div className="text-xs opacity-80">Tap to flip</div>
          </div>
        </Card>

        {/* Back Side */}
        <Card
          className={cn(
            "absolute inset-0 h-56 p-6 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white overflow-hidden cursor-pointer",
            "backface-hidden transform-gpu",
          )}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Member Benefits</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQR(!showQR);
                }}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>

            {showQR ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <UserQRCode
                  data={generateQRData()}
                  size={120}
                  className="mb-3"
                />
                <p className="text-xs text-center opacity-80">
                  Your unique member QR code
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                {/* Remaining Washes */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider opacity-70">
                    Remaining This Month
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="bg-white/10 rounded p-2">
                        <p className="font-bold">
                          {membershipData.remainingWashes.classic === 999
                            ? "∞"
                            : membershipData.remainingWashes.classic}
                        </p>
                        <p className="opacity-70">Classic</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white/10 rounded p-2">
                        <p className="font-bold">
                          {membershipData.remainingWashes.vipProMax}
                        </p>
                        <p className="opacity-70">VIP Pro</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white/10 rounded p-2">
                        <p className="font-bold">
                          {membershipData.remainingWashes.premium}
                        </p>
                        <p className="opacity-70">Premium</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Days Left */}
                <div className="bg-white/10 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-70 uppercase tracking-wider">
                        Days Remaining
                      </p>
                      <p className="text-lg font-bold">
                        {membershipData.daysLeft}
                      </p>
                    </div>
                    <Calendar className="h-5 w-5 opacity-60" />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-white hover:bg-white/20 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-white hover:bg-white/20 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Tap the card to view details and QR code
      </p>
    </div>
  );
}
