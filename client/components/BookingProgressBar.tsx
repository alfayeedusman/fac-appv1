import { useEffect, useState } from "react";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface BookingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  estimatedTimeRemaining?: number; // in seconds
}

export default function BookingProgressBar({
  currentStep,
  totalSteps,
  estimatedTimeRemaining = 300, // Default 5 minutes
}: BookingProgressBarProps) {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTimeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressPercentage = (currentStep / totalSteps) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="w-full space-y-3">
      {/* Progress Bar with Animation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs font-bold text-fac-orange-600 dark:text-fac-orange-400">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {/* Main Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden shadow-sm">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-fac-orange-500 via-fac-orange-400 to-fac-orange-600 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Time Indicator */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-orange-500" />
          <span>
            ~{minutes}:{seconds.toString().padStart(2, "0")} remaining
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-semibold text-foreground/60">
            {totalSteps - currentStep} step{totalSteps - currentStep !== 1 ? "s" : ""} left
          </span>
        </div>
      </div>

      {/* Step Dots Indicator */}
      <div className="flex items-center justify-between gap-1 mt-4">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex items-center flex-1">
              {/* Dot */}
              <div className="relative flex-shrink-0">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                      : isCurrent
                        ? "bg-gradient-to-r from-fac-orange-500 to-fac-orange-400 text-white shadow-lg shadow-fac-orange-500/50 ring-2 ring-fac-orange-500/30 scale-110"
                        : "bg-muted text-muted-foreground border border-border/50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {stepNum < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 shadow-sm shadow-green-500/30"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Motivational Text */}
      {currentStep === totalSteps ? (
        <div className="p-2 bg-green-50/50 dark:bg-green-950/30 rounded-lg border border-green-200/30 dark:border-green-800/30 text-center">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
            ✨ Almost done! Review and confirm your booking.
          </p>
        </div>
      ) : (
        <div className="p-2 bg-fac-orange-50/50 dark:bg-fac-orange-950/30 rounded-lg border border-fac-orange-200/30 dark:border-fac-orange-800/30 text-center">
          <p className="text-xs font-semibold text-fac-orange-700 dark:text-fac-orange-400">
            🚀 You're on track! Keep going.
          </p>
        </div>
      )}
    </div>
  );
}
