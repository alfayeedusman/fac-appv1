import express from "express";
import { supabaseDbService } from "../services/supabaseDatabaseService";
import { pushNotificationService } from "../services/pushNotificationService";
import * as schema from "../database/schema";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const router = express.Router();

// Middleware to parse JSON
router.use(express.json());

/**
 * Register FCM token
 * POST /api/notifications/register-token
 */
router.post("/register-token", async (req, res) => {
  try {
    const { token, userId, userAgent, timestamp } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "FCM token is required",
      });
    }

    // Extract device info from user agent
    const deviceType = "web"; // Could be enhanced to detect mobile browsers
    const deviceName =
      req.headers["user-agent"]?.substring(0, 100) || "Unknown Device";

    const success = await pushNotificationService.registerToken({
      token,
      userId,
      deviceType,
      browserInfo: userAgent || req.headers["user-agent"],
      deviceName,
      notificationTypes: [
        "booking_updates",
        "loyalty_updates",
        "system",
        "achievements",
      ],
    });

    if (success) {
      res.json({
        success: true,
        message: "FCM token registered successfully",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to register FCM token",
      });
    }
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Unregister FCM token
 * POST /api/notifications/unregister-token
 */
router.post("/unregister-token", async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "FCM token is required",
      });
    }

    const success = await pushNotificationService.unregisterToken(
      token,
      userId,
    );

    if (success) {
      res.json({
        success: true,
        message: "FCM token unregistered successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to unregister FCM token",
      });
    }
  } catch (error) {
    console.error("Error unregistering FCM token:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Send custom notification (Admin only)
 * POST /api/notifications/send
 */
router.post("/send", async (req, res) => {
  try {
    const {
      title,
      body,
      imageUrl,
      targetType,
      targetValues,
      notificationType,
      data,
      clickAction,
      scheduledFor,
      campaign,
    } = req.body;

    // Basic validation
    if (!title || !body || !targetType || !notificationType) {
      return res.status(400).json({
        success: false,
        error: "Title, body, targetType, and notificationType are required",
      });
    }

    // Send notification
    const result = await pushNotificationService.sendNotification({
      target: {
        type: targetType,
        values: targetValues,
      },
      payload: {
        title,
        body,
        imageUrl,
        data,
        clickAction,
        icon: "/favicon.ico",
        tag: notificationType,
      },
      notificationType,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      campaign,
      createdBy: req.body.adminUserId, // Should come from auth middleware
    });

    res.json({
      success: result.success,
      notificationId: result.notificationId,
      stats: {
        totalTargets: result.totalTargets,
        successfulDeliveries: result.successfulDeliveries,
        failedDeliveries: result.failedDeliveries,
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Send booking update notification
 * POST /api/notifications/booking-update
 */
router.post("/booking-update", async (req, res) => {
  try {
    const { bookingId, userId, status, message } = req.body;

    if (!bookingId || !userId || !status || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const success = await pushNotificationService.sendBookingUpdateNotification(
      bookingId,
      userId,
      status,
      message,
    );

    res.json({
      success,
      message: success
        ? "Booking notification sent"
        : "Failed to send booking notification",
    });
  } catch (error) {
    console.error("Error sending booking notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Send loyalty points notification
 * POST /api/notifications/loyalty-update
 */
router.post("/loyalty-update", async (req, res) => {
  try {
    const { userId, points, transactionType, message } = req.body;

    if (!userId || points === undefined || !transactionType || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const success = await pushNotificationService.sendLoyaltyUpdateNotification(
      userId,
      points,
      transactionType,
      message,
    );

    res.json({
      success,
      message: success
        ? "Loyalty notification sent"
        : "Failed to send loyalty notification",
    });
  } catch (error) {
    console.error("Error sending loyalty notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Send achievement notification
 * POST /api/notifications/achievement
 */
router.post("/achievement", async (req, res) => {
  try {
    const { userId, achievementId, achievementName, points } = req.body;

    if (!userId || !achievementId || !achievementName || points === undefined) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const success = await pushNotificationService.sendAchievementNotification(
      userId,
      achievementId,
      achievementName,
      points,
    );

    res.json({
      success,
      message: success
        ? "Achievement notification sent"
        : "Failed to send achievement notification",
    });
  } catch (error) {
    console.error("Error sending achievement notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Send system notification to all users
 * POST /api/notifications/system
 */
router.post("/system", async (req, res) => {
  try {
    const { title, message, clickAction } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
      });
    }

    const success = await pushNotificationService.sendSystemNotification(
      title,
      message,
      clickAction,
    );

    res.json({
      success,
      message: success
        ? "System notification sent"
        : "Failed to send system notification",
    });
  } catch (error) {
    console.error("Error sending system notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Track notification interaction
 * POST /api/notifications/track
 */
router.post("/track/:action", async (req, res) => {
  try {
    const { action } = req.params;
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: "Notification ID is required",
      });
    }

    if (!["clicked", "dismissed"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "clicked" or "dismissed"',
      });
    }

    const success = await pushNotificationService.trackNotificationInteraction(
      notificationId,
      action as "clicked" | "dismissed",
    );

    res.json({
      success,
      message: success ? "Interaction tracked" : "Failed to track interaction",
    });
  } catch (error) {
    console.error("Error tracking notification interaction:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Get notification history (Admin only)
 * GET /api/notifications/history
 */
router.get("/history", async (req, res) => {
  try {
    // Check if database is available
    if (!supabaseDbService.db) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      });
    }

    const {
      page = "1",
      limit = "20",
      type,
      status,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build query conditions
    const conditions = [];

    if (type) {
      conditions.push(
        eq(schema.pushNotifications.notificationType, type as string),
      );
    }

    if (status) {
      conditions.push(eq(schema.pushNotifications.status, status as string));
    }

    if (startDate) {
      conditions.push(
        gte(schema.pushNotifications.createdAt, new Date(startDate as string)),
      );
    }

    if (endDate) {
      conditions.push(
        lte(schema.pushNotifications.createdAt, new Date(endDate as string)),
      );
    }

    // Get notifications
    const notifications = await supabaseDbService.db
      .select()
      .from(schema.pushNotifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.pushNotifications.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const totalResult = await supabaseDbService.db
      .select({ count: count() })
      .from(schema.pushNotifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error getting notification history:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Get notification statistics (Admin only)
 * GET /api/notifications/stats
 */
router.get("/stats", async (req, res) => {
  try {
    // Check if database is available
    if (!supabaseDbService.db) {
      return res.json({
        success: true,
        data: {
          activeTokens: 0,
          recentNotifications: [],
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          },
        },
      });
    }

    const { days = "7" } = req.query;
    const dayCount = parseInt(days as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayCount);

    // Get notification stats
    const stats = await supabaseDbService.db
      .select({
        count: count(),
        type: schema.pushNotifications.notificationType,
        status: schema.pushNotifications.status,
      })
      .from(schema.pushNotifications)
      .where(gte(schema.pushNotifications.createdAt, startDate))
      .groupBy(
        schema.pushNotifications.notificationType,
        schema.pushNotifications.status,
      );

    // Get registered tokens count
    const activeTokensResult = await supabaseDbService.db
      .select({ count: count() })
      .from(schema.fcmTokens)
      .where(eq(schema.fcmTokens.isActive, true));

    const activeTokens = activeTokensResult[0]?.count || 0;

    res.json({
      success: true,
      data: {
        activeTokens,
        recentNotifications: stats,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error getting notification stats:", error);
    // Return empty stats if tables don't exist yet
    res.json({
      success: true,
      data: {
        activeTokens: 0,
        recentNotifications: [],
        dateRange: {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
      },
    });
  }
});

/**
 * Get user's notification preferences
 * GET /api/notifications/preferences/:userId
 */
router.get("/preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userTokens = await supabaseDbService.db
      .select({
        notificationTypes: schema.fcmTokens.notificationTypes,
        deviceType: schema.fcmTokens.deviceType,
        isActive: schema.fcmTokens.isActive,
      })
      .from(schema.fcmTokens)
      .where(
        and(
          eq(schema.fcmTokens.userId, userId),
          eq(schema.fcmTokens.isActive, true),
        ),
      );

    res.json({
      success: true,
      data: {
        tokens: userTokens,
        hasActiveTokens: userTokens.length > 0,
      },
    });
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Update user's notification preferences
 * PUT /api/notifications/preferences/:userId
 */
router.put("/preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { notificationTypes } = req.body;

    if (!Array.isArray(notificationTypes)) {
      return res.status(400).json({
        success: false,
        error: "notificationTypes must be an array",
      });
    }

    // Update all user's tokens
    await supabaseDbService.db
      .update(schema.fcmTokens)
      .set({
        notificationTypes,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.fcmTokens.userId, userId),
          eq(schema.fcmTokens.isActive, true),
        ),
      );

    res.json({
      success: true,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * Test push notification (Development only)
 * POST /api/notifications/test
 */
router.post("/test", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: "Test endpoint not available in production",
      });
    }

    const {
      userId,
      title = "Test Notification",
      message = "This is a test push notification",
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required for test notification",
      });
    }

    const result = await pushNotificationService.sendNotification({
      target: { type: "user", values: [userId] },
      payload: {
        title,
        body: message,
        icon: "/favicon.ico",
        data: {
          test: "true",
          url: "/dashboard",
        },
        clickAction: "/dashboard",
        tag: "test",
      },
      notificationType: "test",
    });

    res.json({
      success: result.success,
      message: result.success
        ? "Test notification sent"
        : "Failed to send test notification",
      stats: {
        totalTargets: result.totalTargets,
        successfulDeliveries: result.successfulDeliveries,
        failedDeliveries: result.failedDeliveries,
      },
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
