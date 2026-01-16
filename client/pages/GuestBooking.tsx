import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
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

      {/* Back Button - Sticky */}
      <div className="fixed top-6 left-6 z-50">
        <Link to="/login">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-xl p-3 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 transition-colors shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Header Section - Mobile Optimized */}
      <div className="pt-16 px-4 sm:px-6 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            Quick Booking
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-3 leading-tight">
            Book Your<br />
            <span className="bg-gradient-to-r from-fac-orange-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Service Now
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            No account needed. No signup. Just book instantly and get confirmed.
          </p>
        </div>

        {/* Enhanced Info Card (dismissible; reappears on refresh) */}
        {showInfoCard && (
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 relative">
            <button
              aria-label="Close"
              onClick={() => setShowInfoCard(false)}
              className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-white/90 dark:bg-gray-900/90 border border-border shadow-md flex items-center justify-center hover:bg-muted/70 active:scale-95 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <Card className="glass border-border/50 shadow-md overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-base mb-1">
                      Customize Your Booking
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Choose any service, time, and location that works for you. Full control over your booking.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs font-bold text-foreground">
                          7 Steps
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Detailed
                        </div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs font-bold text-foreground">
                          5 Min
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Complete
                        </div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <div className="text-xs font-bold text-foreground">
                          100%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Secure
                        </div>
                      </div>
                    </div>

                    {/* Account CTA */}
                    <p className="text-xs text-muted-foreground mb-3 flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Create an account to save bookings, earn rewards, and skip future details!</span>
                    </p>

                    <Link to="/signup" className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm h-8 sm:h-9 border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                      >
                        Create Free Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Booking Form - Mobile Optimized */}
      <div className="relative z-10 mt-4 sm:mt-6" id="booking-form">
        <StepperBooking isGuest={true} />
      </div>
    </div>
  );
}
