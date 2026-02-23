import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, AlertCircle, Gift, Bookmark, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "membership" | "loyalty" | "achievement" | "system";
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

const TYPE_ICONS: Record<string, any> = {
  booking: CheckCircle2,
  membership: AlertCircle,
  loyalty: Gift,
  achievement: Bookmark,
  system: Info,
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications/list?limit=5", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);

      // Fetch unread count
      const countResponse = await fetch("/api/notifications/unread-count", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (countResponse.ok) {
        const countData = await countResponse.json();
        setUnreadCount(countData.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={fetchNotifications}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => {
                const IconComponent = TYPE_ICONS[notification.type] || Info;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted",
                      !notification.isRead && "bg-primary/10"
                    )}
                    onClick={() => {
                      handleMarkAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <IconComponent className="w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div
                          className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => navigate("/notifications")}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
