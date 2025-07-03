// Push Notification System for Broadcasting Messages

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: "broadcast" | "personal" | "promotion" | "announcement" | "alert";
  priority: "low" | "normal" | "high" | "urgent";
  targetAudience: "all" | "members" | "vip" | "regular" | "specific";
  targetUsers?: string[]; // specific user emails
  createdBy: string;
  createdAt: string;
  scheduledFor?: string; // for scheduled notifications
  expiresAt?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  sent: boolean;
  readBy: string[]; // array of user emails who read the notification
  delivered: number; // count of users who received it
  clicked: number; // count of users who clicked the action
  metadata?: {
    campaign?: string;
    tags?: string[];
    location?: string;
  };
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
}

// Get all notifications for admin view
export const getAllNotifications = (): PushNotification[] => {
  const notifications = localStorage.getItem("pushNotifications");
  return notifications ? JSON.parse(notifications) : [];
};

// Get notifications for a specific user
export const getUserNotifications = (userEmail: string): PushNotification[] => {
  const allNotifications = getAllNotifications();
  const now = new Date().toISOString();

  return allNotifications
    .filter((notification) => {
      // Check if notification is expired
      if (notification.expiresAt && notification.expiresAt < now) {
        return false;
      }

      // Check if notification is scheduled for future
      if (notification.scheduledFor && notification.scheduledFor > now) {
        return false;
      }

      // Check target audience
      if (notification.targetAudience === "all") {
        return true;
      }

      if (notification.targetAudience === "specific") {
        return notification.targetUsers?.includes(userEmail) || false;
      }

      // Check membership type (get from user data)
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );
      const user = registeredUsers.find((u: any) => u.email === userEmail);
      const userSubscription = JSON.parse(
        localStorage.getItem(`subscription_${userEmail}`) || "null",
      );

      if (notification.targetAudience === "members" && userSubscription) {
        return true;
      }

      if (
        notification.targetAudience === "vip" &&
        userSubscription?.package?.includes("VIP")
      ) {
        return true;
      }

      if (
        notification.targetAudience === "regular" &&
        (!userSubscription || userSubscription.package === "Regular Member")
      ) {
        return true;
      }

      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

// Send a broadcast notification
export const sendBroadcastNotification = (
  notification: Omit<
    PushNotification,
    "id" | "createdAt" | "sent" | "readBy" | "delivered" | "clicked"
  >,
): PushNotification => {
  const newNotification: PushNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    sent: true,
    readBy: [],
    delivered: 0,
    clicked: 0,
  };

  const allNotifications = getAllNotifications();
  allNotifications.unshift(newNotification);

  // Calculate delivery count
  const registeredUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]",
  );
  let deliveryCount = 0;

  if (notification.targetAudience === "all") {
    deliveryCount = registeredUsers.length;
  } else if (notification.targetAudience === "specific") {
    deliveryCount = notification.targetUsers?.length || 0;
  } else {
    // Calculate based on membership types
    deliveryCount = registeredUsers.filter((user: any) => {
      const userSubscription = JSON.parse(
        localStorage.getItem(`subscription_${user.email}`) || "null",
      );

      if (notification.targetAudience === "members") {
        return userSubscription;
      }
      if (notification.targetAudience === "vip") {
        return userSubscription?.package?.includes("VIP");
      }
      if (notification.targetAudience === "regular") {
        return (
          !userSubscription || userSubscription.package === "Regular Member"
        );
      }
      return false;
    }).length;
  }

  newNotification.delivered = deliveryCount;

  localStorage.setItem("pushNotifications", JSON.stringify(allNotifications));

  // Trigger browser notification if permission granted
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(newNotification.title, {
      body: newNotification.message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  }

  return newNotification;
};

// Mark notification as read by user
export const markNotificationAsRead = (
  notificationId: string,
  userEmail: string,
) => {
  const allNotifications = getAllNotifications();
  const notification = allNotifications.find((n) => n.id === notificationId);

  if (notification && !notification.readBy.includes(userEmail)) {
    notification.readBy.push(userEmail);
    localStorage.setItem("pushNotifications", JSON.stringify(allNotifications));
  }
};

// Mark notification action as clicked
export const markNotificationAsClicked = (
  notificationId: string,
  userEmail: string,
) => {
  const allNotifications = getAllNotifications();
  const notification = allNotifications.find((n) => n.id === notificationId);

  if (notification) {
    notification.clicked += 1;
    markNotificationAsRead(notificationId, userEmail);
    localStorage.setItem("pushNotifications", JSON.stringify(allNotifications));
  }
};

// Get notification statistics
export const getNotificationStats = (
  notificationId?: string,
): NotificationStats => {
  const allNotifications = getAllNotifications();
  const notifications = notificationId
    ? allNotifications.filter((n) => n.id === notificationId)
    : allNotifications;

  const totalSent = notifications.length;
  const totalDelivered = notifications.reduce((sum, n) => sum + n.delivered, 0);
  const totalRead = notifications.reduce((sum, n) => sum + n.readBy.length, 0);
  const totalClicked = notifications.reduce((sum, n) => sum + n.clicked, 0);

  return {
    totalSent,
    totalDelivered,
    totalRead,
    totalClicked,
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
    clickRate: totalRead > 0 ? (totalClicked / totalRead) * 100 : 0,
  };
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Delete notification (admin only)
export const deleteNotification = (notificationId: string) => {
  const allNotifications = getAllNotifications();
  const filteredNotifications = allNotifications.filter(
    (n) => n.id !== notificationId,
  );
  localStorage.setItem(
    "pushNotifications",
    JSON.stringify(filteredNotifications),
  );
};

// Initialize default notifications
export const initializePushNotifications = () => {
  const existingNotifications = localStorage.getItem("pushNotifications");
  if (!existingNotifications) {
    const defaultNotifications: PushNotification[] = [
      {
        id: "welcome_2024",
        title: "Welcome to Fayeed Auto Care! 🚗",
        message:
          "Get premium car care services with exclusive member benefits. Book your first wash today!",
        type: "announcement",
        priority: "normal",
        targetAudience: "all",
        createdBy: "system@fayeedautocare.com",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sent: true,
        readBy: [],
        delivered: 1,
        clicked: 0,
        actionUrl: "/booking",
        actionText: "Book Now",
        metadata: {
          campaign: "welcome_series",
          tags: ["welcome", "new_user"],
        },
      },
      {
        id: "weekend_promo_2024",
        title: "Weekend Special - 25% Off! 🎉",
        message:
          "This weekend only! Get 25% off all premium wash services. Limited time offer.",
        type: "promotion",
        priority: "high",
        targetAudience: "all",
        createdBy: "marketing@fayeedautocare.com",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        sent: true,
        readBy: [],
        delivered: 1,
        clicked: 0,
        actionUrl: "/booking",
        actionText: "Claim Offer",
        metadata: {
          campaign: "weekend_special",
          tags: ["promotion", "discount", "weekend"],
        },
      },
    ];

    localStorage.setItem(
      "pushNotifications",
      JSON.stringify(defaultNotifications),
    );
  }
};
