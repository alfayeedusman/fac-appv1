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
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import AdBanner from "@/components/AdBanner";
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
      id: 'welcome',
      title: 'Welcome to Fayeed Auto Care',
      subtitle: `Hello ${userEmail.split("@")[0]}!`,
      description: 'Professional car care services in Zamboanga City.',
      icon: <Sparkles className="h-12 w-12" />,
      content: (
        <div className="space-y-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
            alt="Fayeed Auto Care Logo"
            className="h-24 w-auto mx-auto"
          />
        </div>
      ),
    },
    {
      id: 'services',
      title: 'Our Services',
      subtitle: 'Professional Care',
      description: 'Expert hand washing, premium cleaning, and protection services for all vehicle types.',
      icon: <Car className="h-12 w-12" />,
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: <Car className="h-5 w-5" />, title: 'Car Washing', desc: 'Professional hand wash' },
            { icon: <Shield className="h-5 w-5" />, title: 'Paint Protection', desc: 'Graphene coating available' },
            { icon: <Star className="h-5 w-5" />, title: 'Premium Detailing', desc: 'Expert care service' },
          ].map((service, idx) => (
            <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
              <div className="text-fac-orange-500">{service.icon}</div>
              <div>
                <h4 className="font-semibold text-sm">{service.title}</h4>
                <p className="text-xs text-muted-foreground">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'features',
      title: 'Digital Experience',
      subtitle: 'Modern Technology',
      description: 'Mobile app booking, QR check-in, and real-time service updates.',
      icon: <Smartphone className="h-12 w-12" />,
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: <Smartphone className="h-5 w-5" />, title: 'Mobile Booking', desc: 'Book anytime, anywhere' },
            { icon: <CheckCircle className="h-5 w-5" />, title: 'QR Check-in', desc: 'Quick branch access' },
            { icon: <Bell className="h-5 w-5" />, title: 'Real-time Updates', desc: 'Service notifications' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
              <div className="text-fac-orange-500">{feature.icon}</div>
              <div>
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'locations',
      title: 'Our Locations',
      subtitle: 'Find Us Here',
      description: 'Two convenient locations to serve you better.',
      icon: <Crown className="h-12 w-12" />,
      content: (
        <div className="space-y-3">
          {[
            { name: 'Tumaga Hub', address: 'Tumaga, Zamboanga City', status: 'Open Now' },
            { name: 'Boalan Hub', address: 'Boalan, Zamboanga City', status: 'Open Now' },
          ].map((location, idx) => (
            <div key={idx} className="p-4 border rounded-lg bg-card">
              <h4 className="font-semibold text-foreground">{location.name}</h4>
              <p className="text-sm text-muted-foreground">{location.address}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
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
    setCurrentSlide(prev => prev + 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating || currentSlide <= 0) return;
    setIsAnimating(true);
    setCurrentSlide(prev => prev - 1);
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
    <div className="min-h-screen bg-background theme-transition relative">
      {/* Simple header */}
      <div className="p-4 text-center border-b">
        <h1 className="text-lg font-semibold">Welcome</h1>
      </div>

                  {/* Main Slider Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Slide Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
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
          <Card className={`border shadow-lg transition-all duration-300 ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
            <CardContent className="p-6 text-center">
              {/* Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="bg-fac-orange-500 p-3 rounded-full text-white">
                  {currentSlideData.icon}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {currentSlideData.title}
                </h1>
                <h2 className="text-lg font-medium text-fac-orange-500">
                  {currentSlideData.subtitle}
                </h2>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {currentSlideData.description}
              </p>

              {/* Slide-specific Content */}
              <div className="mb-6">
                {currentSlideData.content}
              </div>

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
                    className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white px-6 py-2 font-semibold"
                    disabled={isAnimating}
                  >
                    <span className="flex items-center">
                      Enter Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={nextSlide}
                    disabled={isAnimating}
                    className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white px-6 py-2 font-semibold"
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
          <div className="text-center mt-4">
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
        <div className="text-center py-4 px-6">
          <p className="text-xs text-muted-foreground">
            © 2025 Fayeed Auto Care
          </p>
        </div>
      </div>
    </div>
  );
}