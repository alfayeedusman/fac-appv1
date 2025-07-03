import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Loader,
} from "lucide-react";

export interface NotificationData {
  id: string;
  type: "success" | "error" | "warning" | "info" | "loading";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  autoClose?: number; // in milliseconds
  showCancel?: boolean;
}

interface NotificationModalProps {
  notifications: NotificationData[];
  onClose: (id: string) => void;
}

export default function NotificationModal({
  notifications,
  onClose,
}: NotificationModalProps) {
  const currentNotification = notifications[0];

  useEffect(() => {
    if (currentNotification?.autoClose) {
      const timer = setTimeout(() => {
        onClose(currentNotification.id);
      }, currentNotification.autoClose);

      return () => clearTimeout(timer);
    }
  }, [currentNotification, onClose]);

  if (!currentNotification) return null;

  const getIcon = () => {
    switch (currentNotification.type) {
      case "success":
        return (
          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        );
      case "error":
        return (
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        );
      case "warning":
        return (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full">
            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        );
      case "info":
        return (
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <Info className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        );
      case "loading":
        return (
          <div className="bg-fac-orange-100 dark:bg-fac-orange-900/30 p-4 rounded-full">
            <Loader className="h-8 w-8 text-fac-orange-600 dark:text-fac-orange-400 animate-spin" />
          </div>
        );
      default:
        return null;
    }
  };

  const getColorScheme = () => {
    switch (currentNotification.type) {
      case "success":
        return {
          border: "border-green-200 dark:border-green-800",
          bg: "bg-green-50 dark:bg-green-950/50",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "error":
        return {
          border: "border-red-200 dark:border-red-800",
          bg: "bg-red-50 dark:bg-red-950/50",
          button: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          border: "border-yellow-200 dark:border-yellow-800",
          bg: "bg-yellow-50 dark:bg-yellow-950/50",
          button: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "info":
        return {
          border: "border-blue-200 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950/50",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      case "loading":
        return {
          border: "border-fac-orange-200 dark:border-fac-orange-800",
          bg: "bg-fac-orange-50 dark:bg-fac-orange-950/50",
          button: "bg-fac-orange-600 hover:bg-fac-orange-700",
        };
      default:
        return {
          border: "border-gray-200 dark:border-gray-800",
          bg: "bg-gray-50 dark:bg-gray-950/50",
          button: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const colorScheme = getColorScheme();

  const handleConfirm = () => {
    currentNotification.onConfirm?.();
    onClose(currentNotification.id);
  };

  const handleCancel = () => {
    currentNotification.onCancel?.();
    onClose(currentNotification.id);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose(currentNotification.id)}>
      <DialogContent
        className={`max-w-md mx-auto ${colorScheme.border} ${colorScheme.bg} backdrop-blur-sm`}
      >
        <DialogHeader>
          <button
            onClick={() => onClose(currentNotification.id)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-6 pt-2 pb-6">
          {/* Icon */}
          <div className="animate-scale-in">{getIcon()}</div>

          {/* Content */}
          <div className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {currentNotification.title}
            </DialogTitle>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              {currentNotification.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full px-2">
            {currentNotification.type !== "loading" && (
              <>
                <Button
                  onClick={handleConfirm}
                  className={`flex-1 ${colorScheme.button} text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-105`}
                >
                  {currentNotification.confirmText || "OK"}
                </Button>

                {currentNotification.showCancel && (
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    {currentNotification.cancelText || "Cancel"}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Auto-close indicator */}
          {currentNotification.autoClose && (
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <div
                className={`h-full bg-current animate-shrink`}
                style={{
                  animationDuration: `${currentNotification.autoClose}ms`,
                }}
              ></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global notification manager
class NotificationManager {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  subscribe(listener: (notifications: NotificationData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  show(notification: Omit<NotificationData, "id">) {
    const newNotification: NotificationData = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()}`,
    };

    this.notifications.push(newNotification);
    this.notify();
    return newNotification.id;
  }

  close(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  closeAll() {
    this.notifications = [];
    this.notify();
  }

  // Convenience methods
  success(title: string, message: string, options?: Partial<NotificationData>) {
    return this.show({
      type: "success",
      title,
      message,
      autoClose: 3000,
      ...options,
    });
  }

  error(title: string, message: string, options?: Partial<NotificationData>) {
    return this.show({
      type: "error",
      title,
      message,
      ...options,
    });
  }

  warning(title: string, message: string, options?: Partial<NotificationData>) {
    return this.show({
      type: "warning",
      title,
      message,
      ...options,
    });
  }

  info(title: string, message: string, options?: Partial<NotificationData>) {
    return this.show({
      type: "info",
      title,
      message,
      autoClose: 4000,
      ...options,
    });
  }

  loading(title: string, message: string, options?: Partial<NotificationData>) {
    return this.show({
      type: "loading",
      title,
      message,
      ...options,
    });
  }

  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    options?: Partial<NotificationData>,
  ) {
    return this.show({
      type: "warning",
      title,
      message,
      showCancel: true,
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm,
      ...options,
    });
  }
}

export const notificationManager = new NotificationManager();

// React hook for using notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    return notificationManager.subscribe(setNotifications);
  }, []);

  return {
    notifications,
    close: notificationManager.close.bind(notificationManager),
    show: notificationManager.show.bind(notificationManager),
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    warning: notificationManager.warning.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager),
    loading: notificationManager.loading.bind(notificationManager),
    confirm: notificationManager.confirm.bind(notificationManager),
  };
};
