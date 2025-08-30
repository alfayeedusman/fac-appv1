import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Settings, 
  Calendar, 
  Users, 
  Wrench, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  TestTube
} from 'lucide-react';

interface NotificationSettings {
  id: string;
  type: 'new_booking' | 'status_update' | 'crew_update' | 'payment_received' | 'system_alert';
  name: string;
  description: string;
  enabled: boolean;
  soundEnabled: boolean;
  soundFile: string;
  volume: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRoles: string[];
}

interface SystemNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRoles: string[];
  targetUsers?: string[];
  data?: any;
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
  readBy: { userId: string; readAt: string }[];
  actions?: {
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'secondary';
  }[];
  playSound?: boolean;
  soundType?: string;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings[] = [
  {
    id: 'new_booking',
    type: 'new_booking',
    name: 'New Booking Alert',
    description: 'Alert when a new booking is created',
    enabled: true,
    soundEnabled: true,
    soundFile: 'synthesized', // Web Audio API synthesis
    volume: 70,
    priority: 'high',
    targetRoles: ['admin', 'superadmin', 'manager']
  },
  {
    id: 'status_update',
    type: 'status_update',
    name: 'Status Update Alert',
    description: 'Alert when booking status changes',
    enabled: true,
    soundEnabled: true,
    soundFile: 'synthesized', // Web Audio API synthesis
    volume: 50,
    priority: 'medium',
    targetRoles: ['admin', 'superadmin', 'manager']
  },
  {
    id: 'crew_update',
    type: 'crew_update',
    name: 'Crew Activity Alert',
    description: 'Alert for crew assignments and updates',
    enabled: true,
    soundEnabled: true,
    soundFile: 'synthesized', // Web Audio API synthesis
    volume: 60,
    priority: 'medium',
    targetRoles: ['admin', 'superadmin', 'manager']
  },
  {
    id: 'payment_received',
    type: 'payment_received',
    name: 'Payment Alert',
    description: 'Alert when payment is received',
    enabled: true,
    soundEnabled: true,
    soundFile: 'synthesized', // Web Audio API synthesis
    volume: 80,
    priority: 'high',
    targetRoles: ['admin', 'superadmin', 'manager', 'cashier']
  },
  {
    id: 'system_alert',
    type: 'system_alert',
    name: 'System Alert',
    description: 'Critical system notifications',
    enabled: true,
    soundEnabled: true,
    soundFile: 'synthesized', // Web Audio API synthesis
    volume: 90,
    priority: 'urgent',
    targetRoles: ['admin', 'superadmin']
  }
];

interface NotificationServiceProps {
  userRole: string;
  userId: string;
  onNotificationReceived?: (notification: SystemNotification) => void;
}

