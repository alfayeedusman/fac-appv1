import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Crown,
  Droplets,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState("John");

  useEffect(() => {
    // Get user name from localStorage or API
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      const name = userEmail.split("@")[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, []);

  const welcomeSteps = [
    {
      icon: Crown,
      title: "Welcome to FAC!",
      subtitle: `Hi ${userName}, ready for premium car care?`,
      description:
        "Your journey to professional car washing starts here. Enjoy premium services, exclusive benefits, and convenient mobile booking.",
      color: "bg-fac-orange-500",
    },
    {
      icon: Droplets,
      title: "Premium Services",
      subtitle: "Professional car care at your fingertips",
      description:
        "Choose from Classic, VIP ProMax, or Premium wash packages. Each service is designed to keep your car looking its best.",
      color: "bg-blue-500",
    },
    {
      icon: MapPin,
      title: "Multiple Locations",
      subtitle: "Convenient branches across Zamboanga City",
      description:
        "Visit our Tumaga or Boalan branches. Book online and enjoy hassle-free car washing at your preferred location.",
      color: "bg-green-500",
    },
    {
      icon: Star,
      title: "Exclusive Benefits",
      subtitle: "VIP membership perks and rewards",
      description:
        "Earn loyalty points, get monthly wash allowances, and enjoy exclusive member discounts. Your loyalty pays off!",
      color: "bg-purple-500",
    },
  ];

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("hasSeenWelcome", "true");
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    navigate("/dashboard");
  };

  const currentWelcome = welcomeSteps[currentStep];
  const Icon = currentWelcome.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center p-6">
        <div className="flex space-x-2">
          {welcomeSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? "bg-fac-orange-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-gray-500 font-medium"
        >
          Skip
        </Button>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
          alt="Fayeed Auto Care Logo"
          className="h-12 w-auto mb-8"
        />

        {/* Main Icon */}
        <div
          className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 ${currentWelcome.color}`}
        >
          <Icon className="h-12 w-12 text-white" />
        </div>

        {/* Content */}
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-black text-black mb-4 tracking-tight">
            {currentWelcome.title}
          </h1>
          <h2 className="text-lg font-bold text-fac-orange-500 mb-4">
            {currentWelcome.subtitle}
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed">
            {currentWelcome.description}
          </p>
        </div>

        {/* Feature Cards for certain steps */}
        {currentStep === 1 && (
          <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm">
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-black">Classic</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="bg-fac-orange-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Crown className="h-5 w-5 text-fac-orange-600" />
                </div>
                <p className="text-xs font-bold text-black">VIP</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-black">Premium</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branches for location step */}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-bold text-black">Tumaga</p>
                <p className="text-xs text-gray-500">Main Branch</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-bold text-black">Boalan</p>
                <p className="text-xs text-gray-500">Full Service</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Benefits for last step */}
        {currentStep === 3 && (
          <div className="space-y-3 mt-8 w-full max-w-sm">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm font-bold text-black">
                Monthly wash allowances
              </span>
            </div>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm font-bold text-black">
                Loyalty points & rewards
              </span>
            </div>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm font-bold text-black">
                Exclusive member discounts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-6">
        <Button
          onClick={handleNext}
          className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-black py-4 text-lg rounded-xl"
        >
          {currentStep < welcomeSteps.length - 1 ? (
            <>
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>

        {currentStep > 0 && (
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-full mt-3 text-gray-500 font-medium"
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
