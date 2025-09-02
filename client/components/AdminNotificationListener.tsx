import { useEffect, useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";

// Global notification listener for admin users
export default function AdminNotificationListener() {
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  const checkForNewNotifications = useCallback(() => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');
      
      // Only check for notifications if user is admin, superadmin, or manager
      if (!userEmail || !['admin', 'superadmin', 'manager'].includes(userRole || '')) {
        return;
      }

      const allNotifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
      const newNotifications = allNotifications.filter((notif: any) => {
        const isTargetUser = notif.targetUsers?.includes(userEmail);
        const isTargetRole = notif.targetRoles.includes(userRole);
        const isUnread = !notif.readBy.some((r: any) => r.userId === userEmail);
        const isRecent = new Date(notif.createdAt).getTime() > lastCheckTime;
        
        return (isTargetUser || isTargetRole) && isUnread && isRecent;
      });

      if (newNotifications.length > 0) {
        setLastCheckTime(Date.now());
        
        newNotifications.forEach((notification: any) => {
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.priority === 'urgent' ? 'destructive' : 'default',
            duration: notification.priority === 'urgent' ? 10000 : 5000,
          });

          // Play sound if enabled
          if (notification.playSound && notification.soundType) {
            playNotificationSound(notification.soundType);
          }
        });
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }, [lastCheckTime]);

  const playNotificationSound = (soundType: string) => {
    try {
      // Get notification settings
      const savedSettings = localStorage.getItem('notification_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : [
        {
          id: 'new_booking',
          type: 'new_booking',
          enabled: true,
          soundEnabled: true,
          volume: 70
        }
      ];
      
      const setting = settings.find((s: any) => s.type === soundType && s.enabled && s.soundEnabled);
      
      if (!setting) {
        console.log(`Sound disabled for notification type: ${soundType}`);
        return;
      }

      // Create a simple beep sound using Web Audio API
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different notification types
      const frequencies: Record<string, number> = {
        'new_booking': 800,
        'status_update': 600,
        'crew_update': 700,
        'payment_received': 900,
        'system_alert': 1000
      };
      
      oscillator.frequency.setValueAtTime(
        frequencies[soundType] || 800, 
        audioContext.currentTime
      );
      oscillator.type = 'square';
      
      const volume = (setting.volume || 70) / 100;
      gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log(`🔊 Played notification sound: ${soundType} at volume ${volume}`);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Check for new notifications every 2 seconds
  useEffect(() => {
    const interval = setInterval(checkForNewNotifications, 2000);
    return () => clearInterval(interval);
  }, [checkForNewNotifications]);

  return null; // This component doesn't render anything
}
