import express from "express";
import mysql from "mysql2/promise";
import { z } from "zod";
import { supabaseDbService } from "../services/supabaseDatabaseService";

const router = express.Router();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fayeed_auto_care",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  reconnect: true,
};

let pool: mysql.Pool;

try {
  pool = mysql.createPool(dbConfig);
} catch (error) {
  console.error("Database connection failed:", error);
}

// Validation schemas
const LocationUpdateSchema = z.object({
  crew_id: z.number().int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  altitude: z.number().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  address: z.string().optional(),
  battery_level: z.number().int().min(0).max(100).optional(),
  signal_strength: z.number().int().min(0).max(100).optional(),
  timestamp: z.string().datetime().optional(),
});

const StatusUpdateSchema = z.object({
  crew_id: z.number().int().positive(),
  status: z.enum([
    "online",
    "offline",
    "busy",
    "available",
    "break",
    "emergency",
  ]),
  reason: z.string().optional(),
  location_id: z.number().int().positive().optional(),
});

const JobUpdateSchema = z.object({
  job_id: z.number().int().positive(),
  status: z.enum([
    "pending",
    "assigned",
    "en_route",
    "in_progress",
    "completed",
    "cancelled",
    "on_hold",
  ]),
  progress_percentage: z.number().min(0).max(100).optional(),
  stage: z
    .enum([
      "preparation",
      "pre_wash",
      "washing",
      "rinsing",
      "drying",
      "interior",
      "detailing",
      "inspection",
      "completed",
    ])
    .optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// ============================================================================
// CREW LOCATION ENDPOINTS
// ============================================================================

// Update crew location
router.post("/crew/location", async (req, res) => {
  try {
    const validatedData = LocationUpdateSchema.parse(req.body);

    const connection = await pool.getConnection();

    try {
      // Insert new location record
      const [result] = await connection.execute(
        `INSERT INTO crew_locations 
         (crew_id, latitude, longitude, accuracy, altitude, heading, speed, address, battery_level, signal_strength, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validatedData.crew_id,
          validatedData.latitude,
          validatedData.longitude,
          validatedData.accuracy || null,
          validatedData.altitude || null,
          validatedData.heading || null,
          validatedData.speed || null,
          validatedData.address || null,
          validatedData.battery_level || null,
          validatedData.signal_strength || null,
          validatedData.timestamp || new Date().toISOString(),
        ],
      );

      // Auto-update crew status to online if they were offline
      await connection.execute(
        `INSERT INTO crew_status (crew_id, status, auto_generated, location_id)
         SELECT ?, 'online', TRUE, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM crew_status 
           WHERE crew_id = ? AND ended_at IS NULL
         )`,
        [
          validatedData.crew_id,
          (result as any).insertId,
          validatedData.crew_id,
        ],
      );

      res.json({
        success: true,
        location_id: (result as any).insertId,
        message: "Location updated successfully",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Location update error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid data",
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update location",
      });
    }
  }
});

// Get crew locations (real-time)
router.get("/crew/locations", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get latest location for each active crew member
      const [rows] = await connection.execute(`
        SELECT 
          cm.id as crew_id,
          cm.name,
          cm.phone,
          cm.crew_group_id,
          cg.name as group_name,
          cg.color_code as group_color,
          cs.status,
          cs.started_at as status_since,
          cl.latitude,
          cl.longitude,
          cl.accuracy,
          cl.heading,
          cl.speed,
          cl.address,
          cl.battery_level,
          cl.signal_strength,
          cl.timestamp as last_update,
          j.id as current_job_id,
          j.job_number,
          j.status as job_status,
          j.service_address as job_address,
          st.name as service_name,
          st.category as service_category,
          jp.progress_percentage as job_progress
        FROM crew_members cm
        LEFT JOIN crew_groups cg ON cm.crew_group_id = cg.id
        LEFT JOIN crew_status cs ON cm.id = cs.crew_id AND cs.ended_at IS NULL
        LEFT JOIN crew_locations cl ON cm.id = cl.crew_id 
          AND cl.timestamp = (
            SELECT MAX(timestamp) 
            FROM crew_locations cl2 
            WHERE cl2.crew_id = cm.id
            AND cl2.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
          )
        LEFT JOIN jobs j ON cm.id = j.assigned_crew_id 
          AND j.status IN ('assigned', 'en_route', 'in_progress')
        LEFT JOIN service_types st ON j.service_type_id = st.id
        LEFT JOIN (
          SELECT job_id, AVG(progress_percentage) as progress_percentage
          FROM job_progress 
          WHERE status = 'completed'
          GROUP BY job_id
        ) jp ON j.id = jp.job_id
        WHERE cm.status = 'active'
        ORDER BY cm.name
      `);

      res.json({
        success: true,
        crews: rows,
        timestamp: new Date().toISOString(),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get crew locations",
    });
  }
});

// ============================================================================
// CREW STATUS ENDPOINTS
// ============================================================================

// Update crew status
router.post("/crew/status", async (req, res) => {
  try {
    const validatedData = StatusUpdateSchema.parse(req.body);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Close any existing active status
      await connection.execute(
        "UPDATE crew_status SET ended_at = NOW() WHERE crew_id = ? AND ended_at IS NULL",
        [validatedData.crew_id],
      );

      // Insert new status
      const [result] = await connection.execute(
        `INSERT INTO crew_status (crew_id, status, reason, location_id)
         VALUES (?, ?, ?, ?)`,
        [
          validatedData.crew_id,
          validatedData.status,
          validatedData.reason || null,
          validatedData.location_id || null,
        ],
      );

      await connection.commit();

      res.json({
        success: true,
        status_id: (result as any).insertId,
        message: "Status updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Status update error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid data",
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update status",
      });
    }
  }
});

// Get crew status history
router.get("/crew/:crewId/status-history", async (req, res) => {
  try {
    const crewId = parseInt(req.params.crewId);
    const limit = parseInt(req.query.limit as string) || 50;

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        `
        SELECT 
          cs.*,
          TIMESTAMPDIFF(MINUTE, cs.started_at, COALESCE(cs.ended_at, NOW())) as duration_minutes
        FROM crew_status cs
        WHERE cs.crew_id = ?
        ORDER BY cs.started_at DESC
        LIMIT ?
      `,
        [crewId, limit],
      );

      res.json({
        success: true,
        history: rows,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get status history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get status history",
    });
  }
});

// ============================================================================
// JOB MANAGEMENT ENDPOINTS
// ============================================================================

// Update job status and progress
router.post("/jobs/update", async (req, res) => {
  try {
    const validatedData = JobUpdateSchema.parse(req.body);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update job status
      const updateFields = ["status = ?"];
      const updateValues = [validatedData.status];

      if (
        validatedData.status === "in_progress" &&
        !validatedData.progress_percentage
      ) {
        updateFields.push("actual_start = NOW()");
      } else if (validatedData.status === "completed") {
        updateFields.push("actual_end = NOW()");
      }

      await connection.execute(
        `UPDATE jobs SET ${updateFields.join(", ")} WHERE id = ?`,
        [...updateValues, validatedData.job_id],
      );

      // Update job progress if provided
      if (
        validatedData.stage ||
        validatedData.progress_percentage !== undefined
      ) {
        const progressData: any = {
          job_id: validatedData.job_id,
          progress_percentage: validatedData.progress_percentage || 0,
          notes: validatedData.notes || null,
        };

        if (validatedData.stage) {
          progressData.stage = validatedData.stage;

          // Mark stage as in progress or completed
          const stageStatus =
            validatedData.progress_percentage === 100
              ? "completed"
              : "in_progress";

          await connection.execute(
            `INSERT INTO job_progress (job_id, stage, status, started_at, completed_at, progress_percentage, notes, photos)
             VALUES (?, ?, ?, 
               CASE WHEN ? = 'in_progress' THEN NOW() ELSE NULL END,
               CASE WHEN ? = 'completed' THEN NOW() ELSE NULL END,
               ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               status = VALUES(status),
               completed_at = VALUES(completed_at),
               progress_percentage = VALUES(progress_percentage),
               notes = VALUES(notes),
               photos = VALUES(photos)`,
            [
              validatedData.job_id,
              validatedData.stage,
              stageStatus,
              stageStatus,
              stageStatus,
              validatedData.progress_percentage || 0,
              validatedData.notes || null,
              JSON.stringify(validatedData.photos || []),
            ],
          );
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: "Job updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Job update error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid data",
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to update job",
      });
    }
  }
});

// Get active jobs with locations
router.get("/jobs/active", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT 
          j.id,
          j.job_number,
          j.status,
          j.customer_id,
          j.service_address,
          j.service_latitude,
          j.service_longitude,
          j.scheduled_start,
          j.actual_start,
          j.estimated_duration,
          j.total_amount,
          j.special_instructions,
          cm.id as crew_id,
          cm.name as crew_name,
          cm.phone as crew_phone,
          cl.latitude as crew_latitude,
          cl.longitude as crew_longitude,
          cl.timestamp as crew_last_update,
          st.name as service_name,
          st.category as service_category,
          st.wash_type,
          st.estimated_duration as service_duration,
          cg.name as group_name,
          cg.color_code as group_color,
          AVG(jp.progress_percentage) as overall_progress
        FROM jobs j
        LEFT JOIN crew_members cm ON j.assigned_crew_id = cm.id
        LEFT JOIN crew_groups cg ON cm.crew_group_id = cg.id
        LEFT JOIN crew_locations cl ON cm.id = cl.crew_id 
          AND cl.timestamp = (
            SELECT MAX(timestamp) 
            FROM crew_locations cl2 
            WHERE cl2.crew_id = cm.id
            AND cl2.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
          )
        LEFT JOIN service_types st ON j.service_type_id = st.id
        LEFT JOIN job_progress jp ON j.id = jp.job_id AND jp.status = 'completed'
        WHERE j.status IN ('pending', 'assigned', 'en_route', 'in_progress')
        GROUP BY j.id
        ORDER BY 
          CASE j.status 
            WHEN 'in_progress' THEN 1
            WHEN 'en_route' THEN 2  
            WHEN 'assigned' THEN 3
            WHEN 'pending' THEN 4
          END,
          j.scheduled_start ASC
      `);

      res.json({
        success: true,
        jobs: rows,
        timestamp: new Date().toISOString(),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get active jobs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get active jobs",
    });
  }
});

// ============================================================================
// REAL-TIME DASHBOARD DATA
// ============================================================================

// Get dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get current statistics
      const [crewStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_crew,
          SUM(CASE WHEN cs.status = 'online' THEN 1 ELSE 0 END) as online_crew,
          SUM(CASE WHEN cs.status = 'busy' THEN 1 ELSE 0 END) as busy_crew,
          SUM(CASE WHEN cs.status = 'available' THEN 1 ELSE 0 END) as available_crew,
          SUM(CASE WHEN cs.status = 'break' THEN 1 ELSE 0 END) as break_crew,
          SUM(CASE WHEN cs.status = 'offline' OR cs.status IS NULL THEN 1 ELSE 0 END) as offline_crew
        FROM crew_members cm
        LEFT JOIN crew_status cs ON cm.id = cs.crew_id AND cs.ended_at IS NULL
        WHERE cm.status = 'active'
      `);

      const [jobStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_active_jobs,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_jobs,
          SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned_jobs,
          SUM(CASE WHEN status = 'en_route' THEN 1 ELSE 0 END) as en_route_jobs,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_jobs,
          SUM(CASE WHEN status = 'completed' AND DATE(actual_end) = CURDATE() THEN 1 ELSE 0 END) as completed_today
        FROM jobs
        WHERE status IN ('pending', 'assigned', 'en_route', 'in_progress', 'completed')
        AND (status != 'completed' OR DATE(actual_end) = CURDATE())
      `);

      const [revenueStats] = await connection.execute(`
        SELECT 
          SUM(CASE WHEN DATE(actual_end) = CURDATE() THEN total_amount ELSE 0 END) as today_revenue,
          SUM(CASE WHEN WEEK(actual_end) = WEEK(NOW()) AND YEAR(actual_end) = YEAR(NOW()) THEN total_amount ELSE 0 END) as week_revenue,
          SUM(CASE WHEN MONTH(actual_end) = MONTH(NOW()) AND YEAR(actual_end) = YEAR(NOW()) THEN total_amount ELSE 0 END) as month_revenue
        FROM jobs
        WHERE status = 'completed' AND actual_end IS NOT NULL
      `);

      res.json({
        success: true,
        stats: {
          crew: crewStats[0],
          jobs: jobStats[0],
          revenue: revenueStats[0],
        },
        timestamp: new Date().toISOString(),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dashboard statistics",
    });
  }
});

