import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Car,
  Clock,
  CreditCard,
  QrCode,
  Share,
} from "lucide-react";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    service: string;
    date: string;
    time: string;
    branch: string;
    vehicle: string;
    duration: string;
    price: number;
    paymentMethod: string;
  };
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  bookingData,
}: BookingConfirmationModalProps) {
  const handleShare = async () => {
    const shareData = {
      title: "Fayeed Auto Care Booking Confirmed",
      text: `My car wash booking is confirmed! ${bookingData.service} on ${bookingData.date} at ${bookingData.time}`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share failed");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500 p-4 rounded-full animate-bounce">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Booking Confirmed! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Reference */}
          <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-muted-foreground mb-1">
              Booking Reference
            </p>
            <p className="text-2xl font-black text-foreground font-mono">
              #{bookingData.id}
            </p>
          </div>

          {/* Service Details Card */}
          <div className="bg-gradient-to-br from-fac-orange-50 to-purple-100 dark:from-fac-orange-950 dark:to-purple-900 rounded-xl p-6 border border-fac-orange-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Car className="h-4 w-4 mr-2 text-fac-orange-500" />
                  <div>
                    <p className="text-muted-foreground">Service</p>
                    <p className="font-semibold text-foreground">
                      {bookingData.service}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <p className="text-muted-foreground">Date & Time</p>
                    <p className="font-semibold text-foreground">
                      {bookingData.date}
                    </p>
                    <p className="font-semibold text-foreground">
                      {bookingData.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold text-foreground">
                      {bookingData.branch}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold text-foreground">
                      {bookingData.duration}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
              <p className="font-semibold text-foreground">
                {bookingData.vehicle}
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="font-bold text-green-600 text-lg">
                ₱{bookingData.price}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Payment Method
                </p>
                <p className="font-semibold text-blue-800 dark:text-blue-200 capitalize">
                  {bookingData.paymentMethod}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              {bookingData.paymentMethod === "membership"
                ? "Membership Used"
                : "Paid"}
            </Badge>
          </div>

          {/* QR Code Section */}
          <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <QrCode className="h-16 w-16 mx-auto mb-3 text-gray-500" />
            <p className="text-sm font-semibold text-foreground mb-1">
              Show this QR code at the branch
            </p>
            <p className="text-xs text-muted-foreground">
              For easy check-in and service activation
            </p>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 dark:bg-yellow-950 rounded-xl p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Important Notes:
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Please arrive 10 minutes before your scheduled time</li>
              <li>• Bring this booking reference for verification</li>
              <li>• Contact us if you need to reschedule</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-fac-orange-500 text-fac-orange-500 hover:bg-fac-orange-50 dark:hover:bg-fac-orange-950 rounded-xl"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-fac-orange-500 to-purple-600 hover:from-fac-orange-600 hover:to-purple-700 text-white rounded-xl"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
