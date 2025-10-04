import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Calendar } from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";
import BookingReceiptModal from "@/components/BookingReceiptModal";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const [countdown, setCountdown] = useState(15);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Poll invoice status until paid/settled, then show receipt
    const payloadStr = localStorage.getItem("fac_last_booking");
    const invoiceId = localStorage.getItem("fac_last_invoice_id");

    if (!payloadStr || !invoiceId) {
      setChecking(false);
      return;
    }

    const payload = JSON.parse(payloadStr);
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/neon/payment/xendit/invoice-status/${invoiceId}`,
        );
        if (res.ok) {
          const data = await res.json();
          const status = (
            data.status ||
            data.invoice?.status ||
            ""
          ).toUpperCase();
          if (status === "PAID" || status === "SETTLED") {
            setReceiptData({
              id: payload.bookingId,
              confirmationCode:
                payload.bookingData?.confirmationCode || payload.bookingId,
              service: payload.bookingData?.service || "Service",
              category: payload.bookingData?.category,
              date: payload.bookingData?.date,
              timeSlot: payload.bookingData?.timeSlot,
              branch: payload.bookingData?.branch,
              serviceType: payload.bookingData?.serviceType,
              unitType: payload.bookingData?.unitType,
              unitSize: payload.bookingData?.unitSize,
              plateNumber: payload.bookingData?.plateNo,
              vehicleModel: payload.bookingData?.carModel,
              totalPrice: payload.bookingData?.totalPrice || 0,
              paymentMethod: "online",
              customerName: payload.bookingData?.fullName || "Customer",
              customerEmail: payload.bookingData?.email || "",
              customerPhone: payload.bookingData?.mobile || "",
            });
            setShowReceipt(true);
            setChecking(false);
            return;
          }
          if (status === "EXPIRED" || status === "FAILED") {
            setChecking(false);
            navigate(`/booking-failed?bookingId=${payload.bookingId}`);
            return;
          }
        }
      } catch (_) {}
      attempts += 1;
      if (attempts < 40) {
        setTimeout(poll, 3000);
      } else {
        setChecking(false);
      }
    };

    poll();
  }, [navigate]);

  useEffect(() => {
    if (showReceipt) return; // do not redirect while receipt shown
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
  }, [navigate, showReceipt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      <StickyHeader showBack={true} title="Payment Success" />

      {receiptData && (
        <BookingReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          bookingData={receiptData}
        />
      )}

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-green-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">
              Payment Successful!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg text-muted-foreground">
                {checking
                  ? "Confirming payment with gateway..."
                  : "Your payment has been processed successfully."}
              </p>
              {bookingId && (
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="text-xl font-bold text-green-700">
                    {bookingId}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>You will receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Check your booking status in the dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Our team will prepare for your service</span>
                </li>
              </ul>
            </div>

            {!showReceipt && (
              <div className="text-center text-sm text-muted-foreground">
                Redirecting to dashboard in {countdown} seconds...
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 hover:from-fac-orange-600 hover:to-fac-orange-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate("/history")}
                variant="outline"
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
