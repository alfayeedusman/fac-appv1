// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Note: Firebase is initialized in the main app (client/services/firebaseService.ts)
// This service worker doesn't need its own Firebase initialization as it receives
// messages from the main app's Firebase instance

// Initialize Firebase with error handling (if needed for compatibility)
let messaging = null;
try {
  // Try to get messaging instance if Firebase was pre-initialized
  messaging = firebase.messaging();
  console.log('✅ Firebase messaging initialized in service worker');
} catch (error) {
  console.warn('⚠️ Firebase not available in service worker scope - this is normal');
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    // Extract notification info
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: payload.data?.tag || 'default',
      data: payload.data,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    // Handle different notification types
    if (payload.data?.type === 'achievement_unlocked') {
      notificationOptions.icon = '🏆';
      notificationOptions.actions = [
        {
          action: 'view_achievements',
          title: 'View Achievements'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ];
    } else if (payload.data?.type === 'booking_update') {
      notificationOptions.icon = '📅';
      notificationOptions.actions = [
        {
          action: 'view_booking',
          title: 'View Booking'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ];
    } else if (payload.data?.type === 'loyalty_update') {
      notificationOptions.icon = '🎯';
      notificationOptions.actions = [
        {
          action: 'view_loyalty',
          title: 'View Points'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ];
    }

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);

  event.notification.close();

  // Handle different actions
  if (event.action === 'dismiss') {
    return;
  }

  let clickAction = event.action;
  let targetUrl = '/dashboard';

  // Determine target URL based on action and notification data
  if (event.notification.data) {
    const data = event.notification.data;
    
    switch (clickAction) {
      case 'view_achievements':
        targetUrl = '/dashboard?tab=achievements';
        break;
      case 'view_booking':
        targetUrl = data.bookingId ? `/booking/${data.bookingId}` : '/bookings';
        break;
      case 'view_loyalty':
        targetUrl = '/dashboard?tab=loyalty';
        break;
      case 'view':
      default:
        targetUrl = data.url || '/dashboard';
        break;
    }
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // Check if there's an existing window to focus
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', function(event) {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
  
  // Track notification dismissal if needed
  if (event.notification.data?.trackDismissal) {
    // Send dismissal analytics to server
    fetch('/api/notifications/track-dismissal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        timestamp: new Date().toISOString(),
      }),
    }).catch(error => {
      console.error('Failed to track notification dismissal:', error);
    });
  }
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle push events (fallback)
self.addEventListener('push', function(event) {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  if (!event.data) {
    return;
  }

  try {
    const payload = event.data.json();
    const title = payload.title || 'New Notification';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: payload.data || {},
      tag: payload.tag || 'default',
      requireInteraction: true,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling push event:', error);
  }
});
