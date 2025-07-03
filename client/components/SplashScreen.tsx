import { useEffect, useState } from "react";
import { Sparkles, Car, Crown, Star } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  userName?: string;
  isFirstTime?: boolean;
}

export default function SplashScreen({
  onComplete,
  userName,
  isFirstTime = false,
}: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      icon: Car,
      title: "Welcome to Fayeed Auto Care",
      subtitle: isFirstTime
        ? "Let's get you started!"
        : `Welcome back, ${userName}!`,
      color: "from-fac-orange-500 to-orange-600",
    },
    {
      icon: Sparkles,
      title: "Premium Car Care",
      subtitle: "Experience the future of car washing",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Crown,
      title: "VIP Experience",
      subtitle: "Quality service you deserve",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsVisible(false);
        setTimeout(onComplete, 500);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length, onComplete]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background to-muted flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-fac-orange-500/10 to-purple-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/10 to-fac-orange-500/10 blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 blur-xl animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8 max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="relative inline-block">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-20 w-auto mx-auto animate-pulse-glow"
            />
          </div>
        </div>

        {/* Animated Icon */}
        <div className="mb-8">
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center mx-auto animate-scale-in shadow-2xl`}
          >
            <IconComponent className="h-12 w-12 text-white animate-bounce" />
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {currentStepData.title}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mt-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index <= currentStep
                  ? "bg-fac-orange-500 scale-125"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Loading Animation */}
        <div className="mt-8">
          <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fac-orange-500 to-purple-600 rounded-full transition-all duration-1500 ease-out"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                transform: "translateX(0%)",
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {isFirstTime
              ? "Setting up your account..."
              : "Loading your dashboard..."}
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-pulse-glow {
          animation: pulse 2s infinite;
          filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.3));
        }
      `}</style>
    </div>
  );
}
