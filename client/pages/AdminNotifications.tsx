import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Send,
  Users,
  UserCheck,
  Megaphone,
  Calendar,
  Gift,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import StickyHeader from "@/components/StickyHeader";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "promotion" | "alert" | "reminder";
  target: "all" | "premium" | "specific";
  status: "draft" | "sent" | "scheduled";
  recipients: number;
  createdAt: string;
  scheduledFor?: string;
}

export default function AdminNotifications() {
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "announcement",
    target: "all",
    scheduledFor: "",
  });

  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Premium Features Available",
      message: "Check out our latest AI-powered wash technology!",
      type: "announcement",
      target: "all",
      status: "sent",
      recipients: 1234,
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "20% Off Weekend Special",
      message: "Get 20% off all services this weekend only!",
      type: "promotion",
      target: "premium",
      status: "sent",
      recipients: 456,
      createdAt: "2024-01-14T09:30:00Z",
    },
    {
      id: "3",
      title: "Scheduled Maintenance Notice",
      message: "System maintenance scheduled for this Sunday 2-4 AM",
      type: "alert",
      target: "all",
      status: "scheduled",
      recipients: 1234,
      createdAt: "2024-01-13T15:00:00Z",
      scheduledFor: "2024-01-21T02:00:00Z",
    },
  ]);

  const handleSendNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert("Please fill in all required fields");
      return;
    }

    // Simulate sending notification
    const recipientCount = notificationForm.target === "all" ? 1234 : 456;
    alert(`Notification sent to ${recipientCount} customers successfully! 🚀`);

    // Reset form
    setNotificationForm({
      title: "",
      message: "",
      type: "announcement",
      target: "all",
      scheduledFor: "",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="h-4 w-4" />;
      case "promotion":
        return <Gift className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      case "reminder":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader
        showBack={true}
        backTo="/admin-dashboard"
        title="Push Notifications"
      />

      {/* Header */}
      <div className="bg-card border-b p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-fac-orange-500 p-2 rounded-xl">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Push Notifications
                </h1>
                <p className="text-sm text-muted-foreground">
                  Send real-time notifications to customers
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Send New Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Send New Notification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={notificationForm.type}
                  onValueChange={(value) =>
                    setNotificationForm({ ...notificationForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">
                      📢 Announcement
                    </SelectItem>
                    <SelectItem value="promotion">🎁 Promotion</SelectItem>
                    <SelectItem value="alert">⚠️ Alert</SelectItem>
                    <SelectItem value="reminder">📅 Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    message: e.target.value,
                  })
                }
                placeholder="Your notification message..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target">Target Audience</Label>
                <Select
                  value={notificationForm.target}
                  onValueChange={(value) =>
                    setNotificationForm({ ...notificationForm, target: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>All Customers (1,234)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4" />
                        <span>Premium Members (456)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduled">Schedule (Optional)</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={notificationForm.scheduledFor}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      scheduledFor: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleSendNotification}
              className="w-full bg-fac-orange-500 hover:bg-fac-orange-600"
            >
              <Send className="h-4 w-4 mr-2" />
              {notificationForm.scheduledFor ? "Schedule" : "Send"} Notification
            </Button>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-fac-orange-500 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>
                            👥 {notification.recipients.toLocaleString()}{" "}
                            recipients
                          </span>
                          <span>
                            📅 {formatDateTime(notification.createdAt)}
                          </span>
                          {notification.scheduledFor && (
                            <span>
                              ⏰ Scheduled for{" "}
                              {formatDateTime(notification.scheduledFor)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(notification.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
