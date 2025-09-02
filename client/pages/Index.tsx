import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle,
  Phone,
  Clock,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      const userRole = localStorage.getItem("userRole");

      // Always route admin and superadmin users directly to admin dashboard
      if (userRole === "admin" || userRole === "superadmin") {
        navigate("/admin-dashboard");
        return;
      }

      if (hasSeenWelcome === "true") {
        // Route based on user role
        if (userRole === "manager") {
          navigate("/manager-dashboard");
        } else if (userRole === "crew") {
          navigate("/crew-dashboard");
        } else if (userRole === "cashier") {
          navigate("/pos");
        } else if (userRole === "inventory_manager") {
          navigate("/inventory-management");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/welcome");
      }
    } else {
      // Check if this is the superadmin trying to access directly
      // This handles cases where superadmin might not be authenticated but should auto-login
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail === "fffayeed@gmail.com") {
        // Auto-authenticate superadmin
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "superadmin");
        localStorage.setItem("hasSeenWelcome", "true");
        localStorage.setItem(`welcomed_${userEmail}`, "true");
        navigate("/admin-dashboard");
        return;
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      <StickyHeader showBack={false} title="Fayeed Auto Care" />

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-xl animate-float animate-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-2xl animate-breathe"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-500/6 to-blue-500/6 blur-lg animate-float animate-delay-500"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Section - Enhanced */}
      <div className="relative z-10 px-6 py-12 text-center max-w-md mx-auto">
        {/* Logo with Better Spacing */}
        <div className="mb-10 animate-fade-in-up">
          <div className="inline-block relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-20 w-auto mx-auto drop-shadow-lg"
            />
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-fac-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                Premium
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Typography */}
        <div className="space-y-6 mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight animate-fade-in-up animate-delay-100">
            <span className="block mb-2">
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                Smart
              </span>{" "}
              Auto Care
            </span>
            <span className="text-2xl md:text-3xl font-bold text-muted-foreground">
              for Modern Drivers
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 animate-fade-in-up animate-delay-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-lg text-muted-foreground font-medium">
              Premium Quality • Affordable Prices
            </p>
          </div>
          
          <p className="text-base text-muted-foreground animate-fade-in-up animate-delay-300 max-w-sm mx-auto leading-relaxed">
            Experience the future of car care with our advanced technology and expert service in Zamboanga City
          </p>
        </div>

        {/* Enhanced Feature Highlights */}
        <div className="grid grid-cols-3 gap-3 mb-12 animate-fade-in-up animate-delay-400">
          <div className="text-center group">
            <div className="glass w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 hover-lift group-hover:scale-105 transition-all duration-300">
              <Droplets className="h-6 w-6 text-fac-orange-500" />
            </div>
            <p className="text-xs font-bold text-foreground mb-1">Premium</p>
            <p className="text-xs text-muted-foreground">Car Wash</p>
          </div>
          <div className="text-center group">
            <div className="glass w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 hover-lift group-hover:scale-105 transition-all duration-300">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-foreground mb-1">Quick</p>
            <p className="text-xs text-muted-foreground">Service</p>
          </div>
          <div className="text-center group">
            <div className="glass w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 hover-lift group-hover:scale-105 transition-all duration-300">
              <Smartphone className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-foreground mb-1">Smart</p>
            <p className="text-xs text-muted-foreground">Booking</p>
          </div>
        </div>

        {/* Enhanced CTA Buttons */}
        <div className="space-y-4 max-w-sm mx-auto">
          <Link
            to="/signup"
            className="block animate-fade-in-up animate-delay-500"
          >
            <Button className="w-full py-4 text-base font-bold rounded-xl shadow-lg bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white border-0 hover-lift group transition-all duration-300">
              <span className="flex items-center justify-center">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground font-medium px-3">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/login" className="animate-fade-in-up animate-delay-600">
              <Button
                variant="outline"
                className="w-full py-3 text-sm font-bold rounded-xl border-2 hover:bg-fac-orange-50 hover:border-fac-orange-200 dark:hover:bg-fac-orange-950 transition-all duration-300"
              >
                <Zap className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>

            <Link to="/guest-booking" className="animate-fade-in-up animate-delay-700">
              <Button
                variant="outline"
                className="w-full py-3 text-sm font-bold rounded-xl border-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 transition-all duration-300"
              >
                📅 Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Services Section */}
      <div className="px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-fac-orange-100 text-fac-orange-700 dark:bg-fac-orange-900 dark:text-fac-orange-200">
            Our Services
          </Badge>
          <h2 className="text-3xl font-black text-foreground animate-fade-in-up">
            Premium{" "}
            <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
              Auto Care
            </span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Professional services designed to keep your vehicle in perfect condition
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          {[
            {
              icon: Car,
              title: "Car & Motor Wash",
              description: "Premium cleaning with eco-friendly products for a spotless finish",
              gradient: "from-fac-orange-500 to-fac-orange-600",
              delay: "animate-delay-100"
            },
            {
              icon: Star,
              title: "Auto Detailing",
              description: "Comprehensive interior and exterior detailing services",
              gradient: "from-purple-500 to-purple-600",
              delay: "animate-delay-200"
            },
            {
              icon: Sparkles,
              title: "Headlight Restoration",
              description: "Crystal clear headlights for enhanced visibility and safety",
              gradient: "from-blue-500 to-blue-600",
              delay: "animate-delay-300"
            },
            {
              icon: Shield,
              title: "Graphene Coating",
              description: "Advanced protection with long-lasting durability",
              gradient: "from-yellow-500 to-orange-500",
              delay: "animate-delay-400"
            }
          ].map((service, index) => (
            <Card key={index} className={`glass border-border/50 shadow-md hover:shadow-xl hover-lift animate-fade-in-up ${service.delay} group transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${service.gradient} flex-shrink-0`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-fac-orange-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Vision & Mission */}
      <div className="px-6 py-16 bg-gradient-to-b from-muted/30 to-muted/10 relative">
        <div className="relative z-10 max-w-md mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
              About Us
            </Badge>
            <h2 className="text-3xl font-black text-foreground animate-fade-in-up">
              Our{" "}
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                Story
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-black text-foreground text-lg mb-4">Our Vision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To become Zamboanga's most trusted auto care brand, delivering premium quality services at affordable prices for every car owner.
                </p>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-black text-foreground text-lg mb-4">Our Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Committed to excellence in auto detailing and protection, treating every vehicle with care while exceeding customer expectations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Locations */}
      <div className="px-6 py-16 relative">
        <div className="relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              Locations
            </Badge>
            <h2 className="text-3xl font-black text-foreground animate-fade-in-up">
              Visit Our{" "}
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                Branches
              </span>
            </h2>
            <p className="text-muted-foreground mt-2">Conveniently located across Zamboanga City</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-100 group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">Tumaga Branch</h3>
                <p className="text-sm text-muted-foreground mb-3">Air Bell Subdivision</p>
                <Button size="sm" variant="ghost" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Contact
                </Button>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 shadow-md hover-lift animate-fade-in-up animate-delay-200 group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">Boalan Branch</h3>
                <p className="text-sm text-muted-foreground mb-3">Besides Divisoria Checkpoint</p>
                <Button size="sm" variant="ghost" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Contact
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="px-6 py-12 bg-gradient-to-t from-muted/20 to-transparent relative z-10">
        <div className="glass rounded-2xl p-8 max-w-sm mx-auto text-center animate-fade-in-up">
          <div className="mb-4">
            <Badge className="bg-fac-orange-100 text-fac-orange-700 dark:bg-fac-orange-900 dark:text-fac-orange-200 mb-2">
              Est. 2025
            </Badge>
            <h3 className="font-bold text-foreground mb-2">Fayeed Auto Care</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Zamboanga's First Smart Carwash & Auto Detailing Service
            </p>
          </div>
          
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <span className="font-medium text-fac-orange-600">Fdigitals</span>
              <span className="inline-block ml-1 animate-pulse">🧡</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
