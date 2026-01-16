import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  CheckCircle,
  Calendar,
  Clock,
  Car,
  MapPin,
  CreditCard,
  Receipt,
  Share2,
} from "lucide-react";
import html2canvas from "html2canvas";

interface BookingReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    confirmationCode: string;
    service: string;
    category: string;
    date: string;
    timeSlot: string;
    branch: string;
    serviceType: string;
    unitType: string;
    unitSize: string;
    plateNumber: string;
    vehicleModel: string;
    totalPrice: number;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
}

export default function BookingReceiptModal({
  isOpen,
  onClose,
  bookingData,
}: BookingReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const image = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = image;
      link.download = `FAC-Booking-${bookingData.confirmationCode}.jpg`;
      link.click();
    } catch (error) {
      console.error("Failed to download receipt:", error);
    }
  };

  const shareReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;

          const file = new File(
            [blob],
            `FAC-Booking-${bookingData.confirmationCode}.jpg`,
            {
              type: "image/jpeg",
            },
          );

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Booking Receipt",
              text: `Fayeed Auto Care - Booking ${bookingData.confirmationCode}`,
            });
          } else {
            // Fallback to download
            downloadReceipt();
          }
        },
        "image/jpeg",
        0.95,
      );
    } catch (error) {
      console.error("Failed to share receipt:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="h-8 w-8 text-green-500" />
            Booking Confirmed!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Preview */}
          <div
            ref={receiptRef}
            className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300"
          >
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff7cf3f8f1c944fbfa1f5031abc56523f%2Faa4bc2d15e574dab80ef472ac32b06f9?format=webp&width=800"
                alt="Fayeed Auto Care Logo"
                className="h-20 mx-auto mb-4 object-contain"
              />
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                BOOKING RECEIPT
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                Thank you for choosing Fayeed Auto Care
              </p>
            </div>

            {/* Confirmation Code */}
            <div className="flex flex-col items-center justify-center mb-8 py-4">
              <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">
                Confirmation Code
              </p>
              <Badge className="bg-fac-orange-500 text-white text-xl px-8 py-3 rounded-full font-bold whitespace-nowrap">
                {bookingData.confirmationCode}
              </Badge>
            </div>

            {/* Customer Details */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.customerEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.customerPhone}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Service Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.vehicleModel} ({bookingData.plateNumber})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.unitType} - {bookingData.unitSize}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Details */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">
                      {bookingData.branch}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-semibold text-gray-900 uppercase">
                      {bookingData.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-dashed">
                    <span className="font-bold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="font-black text-fac-orange-500 text-lg">
                      ₱{bookingData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>Booking ID: {bookingData.id}</p>
              <p className="mt-1">
                For inquiries, contact us at support@fayeedautocare.com
              </p>
              <p className="mt-2 font-semibold">
                © 2025 Fayeed Auto Care. All rights reserved.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={downloadReceipt}
              className="flex-1 bg-gradient-to-r from-fac-orange-500 to-fac-orange-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Image
            </Button>
            <Button onClick={shareReceipt} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>📱 Save this receipt!</strong> Screenshot or download this
              confirmation as proof of your booking. You'll receive a
              confirmation email shortly.
            </p>
          </div>

          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
