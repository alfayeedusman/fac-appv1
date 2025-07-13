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
  ArrowLeft,
  Bell,
  RefreshCw,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import SplashScreen from "@/components/SplashScreen";
import AdBanner from "@/components/AdBanner";
import NotificationDropdown from "@/components/NotificationDropdown";
import { getVisibleAdsForUser, Ad } from "@/utils/adsUtils";

export default function Welcome() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [showSplash, setShowSplash] = useState(false);
  const [welcomeAds, setWelcomeAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

    // Remove auto-advance for manual step control
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

    // Route based on user role
    const userRole = localStorage.getItem("userRole");
    if (userRole === "admin" || userRole === "superadmin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  // Define slides for the journey
  const slides = [
    {
      id: "welcome",
      title: "Welcome to the Future",
      subtitle: `Hey ${userEmail.split("@")[0]}!`,
      description:
        "Experience the next generation of car care with AI-powered precision.",
      icon: <Sparkles className="h-12 w-12" />,
      gradient: "from-fac-orange-500 to-purple-600",
      content: (
        <div className="space-y-6">
          <div className="relative inline-block">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-24 w-auto mx-auto animate-pulse-glow"
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-fac-orange-500/20 to-purple-500/20 rounded-full blur-xl animate-breathe"></div>
          </div>
        </div>
      ),
    },
    {
      id: "services",
      title: "Our Services",
      subtitle: "Professional Care",
      description:
        "Expert hand washing, premium cleaning, and protection services for all vehicle types.",
      icon: <Car className="h-12 w-12" />,
      gradient: "from-fac-orange-500 to-yellow-500",
      content: (
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              icon: <Car className="h-6 w-6" />,
              title: "Car Washing",
              desc: "Professional hand wash",
            },
            {
              icon: <Shield className="h-6 w-6" />,
              title: "Paint Protection",
              desc: "Graphene coating available",
            },
            {
              icon: <Star className="h-6 w-6" />,
              title: "Premium Detailing",
              desc: "Expert care service",
            },
          ].map((service, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 p-3 glass rounded-xl"
            >
              <div className="text-fac-orange-500">{service.icon}</div>
              <div>
                <h4 className="font-bold text-sm">{service.title}</h4>
                <p className="text-xs text-muted-foreground">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "features",
      title: "Digital Experience",
      subtitle: "Modern Technology",
      description:
        "Mobile app booking, QR check-in, and real-time service updates.",
      icon: <Smartphone className="h-12 w-12" />,
      gradient: "from-green-500 to-cyan-500",
      content: (
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              icon: <Smartphone className="h-6 w-6" />,
              title: "Mobile Booking",
              desc: "Book anytime, anywhere",
            },
            {
              icon: <CheckCircle className="h-6 w-6" />,
              title: "QR Check-in",
              desc: "Quick branch access",
            },
            {
              icon: <Bell className="h-6 w-6" />,
              title: "Real-time Updates",
              desc: "Service notifications",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 p-3 glass rounded-xl"
            >
              <div className="text-green-500">{feature.icon}</div>
              <div>
                <h4 className="font-bold text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "locations",
      title: "Our Locations",
      subtitle: "Find Us Here",
      description: "Two convenient locations to serve you better.",
      icon: <Crown className="h-12 w-12" />,
      gradient: "from-purple-500 to-pink-500",
      content: (
        <div className="space-y-4">
          {[
            {
              name: "Tumaga Hub",
              address: "Tumaga, Zamboanga City",
              status: "Open Now",
            },
            {
              name: "Boalan Hub",
              address: "Boalan, Zamboanga City",
              status: "Open Now",
            },
          ].map((location, idx) => (
            <div key={idx} className="p-4 glass rounded-xl">
              <h4 className="font-bold text-foreground">{location.name}</h4>
              <p className="text-sm text-muted-foreground">
                {location.address}
              </p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded-full font-medium">
                {location.status}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    if (isAnimating || currentSlide >= totalSlides - 1) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating || currentSlide <= 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToSlide = (slideIndex: number) => {
    if (isAnimating || slideIndex === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(slideIndex);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      {/* Floating Icons - Top Right */}
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle variant="ghost" size="sm" />
        </div>
        <div className="glass rounded-full p-1 animate-fade-in-scale animate-delay-100">
          <NotificationDropdown />
        </div>
        <div className="glass rounded-full p-1 animate-fade-in-scale animate-delay-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => window.location.reload()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

      {/* Main Slider Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md mx-auto">
            {/* Slide Progress Indicator */}
            <div className="flex justify-center space-x-2 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-fac-orange-500 w-8"
                      : index < currentSlide
                        ? "bg-fac-orange-300 w-2"
                        : "bg-muted w-2"
                  }`}
                  disabled={isAnimating}
                />
              ))}
            </div>

            {/* Slide Card */}
            <Card
              className={`glass border-border shadow-2xl relative overflow-hidden transition-all duration-300 ${isAnimating ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient}/10`}
              ></div>
              <CardContent className="p-8 relative z-10 text-center">
                {/* Icon */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`bg-gradient-to-r ${currentSlideData.gradient} p-4 rounded-2xl animate-pulse-glow`}
                  >
                    <div className="text-white">{currentSlideData.icon}</div>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-6">
                  <h1 className="text-3xl font-black text-foreground mb-2">
                    {currentSlideData.title}
                  </h1>
                  <h2 className="text-xl font-bold text-fac-orange-500">
                    {currentSlideData.subtitle}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {currentSlideData.description}
                </p>

                {/* Slide-specific Content */}
                <div className="mb-8">{currentSlideData.content}</div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={prevSlide}
                    disabled={currentSlide === 0 || isAnimating}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </Button>

                  {isLastSlide ? (
                    <Button
                      onClick={handleGetStarted}
                      className="btn-futuristic px-8 py-3 font-bold"
                      disabled={isAnimating}
                    >
                      <span className="flex items-center">
                        ENTER DASHBOARD
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={nextSlide}
                      disabled={isAnimating}
                      className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white px-8 py-3 font-bold"
                    >
                      <span className="flex items-center">
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Step Counter */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Step {currentSlide + 1} of {totalSlides}
              </p>
            </div>
          </div>
        </div>

        {/* Ads Section */}
        {welcomeAds.length > 0 && (
          <div className="px-6 pb-6">
            <div className="max-w-md mx-auto">
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
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 px-6">
          <div className="glass rounded-2xl p-3 max-w-sm mx-auto">
            <p className="text-xs text-muted-foreground font-medium">
              © 2025 Fayeed Auto Care • Powered by AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
