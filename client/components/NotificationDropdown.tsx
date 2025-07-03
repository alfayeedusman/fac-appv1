import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Gift,
  Calendar,
  AlertCircle,
  CheckCircle,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getUserNotifications,
  markNotificationAsRead,
  markNotificationAsClicked,
  initializePushNotifications,
  PushNotification,
} from "@/utils/pushNotifications";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    initializePushNotifications();
    loadUserNotifications();
  }, [userEmail]);

  const loadUserNotifications = () => {
    if (userEmail) {
      const userNotifs = getUserNotifications(userEmail);
      setNotifications(userNotifs);
    }
  };

  const markAsRead = (id: string) => {
    markNotificationAsRead(id, userEmail);
    loadUserNotifications();
  };

  const handleNotificationClick = (notification: PushNotification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      markNotificationAsClicked(notification.id, userEmail);
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  const markAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.readBy.includes(userEmail)) {
        markNotificationAsRead(notif.id, userEmail);
      }
    });
    loadUserNotifications();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <Gift className="h-4 w-4 text-white" />;
      case "broadcast":
        return <Megaphone className="h-4 w-4 text-white" />;
      case "announcement":
        return <Bell className="h-4 w-4 text-white" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-white" />;
      default:
        return <Bell className="h-4 w-4 text-white" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "promotion":
        return "bg-green-500";
      case "broadcast":
        return "bg-fac-orange-500";
      case "announcement":
        return "bg-blue-500";
      case "alert":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "normal":
        return "border-l-blue-500";
      case "low":
        return "border-l-gray-500";
      default:
        return "border-l-blue-500";
    }
  };

  const unreadCount = notifications.filter(
    (n) => !n.readBy.includes(userEmail),
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-accent"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-fac-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg font-bold text-foreground">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-fac-orange-600 hover:text-fac-orange-700"
                >
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-fac-orange-500 text-white w-fit">
                {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div>
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-accent/50 transition-colors border-l-4",
                        !notification.readBy.includes(userEmail) &&
                          "bg-accent/20",
                        getPriorityColor(notification.priority),
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            "mt-1 p-2 rounded-full",
                            getNotificationColor(notification.type),
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              {notification.title}
                            </p>
                            {!notification.readBy.includes(userEmail) && (
                              <div className="w-2 h-2 bg-fac-orange-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {getTimeAgo(notification.createdAt)}
                            </p>
                            <div className="flex items-center space-x-2">
                              {notification.priority === "urgent" && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Urgent
                                </Badge>
                              )}
                              {notification.priority === "high" && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  High
                                </Badge>
                              )}
                              {notification.actionText &&
                                notification.actionUrl && (
                                  <Badge variant="outline" className="text-xs">
                                    {notification.actionText}
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length > 5 && (
                    <div className="p-4 text-center border-t border-border">
                      <Link to="/notifications">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-fac-orange-600 hover:text-fac-orange-700"
                        >
                          View all notifications ({notifications.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
