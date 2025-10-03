import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  Bell,
  Users,
  Eye,
  MousePointer,
  Calendar,
  Trash2,
  Plus,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Megaphone,
  Settings,
  Activity,
  TrendingUp,
  Smartphone,
  BellRing,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PushNotificationSubscriber from "@/components/PushNotificationSubscriber";

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  notificationType: string;
  targetType: string;
  totalTargets: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  status: string;
  createdAt: string;
  campaign?: string;
}

interface NotificationStats {
  activeTokens: number;
  recentNotifications: Array<{
    count: number;
    type: string;
    status: string;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
}

export default function AdminPushNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NotificationStats>({
    activeTokens: 0,
    recentNotifications: [],
    dateRange: { from: '', to: '' }
  });
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: "",
    body: "",
    targetType: "all",
    targetValues: [] as string[],
    notificationType: "system_notification",
    imageUrl: "",
    clickAction: "",
    campaign: "",
  });

  const userEmail = localStorage.getItem("userEmail") || "";
  const userId = localStorage.getItem("userId") || userEmail;

  useEffect(() => {
    loadStats();
    loadNotificationHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications/stats`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const loadNotificationHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications/history?limit=20`);
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Failed to load notification history:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.body) {
      setError("Please fill in title and message");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNotification.title,
          body: newNotification.body,
          targetType: newNotification.targetType,
          targetValues: newNotification.targetValues,
          notificationType: newNotification.notificationType,
          imageUrl: newNotification.imageUrl || undefined,
          clickAction: newNotification.clickAction || undefined,
          campaign: newNotification.campaign || undefined,
          adminUserId: userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Notification Sent!",
          description: `Successfully delivered to ${result.stats.successfulDeliveries}/${result.stats.totalTargets} users`,
        });

        // Reset form
        setNewNotification({
          title: "",
          body: "",
          targetType: "all",
          targetValues: [],
          notificationType: "system_notification",
          imageUrl: "",
          clickAction: "",
          campaign: "",
        });

        // Reload data
        await loadStats();
        await loadNotificationHistory();
      } else {
        setError(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          title: '🧪 Test Notification',
          message: 'This is a test push notification from your admin panel!',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Test Notification Sent!",
          description: `Test delivered to ${result.stats.successfulDeliveries} device(s)`,
        });
      } else {
        setError(result.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking_update":
        return <Calendar className="h-4 w-4" />;
      case "loyalty_update":
        return <Target className="h-4 w-4" />;
      case "achievement_unlocked":
        return <CheckCircle className="h-4 w-4" />;
      case "system_notification":
        return <Bell className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const deliveryRate = stats.activeTokens > 0 
    ? ((stats.recentNotifications.reduce((sum, n) => sum + n.count, 0) / stats.activeTokens) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-fac-orange-500 p-3 rounded-xl">
              <BellRing className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Firebase Push Notifications
              </h1>
              <p className="text-muted-foreground">
                Send real-time notifications to your users
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={sendTestNotification}
            variant="outline"
            disabled={isLoading}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
          >
            <Activity className="h-4 w-4 mr-2" />
            Send Test
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeTokens}
                </p>
                <p className="text-sm text-muted-foreground">Active Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.recentNotifications.filter(n => n.status === 'sent').reduce((sum, n) => sum + n.count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Sent (7 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-fac-orange-500 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {deliveryRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup & Subscribe</TabsTrigger>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Push Notification Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      As an admin, you should subscribe to push notifications to test the system and receive important updates.
                    </AlertDescription>
                  </Alert>
                  
                  <PushNotificationSubscriber 
                    userId={userId}
                    className="max-w-2xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Send Notification Tab */}
        <TabsContent value="send">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-foreground">
                <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                  <Send className="h-5 w-5 text-white" />
                </div>
                Send Push Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Notification Title *</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter notification title"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={newNotification.notificationType}
                    onValueChange={(value) =>
                      setNewNotification({ ...newNotification, notificationType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system_notification">System Notification</SelectItem>
                      <SelectItem value="booking_update">Booking Update</SelectItem>
                      <SelectItem value="loyalty_update">Loyalty Update</SelectItem>
                      <SelectItem value="achievement_unlocked">Achievement</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetType">Target Audience</Label>
                  <Select
                    value={newNotification.targetType}
                    onValueChange={(value) =>
                      setNewNotification({
                        ...newNotification,
                        targetType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="role">By Role</SelectItem>
                      <SelectItem value="users">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="campaign">Campaign (Optional)</Label>
                  <Input
                    id="campaign"
                    value={newNotification.campaign}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        campaign: e.target.value,
                      })
                    }
                    placeholder="e.g., summer_promo"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={newNotification.body}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      body: e.target.value,
                    })
                  }
                  placeholder="Enter your message here..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    value={newNotification.imageUrl}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="clickAction">Click Action URL (Optional)</Label>
                  <Input
                    id="clickAction"
                    value={newNotification.clickAction}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        clickAction: e.target.value,
                      })
                    }
                    placeholder="/dashboard, /booking, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setNewNotification({
                    title: "",
                    body: "",
                    targetType: "all",
                    targetValues: [],
                    notificationType: "system_notification",
                    imageUrl: "",
                    clickAction: "",
                    campaign: "",
                  })}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSendNotification}
                  disabled={isLoading}
                  className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-foreground">
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Notification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications sent yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`${getStatusColor(notification.status)} p-2 rounded-lg`}>
                            {getTypeIcon(notification.notificationType)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.body}
                            </p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {notification.successfulDeliveries}/{notification.totalTargets} delivered
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(notification.createdAt)}
                              </span>
                              {notification.campaign && (
                                <span className="flex items-center">
                                  <Target className="h-4 w-4 mr-1" />
                                  {notification.campaign}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {notification.targetType}
                          </Badge>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-foreground">
                  <div className="bg-purple-500 p-2 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Notification Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Active Devices
                    </h4>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.activeTokens}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registered for notifications
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Delivery Rate
                    </h4>
                    <p className="text-3xl font-bold text-green-600">
                      {deliveryRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Successfully delivered
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Total Sent
                    </h4>
                    <p className="text-3xl font-bold text-fac-orange-600">
                      {notifications.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All time notifications
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-foreground mb-4">
                    Notification Types (Last 7 Days)
                  </h4>
                  <div className="space-y-3">
                    {stats.recentNotifications.map((stat, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(stat.type)}
                            <span className="font-medium text-foreground">
                              {stat.type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-medium text-foreground">
                              {stat.count} sent
                            </span>
                            <Badge className={getStatusColor(stat.status)}>
                              {stat.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stats.recentNotifications.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No notifications sent in the last 7 days
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
