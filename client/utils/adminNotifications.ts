export interface AdminNotification {
  id: string;
  type:
    | "subscription_request"
    | "payment_submitted"
    | "user_registered"
    | "system";
  title: string;
  message: string;
  userName: string;
  userEmail: string;
  requestId?: string;
  priority: "low" | "normal" | "high" | "urgent";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export const addAdminNotification = (
  notification: Omit<AdminNotification, "id" | "timestamp" | "read">,
) => {
  const adminNotifications = getAdminNotifications();

  const newNotification: AdminNotification = {
    ...notification,
    id: `admin_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  adminNotifications.unshift(newNotification);

  // Keep only last 100 notifications
  if (adminNotifications.length > 100) {
    adminNotifications.splice(100);
  }

  localStorage.setItem(
    "fac_admin_notifications",
    JSON.stringify(adminNotifications),
  );

  return newNotification;
};

export const getAdminNotifications = (): AdminNotification[] => {
  const stored = localStorage.getItem("fac_admin_notifications");
  return stored ? JSON.parse(stored) : [];
};

export const markAdminNotificationAsRead = (notificationId: string) => {
  const notifications = getAdminNotifications();
  const notificationIndex = notifications.findIndex(
    (n) => n.id === notificationId,
  );

  if (notificationIndex !== -1) {
    notifications[notificationIndex].read = true;
    localStorage.setItem(
      "fac_admin_notifications",
      JSON.stringify(notifications),
    );
  }
};

export const markAllAdminNotificationsAsRead = () => {
  const notifications = getAdminNotifications();
  notifications.forEach((n) => (n.read = true));
  localStorage.setItem(
    "fac_admin_notifications",
    JSON.stringify(notifications),
  );
};

export const getUnreadAdminNotificationCount = (): number => {
  const notifications = getAdminNotifications();
  return notifications.filter((n) => !n.read).length;
};

export const clearAdminNotifications = () => {
  localStorage.setItem("fac_admin_notifications", JSON.stringify([]));
};

// Helper function to add subscription request notification
export const addSubscriptionRequestNotification = (
  userName: string,
  userEmail: string,
  packageType: string,
  amount: string,
  requestId: string,
) => {
  return addAdminNotification({
    type: "subscription_request",
    title: "New Subscription Request",
    message: `${userName} submitted a payment request for ${packageType} (${amount})`,
    userName,
    userEmail,
    requestId,
    priority: "high",
    actionUrl: "/admin-subscription-approval",
    actionText: "Review Request",
  });
};

// Helper function to add payment submitted notification
export const addPaymentSubmittedNotification = (
  userName: string,
  userEmail: string,
  packageType: string,
  amount: string,
  paymentMethod: string,
) => {
  return addAdminNotification({
    type: "payment_submitted",
    title: "Payment Submitted",
    message: `${userName} submitted payment via ${paymentMethod.replace("_", " ")} for ${packageType} (${amount})`,
    userName,
    userEmail,
    priority: "normal",
    actionUrl: "/admin-subscription-approval",
    actionText: "View Payment",
  });
};
