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
} from "lucide-react";
import {
  PushNotification,
  getAllNotifications,
  sendBroadcastNotification,
  getNotificationStats,
  deleteNotification,
  initializePushNotifications,
  requestNotificationPermission,
} from "@/utils/pushNotifications";
import { toast } from "@/hooks/use-toast";

export default function AdminPushNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "broadcast" as const,
    priority: "normal" as const,
    targetAudience: "all" as const,
    targetUsers: [] as string[],
    actionUrl: "",
    actionText: "",
    expiresAt: "",
    scheduledFor: "",
  });

  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    initializePushNotifications();
    loadNotifications();
    requestNotificationPermission();
  }, []);

  const loadNotifications = () => {
    setNotifications(getAllNotifications());
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const notification = sendBroadcastNotification({
        ...newNotification,
        createdBy: userEmail,
        scheduledFor: newNotification.scheduledFor || undefined,
        expiresAt: newNotification.expiresAt || undefined,
        actionUrl: newNotification.actionUrl || undefined,
        actionText: newNotification.actionText || undefined,
        targetUsers:
          newNotification.targetAudience === "specific"
            ? newNotification.targetUsers
            : undefined,
      });

      setNotifications([notification, ...notifications]);
      setNewNotification({
        title: "",
        message: "",
        type: "broadcast",
        priority: "normal",
        targetAudience: "all",
        targetUsers: [],
        actionUrl: "",
        actionText: "",
        expiresAt: "",
        scheduledFor: "",
      });
      setIsCreating(false);

      toast({
        title: "Notification Sent! 🎉",
        description: `Broadcast sent to ${notification.delivered} users.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    loadNotifications();
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "broadcast":
        return <Megaphone className="h-4 w-4" />;
      case "promotion":
        return <Target className="h-4 w-4" />;
      case "announcement":
        return <Bell className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
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
        return "bg-blue-500";
    }
  };

  // Add error handling for stats and users
  let stats;
  let registeredUsers = [];

  try {
    stats = getNotificationStats();
    registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]",
    );
  } catch (error) {
    console.error('Error loading notification stats:', error);
    // Provide fallback stats object with all required properties
    stats = {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalClicked: 0,
      deliveryRate: 0,
      readRate: 0,
      clickRate: 0
    };
    registeredUsers = [];
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-fac-orange-500 p-3 rounded-xl">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Push Notifications
                </h1>
                <p className="text-muted-foreground">
                  Broadcast messages to your users
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalSent}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalDelivered}
                  </p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalRead}
                  </p>
                  <p className="text-sm text-muted-foreground">Read</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-fac-orange-500 p-2 rounded-lg">
                  <MousePointer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalClicked}
                  </p>
                  <p className="text-sm text-muted-foreground">Clicked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Broadcast</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Create Notification Tab */}
          <TabsContent value="create">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-foreground">
                  <div className="bg-fac-orange-500 p-2 rounded-lg mr-3">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                  Create New Broadcast
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
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: any) =>
                        setNewNotification({ ...newNotification, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broadcast">Broadcast</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value: any) =>
                        setNewNotification({
                          ...newNotification,
                          priority: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select
                      value={newNotification.targetAudience}
                      onValueChange={(value: any) =>
                        setNewNotification({
                          ...newNotification,
                          targetAudience: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Users ({registeredUsers.length})
                        </SelectItem>
                        <SelectItem value="members">Members Only</SelectItem>
                        <SelectItem value="vip">VIP Members</SelectItem>
                        <SelectItem value="regular">Regular Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        message: e.target.value,
                      })
                    }
                    placeholder="Enter your message here..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="actionText">
                      Action Button Text (Optional)
                    </Label>
                    <Input
                      id="actionText"
                      value={newNotification.actionText}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          actionText: e.target.value,
                        })
                      }
                      placeholder="e.g., Book Now, Learn More"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                    <Input
                      id="actionUrl"
                      value={newNotification.actionUrl}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          actionUrl: e.target.value,
                        })
                      }
                      placeholder="e.g., /booking, /profile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledFor">
                      Schedule For (Optional)
                    </Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={newNotification.scheduledFor}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          scheduledFor: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={newNotification.expiresAt}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          expiresAt: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendNotification}
                    className="bg-fac-orange-500 hover:bg-fac-orange-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Broadcast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification History Tab */}
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
                            <div
                              className={`${getPriorityColor(notification.priority)} p-2 rounded-lg`}
                            >
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {notification.delivered} delivered
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {notification.readBy.length} read
                                </span>
                                <span className="flex items-center">
                                  <MousePointer className="h-4 w-4 mr-1" />
                                  {notification.clicked} clicked
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(
                                    notification.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {notification.targetAudience}
                            </Badge>
                            <Badge
                              className={getPriorityColor(
                                notification.priority,
                              )}
                            >
                              {notification.priority}
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Notification
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    notification? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteNotification(notification.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                      Delivery Rate
                    </h4>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.deliveryRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Successfully delivered
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Read Rate
                    </h4>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.readRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Users who read notifications
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Click Rate
                    </h4>
                    <p className="text-3xl font-bold text-fac-orange-600">
                      {stats.clickRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Users who clicked actions
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-foreground mb-4">
                    Recent Performance
                  </h4>
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => {
                      const readRate =
                        notification.delivered > 0
                          ? (notification.readBy.length /
                              notification.delivered) *
                            100
                          : 0;
                      const clickRate =
                        notification.readBy.length > 0
                          ? (notification.clicked /
                              notification.readBy.length) *
                            100
                          : 0;

                      return (
                        <div
                          key={notification.id}
                          className="border rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-foreground">
                                {notification.title}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-4 text-sm">
                              <div className="text-center">
                                <p className="font-medium text-blue-600">
                                  {readRate.toFixed(0)}%
                                </p>
                                <p className="text-muted-foreground">Read</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-fac-orange-600">
                                  {clickRate.toFixed(0)}%
                                </p>
                                <p className="text-muted-foreground">Click</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
