import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

// Check if running in browser environment and service workers are supported
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
  }
}

// FCM VAPID Key
const VAPID_KEY = import.meta.env.VITE_FIREBASE_FCM_KEY;

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class FirebasePushNotificationService {
  private static instance: FirebasePushNotificationService;
  private fcmToken: string | null = null;
  private permissionGranted: boolean = false;

  private constructor() {}

  static getInstance(): FirebasePushNotificationService {
    if (!FirebasePushNotificationService.instance) {
      FirebasePushNotificationService.instance = new FirebasePushNotificationService();
    }
    return FirebasePushNotificationService.instance;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!messaging) {
      console.error('Firebase messaging not initialized');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      
      if (this.permissionGranted) {
        console.log('🔔 Notification permission granted');
        await this.getFCMToken();
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM registration token
   */
  async getFCMToken(): Promise<string | null> {
    if (!messaging) {
      console.error('Firebase messaging not initialized');
      return null;
    }

    try {
      if (!VAPID_KEY) {
        console.error('VAPID key not configured');
        return null;
      }

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        this.fcmToken = token;
        console.log('📱 FCM Token obtained:', token);
        
        // Store token in local storage for persistence
        localStorage.setItem('fcm_token', token);
        
        // Send token to server
        await this.sendTokenToServer(token);
        
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Send FCM token to server for storage
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId: this.getCurrentUserId(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ FCM token sent to server successfully');
      } else {
        console.error('❌ Failed to send FCM token to server:', response.status);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⏱️ FCM token registration timeout - will retry later');
      } else {
        console.error('Error sending FCM token to server:', error);
      }
    }
  }

  /**
   * Setup foreground message listener
   */
  setupForegroundListener(): void {
    if (!messaging) {
      console.error('Firebase messaging not initialized');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);
      
      // Extract notification data
      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions: NotificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: payload.data?.tag || 'default',
        requireInteraction: true,
        data: payload.data,
      };

      // Show notification
      this.showNotification(notificationTitle, notificationOptions);
      
      // Handle custom data
      if (payload.data) {
        this.handleNotificationData(payload.data);
      }
    });
  }

  /**
   * Show browser notification
   */
  private showNotification(title: string, options: NotificationOptions): void {
    if (this.permissionGranted && 'Notification' in window) {
      const notification = new Notification(title, options);
      
      notification.onclick = (event) => {
        event.preventDefault();
        
        // Focus the window
        window.focus();
        
        // Handle click action based on notification data
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
        
        // Close notification
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  /**
   * Handle notification data payload
   */
  private handleNotificationData(data: any): void {
    console.log('🔄 Processing notification data:', data);
    
    // Handle different notification types
    switch (data.type) {
      case 'booking_update':
        this.handleBookingUpdate(data);
        break;
      case 'loyalty_update':
        this.handleLoyaltyUpdate(data);
        break;
      case 'achievement_unlocked':
        this.handleAchievementUnlocked(data);
        break;
      case 'system_notification':
        this.handleSystemNotification(data);
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  /**
   * Handle booking update notifications
   */
  private handleBookingUpdate(data: any): void {
    console.log('📅 Booking update:', data);
    
    // Trigger booking status refresh
    window.dispatchEvent(new CustomEvent('bookingStatusUpdate', {
      detail: {
        bookingId: data.bookingId,
        status: data.status,
        message: data.message,
      }
    }));
  }

  /**
   * Handle loyalty points update notifications
   */
  private handleLoyaltyUpdate(data: any): void {
    console.log('🎯 Loyalty update:', data);
    
    // Trigger loyalty points refresh
    window.dispatchEvent(new CustomEvent('loyaltyPointsUpdate', {
      detail: {
        points: data.points,
        transaction: data.transaction,
        message: data.message,
      }
    }));
  }

  /**
   * Handle achievement unlocked notifications
   */
  private handleAchievementUnlocked(data: any): void {
    console.log('🏆 Achievement unlocked:', data);
    
    // Show special achievement notification
    this.showAchievementNotification(data);
    
    // Trigger achievement refresh
    window.dispatchEvent(new CustomEvent('achievementUnlocked', {
      detail: {
        achievementId: data.achievementId,
        achievementName: data.achievementName,
        points: data.points,
      }
    }));
  }

  /**
   * Handle system notifications
   */
  private handleSystemNotification(data: any): void {
    console.log('⚙️ System notification:', data);
    
    // Trigger admin notification refresh if user is admin
    if (this.isAdmin()) {
      window.dispatchEvent(new CustomEvent('adminNotificationUpdate', {
        detail: data
      }));
    }
  }

  /**
   * Show special achievement notification with animation
   */
  private showAchievementNotification(data: any): void {
    // Create custom achievement notification
    if (this.permissionGranted) {
      const notification = new Notification(`🏆 Achievement Unlocked!`, {
        body: `You've earned "${data.achievementName}" (+${data.points} points)`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'achievement',
        requireInteraction: true,
        data: {
          type: 'achievement',
          url: '/dashboard?tab=achievements',
          ...data
        }
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/dashboard?tab=achievements';
        notification.close();
      };
    }
  }

  /**
   * Get current user ID from local storage or session
   */
  private getCurrentUserId(): string | null {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.email || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  /**
   * Check if current user is admin
   */
  private isAdmin(): boolean {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.role === 'admin' || user.role === 'superadmin';
      }
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Firebase Push Notification Service...');
    
    if (!messaging) {
      console.error('Firebase messaging not available');
      return false;
    }

    // Check if permission was previously granted
    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      await this.getFCMToken();
    }

    // Setup message listener
    this.setupForegroundListener();

    // Check for stored token
    const storedToken = localStorage.getItem('fcm_token');
    if (storedToken) {
      this.fcmToken = storedToken;
      console.log('📱 Using stored FCM token');
    }

    console.log('✅ Firebase Push Notification Service initialized');
    return true;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<boolean> {
    const permissionGranted = await this.requestPermission();
    if (permissionGranted) {
      await this.initialize();
      return true;
    }
    return false;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    try {
      // Remove token from local storage
      localStorage.removeItem('fcm_token');
      
      // Notify server to remove token
      if (this.fcmToken) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/notifications/unregister-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: this.fcmToken,
              userId: this.getCurrentUserId(),
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch (unregError) {
          clearTimeout(timeoutId);
          console.warn('Failed to unregister token:', unregError);
        }
      }

      this.fcmToken = null;
      this.permissionGranted = false;
      
      console.log('✅ Unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  }

  /**
   * Get current notification status
   */
  getStatus(): {
    permission: NotificationPermission;
    token: string | null;
    supported: boolean;
  } {
    return {
      permission: Notification.permission,
      token: this.fcmToken,
      supported: messaging !== null && 'Notification' in window,
    };
  }
}

// Export singleton instance
export const pushNotificationService = FirebasePushNotificationService.getInstance();

// Export for manual usage
export { messaging };
