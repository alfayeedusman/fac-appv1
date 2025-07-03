import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Star,
  Calendar,
  QrCode,
  Download,
  Share,
  Diamond,
  Sparkles,
  User,
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
  const [isFlipped, setIsFlipped] = useState(false);

  const getMembershipConfig = () => {
    switch (membershipType) {
      case "classic":
        return {
          name: "Classic Pro",
          color: "from-slate-800 to-slate-900",
          accentColor: "bg-blue-500",
          icon: Star,
          textColor: "text-white",
          pattern: "classic",
        };
      case "vip_silver":
        return {
          name: "VIP Silver Elite",
          color: "from-black to-slate-900",
          accentColor: "bg-gray-400",
          icon: Diamond,
          textColor: "text-white",
          pattern: "silver",
        };
      case "vip_gold":
        return {
          name: "VIP Gold Ultimate",
          color: "from-black to-gray-900",
          accentColor: "bg-fac-orange-500",
          icon: Crown,
          textColor: "text-white",
          pattern: "gold",
        };
      default:
        return {
          name: "Regular Member",
          color: "from-slate-700 to-slate-800",
          accentColor: "bg-red-500",
          icon: User,
          textColor: "text-white",
          pattern: "regular",
        };
    }
  };

  const config = getMembershipConfig();
  const IconComponent = config.icon;

  const handleDownload = () => {
    // Simulate card download functionality
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 250);
      gradient.addColorStop(
        0,
        membershipType === "vip_gold"
          ? "#FBBF24"
          : membershipType === "vip_silver"
            ? "#9CA3AF"
            : "#3B82F6",
      );
      gradient.addColorStop(
        1,
        membershipType === "vip_gold"
          ? "#D97706"
          : membershipType === "vip_silver"
            ? "#6B7280"
            : "#1D4ED8",
      );

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 250);

      // Add text
      ctx.fillStyle = config.textColor;
      ctx.font = "bold 20px Arial";
      ctx.fillText("Fayeed Auto Care", 20, 40);

      ctx.font = "16px Arial";
      ctx.fillText(config.name, 20, 70);
      ctx.fillText(userName, 20, 120);
      ctx.fillText(`Member #${membershipNumber}`, 20, 150);

      // Download
      const link = document.createElement("a");
      link.download = "membership-card.png";
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
      {/* Card Container with 3D effect */}
      <div
        className="relative w-full h-56 cursor-pointer preserve-3d duration-1000"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          <div
            className={`w-full h-full bg-gradient-to-br ${config.color} relative overflow-hidden`}
          >
            {/* Luxury Background Pattern */}
            <div className="absolute inset-0">
              {/* Orange accent lines */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${config.accentColor}`}
              ></div>
              <div
                className={`absolute bottom-0 right-0 w-1 h-full ${config.accentColor}`}
              ></div>

              {/* Geometric patterns */}
              <div className="absolute top-4 right-4 opacity-10">
                <Sparkles className="h-16 w-16 text-fac-orange-500 transform rotate-12" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-15">
                <IconComponent className="h-12 w-12 text-fac-orange-500 transform -rotate-12" />
              </div>

              {/* Dot pattern */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(249, 115, 22, 0.15) 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              ></div>

              {/* Circuit-like pattern */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
                <div className="w-40 h-40 border border-fac-orange-500 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-fac-orange-500 rounded-full"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-3">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                      alt="FAC Logo"
                      className="h-8 w-auto mr-3 brightness-0 invert"
                    />
                    <span className="text-sm font-bold text-white tracking-wider">
                      FAYEED AUTO CARE
                    </span>
                  </div>
                  <Badge className="bg-fac-orange-500 text-black font-bold px-3 py-1 text-xs tracking-wide">
                    {config.name.toUpperCase()}
                  </Badge>
                </div>
                <div className={`p-2 rounded-lg ${config.accentColor}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Member Info */}
              <div className="space-y-1">
                <p
                  className={`text-lg font-black ${config.textColor} tracking-wide`}
                >
                  {userName.toUpperCase()}
                </p>
                <p className={`text-sm ${config.textColor} opacity-90`}>
                  {email}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div>
                  <p className={`text-xs ${config.textColor} opacity-80`}>
                    Member Since
                  </p>
                  <p className={`text-sm font-bold ${config.textColor}`}>
                    {memberSince}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${config.textColor} opacity-80`}>
                    Member #
                  </p>
                  <p
                    className={`text-sm font-bold ${config.textColor} font-mono`}
                  >
                    {membershipNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Back of Card */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div
            className={`w-full h-full bg-gradient-to-br ${config.color} relative overflow-hidden`}
            style={{ transform: "scaleX(-1)" }} // Reverse the entire back content
          >
            {/* Magnetic Strip Effect */}
            <div className="absolute top-8 left-0 right-0 h-12 bg-black/50 border-t border-b border-fac-orange-500/30"></div>

            <div
              className="relative z-10 p-6 h-full flex flex-col justify-between"
              style={{ transform: "scaleX(-1)" }}
            >
              {/* QR Code Section */}
              <div className="text-center mt-16">
                <div className="bg-white rounded-xl p-4 inline-block shadow-lg border-2 border-fac-orange-500/20">
                  <QrCode className="h-16 w-16 text-gray-800" />
                </div>
                <p className="text-sm text-white mt-3 font-medium tracking-wide">
                  SCAN FOR QUICK CHECK-IN
                </p>
              </div>

              {/* Membership Status */}
              {totalWashes > 0 && (
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-fac-orange-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-fac-orange-400 font-bold tracking-wider">
                        REMAINING WASHES
                      </p>
                      <p className="text-2xl font-black text-white">
                        {remainingWashes}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-fac-orange-400 font-bold tracking-wider">
                        VALID UNTIL
                      </p>
                      <p className="text-sm font-bold text-white">
                        {expiryDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-400 font-medium">
                  NON-TRANSFERABLE • TERMS APPLY
                </p>
                <p className="text-xs text-fac-orange-400 font-bold">
                  FAYEEDAUTOCARE.COM
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1 rounded-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1 rounded-xl"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        Tap card to flip • Long press for options
      </p>
    </div>
  );
}
