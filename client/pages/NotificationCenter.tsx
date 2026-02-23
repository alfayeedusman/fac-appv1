import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Bookmark, CheckCircle2, AlertCircle, Info, Gift, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import StickyHeader from "@/components/StickyHeader";
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

const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string }> = {
  booking: {
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  membership: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  loyalty: {
    icon: Gift,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  achievement: {
    icon: Bookmark,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  system: {
    icon: Info,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

export default function NotificationCenter() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark notification as read");

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
    const IconComponent = config.icon;

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          !notification.isRead && "border-primary/50 bg-primary/5"
        )}
        onClick={() => handleMarkAsRead(notification.id)}
      >
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className={cn("p-3 rounded-lg", config.bgColor)}>
              <IconComponent className={cn("w-6 h-6", config.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="mt-1 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>

                {notification.actionUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = notification.actionUrl!;
                    }}
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <StickyHeader title="Notifications" />

      <div className="max-w-3xl mx-auto p-4">
        {/* Header with Mark All Read */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">You have {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}</h2>
            </div>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {loading && (
            <TabsContent value={filter} className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          )}

          {/* Notifications List */}
          {!loading && (
            <TabsContent value={filter} className="space-y-4 mt-6">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      {filter === "unread"
                        ? "You're all caught up!"
                        : "You don't have any notifications yet"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
