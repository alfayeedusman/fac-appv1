import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import {
  Car,
  Droplets,
  Star,
  MapPin,
  ArrowRight,
  Shield,
  Crown,
  Sparkles,
  Zap,
  Smartphone,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (hasSeenWelcome === "true") {
        navigate("/dashboard");
      } else {
        navigate("/welcome");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-fac-orange-500/10 to-purple-500/10 blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/10 to-fac-orange-500/10 blur-xl animate-float animate-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-2xl animate-breathe"></div>
      </div>

      {/* Theme Toggle with Modern Styling */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-16 text-center max-w-md mx-auto">
        {/* Logo with Glow Effect */}
        <div className="mb-8 animate-fade-in-up">
          <div className="relative inline-block">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-24 w-auto mx-auto animate-pulse-glow"
            />
          </div>
        </div>

        {/* Modern Typography */}
        <div className="space-y-4 mb-12">
          <h1 className="text-5xl font-black text-foreground tracking-tight leading-tight animate-fade-in-up animate-delay-100">
            <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
              Future
            </span>{" "}
            Car Care
          </h1>
          <p className="text-xl text-muted-foreground font-medium animate-fade-in-up animate-delay-200">
            Experience premium auto care
          </p>
          <p className="text-muted-foreground font-medium animate-fade-in-up animate-delay-300">
            in the digital age • Zamboanga City
          </p>
        </div>

        {/* Modern Feature Highlights with Glassmorphism */}
        <div className="grid grid-cols-3 gap-4 mb-16 animate-fade-in-up animate-delay-400">
          <div className="text-center group">
            <div className="glass w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 hover-lift">
              <Droplets className="h-8 w-8 text-fac-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">AI-Powered</p>
            <p className="text-xs text-muted-foreground">Wash Tech</p>
          </div>
          <div className="text-center group">
            <div className="glass w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 hover-lift">
              <Crown className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">Premium</p>
            <p className="text-xs text-muted-foreground">Services</p>
          </div>
          <div className="text-center group">
            <div className="glass w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 hover-lift">
              <Smartphone className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm font-bold text-foreground">Smart</p>
            <p className="text-xs text-muted-foreground">Booking</p>
          </div>
        </div>

        {/* Futuristic CTA Buttons */}
        <div className="space-y-6 max-w-sm mx-auto">
          <Link
            to="/signup"
            className="block animate-fade-in-up animate-delay-500"
          >
            <Button className="btn-futuristic w-full py-6 text-lg rounded-2xl shadow-2xl relative overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center font-black">
                START YOUR JOURNEY
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-fac-orange-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </Link>

          <div className="relative my-8 animate-fade-in-up animate-delay-600">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border opacity-30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-background text-muted-foreground font-medium glass rounded-full py-2">
                Already a member?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="block animate-fade-in-up animate-delay-700"
          >
            <Button
              variant="outline"
              className="group w-full border-2 border-border hover:border-fac-orange-500 text-foreground hover:bg-fac-orange-500 hover:text-white font-black py-6 text-lg rounded-2xl transition-all duration-300 transform hover-lift glass"
            >
              <span className="flex items-center justify-center">
                ACCESS ACCOUNT
                <Zap className="h-5 w-5 ml-3 group-hover:scale-125 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Modern Features Section */}
      <div className="px-6 py-16 relative z-10">
        <h2 className="text-3xl font-black text-foreground text-center mb-12 animate-fade-in-up">
          Why Choose{" "}
          <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
            FAC 2025
          </span>
          ?
        </h2>

        <div className="space-y-6 max-w-md mx-auto">
          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-100 group">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow">
                  <Star className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg mb-2">
                    AI-Driven Excellence
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Smart algorithms optimize every wash for your vehicle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-200 group">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow">
                  <Shield className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg mb-2">
                    Eco-Smart Technology
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Advanced water recycling and green chemistry
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-300 group">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                <div className="gradient-futuristic w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="h-8 w-8 text-white group-hover:rotate-45 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg mb-2">
                    Seamless Experience
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    QR codes, mobile app, and contactless service
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Locations Section with Modern Cards */}
      <div className="px-6 py-16 bg-muted/30 theme-transition relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/10 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-foreground text-center mb-12 animate-fade-in-up">
            Our{" "}
            <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
              Smart Hubs
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-100 group">
              <CardContent className="p-6 text-center">
                <div className="gradient-primary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-black text-foreground text-base mb-1">
                  Tumaga Hub
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Main Station
                </p>
              </CardContent>
            </Card>
            <Card className="glass border-border shadow-xl hover-lift animate-fade-in-up animate-delay-200 group">
              <CardContent className="p-6 text-center">
                <div className="gradient-secondary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-black text-foreground text-base mb-1">
                  Boalan Hub
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Express Service
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="px-6 py-12 text-center relative z-10">
        <div className="glass rounded-2xl p-6 max-w-sm mx-auto animate-fade-in-up">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            © 2025 Fayeed Auto Care
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Revolutionizing car care with AI • Zamboanga City
          </p>
        </div>
      </div>
    </div>
  );
}
