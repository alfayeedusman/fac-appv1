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

  // Generate unique FAC ID
  const generateFACId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const emailHash = email
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
      .toString(36)
      .substring(2, 6);
    return `FAC${timestamp}${randomStr}${emailHash}`
      .toUpperCase()
      .substring(0, 12);
  };

  const uniqueFACId = generateFACId();

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
      {/* Enhanced Instruction */}
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-fac-orange-500" />
          Tap card to flip and view details
        </p>
      </div>

      {/* Card Container with improved 3D effect */}
      <div
        className="relative w-full h-64 cursor-pointer transition-transform duration-700 ease-out hover:scale-105"
        style={{
          perspective: "1500px",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
        {/* Front of Card - Enhanced */}
        <Card
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-2 border-fac-orange-500/20"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            className={`w-full h-full bg-gradient-to-br ${config.color} relative overflow-hidden`}
          >
            {/* Enhanced Modern Luxury Background Pattern */}
            <div className="absolute inset-0">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/10 via-transparent to-purple-500/10 animate-pulse"></div>

              {/* Enhanced accent lines */}
              <div
                className={`absolute top-0 left-0 w-full h-1 ${config.accentColor} shadow-[0_0_20px_rgba(249,115,22,0.5)]`}
              ></div>
              <div
                className={`absolute bottom-0 right-0 w-1 h-full ${config.accentColor} shadow-[0_0_20px_rgba(249,115,22,0.5)]`}
              ></div>

              {/* Modern geometric grid */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
                `,
                  backgroundSize: "40px 40px",
                }}
              ></div>

              {/* Floating elements - 2025 style */}
              <div className="absolute top-6 right-6 opacity-8">
                <div className="w-20 h-20 border border-fac-orange-500/30 rounded-full "></div>
                <div className="absolute top-2 left-2 w-16 h-16 border border-fac-orange-500/20 rounded-full"></div>
              </div>

              {/* Bottom luxury pattern */}
              <div className="absolute bottom-6 left-6 opacity-10">
                <div className="flex space-x-1">
                  <div className="w-2 h-8 bg-fac-orange-500 rounded-full"></div>
                  <div className="w-2 h-6 bg-fac-orange-500/70 rounded-full"></div>
                  <div className="w-2 h-4 bg-fac-orange-500/50 rounded-full"></div>
                </div>
              </div>

              {/* Enhanced luxury shine effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transform -skew-x-12 animate-[shimmer_3s_ease-in-out_infinite]"></div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-fac-orange-500/5 via-transparent to-transparent"></div>
            </div>

            <style jsx>{`
              @keyframes shimmer {
                0%, 100% { transform: translateX(-100%) skewX(-12deg); }
                50% { transform: translateX(100%) skewX(-12deg); }
              }
            `}</style>

            {/* Card Content - Improved spacing */}
            <div className="relative z-10 p-7 h-full flex flex-col justify-between">
              {/* Enhanced Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl mr-3 border border-white/20">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                        alt="FAC Logo"
                        className="h-7 w-auto filter brightness-125 drop-shadow-lg"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white tracking-wider block drop-shadow-lg">
                        FAYEED AUTO CARE
                      </span>
                      <span className="text-xs text-fac-orange-300 font-bold tracking-wider">
                        PREMIUM MEMBER
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white font-black px-4 py-1.5 text-xs tracking-widest shadow-[0_4px_14px_0_rgba(249,115,22,0.6)] border border-fac-orange-400">
                    {config.name.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div
                    className={`p-2 rounded-lg ${config.accentColor} shadow-lg`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  {/* QR Code on front */}
                  <div className="bg-white/95 p-1.5 rounded-md shadow-lg">
                    <QrCode className="h-8 w-8 text-gray-800" />
                  </div>
                </div>
              </div>

              {/* Enhanced Member Info */}
              <div className="space-y-2.5">
                <p className="text-xl font-black text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {userName.toUpperCase()}
                </p>
                <p className="text-sm text-gray-200 font-medium opacity-95 drop-shadow-md">{email}</p>
                <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 inline-block border border-fac-orange-500/30 shadow-lg">
                  <p className="text-xs text-fac-orange-300 font-mono font-black tracking-[0.15em]">
                    MEMBER ID: {uniqueFACId}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-fac-orange-400 font-semibold tracking-wide">
                    MEMBER SINCE
                  </p>
                  <p className="text-sm font-bold text-white">{memberSince}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-fac-orange-400 font-semibold tracking-wide">
                    EXPIRES
                  </p>
                  <p className="text-sm font-bold text-white">{expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Back of Card - Enhanced */}
        <Card
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-2 border-fac-orange-500/20"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            className={`w-full h-full bg-gradient-to-br ${config.color} relative overflow-hidden`}
          >
            {/* Enhanced Magnetic Strip Effect */}
            <div className="absolute top-10 left-0 right-0 h-14 bg-gradient-to-r from-black/70 via-fac-orange-900/30 to-black/70 border-t border-b border-fac-orange-500/40 shadow-inner"></div>

            <div className="relative z-10 p-7 h-full flex flex-col justify-between">
              {/* Premium QR Code Section */}
              <div className="text-center mt-14">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-fac-orange-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(249,115,22,0.4)] border-2 border-fac-orange-400">
                    <QrCode className="h-24 w-24 text-gray-900 mx-auto" />
                    <div className="mt-3 text-xs text-gray-800 font-black text-center tracking-wider">
                      {uniqueFACId}
                    </div>
                  </div>
                </div>
                <p className="text-base text-white mt-5 font-black tracking-wider drop-shadow-lg">
                  SCAN FOR INSTANT ACCESS
                </p>
                <p className="text-xs text-fac-orange-300 mt-2 font-bold">
                  Quick Check-in • Member Services • Priority Lane
                </p>
              </div>

              {/* Premium Membership Status */}
              {totalWashes > 0 && (
                <div className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-md rounded-2xl p-5 border-2 border-fac-orange-500/60 shadow-[0_4px_24px_rgba(249,115,22,0.3)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-fac-orange-300 font-black tracking-[0.15em] mb-2">
                        REMAINING WASHES
                      </p>
                      <p className="text-4xl font-black text-white drop-shadow-lg">
                        {remainingWashes === 999 ? "∞" : remainingWashes}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-fac-orange-300 font-black tracking-[0.15em] mb-2">
                        STATUS
                      </p>
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-black px-3 py-1 shadow-lg">
                        ACTIVE
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Terms */}
              <div className="text-center space-y-3">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-fac-orange-500/30">
                  <p className="text-xs text-gray-100 font-bold tracking-wider">
                    NON-TRANSFERABLE • TERMS APPLY
                  </p>
                  <p className="text-sm text-fac-orange-400 font-black mt-2 tracking-wide">
                    FAYEEDAUTOCARE.COM
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-200 font-bold">
                    24/7 Premium Support Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="flex-1 rounded-xl border-fac-orange-500/50 hover:bg-fac-orange-500/10 hover:border-fac-orange-500 transition-all duration-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Card
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex-1 rounded-xl border-fac-orange-500/50 hover:bg-fac-orange-500/10 hover:border-fac-orange-500 transition-all duration-300"
        >
          <Share className="h-4 w-4 mr-2" />
          Share Card
        </Button>
      </div>
    </div>
  );
}
