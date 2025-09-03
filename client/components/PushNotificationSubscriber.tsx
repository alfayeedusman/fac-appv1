import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { pushNotificationService } from '@/services/firebaseService';
import { Bell, BellOff, CheckCircle, XCircle, AlertTriangle, Smartphone } from 'lucide-react';

interface PushNotificationSubscriberProps {
  userId?: string;
  className?: string;
}

export default function PushNotificationSubscriber({ 
  userId, 
  className = '' 
}: PushNotificationSubscriberProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check browser support and current status
  useEffect(() => {
    checkNotificationSupport();
    initializeService();
  }, []);

  const checkNotificationSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const initializeService = async () => {
    try {
      await pushNotificationService.initialize();
      const status = pushNotificationService.getStatus();
      setPermission(status.permission);
      setToken(status.token);
      setIsSubscribed(!!status.token);
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      setError('Failed to initialize notification service');
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await pushNotificationService.subscribe();
      
      if (success) {
        const status = pushNotificationService.getStatus();
        setPermission(status.permission);
        setToken(status.token);
        setIsSubscribed(true);
        
        // Show success notification
        if (status.permission === 'granted') {
          new Notification('🔔 Notifications Enabled!', {
            body: 'You will now receive real-time updates about your bookings and rewards.',
            icon: '/favicon.ico',
            tag: 'subscription-success'
          });
        }
      } else {
        setError('Failed to enable notifications. Please check your browser settings.');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      setError('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      setToken(null);
      setPermission('default');
    } catch (error) {
      console.error('Unsubscription failed:', error);
      setError('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!userId) {
      setError('User ID required for test notification');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title: 'Test Notification 🚀',
          message: 'This is a test push notification from Fayeed Auto Care!',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Show success message
        console.log('Test notification sent successfully');
      } else {
        setError('Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification failed:', error);
      setError('Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported in your current browser. 
              Please use a modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get real-time updates about your bookings, loyalty points, and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getPermissionIcon()}
            <span className="font-medium">Permission Status</span>
          </div>
          {getPermissionBadge()}
        </div>

        {/* Subscription Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                {isSubscribed ? 'Receiving notifications' : 'Not subscribed'}
              </div>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {/* Token Info (for debugging) */}
        {token && process.env.NODE_ENV === 'development' && (
          <div className="p-3 border rounded-lg bg-muted">
            <div className="text-sm font-medium mb-1">FCM Token (Dev)</div>
            <div className="text-xs font-mono break-all text-muted-foreground">
              {token.substring(0, 50)}...
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isSubscribed && permission !== 'denied' && (
            <Button 
              onClick={handleSubscribe} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          )}

          {isSubscribed && (
            <>
              <Button 
                variant="outline" 
                onClick={handleUnsubscribe} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Disabling...' : 'Disable'}
              </Button>
              
              {userId && process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="secondary" 
                  onClick={sendTestNotification} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Sending...' : 'Test'}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Permission Denied Help */}
        {permission === 'denied' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium text-orange-800">🔒 Notifications are blocked. Here's how to fix it:</p>

                {/* Chrome/Edge Instructions */}
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p className="font-medium text-blue-800 mb-2">🔧 Chrome/Edge/Brave:</p>
                  <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                    <li>Click the <strong>🔒 lock icon</strong> in the address bar (left of URL)</li>
                    <li>Find "Notifications" and change from <strong>"Block"</strong> to <strong>"Allow"</strong></li>
                    <li>Click <strong>"Reload"</strong> or refresh this page</li>
                  </ol>
                </div>

                {/* Firefox Instructions */}
                <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                  <p className="font-medium text-orange-800 mb-2">🦊 Firefox:</p>
                  <ol className="text-sm text-orange-700 space-y-1 ml-4 list-decimal">
                    <li>Click the <strong>🛡️ shield icon</strong> in the address bar</li>
                    <li>Click <strong>"Permissions"</strong> → <strong>"Notifications"</strong></li>
                    <li>Select <strong>"Allow"</strong> and refresh the page</li>
                  </ol>
                </div>

                {/* Safari Instructions */}
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
                  <p className="font-medium text-gray-800 mb-2">🧭 Safari:</p>
                  <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                    <li>Go to <strong>Safari</strong> → <strong>Preferences</strong> → <strong>Websites</strong></li>
                    <li>Find <strong>"Notifications"</strong> in the left sidebar</li>
                    <li>Set this website to <strong>"Allow"</strong></li>
                  </ol>
                </div>

                {/* Alternative Method */}
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  <p className="font-medium text-green-800 mb-2">📱 Alternative: Browser Settings</p>
                  <ol className="text-sm text-green-700 space-y-1 ml-4 list-decimal">
                    <li>Open your browser settings</li>
                    <li>Search for <strong>"Notifications"</strong> or <strong>"Site Permissions"</strong></li>
                    <li>Find this website and change to <strong>"Allow"</strong></li>
                  </ol>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    🔄 Refresh Page
                  </Button>
                  <Button
                    onClick={() => {
                      // Try to request permission again
                      handleSubscribe();
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    ✅ Try Again
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Ready to Enable Message */}
        {permission === 'default' && !isSubscribed && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">🔔 Ready to enable notifications!</p>
                <p className="text-sm">
                  Click <strong>"Enable Notifications"</strong> below to start receiving real-time updates about your bookings, rewards, and achievements.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Features List */}
        <div className="pt-2 border-t">
          <div className="text-sm font-medium mb-2">You'll receive notifications for:</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Booking confirmations and updates</li>
            <li>• Loyalty points earned and level-ups</li>
            <li>• Achievement unlocks and rewards</li>
            <li>• Service reminders and promotions</li>
            <li>• System updates and announcements</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
