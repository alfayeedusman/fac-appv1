import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Star,
  MessageSquare,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  BookingRecord,
  updateBookingStatus,
  cancelBooking,
} from "@/utils/bookingData";
import RatingReview from "./RatingReview";

interface BookingCardProps {
  booking: BookingRecord;
  onUpdate?: () => void;
}

export default function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const [showRating, setShowRating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: BookingRecord["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "in-progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: BookingRecord["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "confirmed":
      case "in-progress":
        return <Loader className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setIsUpdating(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      cancelBooking(booking.id);
      setIsUpdating(false);
      onUpdate?.();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <>
      <Card className="glass border-border hover-lift transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">
              {booking.service}
            </CardTitle>
            <Badge className={getStatusColor(booking.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(booking.status)}
                <span className="capitalize">{booking.status}</span>
              </div>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehicle Info */}
          <div className="flex items-center space-x-3">
            <div className="bg-fac-orange-100 dark:bg-fac-orange-900/30 p-2 rounded-lg">
              <Car className="h-4 w-4 text-fac-orange-600 dark:text-fac-orange-400" />
            </div>
            <div>
              <p className="font-medium text-foreground capitalize">
                {booking.vehicleType}
                {booking.motorcycleType && ` (${booking.motorcycleType})`}
              </p>
              <p className="text-sm text-muted-foreground">Vehicle Type</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formatDate(booking.date)}
                </p>
                <p className="text-sm text-muted-foreground">Date</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {formatTime(booking.time)}
                </p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
            </div>
          </div>

          {/* Branch */}
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">{booking.branch}</p>
              <p className="text-sm text-muted-foreground">Location</p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-2xl font-bold text-fac-orange-500">
              {booking.price}
            </p>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm text-foreground">{booking.notes}</p>
            </div>
          )}

          {/* Rating & Review */}
          {booking.rating && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  {renderStars(booking.rating)}
                </div>
                <span className="font-medium text-foreground">
                  {booking.rating}/5
                </span>
              </div>
              {booking.review && (
                <p className="text-sm text-foreground">{booking.review}</p>
              )}
            </div>
          )}

          {/* Crew */}
          {booking.crew && booking.crew.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Service Crew:
              </p>
              <div className="flex flex-wrap gap-2">
                {booking.crew.map((member, index) => (
                  <Badge key={index} variant="outline">
                    {member}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            {booking.status === "completed" && !booking.rating && (
              <Button
                onClick={() => setShowRating(true)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Star className="h-4 w-4 mr-2" />
                Rate Service
              </Button>
            )}

            {booking.status === "completed" && booking.rating && (
              <Button
                onClick={() => setShowRating(true)}
                variant="outline"
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Update Review
              </Button>
            )}

            {(booking.status === "pending" ||
              booking.status === "confirmed") && (
              <Button
                onClick={handleCancel}
                disabled={isUpdating}
                variant="destructive"
                className="flex-1"
              >
                {isUpdating ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rating & Review Modal */}
      <RatingReview
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        booking={booking}
        onSubmit={() => {
          setShowRating(false);
          onUpdate?.();
        }}
      />
    </>
  );
}
