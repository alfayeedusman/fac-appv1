import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Info,
  Gift,
  X,
  Calendar,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastNotificationProps {
  type: "success" | "warning" | "info" | "promotion";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose?: () => void;
}

const toastIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  promotion: Gift,
};

const toastColors = {
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-orange-50 border-orange-200 text-orange-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  promotion: "bg-fac-orange-50 border-fac-orange-200 text-fac-orange-800",
};

export default function ToastNotification({
  type,
  title,
  message,
  action,
  duration = 5000,
  onClose,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const Icon = toastIcons[type];

  return (
    <Card
      className={cn(
        "fixed top-4 right-4 z-[9999] w-80 shadow-lg border transition-all duration-300 transform",
        toastColors[type],
        isAnimating
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <p className="text-sm opacity-90">{message}</p>
            {action && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-8 px-3 text-xs"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Toast notification manager
export class ToastManager {
  private static toasts: ToastNotificationProps[] = [];
  private static listeners: ((toasts: ToastNotificationProps[]) => void)[] = [];

  static show(toast: Omit<ToastNotificationProps, "onClose">) {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      onClose: () => this.remove(id),
    };

    this.toasts.push(newToast);
    this.notifyListeners();

    return id;
  }

  static remove(id: string) {
    this.toasts = this.toasts.filter((_, index) => index.toString() !== id);
    this.notifyListeners();
  }

  static subscribe(listener: (toasts: ToastNotificationProps[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }
}
