import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  UserPlus,
  Info,
  Sparkles,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StepperBooking from "@/components/StepperBooking";
import { useState } from "react";

export default function GuestBooking() {
  const [showInfoCard, setShowInfoCard] = useState(true);

  return (
    <div className="min-h-screen bg-background theme-transition relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-fac-orange-500/8 to-purple-500/8 blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/8 to-fac-orange-500/8 blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-2xl"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-500/6 to-blue-500/6 blur-lg"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-30">
        <div className="glass rounded-full p-1">
          <ThemeToggle />
        </div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link to="/login">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-xl p-3 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <div className="pt-20 px-6 relative z-10">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            Quick Booking
          </Badge>
          <h1 className="text-3xl font-black text-foreground mb-2">
            Book{" "}
            <span className="bg-gradient-to-r from-fac-orange-500 to-purple-600 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Get your car serviced without creating an account - quick and simple
          </p>
        </div>

        {/* Enhanced Info Card (dismissible; reappears on refresh) */}
        {showInfoCard && (
        <div className="max-w-md mx-auto mb-8 relative">
          <button
            aria-label="Close"
            onClick={() => setShowInfoCard(false)}
            className="absolute -top-3 -right-3 z-10 h-9 w-9 rounded-full bg-white/90 dark:bg-gray-900/90 border border-border shadow-md flex items-center justify-center hover:bg-muted/70 active:scale-95 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <Card className="glass border-border/50 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">
                  Guest Booking
                </h3>
                <p className="text-sm text-muted-foreground">
                  Book your service in just a few steps. No account required!
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">
                    Instant confirmation via email
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">
                    Quick 3-step process
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">
                    Premium service guaranteed
                  </span>
                </div>
              </div>

              {/* Account Benefits */}
              <div className="p-4 bg-gradient-to-r from-fac-orange-50/80 to-purple-50/80 dark:from-fac-orange-950/30 dark:to-purple-950/30 rounded-xl border border-fac-orange-200/50 dark:border-fac-orange-800/50">
                <div className="flex items-start space-x-3">
                  <Info className="h-4 w-4 text-fac-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">
                      💡 Want more benefits?
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Create an account to track bookings, earn loyalty points,
                      get exclusive offers, and enjoy faster checkout!
                    </p>
                  </div>
                </div>
                <Link to="/signup" className="block mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-fac-orange-200 text-fac-orange-600 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 transition-all"
                  >
                    Create Account Instead
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
        </div>

      {/* Booking Form */}
      <div className="relative z-10">
        <StepperBooking isGuest={true} />
      </div>
    </div>
  );
}
