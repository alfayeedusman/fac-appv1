import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car, Droplets, Star, MapPin } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
              alt="Fayeed Auto Care Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-fac-blue-900">FAC App</h1>
          <p className="text-fac-blue-700 font-medium">
            Your Premium Car Care Partner
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Premium Car Care
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Experience the finest car wash services in Zamboanga City.
              Professional care for your vehicle with convenient mobile booking.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="bg-fac-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Droplets className="h-8 w-8 text-fac-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Wash</h3>
              <p className="text-gray-600 text-sm">
                Professional cleaning with high-quality products
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-fac-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-8 w-8 text-fac-gold-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">VIP Packages</h3>
              <p className="text-gray-600 text-sm">
                Exclusive membership plans with amazing benefits
              </p>
            </div>
            <div className="text-center p-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Multiple Branches
              </h3>
              <p className="text-gray-600 text-sm">
                Convenient locations across Zamboanga City
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link to="/signup" className="block">
              <Button className="w-full bg-fac-blue-600 hover:bg-fac-blue-700 text-white py-4 text-lg font-semibold rounded-xl">
                Get Started - Sign Up Now
              </Button>
            </Link>
            <Link to="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full border-fac-blue-600 text-fac-blue-600 hover:bg-fac-blue-50 py-4 text-lg font-semibold rounded-xl"
              >
                Already a Member? View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Why Choose Fayeed Auto Care?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-fac-blue-100 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-fac-blue-600 rounded-full"></div>
              </div>
              <p className="text-gray-700">
                Professional staff with years of experience
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-fac-blue-100 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-fac-blue-600 rounded-full"></div>
              </div>
              <p className="text-gray-700">
                Eco-friendly products and water conservation
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-fac-blue-100 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-fac-blue-600 rounded-full"></div>
              </div>
              <p className="text-gray-700">
                Loyalty rewards and membership benefits
              </p>
            </div>
            <div className="flex items-start">
              <div className="bg-fac-blue-100 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-fac-blue-600 rounded-full"></div>
              </div>
              <p className="text-gray-700">
                Convenient QR code system for quick service
              </p>
            </div>
          </div>
        </div>

        {/* Branch Locations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Our Locations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-fac-blue-700">Tumaga Branch</h4>
              <p className="text-gray-600 text-sm">
                Professional car wash services
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-fac-blue-700">Boalan Branch</h4>
              <p className="text-gray-600 text-sm">Full-service auto care</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
