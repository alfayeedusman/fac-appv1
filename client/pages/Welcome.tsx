import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Star,
  Crown,
  Zap,
  Shield,
  Smartphone,
  Car,
  CheckCircle,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import SplashScreen from "@/components/SplashScreen";
import AdBanner from "@/components/AdBanner";
import { getVisibleAdsForUser, Ad } from "@/utils/adsUtils";

export default function Welcome() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const [welcomeAds, setWelcomeAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
      // Load ads for welcome page
      const ads = getVisibleAdsForUser("welcome", email);
      setWelcomeAds(ads);
    }

    // Check if splash screen should be shown
    const shouldShowSplash = localStorage.getItem("showSplashScreen");
    if (shouldShowSplash === "true") {
      setShowSplash(true);
      localStorage.removeItem("showSplashScreen");
    }

    // Auto-advance steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleAdDismiss = (adId: string) => {
    setWelcomeAds((prev) => prev.filter((ad) => ad.id !== adId));
  };

  if (showSplash) {
    const userName = userEmail.split("@")[0];
    const isFirstTime = !localStorage.getItem("hasSeenWelcome");

    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        userName={userName}
        isFirstTime={isFirstTime}
      />
    );
  }

  const handleGetStarted = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    // Mark user as having completed welcome flow
    if (userEmail) {
      localStorage.setItem(`welcomed_${userEmail}`, "true");
    }
    navigate("/dashboard");
  };

  const features = [
    {
      icon: <Car className="h-8 w-8" />,
      title: "Professional Car Wash",
      description:
        "Expert hand washing and premium cleaning services for all vehicle types",
      gradient: "from-fac-orange-500 to-yellow-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Paint Protection",
      description:
        "Graphene coating and advanced protection treatments available",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Digital Experience",
      description:
        "Mobile app booking, QR check-in, and real-time service updates",
      gradient: "from-green-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      <StickyHeader showBack={false} title="Welcome" />

      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-fac-orange-500/10 to-purple-500/10 blur-3xl animate-breathe"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/10 to-fac-orange-500/10 blur-2xl animate-float"></div>
        <div className="absolute top-1/2 right-1/6 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl animate-float animate-delay-300"></div>

        {/* Animated particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-fac-orange-500 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-500 rounded-full animate-ping animate-delay-200"></div>
        <div className="absolute bottom-40 left-16 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping animate-delay-500"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          {/* Logo with Glow Effect */}
          <div className="mb-12 animate-fade-in-up">
            <div className="relative inline-block">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                alt="Fayeed Auto Care Logo"
                className="h-28 w-auto mx-auto animate-pulse-glow"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-fac-orange-500/20 to-purple-500/20 rounded-full blur-xl animate-breathe"></div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-6 mb-16 max-w-lg">
            <h1 className="text-5xl font-black text-foreground tracking-tight leading-tight animate-fade-in-up animate-delay-100">
              Welcome to the{" "}
              <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
                Future
              </span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium animate-fade-in-up animate-delay-200">
              Hey{" "}
              <span className="font-bold text-fac-orange-500">
                {userEmail.split("@")[0]}
              </span>
              ! Experience the next generation of car care with AI-powered
              precision.
            </p>
          </div>

          {/* Feature Showcase */}
          <div className="w-full max-w-md mb-16">
            <Card className="glass border-border shadow-2xl relative overflow-hidden animate-fade-in-up animate-delay-300">
              <div className="absolute inset-0 bg-gradient-to-br from-fac-orange-500/5 to-purple-500/5"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`bg-gradient-to-r ${features[currentStep].gradient} p-4 rounded-2xl animate-pulse-glow`}
                  >
                    <div className="text-white">
                      {features[currentStep].icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4">
                  {features[currentStep].title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {features[currentStep].description}
                </p>
              </CardContent>
            </Card>

            {/* Feature Indicators */}
            <div className="flex justify-center space-x-3 mt-6 animate-fade-in-up animate-delay-400">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentStep === index
                      ? "bg-fac-orange-500 scale-125"
                      : "bg-muted hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Benefits Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-4xl w-full animate-fade-in-up animate-delay-500">
            <div className="text-center group">
              <div className="glass w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform hover-lift">
                <Car className="h-8 w-8 text-fac-orange-500" />
              </div>
              <h4 className="font-bold text-foreground mb-2">
                Multi-Vehicle Service
              </h4>
              <p className="text-sm text-muted-foreground">
                Cars, motorcycles, SUVs - we service them all
              </p>
            </div>
            <div className="text-center group">
              <div className="glass w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform hover-lift">
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
              <h4 className="font-bold text-foreground mb-2">VIP Packages</h4>
              <p className="text-sm text-muted-foreground">
                Premium subscriptions with exclusive benefits
              </p>
            </div>
            <div className="text-center group">
              <div className="glass w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform hover-lift">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Expert Care</h4>
              <p className="text-sm text-muted-foreground">
                Professional detailing and protection services
              </p>
            </div>
          </div>

          {/* What's New Section */}
          <Card className="glass border-border shadow-2xl mb-16 max-w-2xl w-full animate-fade-in-up animate-delay-600">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="gradient-primary p-3 rounded-xl mr-4 animate-pulse-glow">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-foreground">
                  What's New in 2025
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Professional car wash and auto detailing services",
                  "Graphene coating and paint protection treatments",
                  "Mobile app booking with QR code check-in",
                  "Two convenient locations: Tumaga and Boalan",
                  "Motorcycle and car washing with expert care",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ads Section */}
          {welcomeAds.length > 0 && (
            <div className="w-full max-w-2xl mb-8 animate-fade-in-up animate-delay-700">
              <AdBanner
                ad={welcomeAds[currentAdIndex]}
                userEmail={userEmail}
                variant="inline"
                onDismiss={handleAdDismiss}
                className="mb-4"
              />
              {welcomeAds.length > 1 && (
                <div className="flex justify-center gap-2">
                  {welcomeAds.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentAdIndex
                          ? "bg-fac-orange-500 w-4"
                          : "bg-muted-foreground/30"
                      }`}
                      onClick={() => setCurrentAdIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="space-y-6 max-w-sm w-full animate-fade-in-up animate-delay-700">
            <Button
              onClick={handleGetStarted}
              className="btn-futuristic w-full py-6 text-xl rounded-2xl font-black relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                ENTER THE FUTURE
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ready when you are •{" "}
                <span className="text-fac-orange-500 font-semibold">
                  Zero setup required
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 px-6">
          <div className="glass rounded-2xl p-4 max-w-sm mx-auto animate-fade-in-up animate-delay-800">
            <p className="text-xs text-muted-foreground font-medium">
              © 2025 Fayeed Auto Care • Powered by AI • Secured by quantum
              encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
