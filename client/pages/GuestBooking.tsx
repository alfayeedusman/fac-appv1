import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Info } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";
import StepperBooking from "@/components/StepperBooking";

export default function GuestBooking() {
  return (
    <div className="min-h-screen bg-background theme-transition relative">
      <StickyHeader showBack={true} title="Guest Booking" />

      {/* Responsive Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 md:top-1/4 md:left-1/6 w-40 h-40 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-fac-orange-500/6 to-purple-500/6 blur-2xl md:blur-3xl animate-breathe"></div>
        <div className="absolute bottom-20 right-4 md:bottom-1/3 md:right-1/6 w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-blue-500/6 to-fac-orange-500/6 blur-xl md:blur-2xl animate-float"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-purple-500/8 to-pink-500/8 blur-lg md:blur-xl animate-float animate-delay-300"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30">
        <div className="glass rounded-full p-1 animate-fade-in-scale">
          <ThemeToggle />
        </div>
      </div>

      {/* Back Button */}
      <div className="absolute top-16 left-4 md:top-20 md:left-6 z-30">
        <Link to="/login">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full glass hover-lift shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
      </div>

      {/* Guest Booking Header Info */}
      <div className="pt-20 md:pt-24 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Card className="glass border-border shadow-lg mb-4 md:mb-6 animate-fade-in-up">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-foreground text-base md:text-lg">Quick Guest Booking</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Book instantly without creating an account. You'll receive confirmation via email.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link to="/signup">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs md:text-sm border-fac-orange-500 text-fac-orange-600 hover:bg-fac-orange-50 hover:text-fac-orange-700"
                        >
                          Create Account Instead
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits for account creation */}
              <div className="mt-4 p-3 bg-gradient-to-r from-fac-orange-50 to-purple-50 dark:from-fac-orange-950/30 dark:to-purple-950/30 rounded-lg border border-fac-orange-200/50">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-fac-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs md:text-sm text-foreground">
                    <span className="font-semibold">💡 Get more with an account:</span>{" "}
                    Track bookings, earn loyalty points, exclusive offers, booking history, and faster checkout!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responsive Stepper Booking Component */}
      <div className="relative z-10">
        <StepperBooking isGuest={true} />
      </div>
    </div>
  );
}
