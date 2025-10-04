import admin from 'firebase-admin';
import { neonDbService } from './neonDatabaseService';
import * as schema from '../database/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // You'll need to set up your Firebase service account credentials
    // This should be done via environment variables or service account key file
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    console.log('🔧 Using mock push notification service for development');
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  clickAction?: string;
  icon?: string;
  badge?: string;
  sound?: string;
  tag?: string;
}

export interface NotificationTarget {
  type: 'user' | 'users' | 'role' | 'all' | 'topic';
  values?: string[]; // User IDs, role names, or topic names
}

export interface SendNotificationOptions {
  target: NotificationTarget;
  payload: PushNotificationPayload;
  notificationType: string;
  scheduledFor?: Date;
  campaign?: string;
  createdBy?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Register FCM token for a user
   */
  async registerToken(tokenData: {
    token: string;
    userId?: string;
    deviceType?: string;
    browserInfo?: string;
    deviceName?: string;
    notificationTypes?: string[];
  }): Promise<boolean> {
    try {
      const db = neonDbService.db;
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Check if token already exists
      const existingTokens = await db
        .select()
        .from(schema.fcmTokens)
        .where(eq(schema.fcmTokens.token, tokenData.token))
        .limit(1);

      if (existingTokens.length > 0) {
        // Update existing token
        await db
          .update(schema.fcmTokens)
          .set({
            userId: tokenData.userId,
            deviceType: tokenData.deviceType || 'web',
            browserInfo: tokenData.browserInfo,
            deviceName: tokenData.deviceName,
            notificationTypes: tokenData.notificationTypes || ['booking_updates', 'loyalty_updates', 'system'],
            isActive: true,
            lastUsed: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(schema.fcmTokens.token, tokenData.token));

        console.log('✅ FCM token updated successfully');
      } else {
        // Insert new token
        await neonDbService.db.insert(schema.fcmTokens).values({
          id: createId(),
          token: tokenData.token,
          userId: tokenData.userId,
          deviceType: tokenData.deviceType || 'web',
          browserInfo: tokenData.browserInfo,
          deviceName: tokenData.deviceName,
          notificationTypes: tokenData.notificationTypes || ['booking_updates', 'loyalty_updates', 'system'],
          isActive: true,
          lastUsed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log('✅ FCM token registered successfully');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to register FCM token:', error);
      return false;
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(token: string, userId?: string): Promise<boolean> {
    try {
      const db = neonDbService.db;
      if (!db) {
        throw new Error('Database not initialized');
      }

      const conditions = [eq(schema.fcmTokens.token, token)];
      if (userId) {
        conditions.push(eq(schema.fcmTokens.userId, userId));
      }

      await db
        .update(schema.fcmTokens)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(and(...conditions));

      console.log('✅ FCM token unregistered successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to unregister FCM token:', error);
      return false;
    }
  }

  /**
   * Get FCM tokens for target users
   */
  private async getTargetTokens(target: NotificationTarget): Promise<Array<{ token: string; userId?: string; id: string }>> {
    try {
      const db = neonDbService.db;
      if (!db) {
        console.error('Database not initialized for getTargetTokens');
        return [];
      }

      let tokens: Array<{ token: string; userId?: string; id: string }> = [];

      switch (target.type) {
        case 'user':
          if (target.values && target.values.length > 0) {
            const userTokens = await db
              .select({
                token: schema.fcmTokens.token,
                userId: schema.fcmTokens.userId,
                id: schema.fcmTokens.id,
              })
              .from(schema.fcmTokens)
              .where(
                and(
                  eq(schema.fcmTokens.userId, target.values[0]),
                  eq(schema.fcmTokens.isActive, true)
                )
              );
            tokens = userTokens;
          }
          break;

        case 'users':
          if (target.values && target.values.length > 0) {
            const userTokens = await db
              .select({
                token: schema.fcmTokens.token,
                userId: schema.fcmTokens.userId,
                id: schema.fcmTokens.id,
              })
              .from(schema.fcmTokens)
              .where(
                and(
                  inArray(schema.fcmTokens.userId, target.values),
                  eq(schema.fcmTokens.isActive, true)
                )
              );
            tokens = userTokens;
          }
          break;

        case 'role':
          // This would require joining with users table to filter by role
          // For now, we'll implement a basic version
          const allTokens = await db
            .select({
              token: schema.fcmTokens.token,
              userId: schema.fcmTokens.userId,
              id: schema.fcmTokens.id,
            })
            .from(schema.fcmTokens)
            .where(eq(schema.fcmTokens.isActive, true));
          tokens = allTokens;
          break;

        case 'all':
          const allActiveTokens = await db
            .select({
              token: schema.fcmTokens.token,
              userId: schema.fcmTokens.userId,
              id: schema.fcmTokens.id,
            })
            .from(schema.fcmTokens)
            .where(eq(schema.fcmTokens.isActive, true));
          tokens = allActiveTokens;
          break;

        default:
          console.warn('Unknown target type:', target.type);
      }

      return tokens;
    } catch (error) {
      console.error('❌ Failed to get target tokens:', error);
      return [];
    }
  }

  /**
   * Send push notification
   */
  async sendNotification(options: SendNotificationOptions): Promise<{
    success: boolean;
    notificationId?: string;
    totalTargets: number;
    successfulDeliveries: number;
    failedDeliveries: number;
  }> {
    try {
      // Get target tokens
      const targetTokens = await this.getTargetTokens(options.target);

      if (targetTokens.length === 0) {
        console.warn('⚠️ No target tokens found for notification');
        return {
          success: false,
          totalTargets: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
        };
      }

      // Create notification record
      const notificationId = createId();
      await neonDbService.db.insert(schema.pushNotifications).values({
        id: notificationId,
        title: options.payload.title,
        body: options.payload.body,
        imageUrl: options.payload.imageUrl,
        targetType: options.target.type,
        targetIds: options.target.values || [],
        notificationType: options.notificationType,
        data: options.payload.data,
        totalTargets: targetTokens.length,
        status: 'sending',
        scheduledFor: options.scheduledFor,
        createdBy: options.createdBy,
        campaign: options.campaign,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      let successfulDeliveries = 0;
      let failedDeliveries = 0;

      // Check if Firebase Admin is properly initialized
      if (!admin.apps.length) {
        console.warn('🔧 Firebase Admin not initialized, using mock delivery');
        successfulDeliveries = targetTokens.length;
        
        // Create mock delivery records
        for (const tokenData of targetTokens) {
          await neonDbService.db.insert(schema.notificationDeliveries).values({
            id: createId(),
            notificationId,
            fcmTokenId: tokenData.id,
            userId: tokenData.userId,
            status: 'sent',
            deliveredAt: new Date(),
            createdAt: new Date(),
          });
        }
      } else {
        // Prepare Firebase message
        const firebasePayload: admin.messaging.MulticastMessage = {
          tokens: targetTokens.map(t => t.token),
          notification: {
            title: options.payload.title,
            body: options.payload.body,
            imageUrl: options.payload.imageUrl,
          },
          data: {
            type: options.notificationType,
            notificationId: notificationId,
            clickAction: options.payload.clickAction || '',
            ...options.payload.data,
          },
          webpush: {
            notification: {
              title: options.payload.title,
              body: options.payload.body,
              icon: options.payload.icon || '/favicon.ico',
              badge: options.payload.badge || '/favicon.ico',
              image: options.payload.imageUrl,
              tag: options.payload.tag || 'default',
              requireInteraction: true,
              actions: [
                {
                  action: 'view',
                  title: 'View',
                },
                {
                  action: 'dismiss',
                  title: 'Dismiss',
                }
              ],
            },
            fcmOptions: {
              link: options.payload.clickAction || '/',
            },
          },
        };

        // Send notification via Firebase
        try {
          const response = await admin.messaging().sendEachForMulticast(firebasePayload);
          
          // Process results
          for (let i = 0; i < response.responses.length; i++) {
            const result = response.responses[i];
            const tokenData = targetTokens[i];

            if (result.success) {
              successfulDeliveries++;
              
              // Record successful delivery
              await neonDbService.db.insert(schema.notificationDeliveries).values({
                id: createId(),
                notificationId,
                fcmTokenId: tokenData.id,
                userId: tokenData.userId,
                status: 'sent',
                deliveredAt: new Date(),
                createdAt: new Date(),
              });
            } else {
              failedDeliveries++;
              
              // Record failed delivery
              await neonDbService.db.insert(schema.notificationDeliveries).values({
                id: createId(),
                notificationId,
                fcmTokenId: tokenData.id,
                userId: tokenData.userId,
                status: 'failed',
                errorMessage: result.error?.message || 'Unknown error',
                createdAt: new Date(),
              });

              // Handle token errors (invalid, expired, etc.)
              if (result.error?.code === 'messaging/invalid-registration-token' ||
                  result.error?.code === 'messaging/registration-token-not-registered') {
                await this.unregisterToken(tokenData.token);
              }
            }
          }

          console.log(`📤 Notification sent: ${successfulDeliveries}/${targetTokens.length} successful`);
        } catch (error) {
          console.error('❌ Failed to send notification via Firebase:', error);
          failedDeliveries = targetTokens.length;
        }
      }

      // Update notification status
      await db
        .update(schema.pushNotifications)
        .set({
          status: failedDeliveries === targetTokens.length ? 'failed' : 'sent',
          successfulDeliveries,
          failedDeliveries,
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.pushNotifications.id, notificationId));

      return {
        success: successfulDeliveries > 0,
        notificationId,
        totalTargets: targetTokens.length,
        successfulDeliveries,
        failedDeliveries,
      };
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      return {
        success: false,
        totalTargets: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
      };
    }
  }

  /**
   * Send booking update notification
   */
  async sendBookingUpdateNotification(bookingId: string, userId: string, status: string, message: string): Promise<boolean> {
    const result = await this.sendNotification({
      target: { type: 'user', values: [userId] },
      payload: {
        title: 'Booking Update',
        body: message,
        icon: '/favicon.ico',
        data: {
          bookingId,
          status,
          url: `/booking/${bookingId}`,
        },
        clickAction: `/booking/${bookingId}`,
        tag: 'booking_update',
      },
      notificationType: 'booking_update',
    });

    return result.success;
  }

  /**
   * Send loyalty points update notification
   */
  async sendLoyaltyUpdateNotification(userId: string, points: number, transactionType: string, message: string): Promise<boolean> {
    const result = await this.sendNotification({
      target: { type: 'user', values: [userId] },
      payload: {
        title: 'Loyalty Points Update',
        body: message,
        icon: '/favicon.ico',
        data: {
          points: points.toString(),
          transactionType,
          url: '/dashboard?tab=loyalty',
        },
        clickAction: '/dashboard?tab=loyalty',
        tag: 'loyalty_update',
      },
      notificationType: 'loyalty_update',
    });

    return result.success;
  }

  /**
   * Send achievement unlocked notification
   */
  async sendAchievementNotification(userId: string, achievementId: string, achievementName: string, points: number): Promise<boolean> {
    const result = await this.sendNotification({
      target: { type: 'user', values: [userId] },
      payload: {
        title: '🏆 Achievement Unlocked!',
        body: `You've earned "${achievementName}" (+${points} points)`,
        icon: '/favicon.ico',
        data: {
          achievementId,
          achievementName,
          points: points.toString(),
          url: '/dashboard?tab=achievements',
        },
        clickAction: '/dashboard?tab=achievements',
        tag: 'achievement',
      },
      notificationType: 'achievement_unlocked',
    });

    return result.success;
  }

  /**
   * Send system notification to all users
   */
  async sendSystemNotification(title: string, message: string, clickAction?: string): Promise<boolean> {
    const result = await this.sendNotification({
      target: { type: 'all' },
      payload: {
        title,
        body: message,
        icon: '/favicon.ico',
        data: {
          url: clickAction || '/dashboard',
        },
        clickAction: clickAction || '/dashboard',
        tag: 'system',
      },
      notificationType: 'system_notification',
    });

    return result.success;
  }

  /**
   * Track notification interaction (click, dismiss)
   */
  async trackNotificationInteraction(notificationId: string, action: 'clicked' | 'dismissed'): Promise<boolean> {
    try {
      const updateData: any = { updatedAt: new Date() };
      
      if (action === 'clicked') {
        updateData.clickedAt = new Date();
        updateData.status = 'clicked';
      } else if (action === 'dismissed') {
        updateData.dismissedAt = new Date();
        updateData.status = 'dismissed';
      }

      await db
        .update(schema.notificationDeliveries)
        .set(updateData)
        .where(eq(schema.notificationDeliveries.notificationId, notificationId));

      return true;
    } catch (error) {
      console.error('❌ Failed to track notification interaction:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
