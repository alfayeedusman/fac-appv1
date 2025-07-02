export interface Notification {
  id: string;
  type: "booking" | "membership" | "promotion" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
