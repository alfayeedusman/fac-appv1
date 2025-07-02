import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bell,
  Calendar,
  Crown,
  Gift,
  Settings,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/types/notifications";

interface NotificationPanelProps {
  children: React.ReactNode;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "booking",
    title: "Booking Confirmed",
    message: "Your VIP ProMax wash is scheduled for tomorrow at 2:00 PM",
    timestamp: "2024-01-29T10:30:00Z",
    read: false,
    actionUrl: "/booking",
    actionText: "View Details",
  },
  {
    id: "2",
    type: "membership",
    title: "Membership Expiring Soon",
    message:
      "Your VIP Gold membership expires in 8 days. Renew now to avoid interruption.",
    timestamp: "2024-01-29T08:15:00Z",
    read: false,
    actionUrl: "/manage-subscription",
    actionText: "Renew Now",
  },
  {
    id: "3",
    type: "promotion",
    title: "Special Offer! 🎉",
    message: "Get 20% off your next Premium wash when you book this week!",
    timestamp: "2024-01-28T16:45:00Z",
    read: true,
    actionUrl: "/booking",
    actionText: "Book Now",
  },
  {
    id: "4",
    type: "booking",
    title: "Service Completed",
    message:
      "Your Premium wash at Tumaga branch has been completed. Thank you for choosing FAC!",
    timestamp: "2024-01-28T14:30:00Z",
    read: true,
    actionUrl: "/booking",
    actionText: "Rate Service",
  },
  {
    id: "5",
    type: "system",
    title: "Monthly Benefits Reset",
    message:
      "Your monthly wash benefits have been reset to full amount. Enjoy your services!",
    timestamp: "2024-01-01T00:00:00Z",
    read: true,
  },
];

export default function NotificationPanel({
  children,
}: NotificationPanelProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "membership":
        return <Crown className="h-4 w-4" />;
      case "promotion":
        return <Gift className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return "text-blue-600 bg-blue-100";
      case "membership":
        return "text-fac-orange-600 bg-fac-orange-100";
      case "promotion":
        return "text-green-600 bg-green-100";
      case "system":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b bg-fac-orange-50">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center text-fac-orange-900">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-fac-orange-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-fac-orange-600 hover:text-fac-orange-700"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      "transition-all cursor-pointer hover:shadow-md border-0 shadow-sm",
                      !notification.read &&
                        "bg-fac-orange-50 ring-1 ring-fac-orange-200",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            getNotificationColor(notification.type),
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4
                              className={cn(
                                "font-semibold text-sm",
                                !notification.read && "text-fac-orange-900",
                              )}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-fac-orange-500 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>

                            {notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs border-fac-orange-300 text-fac-orange-600 hover:bg-fac-orange-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigate to action URL
                                  window.location.href =
                                    notification.actionUrl!;
                                }}
                              >
                                {notification.actionText}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-fac-orange-600 border-fac-orange-200 hover:bg-fac-orange-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-fac-orange-600 border-fac-orange-200 hover:bg-fac-orange-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