export default function NotificationService({ userRole, userId, onNotificationReceived }: NotificationServiceProps) {
  const [settings, setSettings] = useState<NotificationSettings[]>(DEFAULT_NOTIFICATION_SETTINGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // Initialize notification settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      localStorage.setItem('notification_settings', JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS));
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(() => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      const userNotifications = allNotifications.filter((notif: SystemNotification) => {
        const isTargetUser = notif.targetUsers?.includes(userId);
        const isTargetRole = notif.targetRoles.includes(userRole);
        return isTargetUser || isTargetRole;
      });
      
      setNotifications(userNotifications);
      
      const unread = userNotifications.filter((notif: SystemNotification) => 
        !notif.readBy.some(r => r.userId === userId)
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId, userRole]);

  // Poll for new notifications
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Check for new notifications and play sounds
  useEffect(() => {
    const checkForNewNotifications = () => {
      try {
        const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
        const newNotifications = allNotifications.filter((notif: SystemNotification) => {
          const isTargetUser = notif.targetUsers?.includes(userId);
          const isTargetRole = notif.targetRoles.includes(userRole);
          const isUnread = !notif.readBy.some((r: any) => r.userId === userId);
          const isRecent = new Date(notif.createdAt).getTime() > Date.now() - 10000; // Last 10 seconds
          
          return (isTargetUser || isTargetRole) && isUnread && isRecent;
        });

        newNotifications.forEach((notification: SystemNotification) => {
          // Show toast notification
          const setting = settings.find(s => s.type === notification.type);
          if (setting?.enabled) {
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.priority === 'urgent' ? 'destructive' : 'default',
              duration: notification.priority === 'urgent' ? 10000 : 5000,
            });

            // Play sound if enabled
            if (setting.soundEnabled && notification.playSound) {
              playNotificationSound(setting);
            }

            // Callback for parent component
            if (onNotificationReceived) {
              onNotificationReceived(notification);
            }
          }
        });
      } catch (error) {
        console.error('Error checking for new notifications:', error);
      }
    };

    const interval = setInterval(checkForNewNotifications, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [settings, userId, userRole, onNotificationReceived]);

  const playNotificationSound = (setting: NotificationSettings) => {
    try {
      // Create a simple beep sound using Web Audio API since we don't have actual sound files
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different notification types
      const frequencies = {
        new_booking: 800,
        status_update: 600,
        crew_update: 700,
        payment_received: 900,
        system_alert: 1000
      };
      
      oscillator.frequency.setValueAtTime(
        frequencies[setting.type as keyof typeof frequencies] || 800, 
        audioContext.currentTime
      );
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(setting.volume / 100 * 0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const updateNotificationSetting = (id: string, updates: Partial<NotificationSettings>) => {
    const updatedSettings = settings.map(setting => 
      setting.id === id ? { ...setting, ...updates } : setting
    );
    setSettings(updatedSettings);
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
  };

  const markAsRead = (notificationId: string) => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      const updatedNotifications = allNotifications.map((notif: SystemNotification) => {
        if (notif.id === notificationId) {
          const readBy = notif.readBy || [];
          if (!readBy.some((r: any) => r.userId === userId)) {
            readBy.push({ userId, readAt: new Date().toISOString() });
          }
          return { ...notif, readBy };
        }
        return notif;
      });
      
      localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      const updatedNotifications = allNotifications.map((notif: SystemNotification) => {
        const isTargetUser = notif.targetUsers?.includes(userId);
        const isTargetRole = notif.targetRoles.includes(userRole);
        
        if (isTargetUser || isTargetRole) {
          const readBy = notif.readBy || [];
          if (!readBy.some((r: any) => r.userId === userId)) {
            readBy.push({ userId, readAt: new Date().toISOString() });
          }
          return { ...notif, readBy };
        }
        return notif;
      });
      
      localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
      loadNotifications();
      
      toast({
        title: "All notifications marked as read",
        description: "You're all caught up!",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const testNotificationSound = (setting: NotificationSettings) => {
    setIsPlaying(setting.id);
    playNotificationSound(setting);
    setTimeout(() => setIsPlaying(null), 500);
  };

  const createTestNotification = () => {
    const testNotification: SystemNotification = {
      id: `test_${Date.now()}`,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      priority: 'medium',
      targetRoles: [userRole],
      targetUsers: [userId],
      createdAt: new Date().toISOString(),
      readBy: [],
      playSound: true,
      soundType: 'system_alert'
    };

    const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
    allNotifications.push(testNotification);
    localStorage.setItem('system_notifications', JSON.stringify(allNotifications));

    toast({
      title: "Test Notification Created",
      description: "Check if you received the notification with sound",
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      new_booking: Calendar,
      status_update: CheckCircle,
      crew_update: Wrench,
      payment_received: DollarSign,
      system_alert: AlertCircle
    };
    const IconComponent = icons[type as keyof typeof icons] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Center
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={createTestNotification} variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </Button>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  Mark All Read
                </Button>
              )}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {settings.map((setting) => (
                      <Card key={setting.id}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold flex items-center">
                                  {getTypeIcon(setting.type)}
                                  <span className="ml-2">{setting.name}</span>
                                  <Badge className={`ml-2 ${getPriorityColor(setting.priority)}`}>
                                    {setting.priority}
                                  </Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground">{setting.description}</p>
                              </div>
                              <Switch
                                checked={setting.enabled}
                                onCheckedChange={(enabled) => 
                                  updateNotificationSetting(setting.id, { enabled })
                                }
                              />
                            </div>
                            
                            {setting.enabled && (
                              <div className="space-y-3 border-t pt-3">
                                <div className="flex items-center justify-between">
                                  <Label className="flex items-center">
                                    {setting.soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                                    Sound Enabled
                                  </Label>
                                  <Switch
                                    checked={setting.soundEnabled}
                                    onCheckedChange={(soundEnabled) => 
                                      updateNotificationSetting(setting.id, { soundEnabled })
                                    }
                                  />
                                </div>
                                
                                {setting.soundEnabled && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label>Volume: {setting.volume}%</Label>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => testNotificationSound(setting)}
                                        disabled={isPlaying === setting.id}
                                      >
                                        {isPlaying === setting.id ? (
                                          <PauseCircle className="h-4 w-4" />
                                        ) : (
                                          <PlayCircle className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <Slider
                                      value={[setting.volume]}
                                      onValueChange={([volume]) => 
                                        updateNotificationSetting(setting.id, { volume })
                                      }
                                      max={100}
                                      step={5}
                                      className="w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => {
              const isRead = notification.readBy.some(r => r.userId === userId);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isRead ? 'bg-muted opacity-75' : 'bg-card shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => !isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(notification.type)}
                        <h4 className="font-semibold">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export hook for easy integration
export function useNotificationService(userRole: string, userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnreadCount = useCallback(() => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      const userNotifications = allNotifications.filter((notif: SystemNotification) => {
        const isTargetUser = notif.targetUsers?.includes(userId);
        const isTargetRole = notif.targetRoles.includes(userRole);
        return isTargetUser || isTargetRole;
      });
      
      const unread = userNotifications.filter((notif: SystemNotification) => 
        !notif.readBy.some((r: any) => r.userId === userId)
      ).length;
      
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error checking unread count:', error);
    }
  }, [userId, userRole]);

  useEffect(() => {
    checkUnreadCount();
    const interval = setInterval(checkUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [checkUnreadCount]);

  return { unreadCount };
}
