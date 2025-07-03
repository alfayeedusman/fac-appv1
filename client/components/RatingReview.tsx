import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Send, Loader } from "lucide-react";
import { BookingRecord, addBookingRating } from "@/utils/bookingData";

interface RatingReviewProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord;
  onSubmit: () => void;
}

export default function RatingReview({
  isOpen,
  onClose,
  booking,
  onSubmit,
}: RatingReviewProps) {
  const [rating, setRating] = useState(booking.rating || 0);
  const [review, setReview] = useState(booking.review || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(booking.rating || 0);
      setReview(booking.review || "");
    }
  }, [isOpen, booking]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addBookingRating(booking.id, rating, review);
    setIsSubmitting(false);
    onSubmit();
  };

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const ratingDescriptions = {
    1: "Service did not meet expectations",
    2: "Service was below average",
    3: "Service was satisfactory",
    4: "Service exceeded expectations",
    5: "Outstanding service, highly recommended",
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={i}
          type="button"
          className={`p-1 transition-all duration-200 hover:scale-110 ${
            isActive ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className={`h-8 w-8 ${isActive ? "fill-current" : ""}`} />
        </button>
      );
    });
  };

  const currentRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {booking.rating ? "Update Review" : "Rate Your Experience"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Info */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">
              {booking.service}
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Booking ID: {booking.id}</p>
              <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
              <p>Branch: {booking.branch}</p>
            </div>
          </div>

          {/* Crew Members */}
          {booking.crew && booking.crew.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-foreground">
                Service Team:
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {booking.crew.map((member, index) => (
                  <Badge key={index} variant="outline">
                    {member}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rating Stars */}
          <div className="text-center space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              How would you rate this service?
            </Label>
            <div className="flex justify-center space-x-1">{renderStars()}</div>
            {currentRating > 0 && (
              <div className="space-y-2">
                <p className="text-xl font-bold text-fac-orange-500">
                  {ratingLabels[currentRating as keyof typeof ratingLabels]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    ratingDescriptions[
                      currentRating as keyof typeof ratingDescriptions
                    ]
                  }
                </p>
              </div>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-foreground font-medium">
              Share your experience (optional)
            </Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your experience with our service and team..."
              className="min-h-[120px] bg-background/50 backdrop-blur-sm border-border rounded-xl focus:border-fac-orange-500 focus:ring-fac-orange-500 transition-all duration-300"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
