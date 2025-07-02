import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Calendar,
  Car,
  Droplets,
  Crown,
  Clock,
  MapPin,
  CheckCircle,
  User,
  Bell,
  QrCode,
  Star,
  ArrowRight,
  Heart,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

interface Service {
  id: string;
  name: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  duration: string;
  popular?: boolean;
  category: "wash" | "detail" | "maintenance";
}

interface RecentService {
  id: string;
  service: Service;
  date: string;
  status: "completed" | "scheduled";
  branch: string;
}

export default function Dashboard() {
  const [popularServices] = useState<Service[]>([
    {
      id: "1",
      name: "Premium ProMax Wash",
      price: "$25",
      image:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 124,
      duration: "45 min",
      popular: true,
      category: "wash",
    },
    {
      id: "2",
      name: "AI Interior Detail",
      price: "$35",
      image:
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&crop=center",
      rating: 4.9,
      reviews: 89,
      duration: "60 min",
      popular: true,
      category: "detail",
    },
    {
      id: "3",
      name: "Express Wash",
      price: "$15",
      image:
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=300&fit=crop&crop=center",
      rating: 4.6,
      reviews: 256,
      duration: "20 min",
      category: "wash",
    },
  ]);

  const [recentServices] = useState<RecentService[]>([
    {
      id: "1",
      service: {
        id: "4",
        name: "VIP Full Detail",
        price: "$75",
        image:
          "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop&crop=center",
        rating: 4.9,
        reviews: 45,
        duration: "120 min",
        category: "detail",
      },
      date: "2024-01-15",
      status: "completed",
      branch: "Tumaga Hub",
    },
  ]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300",
        )}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-fac-orange-500/3 to-purple-500/3 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-blue-500/3 to-fac-orange-500/3 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-xl animate-float animate-delay-300"></div>
      </div>

      <div className="px-6 py-8 max-w-md mx-auto relative z-10">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                alt="Fayeed Auto Care Logo"
                className="h-14 w-auto object-contain animate-pulse-glow"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Hey,{" "}
                <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                  John
                </span>
                !
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Ready for your next wash? ✨
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle
              variant="ghost"
              size="icon"
              className="glass rounded-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="glass rounded-full hover-lift"
            >
              <Bell className="h-5 w-5 text-foreground" />
            </Button>
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="glass rounded-full hover-lift"
              >
                <User className="h-5 w-5 text-foreground" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="glass hover:bg-accent border-border text-foreground hover:text-fac-orange-500 rounded-full transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Premium Membership Status Card */}
        <Card className="glass border-border shadow-2xl hover-lift mb-8 animate-fade-in-up animate-delay-100 relative overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-fac-orange-500 via-purple-500 to-fac-orange-500 opacity-20 animate-shimmer"></div>
          <div className="relative bg-background/80 backdrop-blur-sm m-[1px] rounded-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="gradient-primary p-4 rounded-2xl animate-pulse-glow">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">
                      {membershipData.package}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Premium Member
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="glass rounded-2xl px-4 py-3 border border-fac-orange-500/30">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      EXPIRES IN
                    </p>
                    <p className="text-3xl font-black text-fac-orange-500">
                      {membershipData.daysLeft}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      days
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">
                        Cycle Resets
                      </span>
                      <RefreshCw className="h-4 w-4 text-fac-orange-500" />
                    </div>
                    <p className="font-bold text-foreground">
                      {membershipData.daysLeftInCycle} days
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">
                        Auto-Renewal
                      </span>
                      {membershipData.autoRenewal ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="font-bold text-foreground">
                      {membershipData.autoRenewal ? "Active" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Link to="/manage-subscription">
                  <Button className="w-full glass border-border text-foreground hover:bg-fac-orange-500 hover:text-white font-bold rounded-xl py-3 transition-all duration-300 hover-lift">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Quick Actions with Modern Design */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Link to="/booking" className="animate-fade-in-up animate-delay-200">
            <Card className="glass border-border shadow-xl hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="font-black text-foreground mb-2 text-lg">
                  Book Wash
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Schedule AI service
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile" className="animate-fade-in-up animate-delay-300">
            <Card className="glass border-border shadow-xl hover-lift transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <p className="font-black text-foreground mb-2 text-lg">
                  Smart QR
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Instant access
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Monthly Benefits with Futuristic Design */}
        <Card className="glass border-border shadow-2xl mb-8 animate-fade-in-up animate-delay-400">
          <CardHeader className="pb-6">
            <CardTitle>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="gradient-futuristic p-3 rounded-xl animate-pulse-glow">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-black text-foreground">
                    AI Benefits Hub
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="glass border-border text-muted-foreground font-bold hover-lift"
                >
                  View Details
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Classic Unlimited */}
            <div className="glass rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-xl">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-black text-foreground">AI Classic</span>
                </div>
                <Badge className="bg-green-500 text-white text-xs font-bold">
                  UNLIMITED
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3 relative z-10">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full w-full animate-shimmer"></div>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-3 relative z-10">
                ∞ Unlimited AI-powered washes this month
              </p>
            </div>

            {/* VIP ProMax */}
            <div className="glass rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-xl">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-black text-foreground">VIP ProMax</span>
                </div>
                <Badge className="bg-purple-500 text-white text-xs font-bold">
                  {membershipData.remainingWashes.vipProMax} LEFT
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-3 relative z-10">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${getProgressPercentage(
                      membershipData.remainingWashes.vipProMax,
                      membershipData.totalWashes.vipProMax,
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-3 relative z-10">
                {membershipData.remainingWashes.vipProMax} of{" "}
                {membershipData.totalWashes.vipProMax} premium washes
              </p>
            </div>

            {/* Premium Detail */}
            <div className="glass rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-fac-orange-500/20 to-yellow-500/20 rounded-full blur-lg"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-fac-orange-500 p-2 rounded-lg">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-foreground text-sm">
                    Premium Detail
                  </span>
                </div>
                <Badge className="bg-fac-orange-500 text-white text-xs">
                  {membershipData.remainingWashes.premium} LEFT
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 relative z-10">
                <div
                  className="bg-gradient-to-r from-fac-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${getProgressPercentage(
                      membershipData.remainingWashes.premium,
                      membershipData.totalWashes.premium,
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 relative z-10">
                {membershipData.remainingWashes.premium} luxury detail remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity with Modern Cards */}
        <Card className="glass border-border shadow-2xl mb-8 animate-fade-in-up animate-delay-500">
          <CardHeader className="pb-6">
            <CardTitle>
              <div className="flex items-center space-x-3">
                <div className="gradient-secondary p-3 rounded-xl animate-pulse-glow">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-foreground">
                  Recent Activity
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {washLogs.slice(0, 3).map((log, index) => (
                <div
                  key={log.id}
                  className={`glass rounded-2xl p-5 hover-lift cursor-pointer transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="gradient-primary p-2 rounded-xl">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-black text-foreground text-sm">
                          {log.service}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium">
                          <span>{formatDate(log.date)}</span>
                          <span>•</span>
                          <span>{log.branch}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500 text-white text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-600">
            <CardContent className="p-8 text-center">
              <div className="gradient-primary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">
                {washLogs.length}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                TOTAL WASHES
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-700">
            <CardContent className="p-8 text-center">
              <div className="gradient-secondary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <p className="text-3xl font-black text-foreground mb-1">
                {
                  washLogs.filter(
                    (log) =>
                      new Date(log.date).getMonth() === new Date().getMonth(),
                  ).length
                }
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                THIS MONTH
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Futuristic Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border z-50 md:hidden animate-slide-in-left">
        <div className="grid grid-cols-4 h-16 px-2 py-3">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center space-y-1 bg-fac-orange-50 dark:bg-fac-orange-950 text-fac-orange-500 rounded-xl mx-1 py-2"
          >
            <Crown className="h-5 w-5" />
            <span className="text-xs font-bold">Home</span>
          </Link>
          <Link
            to="/booking"
            className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-foreground transition-colors mx-1 py-2 rounded-xl hover:bg-muted/30"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">Book</span>
          </Link>
          <Link
            to="/manage-subscription"
            className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-foreground transition-colors mx-1 py-2 rounded-xl hover:bg-muted/30"
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs font-medium">Plans</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-foreground transition-colors mx-1 py-2 rounded-xl hover:bg-muted/30"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
