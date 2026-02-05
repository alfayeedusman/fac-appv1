import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Droplets, Clock, Smartphone, Moon, Sun } from "lucide-react";
import { authService } from "@/services/authService";

export default function Index() {
  const [isDark, setIsDark] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme === "dark" || 
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Logo */}
      <div className="mb-8 text-center relative">
        <div className="inline-block relative">
          <div className="text-4xl md:text-5xl font-black text-center" style={{ color: "#f97316" }}>
            FAYEED
          </div>
          <div className="text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white">
            AUTOCARE
          </div>
          <div className="absolute -top-2 -right-8 bg-fac-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Premium
          </div>
          <div className="flex justify-center gap-1 mt-1">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-8 h-1 bg-fac-orange-500 rounded"></div>
          </div>
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-6 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
          <span style={{ color: "#f97316" }}>Smart Auto Care</span>
          <span className="text-gray-900 dark:text-white"> for</span>
        </h1>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-600 dark:text-gray-300 mb-4">
          Modern Drivers
        </h1>
      </div>

      {/* Badge */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
        <span className="text-gray-700 dark:text-gray-300 font-semibold">
          Premium Quality • Affordable Prices
        </span>
      </div>

      {/* Description */}
      <p className="text-center text-gray-600 dark:text-gray-400 text-lg max-w-xl mb-12">
        Experience the future of car care with our advanced technology and expert service in Zamboanga City
      </p>

      {/* Features */}
      <div className="grid grid-cols-3 gap-8 mb-12 w-full max-w-lg">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Droplets className="w-8 h-8" style={{ color: "#f97316" }} />
          </div>
          <p className="font-bold text-gray-900 dark:text-white">Premium</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Car Wash</p>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Clock className="w-8 h-8" style={{ color: "#a855f7" }} />
          </div>
          <p className="font-bold text-gray-900 dark:text-white">Quick</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Service</p>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Smartphone className="w-8 h-8" style={{ color: "#3b82f6" }} />
          </div>
          <p className="font-bold text-gray-900 dark:text-white">Smart</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Booking</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-sm space-y-3">
        {!isAuthenticated ? (
          <>
            <Link to="/signup" className="w-full block">
              <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-full text-lg flex items-center justify-center gap-2">
                <span>✓</span> Get Started Free <Zap className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/login" className="w-full block">
              <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-full text-lg">
                Login →
              </Button>
            </Link>

            <Link to="/guest-booking" className="w-full block">
              <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-full text-lg">
                Book Now →
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="w-full block">
              <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-full text-lg">
                Go to Dashboard →
              </Button>
            </Link>

            <Link to="/booking" className="w-full block">
              <Button className="w-full bg-fac-orange-500 hover:bg-fac-orange-600 text-white font-bold py-3 rounded-full text-lg">
                Book a Service →
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; 2024 Fayeed Auto Care. All rights reserved.</p>
      </div>
    </div>
  );
}
