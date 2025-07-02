import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  User,
  UserPlus,
  CreditCard,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type:
    | "new_customer"
    | "subscription"
    | "approval_request"
    | "payment"
    | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  customerName?: string;
  amount?: number;
  actionRequired?: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onApproveCustomer?: (customerId: string) => void;
  onRejectCustomer?: (customerId: string) => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onApproveCustomer,
  onRejectCustomer,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_customer":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "subscription":
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case "approval_request":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "payment":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "system":
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_customer":
        return "border-l-blue-500";
      case "subscription":
        return "border-l-green-500";
      case "approval_request":
        return "border-l-yellow-500";
      case "payment":
        return "border-l-green-500";
      case "system":
        return "border-l-purple-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-fac-orange-500" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Mark All Read
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-1 p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 transition-all hover:bg-gray-50 ${getNotificationColor(
                    notification.type,
                  )} ${
                    notification.read ? "bg-gray-50 opacity-75" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <h4 className="text-sm font-bold text-black">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                        {notification.actionRequired && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50 h-6 px-2 text-xs"
                              onClick={() => {
                                onApproveCustomer?.(notification.id);
                                onMarkAsRead(notification.id);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 h-6 px-2 text-xs"
                              onClick={() => {
                                onRejectCustomer?.(notification.id);
                                onMarkAsRead(notification.id);
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="ml-2 p-1 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
