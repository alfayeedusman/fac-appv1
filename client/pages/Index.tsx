import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Car,
  Droplets,
  Star,
  MapPin,
  ArrowRight,
  Shield,
  Crown,
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
    <div className="min-h-screen bg-background theme-transition">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="px-6 py-12 text-center">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
          alt="Fayeed Auto Care Logo"
          className="h-20 w-auto mx-auto mb-8"
        />
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
          Premium Car Care
        </h1>
        <p className="text-xl text-muted-foreground font-medium mb-2">
          Professional car wash services
        </p>
        <p className="text-muted-foreground font-medium mb-8">
          in Zamboanga City
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-sm mx-auto">
          <div className="text-center">
            <div className="bg-fac-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Droplets className="h-6 w-6 text-fac-orange-600" />
            </div>
            <p className="text-xs font-bold text-foreground">Premium</p>
            <p className="text-xs text-muted-foreground">Wash</p>
          </div>
          <div className="text-center">
            <div className="bg-fac-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Crown className="h-6 w-6 text-fac-orange-600" />
            </div>
            <p className="text-xs font-bold text-foreground">VIP</p>
            <p className="text-xs text-muted-foreground">Packages</p>
          </div>
          <div className="text-center">
            <div className="bg-fac-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <MapPin className="h-6 w-6 text-fac-orange-600" />
            </div>
            <p className="text-xs font-bold text-foreground">Multiple</p>
            <p className="text-xs text-muted-foreground">Locations</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-6 max-w-sm mx-auto">
          <Link to="/signup">
            <Button className="group relative w-full bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700 text-white font-black py-5 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0">
              <span className="relative z-10 flex items-center justify-center">
                GET STARTED
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </Link>

          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground font-medium">
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          <Link to="/login">
            <Button
              variant="outline"
              className="group w-full border-2 border-border hover:border-foreground text-foreground hover:bg-foreground hover:text-background font-black py-5 text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] bg-background theme-transition"
            >
              <span className="flex items-center justify-center">
                SIGN IN
                <div className="ml-3 w-2 h-2 bg-current rounded-full group-hover:scale-150 transition-transform duration-300"></div>
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-8">
        <h2 className="text-2xl font-black text-foreground text-center mb-8">
          Why Choose FAC?
        </h2>

        <div className="space-y-4 max-w-md mx-auto">
          <Card className="bg-card border-border shadow-sm theme-transition">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-fac-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-foreground">
                    Professional Service
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Expert staff with years of experience
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm theme-transition">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-foreground">Eco-Friendly</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Green products and water conservation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm theme-transition">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-foreground">
                    Convenient Booking
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Mobile app with QR code system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Locations Section */}
      <div className="px-6 py-8 bg-muted theme-transition">
        <h2 className="text-2xl font-black text-foreground text-center mb-8">
          Our Locations
        </h2>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <Card className="bg-card border-border theme-transition">
            <CardContent className="p-4 text-center">
              <div className="bg-fac-orange-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-5 w-5 text-fac-orange-600" />
              </div>
              <h3 className="font-black text-foreground text-sm">
                Tumaga Branch
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Main Location
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border theme-transition">
            <CardContent className="p-4 text-center">
              <div className="bg-fac-orange-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-5 w-5 text-fac-orange-600" />
              </div>
              <h3 className="font-black text-foreground text-sm">
                Boalan Branch
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Full Service
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-xs text-muted-foreground font-medium mb-2">
          © 2024 Fayeed Auto Care
        </p>
        <p className="text-xs text-muted-foreground font-medium">
          Professional car wash services in Zamboanga City
        </p>
      </div>
    </div>
  );
}
