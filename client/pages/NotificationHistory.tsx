import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Crown,
  Car,
  Gift,
  Calendar,
  Trash2,
  Check,
  Filter,
} from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import BottomNavigation from "@/components/BottomNavigation";

interface Notification {
  id: string;
  type: "upgrade" | "booking" | "payment" | "system" | "promotion";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    // Get user-specific notifications
    const userEmail = localStorage.getItem("userEmail") || "";
    const userNotifications = JSON.parse(
      localStorage.getItem(`notifications_${userEmail}`) || "[]",
    );

    // Add some default notifications if none exist
    if (userNotifications.length === 0) {
      const defaultNotifications: Notification[] = [
        {
          id: "1",
          type: "upgrade",
          title: "Upgrade Your Account",
          message:
            "Unlock premium features with our subscription plans. Get unlimited washes and VIP services!",
          timestamp: new Date().toISOString(),
          read: false,
          priority: "high",
        },
        {
          id: "2",
          type: "system",
          title: "Welcome to Fayeed Auto Care!",
          message:
            "Thank you for joining us. Start by exploring our services and booking your first wash.",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: "medium",
        },
      ];

      localStorage.setItem(
        `notifications_${userEmail}`,
        JSON.stringify(defaultNotifications),
      );
      setNotifications(defaultNotifications);
    } else {
      setNotifications(userNotifications);
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "upgrade":
        return <Crown className="h-5 w-5 text-orange-500" />;
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "payment":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "promotion":
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif,
    );
    setNotifications(updatedNotifications);

    const userEmail = localStorage.getItem("userEmail") || "";
    localStorage.setItem(
      `notifications_${userEmail}`,
      JSON.stringify(updatedNotifications),
    );
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);

    const userEmail = localStorage.getItem("userEmail") || "";
    localStorage.setItem(
      `notifications_${userEmail}`,
      JSON.stringify(updatedNotifications),
    );
  };

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(
      (notif) => notif.id !== id,
    );
    setNotifications(updatedNotifications);

    const userEmail = localStorage.getItem("userEmail") || "";
    localStorage.setItem(
      `notifications_${userEmail}`,
      JSON.stringify(updatedNotifications),
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fac-blue-50 to-blue-100 pb-20">
      <StickyHeader showBack={true} title="Notifications" />

      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in-up">
          <Link to="/dashboard" className="mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full glass hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-fac-orange-500 to-purple-600 p-3 rounded-xl ">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">
                Notifications
              </h1>
              <p className="text-muted-foreground font-medium">
                {unreadCount > 0
                  ? `${unreadCount} unread messages`
                  : "All caught up!"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6 animate-fade-in-up animate-delay-100">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="glass"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm bg-background border border-border rounded-lg px-3 py-1"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4 animate-fade-in-up animate-delay-200">
          {filteredNotifications.length === 0 ? (
            <Card className="glass border-border text-center py-12">
              <CardContent>
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No notifications
                </h3>
                <p className="text-muted-foreground">
                  {filter === "unread"
                    ? "All notifications have been read"
                    : "You're all caught up!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`glass border shadow-md transition-all duration-200 hover-lift ${
                  !notification.read
                    ? getPriorityColor(notification.priority)
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className={`font-semibold ${
                              !notification.read
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-fac-orange-500 rounded-full"></div>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "text-foreground"
                              : "text-muted-foreground"
                          } leading-relaxed mb-2`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                notification.priority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : notification.priority === "medium"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0 hover:bg-green-100"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <Card className="glass border-border mt-8 animate-fade-in-up animate-delay-300">
          <CardHeader>
            <CardTitle className="text-center">Notification Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.length}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {unreadCount}
                </p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {notifications.length - unreadCount}
                </p>
                <p className="text-sm text-muted-foreground">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
