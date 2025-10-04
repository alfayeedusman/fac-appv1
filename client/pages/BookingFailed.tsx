import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, RefreshCw, Phone } from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";

export default function BookingFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-20">
      <StickyHeader showBack={true} title="Payment Failed" />

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-red-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-6">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-red-700">
              Payment Failed
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg text-muted-foreground">
                Unfortunately, your payment could not be processed.
              </p>
              {bookingId && (
                <div className="bg-red-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="text-xl font-bold text-red-700">{bookingId}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your booking is still saved but requires payment
                  </p>
                </div>
              )}
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">
                What to do next?
              </h3>
              <ul className="space-y-2 text-sm text-orange-800">
                <li className="flex items-start">
                  <RefreshCw className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span>Try booking again with a different payment method</span>
                </li>
                <li className="flex items-start">
                  <Phone className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span>Contact our support team for assistance</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 mr-2 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span>Check if your payment details are correct</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Common Issues:
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Insufficient balance</li>
                <li>• Incorrect card details</li>
                <li>• Network connection issues</li>
                <li>• Payment timeout</li>
              </ul>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Redirecting to dashboard in {countdown} seconds...
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/booking")}
                className="flex-1 bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