// ============================================================================
// WEBSOCKET NOTIFICATIONS (Basic HTTP endpoint for now)
// ============================================================================

import { triggerPusherEvent } from "../services/pusherService";

// Send real-time message
router.post("/messages/send", async (req, res) => {
  try {
    const {
      job_id,
      sender_type,
      sender_id,
      recipient_type,
      recipient_id,
      message_type,
      content,
      metadata,
      priority,
    } = req.body;

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO realtime_messages
         (job_id, sender_type, sender_id, recipient_type, recipient_id, message_type, content, metadata, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job_id || null,
          sender_type,
          sender_id,
          recipient_type,
          recipient_id || null,
          message_type,
          content,
          JSON.stringify(metadata || {}),
          priority || "normal",
        ],
      );

      const messageId = (result as any).insertId;

      res.json({
        success: true,
        message_id: messageId,
        message: "Message sent successfully",
      });

      // Fire-and-forget Pusher event
      (async () => {
        try {
          const payload = {
            id: messageId,
            job_id: job_id || null,
            sender_type,
            sender_id,
            recipient_type,
            recipient_id: recipient_id || null,
            message_type,
            content,
            metadata: metadata || {},
            priority: priority || "normal",
            created_at: new Date().toISOString(),
          };

          // Trigger user-specific channel if recipient_id provided
          if (recipient_id) {
            const userChannel = `user-${recipient_type}-${recipient_id}`;
            const privateUserChannel = `private-user-${recipient_type}-${recipient_id}`;
            await Promise.all([
              triggerPusherEvent(userChannel, "new-message", payload),
              triggerPusherEvent(privateUserChannel, "new-message", payload),
            ]);
          }

          // Also broadcast to a public realtime channel for admin dashboards
          await Promise.all([
            triggerPusherEvent("public-realtime", "new-message", payload),
            triggerPusherEvent(
              "private-public-realtime",
              "new-message",
              payload,
            ),
          ]);
        } catch (err) {
          console.warn("⚠️ Failed to trigger Pusher event:", err);
        }
      })();
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

// Get recent messages
router.get("/messages/:recipientType/:recipientId", async (req, res) => {
  try {
    const { recipientType, recipientId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        `
        SELECT *
        FROM realtime_messages
        WHERE recipient_type = ? AND (recipient_id = ? OR recipient_id IS NULL)
        ORDER BY created_at DESC
        LIMIT ?
      `,
        [recipientType, recipientId, limit],
      );

      res.json({
        success: true,
        messages: rows,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get messages",
    });
  }
});

// ============================================================================
// AUTH: Pusher private channel auth endpoint
// ============================================================================

router.post("/pusher/auth", async (req, res) => {
  try {
    const { socket_id, channel_name } = req.body;
    if (!socket_id || !channel_name) {
      return res
        .status(400)
        .json({ success: false, error: "socket_id and channel_name required" });
    }

    const PUSHER_KEY = process.env.PUSHER_KEY;
    const PUSHER_SECRET = process.env.PUSHER_SECRET;

    if (!PUSHER_KEY || !PUSHER_SECRET) {
      return res
        .status(500)
        .json({ success: false, error: "Pusher not configured" });
    }

    // Server-side authentication: prefer Authorization Bearer <token> header
    // The token is validated against user_sessions table via supabaseDbService
    let authenticatedUserId: string | null = null;
    let authenticatedUserRole: string | null = null;

    const authHeader = (req.headers["authorization"] ||
      req.headers["Authorization"]) as string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const session = await supabaseDbService.getSessionByToken(token);
        if (!session || !session.isActive) {
          return res.status(403).json({
            success: false,
            error: "Invalid or inactive session token",
          });
        }
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
          return res
            .status(403)
            .json({ success: false, error: "Session token expired" });
        }

        const user = await supabaseDbService.getUserById(session.userId);
        if (!user) {
          return res
            .status(403)
            .json({ success: false, error: "User not found for session" });
        }

        authenticatedUserId = user.id;
        authenticatedUserRole = user.role;
      } catch (sessionErr) {
        console.warn("⚠️ Session validation error on pusher auth:", sessionErr);
        return res
          .status(500)
          .json({ success: false, error: "Session validation failed" });
      }
    } else {
      // Fallback to header-based checks (deprecated) for backward compatibility
      const userIdHeader = req.headers["x-user-id"] as string | undefined;
      const userRoleHeader = req.headers["x-user-role"] as string | undefined;
      if (userIdHeader) authenticatedUserId = userIdHeader;
      if (userRoleHeader) authenticatedUserRole = userRoleHeader as string;
    }

    // Basic access control for private channels
    if (channel_name.startsWith("private-user-customer-")) {
      const parts = channel_name.split("private-user-customer-");
      const channelUserId = parts[1];
      if (!authenticatedUserId || authenticatedUserId !== channelUserId) {
        return res
          .status(403)
          .json({ success: false, error: "Unauthorized for this channel" });
      }
    }

    if (channel_name.startsWith("private-admin")) {
      if (
        !authenticatedUserRole ||
        !["admin", "superadmin", "manager", "dispatcher"].includes(
          authenticatedUserRole,
        )
      ) {
        return res
          .status(403)
          .json({ success: false, error: "Unauthorized for admin channel" });
      }
    }

    // Create signature
    const crypto = await import("crypto");
    const stringToSign = `${socket_id}:${channel_name}`;
    const signature = crypto
      .createHmac("sha256", PUSHER_SECRET)
      .update(stringToSign)
      .digest("hex");
    const auth = `${PUSHER_KEY}:${signature}`;

    return res.json({ auth });
  } catch (error: any) {
    console.error("Pusher auth error:", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "Internal error" });
  }
});

// ============================================================================
// HEALTH CHECK AND SYSTEM STATUS
// ============================================================================

router.get("/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      await connection.execute("SELECT 1");

      res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    });
  }
});

export default router;
