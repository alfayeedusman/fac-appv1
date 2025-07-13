import { Router, RequestHandler } from "express";
import mysql from "mysql2/promise";
import admin from "firebase-admin";

const router = Router();

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "fayeed_user",
  password: process.env.MYSQL_PASSWORD || "fayeed_pass_2024",
  database: process.env.MYSQL_DATABASE || "fayeed_auto_care",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create MySQL connection pool
const pool = mysql.createPool(mysqlConfig);

// Middleware to verify Firebase token
const verifyFirebaseToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No valid authorization header" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
};

// User Management Routes
router.post("/users/sync", verifyFirebaseToken, async (req, res) => {
  try {
    const {
      firebase_uid,
      email,
      full_name,
      phone_number,
      address,
      profile_image_url,
    } = req.body;

    const connection = await pool.getConnection();

    // Insert or update user
    const [result] = await connection.execute(
      `INSERT INTO users (id, email, full_name, phone_number, address, profile_image_url, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       phone_number = VALUES(phone_number),
       address = VALUES(address),
       profile_image_url = VALUES(profile_image_url),
       last_login_at = NOW()`,
      [
        firebase_uid,
        email,
        full_name,
        phone_number,
        address,
        profile_image_url,
      ],
    );

    // Create user profile if not exists
    await connection.execute(
      `INSERT IGNORE INTO user_profiles (user_id, referral_code)
       VALUES (?, ?)`,
      [firebase_uid, generateReferralCode()],
    );

    connection.release();
    res.status(200).json({ message: "User synced successfully" });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

router.get("/users/:userId/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `SELECT u.*, up.loyalty_points, up.total_bookings, up.total_spent, up.referral_code,
              um.membership_id, m.name as membership_name, m.type as membership_type,
              um.remaining_washes, um.remaining_credits
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_memberships um ON u.id = um.user_id AND um.is_active = true
       LEFT JOIN memberships m ON um.membership_id = m.id
       WHERE u.id = ?`,
      [userId],
    );

    connection.release();

    if (Array.isArray(rows) && rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});

// Vehicle Management Routes
router.get("/users/:userId/vehicles", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT * FROM vehicles WHERE user_id = ? AND is_active = true ORDER BY is_default DESC, created_at DESC",
      [userId],
    );

    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error getting vehicles:", error);
    res.status(500).json({ error: "Failed to get vehicles" });
  }
});

router.post(
  "/users/:userId/vehicles",
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { vehicle_type, car_model, plate_number, color, year, is_default } =
        req.body;

      const connection = await pool.getConnection();

      // If this is default, unset other defaults
      if (is_default) {
        await connection.execute(
          "UPDATE vehicles SET is_default = false WHERE user_id = ?",
          [userId],
        );
      }

      const [result] = await connection.execute(
        `INSERT INTO vehicles (user_id, vehicle_type, car_model, plate_number, color, year, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          vehicle_type,
          car_model,
          plate_number,
          color,
          year,
          is_default || false,
        ],
      );

      connection.release();
      res.status(201).json({ vehicle_id: (result as any).insertId });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      res.status(500).json({ error: "Failed to add vehicle" });
    }
  },
);

// Service Management Routes
router.get("/services", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT * FROM services WHERE is_active = true ORDER BY sort_order, category, base_price",
    );

    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({ error: "Failed to get services" });
  }
});

router.get("/services/:serviceId/price", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { vehicle_type } = req.query;

    const connection = await pool.getConnection();

    const [serviceRows] = await connection.execute(
      "SELECT base_price FROM services WHERE id = ?",
      [serviceId],
    );

    if (!Array.isArray(serviceRows) || serviceRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Service not found" });
    }

    const basePrice = (serviceRows[0] as any).base_price;

    // Check for vehicle-specific pricing
    const [pricingRows] = await connection.execute(
      "SELECT price_multiplier, fixed_price FROM service_pricing WHERE service_id = ? AND vehicle_type = ?",
      [serviceId, vehicle_type],
    );

    let finalPrice = basePrice;
    if (Array.isArray(pricingRows) && pricingRows.length > 0) {
      const pricing = pricingRows[0] as any;
      if (pricing.fixed_price) {
        finalPrice = pricing.fixed_price;
      } else {
        finalPrice = basePrice * pricing.price_multiplier;
      }
    }

    connection.release();
    res.json({ price: finalPrice });
  } catch (error) {
    console.error("Error getting service price:", error);
    res.status(500).json({ error: "Failed to get service price" });
  }
});

// Branch Management Routes
router.get("/branches", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      "SELECT * FROM branches WHERE is_active = true ORDER BY name",
    );

    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error getting branches:", error);
    res.status(500).json({ error: "Failed to get branches" });
  }
});

// Booking Management Routes
router.post("/bookings", verifyFirebaseToken, async (req, res) => {
  try {
    const {
      service_id,
      branch_id,
      vehicle_id,
      scheduled_date,
      vehicle_type,
      plate_number,
      special_instructions,
      payment_method,
      total_amount,
    } = req.body;

    const userId = req.user!.uid;
    const connection = await pool.getConnection();

    // Generate queue number for the day
    const scheduledDate = new Date(scheduled_date);
    const startOfDay = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const [queueRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM bookings WHERE branch_id = ? AND scheduled_date >= ? AND scheduled_date < ?",
      [branch_id, startOfDay, endOfDay],
    );

    const queueNumber = (queueRows as any)[0].count + 1;

    const [result] = await connection.execute(
      `INSERT INTO bookings (
        user_id, service_id, branch_id, vehicle_id, scheduled_date,
        vehicle_type, plate_number, special_instructions, payment_method,
        total_amount, queue_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        service_id,
        branch_id,
        vehicle_id,
        scheduled_date,
        vehicle_type,
        plate_number,
        special_instructions,
        payment_method,
        total_amount,
        queueNumber,
      ],
    );

    // Update user stats
    await connection.execute(
      "UPDATE user_profiles SET total_bookings = total_bookings + 1 WHERE user_id = ?",
      [userId],
    );

    connection.release();
    res.status(201).json({ booking_id: (result as any).insertId });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.get("/users/:userId/bookings", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `SELECT b.*, s.name as service_name, br.name as branch_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN branches br ON b.branch_id = br.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT ?`,
      [userId, parseInt(limit as string)],
    );

    connection.release();
    res.json(rows);
  } catch (error) {
    console.error("Error getting user bookings:", error);
    res.status(500).json({ error: "Failed to get user bookings" });
  }
});

// QR Code Routes
router.post("/qr/checkin", verifyFirebaseToken, async (req, res) => {
  try {
    const { user_id, branch_id, qr_code_data, timestamp } = req.body;

    const connection = await pool.getConnection();

    // Insert check-in record
    await connection.execute(
      "INSERT INTO qr_checkins (user_id, branch_id, qr_code_data, check_in_time) VALUES (?, ?, ?, ?)",
      [user_id, branch_id, qr_code_data, new Date(timestamp)],
    );

    // Log the scan
    await connection.execute(
      `INSERT INTO qr_scan_logs (user_id, scan_type, qr_data, branch_id, scan_result)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, "branch_checkin", qr_code_data, branch_id, "success"],
    );

    connection.release();
    res.json({ success: true });
  } catch (error) {
    console.error("Error checking in:", error);
    res.status(500).json({ error: "Failed to check in" });
  }
});

// Helper function to generate referral code
function generateReferralCode(): string {
  return "FAC" + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export default router;
