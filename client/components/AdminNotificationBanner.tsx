import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Users,
  Zap,
  Crown,
  TrendingUp,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { notificationSoundService } from "@/services/notificationSoundService";

export interface AdminNotification {
  id: string;
  type: "new_customer" | "new_booking" | "subscription" | "upgrade" | "payment";
  title: string;
  message: string;
  customerName?: string;
  timestamp: Date;
  read: boolean;
}

interface AdminNotificationBannerProps {
  notifications?: AdminNotification[];
  onDismiss?: (id: string) => void;
}

export function AdminNotificationBanner({
  notifications = [],
  onDismiss,
}: AdminNotificationBannerProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<AdminNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(
    notificationSoundService.isNotificationEnabled()
  );

  useEffect(() => {
    // Show new notifications
    setVisibleNotifications(notifications.filter((n) => !n.read).slice(0, 3));
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_customer":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "new_booking":
        return <Bell className="h-5 w-5 text-purple-500" />;
      case "subscription":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case "upgrade":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "payment":
        return <Zap className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_customer":
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950";
      case "new_booking":
        return "border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950";
      case "subscription":
        return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950";
      case "upgrade":
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950";
      case "payment":
        return "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950";
      default:
        return "border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950";
    }
  };

  const handleDismiss = (id: string) => {
    setVisibleNotifications(visibleNotifications.filter((n) => n.id !== id));
    onDismiss?.(id);
  };

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    notificationSoundService.setEnabled(newState);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm space-y-3">
      {/* Sound Toggle */}
      <div className="flex justify-end">
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          title={soundEnabled ? "Mute notifications" : "Enable notifications"}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <VolumeX className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Notifications */}
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg animate-slideIn ${getNotificationColor(
            notification.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-foreground mb-1">
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2 opacity-75">
                {formatTimeAgo(notification.timestamp)}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      ))}

      {/* Notification count badge */}
      {visibleNotifications.length > 1 && (
        <div className="text-center text-xs text-muted-foreground">
          +{visibleNotifications.length} notification{visibleNotifications.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
