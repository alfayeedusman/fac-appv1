import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  User,
  CreditCard,
  AlertTriangle,
  Clock,
  Check,
  ChevronRight,
  MarkAsUnread,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AdminNotification,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  getUnreadAdminNotificationCount,
} from "@/utils/adminNotifications";

interface AdminNotificationDropdownProps {
  className?: string;
}

export default function AdminNotificationDropdown({
  className = "",
}: AdminNotificationDropdownProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const allNotifications = getAdminNotifications();
    const recentNotifications = allNotifications.slice(0, 20); // Show only recent 20
    setNotifications(recentNotifications);
    setUnreadCount(getUnreadAdminNotificationCount());
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.read) {
      markAdminNotificationAsRead(notification.id);
      loadNotifications();
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAdminNotificationsAsRead();
    loadNotifications();
  };

  const getNotificationIcon = (type: AdminNotification["type"]) => {
    switch (type) {
      case "subscription_request":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "payment_submitted":
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case "user_registered":
        return <User className="h-4 w-4 text-purple-600" />;
      case "system":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: AdminNotification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notifTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative hover:bg-accent rounded-full ${className}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 bg-background/95 backdrop-blur-sm border border-border"
      >
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="font-semibold">Admin Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-accent"
                >
                  {notification.actionUrl ? (
                    <Link
                      to={notification.actionUrl}
                      className="w-full p-3 block hover:bg-accent/50 transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`text-sm font-medium truncate ${
                                notification.read
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1 ml-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}
                              ></div>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.actionText && (
                              <span className="text-xs text-blue-600 flex items-center">
                                {notification.actionText}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div
                      className="w-full p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`text-sm font-medium truncate ${
                                notification.read
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1 ml-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}
                              ></div>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Link
                to="/admin-notifications"
                className="w-full p-3 text-center text-sm text-blue-600 hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
