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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Find your favourite wash"
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 text-sm w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Filter className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Popular Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Popular Services
            </h2>
            <Button variant="ghost" size="sm" className="text-orange-500">
              See all
            </Button>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {popularServices.map((service) => (
              <Card
                key={service.id}
                className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border-0"
              >
                <div className="relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-32 object-cover"
                  />
                  {service.popular && (
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full"
                  >
                    <Heart className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                    {service.name}
                  </h3>
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(service.rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({service.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {service.price}
                    </span>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-1 h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Viewed */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Viewed
          </h2>

          {recentServices.map((recent) => (
            <Card
              key={recent.id}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border-0 mb-4"
            >
              <div className="flex items-center p-4">
                <div className="relative mr-4">
                  <img
                    src={recent.service.image}
                    alt={recent.service.name}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {recent.service.name}
                  </h3>
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(recent.service.rating)}
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {recent.service.price}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 p-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured Service Detail Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-3xl overflow-hidden border-0">
          <div className="relative">
            <img
              src={popularServices[0].image}
              alt={popularServices[0].name}
              className="w-full h-48 object-cover"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 left-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full"
            >
              <Heart className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {popularServices[0].name}
            </h1>
            <div className="flex items-center space-x-1 mb-3">
              {renderStars(popularServices[0].rating)}
              <span className="text-sm text-gray-500 ml-2">
                ({popularServices[0].reviews} reviews)
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
              Premium car wash service with AI-powered cleaning technology for
              superior results. Get the best care for your vehicle.
            </p>

            {/* Service Options */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Service Type
                </p>
                <div className="flex space-x-3">
                  {["Basic", "Premium", "Deluxe"].map((type, index) => (
                    <Button
                      key={type}
                      variant={index === 1 ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm",
                        index === 1
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "border-gray-200 dark:border-gray-600",
                      )}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Duration
                </p>
                <div className="flex space-x-3">
                  {["30 min", "45 min", "60 min", "90 min"].map(
                    (duration, index) => (
                      <Button
                        key={duration}
                        variant={index === 1 ? "default" : "outline"}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm",
                          index === 1
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "border-gray-200 dark:border-gray-600",
                        )}
                      >
                        {duration}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {popularServices[0].price}
                </p>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 py-3 font-semibold">
                Add to cart
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-1">
            <Link
              to="/dashboard"
              className="flex flex-col items-center justify-center py-2 px-1 text-orange-500"
            >
              <Crown className="h-5 w-5" />
              <span className="text-xs font-medium mt-1">Home</span>
            </Link>
            <Link
              to="/booking"
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs font-medium mt-1">Book</span>
            </Link>
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs font-medium mt-1">Orders</span>
            </Link>
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
