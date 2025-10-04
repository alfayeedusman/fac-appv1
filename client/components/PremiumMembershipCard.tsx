import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Star,
  QrCode,
  Download,
  Share,
  Diamond,
  User,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface PremiumMembershipCardProps {
  userName: string;
  email: string;
  membershipType: "regular" | "classic" | "vip_silver" | "vip_gold";
  memberSince: string;
  expiryDate: string;
  membershipNumber: string;
  remainingWashes?: number;
  totalWashes?: number;
}

export default function PremiumMembershipCard({
  userName,
  email,
  membershipType,
  memberSince,
  expiryDate,
  membershipNumber,
  remainingWashes = 0,
  totalWashes = 0,
}: PremiumMembershipCardProps) {
  const [showBack, setShowBack] = useState(false);

  const getMembershipConfig = () => {
    switch (membershipType) {
      case "classic":
        return {
          name: "Classic Pro",
          color: "from-blue-600 to-blue-800",
          accentColor: "bg-blue-500",
          icon: Star,
          badgeColor: "bg-blue-500",
        };
      case "vip_silver":
        return {
          name: "VIP Silver Elite",
          color: "from-gray-600 to-gray-800",
          accentColor: "bg-gray-400",
          icon: Diamond,
          badgeColor: "bg-gray-400",
        };
      case "vip_gold":
        return {
          name: "VIP Gold Ultimate",
          color: "from-fac-orange-600 to-orange-800",
          accentColor: "bg-fac-orange-500",
          icon: Crown,
          badgeColor: "bg-gradient-to-r from-fac-orange-500 to-yellow-500",
        };
      default:
        return {
          name: "Regular Member",
          color: "from-gray-700 to-gray-900",
          accentColor: "bg-gray-500",
          icon: User,
          badgeColor: "bg-gray-500",
        };
    }
  };

  const config = getMembershipConfig();
  const IconComponent = config.icon;

  // Generate unique FAC ID
  const generateFACId = () => {
    const emailHash = email
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    return `FAC${emailHash}${membershipNumber.slice(-4)}`;
  };

  const uniqueFACId = generateFACId();

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 400, 250);
      gradient.addColorStop(
        0,
        membershipType === "vip_gold"
          ? "#ea580c"
          : membershipType === "vip_silver"
            ? "#6b7280"
            : "#3b82f6",
      );
      gradient.addColorStop(1, "#1f2937");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 250);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial";
      ctx.fillText("FAYEED AUTO CARE", 20, 40);

      ctx.font = "18px Arial";
      ctx.fillText(config.name, 20, 70);
      ctx.fillText(userName, 20, 130);
      ctx.fillText(`Member #${uniqueFACId}`, 20, 160);

      const link = document.createElement("a");
      link.download = "fac-membership-card.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Fayeed Auto Care Membership",
      text: `I'm a ${config.name} member at Fayeed Auto Care! ✨`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share failed");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Instruction */}
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-fac-orange-500" />
          Tap to {showBack ? "view front" : "show QR code"}
        </p>
      </div>

      {/* Card */}
      <div className="relative">
        {showBack ? (
          /* Back Side - QR Code */
          <Card
            onClick={() => setShowBack(false)}
            className="cursor-pointer rounded-3xl overflow-hidden shadow-2xl border-2 border-fac-orange-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className={`w-full bg-gradient-to-br ${config.color} p-8 min-h-[280px] flex flex-col items-center justify-center relative`}>
              {/* Back Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-fac-orange-500"></div>
                <div className="absolute bottom-0 right-0 w-1 h-full bg-fac-orange-500"></div>
              </div>

              {/* QR Code Section */}
              <div className="relative z-10 text-center">
                <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6 inline-block">
                  <QrCode className="h-32 w-32 text-gray-900 mx-auto" />
                  <div className="mt-3 text-sm text-gray-800 font-bold">
                    {uniqueFACId}
                  </div>
                </div>

                <p className="text-white font-bold text-lg mb-2">
                  SCAN FOR INSTANT ACCESS
                </p>
                <p className="text-fac-orange-300 text-sm">
                  Quick Check-in • Member Services
                </p>

                {/* Status */}
                {totalWashes > 0 && (
                  <div className="mt-6 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-fac-orange-500/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-fac-orange-300 font-bold mb-1">
                          REMAINING
                        </p>
                        <p className="text-3xl font-black text-white">
                          {remainingWashes === 999 ? "∞" : remainingWashes}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-fac-orange-300 font-bold mb-1">
                          STATUS
                        </p>
                        <Badge className="bg-green-500 text-white font-bold">
                          ACTIVE
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tap to flip back */}
                <p className="text-white/60 text-xs mt-6 flex items-center justify-center gap-1">
                  Tap to view details
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </div>
          </Card>
        ) : (
          /* Front Side - Main Card */
          <Card
            onClick={() => setShowBack(true)}
            className="cursor-pointer rounded-3xl overflow-hidden shadow-2xl border-2 border-fac-orange-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className={`w-full bg-gradient-to-br ${config.color} p-7 min-h-[280px] relative`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                ></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-fac-orange-500 shadow-lg"></div>
                <div className="absolute bottom-0 right-0 w-1 h-full bg-fac-orange-500 shadow-lg"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl mr-3 border border-white/20">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                          alt="FAC Logo"
                          className="h-6 w-auto brightness-125"
                        />
                      </div>
                      <div>
                        <span className="text-sm font-black text-white tracking-wide block">
                          FAYEED AUTO CARE
                        </span>
                        <span className="text-xs text-fac-orange-300 font-bold">
                          PREMIUM MEMBER
                        </span>
                      </div>
                    </div>
                    <Badge className={`${config.badgeColor} text-white font-black px-4 py-1.5 text-xs tracking-wider shadow-lg`}>
                      {config.name.toUpperCase()}
                    </Badge>
                  </div>

                  <div className={`p-3 rounded-xl ${config.accentColor} shadow-lg`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                </div>

                {/* Member Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xl font-black text-white tracking-wide">
                      {userName.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-200 mt-1">{email}</p>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 inline-block border border-fac-orange-500/30">
                    <p className="text-xs text-fac-orange-300 font-mono font-black tracking-wider">
                      ID: {uniqueFACId}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end mt-6 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-xs text-fac-orange-300 font-bold mb-1">
                      MEMBER SINCE
                    </p>
                    <p className="text-sm font-bold text-white">{memberSince}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-fac-orange-300 font-bold mb-1">
                      EXPIRES
                    </p>
                    <p className="text-sm font-bold text-white">{expiryDate}</p>
                  </div>
                </div>

                {/* Tap to flip */}
                <p className="text-white/60 text-xs mt-4 flex items-center justify-center gap-1">
                  Tap for QR code
                  <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="flex-1 rounded-xl border-fac-orange-500/50 hover:bg-fac-orange-500/10 hover:border-fac-orange-500 transition-all"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex-1 rounded-xl border-fac-orange-500/50 hover:bg-fac-orange-500/10 hover:border-fac-orange-500 transition-all"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
