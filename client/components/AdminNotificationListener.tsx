import { useEffect, useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useVisibilityPolling } from '@/hooks/use-visibility-polling';
import { log, warn } from '@/utils/logger';

// Global notification listener for admin users
import realtimeService from '@/services/realtimeService';
import { addAdminNotification } from '@/utils/adminNotifications';

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

          // Also add to admin notification center
          addAdminNotification({
            type: notification.type || 'system',
            title: notification.title,
            message: notification.message,
            priority: notification.priority || 'normal',
            data: notification.data || null,
            targetRoles: notification.targetRoles || ['admin'],
            targetUsers: notification.targetUsers || [],
          });
        });
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }, [lastCheckTime]);

  const handleRealtimeEvent = useCallback((eventType: string, data: any) => {
    try {
      // Create a friendly admin notification and toast for key events
      if (eventType === 'booking.created') {
        const title = 'New Booking';
        const message = `Booking ${data.bookingId} created by ${data.booking?.guestInfo?.firstName || data.booking?.customerName || 'Customer'}`;
        toast({ title, description: message, duration: 8000 });
        addAdminNotification({ type: 'new_booking', title, message, priority: 'high', data });
        playNotificationSound('new_booking');
      }

      if (eventType === 'booking.updated') {
        // Check if payment status changed
        const isPaymentUpdate = data.paymentStatus === 'completed' || data.paymentStatus === 'failed';
        const title = isPaymentUpdate ? '💳 Payment Received' : 'Booking Updated';
        const amount = data.booking?.totalPrice ? `₱${data.booking.totalPrice}` : '';
        const message = isPaymentUpdate
          ? `Booking ${data.bookingId} - Payment ${data.paymentStatus === 'completed' ? 'completed' : 'failed'} ${amount}`
          : `Booking ${data.bookingId} - ${data.paymentStatus || 'status updated'}`;

        toast({
          title,
          description: message,
          duration: isPaymentUpdate ? 8000 : 6000,
          variant: data.paymentStatus === 'failed' ? 'destructive' : 'default'
        });

        const priority = isPaymentUpdate ? 'high' : 'normal';
        addAdminNotification({ type: 'status_update', title, message, priority, data });

        // Play sound for payment notifications
        if (isPaymentUpdate && data.paymentStatus === 'completed') {
          playNotificationSound('payment_received');
        }
      }

      if (eventType === 'pos.transaction.created') {
        const title = 'POS Transaction';
        const message = `Transaction ${data.transactionNumber || data.transactionId} - ₱${data.totalAmount}`;
        toast({ title, description: message, duration: 6000 });
        addAdminNotification({ type: 'payment', title, message, priority: 'normal', data });
      }

      if (eventType === 'inventory.updated' || eventType === 'inventory.created' || eventType === 'inventory.deleted') {
        const title = 'Inventory Update';
        const message = eventType === 'inventory.deleted' ? `Item removed: ${data.id}` : `Item ${data.item?.id || data.item?.name || ''} updated`;
        toast({ title, description: message, duration: 6000 });
        addAdminNotification({ type: 'inventory', title, message, priority: 'normal', data });
      }

      if (eventType === 'new-message') {
        const title = 'New Message';
        const message = data.content || 'New message received';
        toast({ title, description: message, duration: 6000 });
        addAdminNotification({ type: 'system', title, message, priority: 'normal', data });
      }

      if (eventType === 'subscription.renewed' || eventType === 'subscription.failed') {
        const title = eventType === 'subscription.renewed' ? 'Subscription Renewed' : 'Subscription Payment Failed';
        const message = eventType === 'subscription.renewed' ? `Subscription ${data.subscriptionId} renewed` : `Subscription ${data.subscriptionId} payment failed`;
        toast({ title, description: message, duration: 6000 });
        addAdminNotification({ type: 'subscription', title, message, priority: 'normal', data });
      }
    } catch (error) {
      console.error('Error handling realtime event:', error);
    }
  }, []);

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

  // Use visibility-aware polling as a safer fallback (checks every 10s when visible)
  useVisibilityPolling(checkForNewNotifications, 10000);

  // Subscribe to realtimeService events
  useEffect(() => {
    const subs: Array<() => void> = [];
    subs.push(realtimeService.subscribe('booking.created', (d) => handleRealtimeEvent('booking.created', d)));
    subs.push(realtimeService.subscribe('booking.updated', (d) => handleRealtimeEvent('booking.updated', d)));
    subs.push(realtimeService.subscribe('pos.transaction.created', (d) => handleRealtimeEvent('pos.transaction.created', d)));
    subs.push(realtimeService.subscribe('inventory.updated', (d) => handleRealtimeEvent('inventory.updated', d)));
    subs.push(realtimeService.subscribe('inventory.created', (d) => handleRealtimeEvent('inventory.created', d)));
    subs.push(realtimeService.subscribe('inventory.deleted', (d) => handleRealtimeEvent('inventory.deleted', d)));
    subs.push(realtimeService.subscribe('new-message', (d) => handleRealtimeEvent('new-message', d)));
    subs.push(realtimeService.subscribe('subscription.renewed', (d) => handleRealtimeEvent('subscription.renewed', d)));
    subs.push(realtimeService.subscribe('subscription.failed', (d) => handleRealtimeEvent('subscription.failed', d)));

    return () => {
      subs.forEach((unsub) => unsub());
    };
  }, [handleRealtimeEvent]);

  return null; // This component doesn't render anything
}
