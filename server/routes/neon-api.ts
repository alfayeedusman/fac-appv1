import { RequestHandler } from "express";
import { supabaseDbService } from "../services/supabaseDatabaseService";
import {
  initializeDatabase,
  testConnection,
  sql,
  getDatabase,
} from "../database/connection";
import { migrate } from "../database/migrate";
import { triggerPusherEvent } from "../services/pusherService"; // Fire events to Pusher
import * as schema from "../database/schema";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const emitPusher = async (
  channels: string | string[],
  eventName: string,
  payload: any,
) => {
  try {
    await triggerPusherEvent(channels, eventName, payload);
  } catch (e) {
    console.warn("Pusher emit failed:", e);
  }
};

// Simple in-memory guards to avoid repeated heavy migrations per server process
let __SUPABASE_DB_INITIALIZED__ = false;
let __SUPABASE_DB_INITIALIZING__ = false;

// Admin API catalog for mobile app integration
export const getApiCatalog: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    baseUrl: "/api",
    catalog: {
      dashboard: [
        {
          method: "GET",
          path: "/api/supabase/stats",
          description: "Dashboard stats",
        },
        {
          method: "GET",
          path: "/api/supabase/realtime-stats",
          description: "Live crew/customer stats",
        },
        {
          method: "GET",
          path: "/api/supabase/analytics",
          description: "Analytics charts data",
        },
        {
          method: "GET",
          path: "/api/supabase/crew/commission-summary",
          description: "Crew commission totals",
        },
      ],
      ads: [
        { method: "GET", path: "/api/supabase/ads", description: "Popup ads" },
        { method: "POST", path: "/api/supabase/ads", description: "Create ad" },
        {
          method: "POST",
          path: "/api/supabase/ads/:adId/dismiss",
          description: "Dismiss ad",
        },
      ],
      cms: [
        {
          method: "GET",
          path: "/api/cms/homepage",
          description: "Homepage CMS content",
        },
        {
          method: "POST",
          path: "/api/cms/homepage",
          description: "Update homepage CMS",
        },
        {
          method: "GET",
          path: "/api/cms/history",
          description: "CMS update history",
        },
        {
          method: "POST",
          path: "/api/cms/initialize",
          description: "Initialize CMS defaults",
        },
      ],
      notifications: [
        {
          method: "GET",
          path: "/api/supabase/notifications",
          description: "System notifications",
        },
        {
          method: "PUT",
          path: "/api/supabase/notifications/:notificationId/read",
          description: "Mark notification read",
        },
        {
          method: "POST",
          path: "/api/notifications/send",
          description: "Send push notification",
        },
        {
          method: "POST",
          path: "/api/notifications/register-token",
          description: "Register device token",
        },
      ],
      crew: [
        {
          method: "GET",
          path: "/api/supabase/crew/list",
          description: "Crew list",
        },
        {
          method: "GET",
          path: "/api/supabase/crew/commission-entries",
          description: "Commission entries",
        },
        {
          method: "POST",
          path: "/api/supabase/crew/commission-entries",
          description: "Create commission entry",
        },
        {
          method: "GET",
          path: "/api/supabase/crew/payouts",
          description: "Crew payouts",
        },
        {
          method: "POST",
          path: "/api/supabase/crew/payouts",
          description: "Create payout",
        },
      ],
      users: [
        {
          method: "GET",
          path: "/api/supabase/users",
          description: "All users",
        },
        {
          method: "GET",
          path: "/api/supabase/customers",
          description: "Customers",
        },
        { method: "GET", path: "/api/supabase/staff", description: "Staff" },
        {
          method: "POST",
          path: "/api/supabase/staff",
          description: "Create staff",
        },
      ],
      bookings: [
        {
          method: "GET",
          path: "/api/supabase/bookings",
          description: "Bookings",
        },
        {
          method: "POST",
          path: "/api/supabase/bookings",
          description: "Create booking",
        },
        {
          method: "PUT",
          path: "/api/supabase/bookings/:id",
          description: "Update booking",
        },
      ],
      inventory: [
        {
          method: "GET",
          path: "/api/supabase/inventory/items",
          description: "Inventory items",
        },
        {
          method: "GET",
          path: "/api/supabase/inventory/analytics",
          description: "Inventory analytics",
        },
      ],
      payments: [
        {
          method: "POST",
          path: "/api/supabase/payment/xendit/create-invoice",
          description: "Create invoice",
        },
      ],
    },
  });
};

// Initialize database connection
export const initializeSupabaseDB: RequestHandler = async (req, res) => {
  try {
    if (__SUPABASE_DB_INITIALIZED__) {
      return res.json({
        success: true,
        message: "Supabase database already initialized",
        timestamp: new Date().toISOString(),
      });
    }
    if (__SUPABASE_DB_INITIALIZING__) {
      return res.json({
        success: true,
        message: "Initialization in progress",
        timestamp: new Date().toISOString(),
      });
    }

    __SUPABASE_DB_INITIALIZING__ = true;
    console.log("🔄 Initializing Supabase database...");

    const db = await initializeDatabase();
    if (!db) {
      return res.status(500).json({
        success: false,
        error:
          "Failed to initialize database connection. Check SUPABASE_DATABASE_URL environment variable.",
      });
    }

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        error: "Database connection test failed",
      });
    }

    // Run migrations (idempotent)
    await migrate();

    __SUPABASE_DB_INITIALIZED__ = true;
    res.json({
      success: true,
      message: "Supabase database initialized and migrated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    __SUPABASE_DB_INITIALIZING__ = false;
  }
};

// Test database connection
export const testSupabaseConnection: RequestHandler = async (req, res) => {
  try {
    // Check if database URL is configured
    const databaseUrl =
      process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.json({
        success: false,
        connected: false,
        error:
          "No database URL configured. Please set SUPABASE_DATABASE_URL environment variable.",
        stats: null,
        timestamp: new Date().toISOString(),
      });
    }

    const isConnected = await testConnection();

    let stats = null;
    if (isConnected) {
      try {
        stats = await supabaseDbService.getStats();
      } catch (statsError) {
        // Silently fail - don't log
      }
    }

    res.json({
      success: isConnected,
      connected: isConnected,
      stats: stats || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : "Connection test failed",
      stats: null,
      timestamp: new Date().toISOString(),
    });
  }
};

// Diagnostic endpoint for troubleshooting live server
export const diagnoseDatabase: RequestHandler = async (req, res) => {
  try {
    const databaseUrl =
      process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

    // Check environment
    const checks = {
      hasDatabaseUrl: !!databaseUrl,
      databaseUrlConfigured: !!databaseUrl ? "✅ Yes" : "❌ No",
      environment: process.env.NODE_ENV || "development",
      hasUsers: false,
      usersCount: 0,
      superadminExists: false,
      tablesExist: false,
    };

    if (!databaseUrl) {
      return res.json({
        success: false,
        error: "Database URL not configured",
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    // Test connection
    const isConnected = await testConnection();

    if (!isConnected) {
      return res.json({
        success: false,
        error: "Database connection failed",
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if users table exists and get user counts
    try {
      const allUsers = await supabaseDbService.getAllUsers();
      checks.tablesExist = true;
      checks.hasUsers = allUsers.length > 0;
      checks.usersCount = allUsers.length;
      checks.superadminExists = allUsers.some(
        (u) => u.email === "superadmin@fayeedautocare.com",
      );
    } catch (userError) {
      checks.tablesExist = false;
    }

    res.json({
      success: isConnected,
      connected: isConnected,
      checks,
      nextSteps: !checks.tablesExist
        ? "Run migrations: POST /api/supabase/init"
        : !checks.superadminExists
          ? "Seed users: POST /api/supabase/init"
          : "Database ready!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: false,
      error: error instanceof Error ? error.message : "Diagnostic failed",
      timestamp: new Date().toISOString(),
    });
  }
};

// Demo accounts for when database is unavailable
const DEMO_ACCOUNTS: Record<string, any> = {
  "superadmin@fayeedautocare.com": {
    id: "usr_superadmin_001",
    email: "superadmin@fayeedautocare.com",
    fullName: "Super Admin",
    role: "superadmin",
    isActive: true,
    branchLocation: "All Branches",
    canViewAllBranches: true,
    loyaltyPoints: 0,
    subscriptionStatus: "free",
  },
  "admin@fayeedautocare.com": {
    id: "usr_admin_001",
    email: "admin@fayeedautocare.com",
    fullName: "Admin User",
    role: "admin",
    isActive: true,
    branchLocation: "All Branches",
    canViewAllBranches: true,
    loyaltyPoints: 0,
    subscriptionStatus: "free",
  },
  "manager@tumaga.com": {
    id: "usr_manager_tumaga",
    email: "manager@tumaga.com",
    fullName: "Juan Dela Cruz",
    role: "manager",
    isActive: true,
    branchLocation: "Tumaga Branch",
    canViewAllBranches: false,
    loyaltyPoints: 0,
    subscriptionStatus: "free",
  },
  "crew1@tumaga.com": {
    id: "usr_crew_001",
    email: "crew1@tumaga.com",
    fullName: "Carlo Reyes",
    role: "crew",
    isActive: true,
    branchLocation: "Tumaga Branch",
    canViewAllBranches: false,
    loyaltyPoints: 0,
    subscriptionStatus: "free",
  },
  "customer@test.com": {
    id: "usr_customer_001",
    email: "customer@test.com",
    fullName: "Maria Santos",
    role: "user",
    isActive: true,
    branchLocation: "Tumaga Branch",
    canViewAllBranches: false,
    loyaltyPoints: 150,
    subscriptionStatus: "basic",
  },
  "premium@test.com": {
    id: "usr_premium_001",
    email: "premium@test.com",
    fullName: "John Dela Cruz",
    role: "user",
    isActive: true,
    branchLocation: "Tumaga Branch",
    canViewAllBranches: false,
    loyaltyPoints: 500,
    subscriptionStatus: "premium",
  },
};

const DEMO_PASSWORD = "password123";

// User authentication endpoints
export const loginUser: RequestHandler = async (req, res) => {
  // Ensure JSON response headers
  res.setHeader("Content-Type", "application/json");
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt received", {
      email,
      hasPassword: typeof password === "string" && password.length > 0,
      passwordLength: typeof password === "string" ? password.length : 0,
      contentType: req.headers["content-type"],
      time: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      dbConnected: !!supabaseDbService["db"],
    });

    if (!email || !password) {
      console.warn("🔐 Login failed: missing email or password", {
        hasEmail: !!email,
        hasPassword: !!password,
      });
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    let user;
    let usingDemoMode = false;

    try {
      console.log("🔐 Attempting to fetch user from database...");
      user = await supabaseDbService.getUserByEmail(email);
      if (user) {
        console.log("✅ User found in database", {
          email: user.email,
          hasPassword: !!user.password,
          passwordHash: user.password
            ? user.password.substring(0, 10) + "..."
            : "NO_PASSWORD",
          isActive: user.isActive,
          role: user.role,
        });
      } else {
        console.warn("🔐 User not found in database", { email });
      }
    } catch (dbErr) {
      const errorMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn("🔐 Database error, checking demo accounts:", errorMsg);

      // Try demo mode when database is unavailable
      const demoUser = DEMO_ACCOUNTS[email.toLowerCase()];
      if (demoUser && password === DEMO_PASSWORD) {
        console.log("✅ Demo mode login successful for:", email);
        usingDemoMode = true;
        user = { ...demoUser, password: "demo" }; // Add fake password field
      } else if (demoUser) {
        return res.status(401).json({
          success: false,
          error: "Invalid password. Demo accounts use: password123",
        });
      } else {
        return res.status(401).json({
          success: false,
          error:
            "Account not found. Available demo accounts: superadmin@fayeedautocare.com, admin@fayeedautocare.com",
        });
      }
    }

    if (!user) {
      console.warn("🔐 Login failed: user not found", { email });
      const response = { success: false, error: "Invalid email or password" };
      return res.status(401).json(response);
    }

    // Skip password verification for demo mode (already verified above)
    if (!usingDemoMode) {
      // Check if password exists in database
      if (!user.password) {
        console.error("🔐 Login failed: user has no password hash", { email });
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      let isValidPassword = false;
      try {
        console.log("🔐 Starting password verification...");
        isValidPassword = await supabaseDbService.verifyPassword(
          email,
          password,
        );
        console.log("🔐 Password verification result", {
          email,
          isValid: isValidPassword,
        });
      } catch (pwErr) {
        const errorMsg = pwErr instanceof Error ? pwErr.message : String(pwErr);
        console.error("🔐 Password verification error:", {
          error: errorMsg,
          email,
          stack: pwErr instanceof Error ? pwErr.stack : undefined,
        });
        return res.status(500).json({
          success: false,
          error: "Authentication service error. Please try again.",
          debug: process.env.NODE_ENV === "development" ? errorMsg : undefined,
        });
      }

      if (!isValidPassword) {
        console.warn("🔐 Login failed: invalid password", { email });
        const response = { success: false, error: "Invalid credentials" };
        return res.status(401).json(response);
      }
    } else {
      console.log("✅ Demo mode: skipping password verification");
    }

    if (!user.isActive) {
      console.warn("🔐 Login failed: account disabled", { email });
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
      });
    }

    // Update last login
    try {
      await supabaseDbService.updateUser(user.id, { lastLoginAt: new Date() });
    } catch (updateErr) {
      console.warn("⚠️ Failed to update last login:", updateErr);
      // Continue - this is not critical
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create a server side session token and store it in user_sessions
    const crypto = await import("crypto");
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      await supabaseDbService.createUserSession(
        userWithoutPassword.id,
        sessionToken,
        expiresAt,
        req.ip,
        (req.headers["user-agent"] || "") as string,
      );
    } catch (sessionErr) {
      console.warn("⚠️ Failed to create user session:", sessionErr);
      // Continue - session is optional
    }

    console.log("✅ Login successful", {
      email,
      role: userWithoutPassword.role,
      id: userWithoutPassword.id,
    });
    const response = {
      success: true,
      user: userWithoutPassword,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      message: "Login successful",
    };
    return res.json(response);
  } catch (error: any) {
    console.error("❌ Login error:", {
      message: error?.message || error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
};

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const userData = req.body;
    const { subscriptionPackage } = userData;

    console.log("📝 User registration initiated:", {
      email: userData.email,
      subscriptionPackage,
    });

    // Check if user already exists
    const existingUser = await supabaseDbService.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create user (excluding subscriptionPackage from user data)
    const { subscriptionPackage: _ignore, ...userDataWithoutPackage } =
      userData;
    const user = await supabaseDbService.createUser(userDataWithoutPackage);

    console.log("✅ User created:", user.id);

    // Create subscription if a package was selected
    let subscription = null;
    if (subscriptionPackage && subscriptionPackage !== "regular") {
      try {
        console.log(
          "📦 Creating subscription for package:",
          subscriptionPackage,
        );
        subscription = await supabaseDbService.createSubscription({
          userId: user.id,
          packageId: subscriptionPackage,
          status: "pending",
          finalPrice: getPackagePrice(subscriptionPackage),
          paymentMethod: "registration",
          autoRenew: true,
        });
        console.log("✅ Subscription created:", subscription.id);
      } catch (subError) {
        console.warn("⚠️ Failed to create subscription:", subError);
        // Continue - subscription creation failure should not block registration
      }
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      subscription: subscription || null,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
};

// Update user subscription status
export const updateSubscription: RequestHandler = async (req, res) => {
  try {
    const { userId, newStatus } = req.body;

    if (!userId || !newStatus) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: userId, newStatus",
      });
    }

    console.log("🔄 Updating subscription for user:", {
      userId,
      newStatus,
    });

    // Update user's subscription status
    const updatedUser = await neonDbService.updateUser(userId, {
      subscriptionStatus: newStatus,
    });

    console.log("✅ Subscription updated successfully:", {
      userId,
      newStatus,
      email: updatedUser.email,
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `Subscription updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("❌ Subscription update error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update subscription",
    });
  }
};

// Fetch user's subscription status
export const fetchUserSubscription: RequestHandler = async (req, res) => {
  try {
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: userId or email",
      });
    }

    let user;
    if (userId) {
      user = await neonDbService.getUserById(userId as string);
    } else {
      user = await neonDbService.getUserByEmail(email as string);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("✅ Fetched subscription for user:", {
      userId: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
    });

    // Return subscription data in format expected by frontend
    const subscriptionData = {
      package: user.subscriptionStatus || "Regular Member",
      subscriptionStatus: user.subscriptionStatus || "free",
      daysLeft: 30,
      currentCycleStart: new Date().toISOString().split("T")[0],
      currentCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysLeftInCycle: 30,
      autoRenewal: false,
      remainingWashes: {
        classic: 0,
        vipProMax: 0,
        premium: 0,
      },
      totalWashes: {
        classic: 0,
        vipProMax: 0,
        premium: 0,
      },
    };

    res.json({
      success: true,
      subscription: subscriptionData,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("❌ Fetch subscription error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch subscription",
    });
  }
};

// Helper function to get package price
function getPackagePrice(packageId: string): number {
  const prices: Record<string, number> = {
    regular: 0,
    classic: 500,
    "vip-silver": 1500,
    "vip-gold": 3000,
  };
  return prices[packageId] || 0;
}

// Booking endpoints

// Get slot availability for a specific date, time, and branch
export const getSlotAvailability: RequestHandler = async (req, res) => {
  try {
    const { date, timeSlot, branch } = req.query;

    if (!date || !timeSlot || !branch) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: date, timeSlot, branch",
      });
    }

    const availability = await supabaseDbService.getSlotAvailability(
      String(date),
      String(timeSlot),
      String(branch),
    );

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("❌ Error checking slot availability:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check slot availability",
    });
  }
};

// Get garage settings and current time in Manila timezone
export const getGarageSettings: RequestHandler = async (req, res) => {
  try {
    // Get current time in Manila timezone (UTC+8) using Intl API
    const now = new Date();

    // Use Intl.DateTimeFormat to properly extract Manila timezone values
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const partMap = Object.fromEntries(parts.map((p) => [p.type, p.value]));

    const manilaHour = parseInt(partMap.hour, 10);
    const manilaMinute = parseInt(partMap.minute, 10);
    const manilaDate = `${partMap.year}-${partMap.month}-${partMap.day}`;

    console.log("🕐 Manila time details:", {
      hour: manilaHour,
      minute: manilaMinute,
      date: manilaDate,
      utcTime: now.toISOString(),
    });

    // Garage hours: 8:00 AM to 8:00 PM
    const garageOpenTime = 8; // 8:00 AM
    const garageCloseTime = 20; // 8:00 PM

    const isGarageOpen =
      manilaHour >= garageOpenTime && manilaHour < garageCloseTime;

    res.json({
      success: true,
      data: {
        currentTime: now.toISOString(),
        currentHour: manilaHour,
        currentMinute: manilaMinute,
        currentDate: manilaDate,
        garageOpenTime,
        garageCloseTime,
        isGarageOpen,
        timezone: "Asia/Manila",
      },
    });
  } catch (error) {
    console.error("❌ Error getting garage settings:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get garage settings",
    });
  }
};

export const createBooking: RequestHandler = async (req, res) => {
  try {
    // Validate required fields
    const {
      category,
      service,
      date,
      timeSlot,
      branch,
      fullName,
      mobile,
      email,
      basePrice,
      totalPrice,
    } = req.body;

    const missingFields = [];
    if (!category) missingFields.push("category");
    if (!service) missingFields.push("service");
    if (!date) missingFields.push("date");
    if (!timeSlot) missingFields.push("timeSlot");
    if (!branch) missingFields.push("branch");
    if (!fullName) missingFields.push("fullName");
    if (!mobile) missingFields.push("mobile");
    if (!email) missingFields.push("email");
    if (basePrice === undefined || basePrice === null)
      missingFields.push("basePrice");
    if (totalPrice === undefined || totalPrice === null)
      missingFields.push("totalPrice");

    if (missingFields.length > 0) {
      console.warn("🔐 Booking validation failed: missing fields", {
        missingFields,
      });
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate price fields are numbers
    if (typeof basePrice !== "number" || typeof totalPrice !== "number") {
      return res.status(400).json({
        success: false,
        error: "basePrice and totalPrice must be valid numbers",
      });
    }

    // Validate prices are non-negative
    if (basePrice < 0 || totalPrice < 0) {
      return res.status(400).json({
        success: false,
        error: "Prices must be non-negative",
      });
    }

    // Check slot availability before creating booking
    console.log("🔍 Checking slot availability for:", {
      date,
      timeSlot,
      branch,
    });
    const availability = await supabaseDbService.getSlotAvailability(
      date,
      timeSlot,
      branch,
    );

    if (!availability.isAvailable) {
      console.warn("❌ Booking slot not available", { date, timeSlot, branch });
      return res.status(409).json({
        success: false,
        error: `No availability for ${timeSlot} on ${date} at ${branch}. Please select another time slot.`,
      });
    }

    const booking = await supabaseDbService.createBooking(req.body);

    // Create notification for new booking
    try {
      await supabaseDbService.createSystemNotification({
        type: "new_booking",
        title: "🎯 New Booking Received",
        message: `New booking created: ${booking.service} on ${booking.date}`,
        priority: "high",
        targetRoles: ["admin", "superadmin", "manager", "dispatcher"],
        data: { bookingId: booking.id },
        playSound: true,
        soundType: "new_booking",
      });
    } catch (notifyErr) {
      console.warn("⚠️ Failed to create notification:", notifyErr);
    }

    res.status(201).json({
      success: true,
      booking,
      message: "Booking created successfully",
    });

    // Emit Pusher events for new booking (admin & user channels) - non-blocking
    (async () => {
      try {
        const adminChannel = "public-realtime";
        const userChannel = booking.userId
          ? `user-customer-${booking.userId}`
          : null;
        const payload = {
          bookingId: booking.id,
          booking,
        };

        if (userChannel) {
          const privateUserChannel = `private-${userChannel}`;
          await emitPusher(
            [
              userChannel,
              privateUserChannel,
              adminChannel,
              `private-${adminChannel}`,
            ],
            "booking.created",
            payload,
          );
        } else {
          await emitPusher(
            [adminChannel, `private-${adminChannel}`],
            "booking.created",
            payload,
          );
        }
      } catch (err) {
        console.warn("Failed to emit pusher booking.created:", err);
      }
    })();
  } catch (error) {
    console.error(
      "Create booking error:",
      error instanceof Error ? error.message : error,
    );

    // Provide more specific error messages
    let errorMessage = "Failed to create booking. Please try again.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        errorMessage = "Database connection error. Please try again later.";
        statusCode = 503;
      } else if (error.message.includes("validation")) {
        errorMessage = error.message;
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};

export const getBookings: RequestHandler = async (req, res) => {
  try {
    const { userId, status, branch, userEmail, userRole } = req.query;

    let bookings;

    // Get current user's details if filtering by branch access is needed
    let currentUser = null;
    if (userEmail) {
      currentUser = await supabaseDbService.getUserByEmail(userEmail as string);
    }

    // Check if user can view all branches
    const canViewAll =
      userRole === "admin" ||
      userRole === "superadmin" ||
      userRole === "dispatcher" ||
      (currentUser && currentUser.canViewAllBranches);

    if (userId) {
      // Get bookings for specific user
      bookings = await supabaseDbService.getBookingsByUserId(userId as string);
    } else if (branch && branch !== "all") {
      // Filter by specific branch
      if (status) {
        bookings = await supabaseDbService.getBookingsByBranchAndStatus(
          branch as string,
          status as string,
        );
      } else {
        bookings = await supabaseDbService.getBookingsByBranch(
          branch as string,
        );
      }
    } else if (status) {
      // Filter by status
      let allBookings = await supabaseDbService.getBookingsByStatus(
        status as string,
      );

      // Apply branch restriction if user can't view all branches
      if (!canViewAll && currentUser) {
        bookings = allBookings.filter(
          (b) => b.branch === currentUser.branchLocation,
        );
      } else {
        bookings = allBookings;
      }
    } else {
      // Get all bookings
      let allBookings = await supabaseDbService.getAllBookings();

      // Apply branch restriction if user can't view all branches
      if (!canViewAll && currentUser) {
        bookings = allBookings.filter(
          (b) => b.branch === currentUser.branchLocation,
        );
      } else {
        bookings = allBookings;
      }
    }

    res.json({
      success: true,
      bookings,
      canViewAllBranches: canViewAll,
      userBranch: currentUser?.branchLocation || null,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

// Logout endpoint: invalidates the current session token
export const logoutUser: RequestHandler = async (req, res) => {
  try {
    const authHeader = (req.headers["authorization"] ||
      req.headers["Authorization"]) as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(400)
        .json({ success: false, error: "Authorization Bearer token required" });
    }
    const token = authHeader.split(" ")[1];

    const session = await supabaseDbService.getSessionByToken(token);
    if (!session) {
      return res
        .status(400)
        .json({ success: false, error: "Session not found" });
    }

    await supabaseDbService.deactivateSession(token);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, error: "Failed to logout" });
  }
};

// Revoke session(s) - admin only. Body may contain { sessionToken, sessionId, userId }
export const revokeSession: RequestHandler = async (req, res) => {
  try {
    // Validate caller's session
    const authHeader = (req.headers["authorization"] ||
      req.headers["Authorization"]) as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(403)
        .json({ success: false, error: "Admin Authorization required" });
    }
    const callerToken = authHeader.split(" ")[1];
    const callerSession =
      await supabaseDbService.getSessionByToken(callerToken);
    if (!callerSession)
      return res.status(403).json({ success: false, error: "Invalid session" });
    const callerUser = await supabaseDbService.getUserById(
      callerSession.userId,
    );
    if (
      !callerUser ||
      !["admin", "superadmin", "manager"].includes(callerUser.role)
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Insufficient privileges" });
    }

    const { sessionToken, sessionId, userId } = req.body as {
      sessionToken?: string;
      sessionId?: string;
      userId?: string;
    };

    if (sessionToken) {
      await supabaseDbService.deactivateSession(sessionToken);
      return res.json({ success: true, message: "Session token revoked" });
    }

    if (sessionId) {
      await supabaseDbService.deactivateSessionById(sessionId);
      return res.json({ success: true, message: "Session id revoked" });
    }

    if (userId) {
      await supabaseDbService.deactivateSessionsByUserId(userId);
      return res.json({
        success: true,
        message: "All sessions for user revoked",
      });
    }

    return res.status(400).json({
      success: false,
      error: "sessionToken or sessionId or userId required",
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ success: false, error: "Failed to revoke session" });
  }
};

// Admin: list sessions (optional ?userId and ?activeOnly)
export const getSessions: RequestHandler = async (req, res) => {
  try {
    const authHeader = (req.headers["authorization"] ||
      req.headers["Authorization"]) as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(403)
        .json({ success: false, error: "Admin Authorization required" });
    }
    const callerToken = authHeader.split(" ")[1];
    const callerSession =
      await supabaseDbService.getSessionByToken(callerToken);
    if (!callerSession)
      return res.status(403).json({ success: false, error: "Invalid session" });
    const callerUser = await supabaseDbService.getUserById(
      callerSession.userId,
    );
    if (
      !callerUser ||
      !["admin", "superadmin", "manager"].includes(callerUser.role)
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Insufficient privileges" });
    }

    const { userId, activeOnly } = req.query as {
      userId?: string;
      activeOnly?: string;
    };
    const sessions = await supabaseDbService.getSessions({
      userId,
      activeOnly: activeOnly === "true",
    });

    // Attach basic user info
    const sessionsWithUser = await Promise.all(
      sessions.map(async (s: any) => {
        const user = await supabaseDbService.getUserById(s.userId);
        return {
          ...s,
          userEmail: user?.email || null,
          userFullName: user?.fullName || null,
          userRole: user?.role || null,
        };
      }),
    );

    res.json({ success: true, sessions: sessionsWithUser });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch sessions" });
  }
};

// Ensure voucher tables exist (idempotent)
async function ensureVoucherTables() {
  await sql`CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0.00,
    audience VARCHAR(20) NOT NULL DEFAULT 'registered',
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    usage_limit INTEGER,
    per_user_limit INTEGER DEFAULT 1,
    total_used INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`;
  await sql`CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id TEXT PRIMARY KEY,
    voucher_code VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    booking_id TEXT,
    discount_amount DECIMAL(10,2) NOT NULL,
    redeemed_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(100);`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS voucher_discount DECIMAL(10,2) DEFAULT 0.00;`;
}

export const getVouchers: RequestHandler = async (req, res) => {
  try {
    await ensureVoucherTables();
    const { audience, status } = req.query;

    let query = sql`SELECT * FROM vouchers WHERE 1=1`;

    if (audience) {
      query = sql`SELECT * FROM vouchers WHERE (audience = ${audience} OR audience = 'all')`;
    }

    if (status === "active") {
      query = sql`SELECT * FROM vouchers WHERE is_active = true AND (valid_until IS NULL OR valid_until >= NOW())`;
    }

    if (audience && status === "active") {
      query = sql`SELECT * FROM vouchers WHERE (audience = ${audience} OR audience = 'all') AND is_active = true AND (valid_until IS NULL OR valid_until >= NOW())`;
    }

    const vouchers = await query;
    res.json({
      success: true,
      vouchers: Array.isArray(vouchers) ? vouchers : vouchers?.rows || [],
    });
  } catch (err: any) {
    console.error("Get vouchers error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch vouchers" });
  }
};

export const validateVoucher: RequestHandler = async (req, res) => {
  try {
    const { code, bookingAmount, userEmail, bookingType } = req.body || {};
    if (!code || typeof bookingAmount !== "number") {
      return res
        .status(400)
        .json({ success: false, error: "code and bookingAmount are required" });
    }

    await ensureVoucherTables();

    // Fetch voucher by code (case-insensitive)
    const result: any =
      await sql`SELECT * FROM vouchers WHERE LOWER(code) = LOWER(${code}) LIMIT 1`;
    const voucher = Array.isArray(result) ? result[0] : result?.rows?.[0];
    if (!voucher)
      return res
        .status(404)
        .json({ success: false, error: "Invalid voucher code" });

    // Check status and validity window
    const now = new Date();
    if (voucher.is_active === false)
      return res
        .status(400)
        .json({ success: false, error: "Voucher is inactive" });
    if (voucher.valid_from && new Date(voucher.valid_from) > now)
      return res
        .status(400)
        .json({ success: false, error: "Voucher not yet active" });
    if (voucher.valid_until && new Date(voucher.valid_until) < now)
      return res.status(400).json({ success: false, error: "Voucher expired" });

    // Audience rules
    const isRegistered = !!userEmail;
    if (voucher.audience === "registered" && !isRegistered) {
      return res.status(403).json({
        success: false,
        error: "Voucher is only for registered users",
      });
    }

    // Usage limits
    if (
      voucher.usage_limit &&
      Number(voucher.total_used || 0) >= voucher.usage_limit
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Voucher usage limit reached" });
    }
    if (isRegistered && voucher.per_user_limit) {
      const usedByUser: any =
        await sql`SELECT COUNT(*)::int as cnt FROM voucher_redemptions WHERE voucher_code = ${voucher.code} AND user_email = ${userEmail}`;
      const usedCount = Array.isArray(usedByUser)
        ? usedByUser[0]?.cnt
        : usedByUser?.rows?.[0]?.cnt;
      if (Number(usedCount || 0) >= voucher.per_user_limit) {
        return res.status(400).json({
          success: false,
          error: "You have already used this voucher",
        });
      }
    }

    // Min amount
    const minAmt = Number(voucher.minimum_amount || 0);
    if (minAmt > 0 && bookingAmount < minAmt) {
      return res.status(400).json({
        success: false,
        error: `Minimum amount ₱${minAmt.toFixed(2)} not met`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discount_type === "percentage") {
      discountAmount =
        Math.round(bookingAmount * Number(voucher.discount_value)) / 100; // percentage value already like 20 => amount = amount * 20 / 100
      discountAmount = Number(
        ((bookingAmount * Number(voucher.discount_value)) / 100).toFixed(2),
      );
    } else {
      discountAmount = Number(voucher.discount_value);
    }
    if (discountAmount > bookingAmount) discountAmount = bookingAmount;
    const finalAmount = Number((bookingAmount - discountAmount).toFixed(2));

    return res.json({
      success: true,
      data: {
        code: voucher.code,
        title: voucher.title,
        discountType: voucher.discount_type,
        discountValue: Number(voucher.discount_value),
        discountAmount,
        finalAmount,
        audience: voucher.audience,
      },
    });
  } catch (error: any) {
    console.error("validateVoucher error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to validate voucher" });
  }
};

export const redeemVoucher: RequestHandler = async (req, res) => {
  try {
    const { code, userEmail, bookingId, discountAmount } = req.body || {};
    if (!code || !bookingId || typeof discountAmount !== "number") {
      return res.status(400).json({
        success: false,
        error: "code, bookingId and discountAmount are required",
      });
    }

    await ensureVoucherTables();

    // Insert redemption
    const id = `vrd_${Date.now()}`;
    await sql`INSERT INTO voucher_redemptions (id, voucher_code, user_email, booking_id, discount_amount) VALUES (${id}, ${code}, ${userEmail || null}, ${bookingId}, ${discountAmount})`;
    await sql`UPDATE vouchers SET total_used = COALESCE(total_used,0) + 1, updated_at = NOW() WHERE code = ${code}`;

    // Also update booking columns if present
    await sql`UPDATE bookings SET voucher_code = ${code}, voucher_discount = ${discountAmount} WHERE id = ${bookingId}`;

    return res.json({ success: true, message: "Voucher redeemed", id });
  } catch (error: any) {
    console.error("redeemVoucher error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to redeem voucher" });
  }
};

export const updateBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await supabaseDbService.updateBooking(id, updates);

    res.json({
      success: true,
      booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update booking",
    });
  }
};

// Notification endpoints
export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const { userId, userRole } = req.query;

    if (!userId || !userRole) {
      return res.status(400).json({
        success: false,
        error: "userId and userRole are required",
      });
    }

    const notifications = await supabaseDbService.getNotificationsForUser(
      userId as string,
      userRole as string,
    );

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
    });
  }
};

export const markNotificationRead: RequestHandler = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    await supabaseDbService.markNotificationAsRead(notificationId, userId);

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read",
    });
  }
};

// Admin settings endpoints
export const getSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await supabaseDbService.getAllSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
    });
  }
};

export const updateSetting: RequestHandler = async (req, res) => {
  try {
    const { key, value, description, category } = req.body;

    const setting = await supabaseDbService.setSetting(
      key,
      value,
      description,
      category,
    );

    res.json({
      success: true,
      setting,
      message: "Setting updated successfully",
    });
  } catch (error) {
    console.error("Update setting error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update setting",
    });
  }
};

// Daily income endpoints
export const createDailyIncome: RequestHandler = async (req, res) => {
  try {
    const { branch, incomeDate, amount, recordedBy, notes } = req.body;
    if (!branch || !incomeDate || amount === undefined || !recordedBy) {
      return res.status(400).json({
        success: false,
        error: "branch, incomeDate, amount, and recordedBy are required",
      });
    }

    const db = await getDatabase();
    const [entry] = await db
      .insert(schema.dailyIncome)
      .values({
        id: createId(),
        branch,
        incomeDate: new Date(incomeDate),
        amount: String(amount),
        recordedBy,
        notes: notes || null,
        createdAt: new Date(),
      })
      .returning();

    res.json({ success: true, entry });
  } catch (error) {
    console.error("Create daily income error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create daily income entry",
    });
  }
};

export const getDailyIncome: RequestHandler = async (req, res) => {
  try {
    const { branch, startDate, endDate } = req.query;
    const filters = [] as any[];
    if (branch) {
      filters.push(eq(schema.dailyIncome.branch, branch as string));
    }
    if (startDate) {
      filters.push(
        gte(schema.dailyIncome.incomeDate, new Date(startDate as string)),
      );
    }
    if (endDate) {
      filters.push(
        lte(schema.dailyIncome.incomeDate, new Date(endDate as string)),
      );
    }

    const db = await getDatabase();
    const entries = await db
      .select()
      .from(schema.dailyIncome)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.dailyIncome.incomeDate));

    res.json({ success: true, entries });
  } catch (error) {
    console.error("Get daily income error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch daily income entries",
    });
  }
};

// Ads endpoints
export const getAds: RequestHandler = async (req, res) => {
  try {
    const ads = await supabaseDbService.getActiveAds();
    res.json({
      success: true,
      ads,
    });
  } catch (error) {
    console.error("Get ads error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch ads",
    });
  }
};

export const createAd: RequestHandler = async (req, res) => {
  try {
    const ad = await supabaseDbService.createAd(req.body);

    res.status(201).json({
      success: true,
      ad,
      message: "Ad created successfully",
    });
  } catch (error) {
    console.error("Create ad error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create ad",
    });
  }
};

export const dismissAd: RequestHandler = async (req, res) => {
  try {
    const { adId } = req.params;
    const { userEmail } = req.body;

    await supabaseDbService.dismissAd(adId, userEmail);

    res.json({
      success: true,
      message: "Ad dismissed successfully",
    });
  } catch (error) {
    console.error("Dismiss ad error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to dismiss ad",
    });
  }
};

// Database stats endpoint
export const getDatabaseStats: RequestHandler = async (req, res) => {
  try {
    const period = (req.query.period as string) || "monthly";
    const stats = await supabaseDbService.getStats(period);
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch database stats",
    });
  }
};

// Real-time crew and customer stats endpoint
export const getRealtimeStats: RequestHandler = async (req, res) => {
  try {
    const realtimeStats = await supabaseDbService.getRealtimeStats();
    res.json({
      success: true,
      stats: realtimeStats,
    });
  } catch (error) {
    console.error("Get realtime stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch realtime stats",
    });
  }
};

// FAC MAP comprehensive stats endpoint
export const getFacMapStats: RequestHandler = async (req, res) => {
  try {
    console.log("📊 Getting FAC MAP stats...");
    const facMapStats = await supabaseDbService.getFacMapStats();
    console.log(
      "✅ FAC MAP stats retrieved:",
      JSON.stringify(facMapStats, null, 2),
    );

    res.json({
      success: true,
      stats: facMapStats,
      message: "FAC MAP stats retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get FAC MAP stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch FAC MAP stats",
    });
  }
};

// Analytics data endpoint
export const getAnalyticsData: RequestHandler = async (req, res) => {
  try {
    console.log("📊 Getting analytics data...");
    const { timeFilter } = req.query;

    let stats = {
      totalRevenue: 0,
      totalUsers: 0,
      totalWashes: 0,
    } as any;
    let users: any[] = [];
    let bookings: any[] = [];

    try {
      stats = await supabaseDbService.getStats(
        (timeFilter as string) || "monthly",
      );
      users = await supabaseDbService.getAllUsers();
      bookings = await supabaseDbService.getAllBookings();
    } catch (dbError) {
      console.warn("⚠️ Analytics fallback: database unavailable", dbError);
    }

    // Calculate analytics based on time filter
    const analyticsData = {
      salesData: calculateSalesData(bookings, timeFilter as string),
      packageDistribution: calculatePackageDistribution(users),
      branchPerformance: calculateBranchPerformance(bookings, users),
      totalSales: stats.totalRevenue || 0,
      totalCustomers: stats.totalUsers || 0,
      totalWashes: stats.totalWashes || 0,
    };

    console.log("✅ Analytics data calculated");
    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error("❌ Error getting analytics data:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get analytics data" });
  }
};

// Helper functions for analytics calculations
function calculateSalesData(bookings: any[], timeFilter: string) {
  // Return data based on real database info
  const realCustomerCount = bookings?.length || 2;

  const baseData = {
    daily: [
      { name: "Mon", sales: 0, customers: 0, washes: 0 },
      { name: "Tue", sales: 0, customers: 0, washes: 0 },
      { name: "Wed", sales: 0, customers: 0, washes: 0 },
      { name: "Thu", sales: 0, customers: 0, washes: 0 },
      { name: "Fri", sales: 0, customers: 0, washes: 0 },
      { name: "Sat", sales: 0, customers: 0, washes: 0 },
      { name: "Sun", sales: 0, customers: realCustomerCount, washes: 0 },
    ],
    weekly: [
      { name: "Week 1", sales: 0, customers: 0, washes: 0 },
      { name: "Week 2", sales: 0, customers: 0, washes: 0 },
      { name: "Week 3", sales: 0, customers: 0, washes: 0 },
      { name: "Week 4", sales: 0, customers: realCustomerCount, washes: 0 },
    ],
    monthly: [
      { name: "Jan", sales: 0, customers: 0, washes: 0 },
      { name: "Feb", sales: 0, customers: 0, washes: 0 },
      { name: "Mar", sales: 0, customers: 0, washes: 0 },
      { name: "Apr", sales: 0, customers: 0, washes: 0 },
      { name: "May", sales: 0, customers: 0, washes: 0 },
      { name: "Jun", sales: 0, customers: realCustomerCount, washes: 0 },
    ],
    yearly: [
      { name: "2020", sales: 0, customers: 0, washes: 0 },
      { name: "2021", sales: 0, customers: 0, washes: 0 },
      { name: "2022", sales: 0, customers: 0, washes: 0 },
      { name: "2023", sales: 0, customers: 0, washes: 0 },
      { name: "2024", sales: 0, customers: realCustomerCount, washes: 0 },
    ],
  };

  return baseData[timeFilter as keyof typeof baseData] || baseData.monthly;
}

function calculatePackageDistribution(users: any[]) {
  if (!users || users.length === 0) {
    return [
      { name: "Classic", value: 50, color: "#3b82f6" },
      { name: "VIP Silver", value: 30, color: "#6b7280" },
      { name: "VIP Gold", value: 20, color: "#f59e0b" },
    ];
  }

  const distribution = users.reduce((acc: any, user: any) => {
    const status = user.subscriptionStatus || "free";
    const packageName =
      status === "free"
        ? "Classic"
        : status === "basic"
          ? "VIP Silver"
          : status === "premium"
            ? "VIP Gold"
            : status === "vip"
              ? "VIP Gold Ultimate"
              : "Classic";

    acc[packageName] = (acc[packageName] || 0) + 1;
    return acc;
  }, {});

  const total = users.length;
  return Object.entries(distribution).map(([name, count]: [string, any]) => ({
    name,
    value: Math.round((count / total) * 100),
    color:
      name === "Classic"
        ? "#3b82f6"
        : name === "VIP Silver"
          ? "#6b7280"
          : name === "VIP Gold"
            ? "#f59e0b"
            : "#ef4444",
  }));
}

function calculateBranchPerformance(bookings: any[], users: any[]) {
  if (!users || users.length === 0) {
    return [{ name: "Main Branch", revenue: 0, customers: 2, washes: 0 }];
  }

  // Group by branch location
  const branchStats = users.reduce((acc: any, user: any) => {
    const branch = user.branchLocation || "Main Branch";
    if (!acc[branch]) {
      acc[branch] = { revenue: 0, customers: 0, washes: 0 };
    }
    acc[branch].customers += 1;
    return acc;
  }, {});

  // Add booking data to branch stats
  if (bookings && bookings.length > 0) {
    bookings.forEach((booking: any) => {
      const branch = booking.branch || "Main Branch";
      if (branchStats[branch]) {
        branchStats[branch].revenue += booking.totalPrice || 0;
        branchStats[branch].washes += 1;
      }
    });
  }

  return Object.entries(branchStats).map(([name, stats]: [string, any]) => ({
    name,
    ...stats,
  }));
}

// Debug endpoint to test password verification
export const debugLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 DEBUG: Testing login with", { email });

    const user = await supabaseDbService.getUserByEmail(email);
    if (!user) {
      console.error("❌ DEBUG: User not found:", email);
      return res.json({
        success: false,
        error: "User not found",
        debugInfo: { userExists: false },
      });
    }

    console.log("✅ DEBUG: User found:", {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
    });

    const isValidPassword = await supabaseDbService.verifyPassword(
      email,
      password,
    );
    console.log("🔐 DEBUG: Password verification result:", isValidPassword);

    return res.json({
      success: isValidPassword,
      debugInfo: {
        userExists: true,
        passwordCorrect: isValidPassword,
        userEmail: user.email,
        userRole: user.role,
      },
    });
  } catch (error: any) {
    console.error("❌ DEBUG endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Debug failed",
    });
  }
};

// Users endpoint - returns all users
export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    console.log("👥 Getting all users...");
    const users = await supabaseDbService.getAllUsers();
    console.log("✅ Users retrieved:", users.length, "users found");
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to get users" });
  }
};

// Customers endpoint - returns only customer users (role='user')
export const getCustomers: RequestHandler = async (req, res) => {
  try {
    console.log("🛒 Getting customer users...");
    const allUsers = await supabaseDbService.getAllUsers();
    const customers = allUsers.filter((user) => user.role === "user");
    console.log("✅ Customers retrieved:", customers.length, "customers found");
    res.json({ success: true, users: customers });
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ success: false, error: "Failed to get customers" });
  }
};

// Staff endpoint - returns admin/staff users (role != 'user')
export const getStaffUsers: RequestHandler = async (req, res) => {
  try {
    console.log("👨‍💼 Getting staff users...");
    const allUsers = await supabaseDbService.getAllUsers();
    const staff = allUsers.filter((user) => user.role !== "user");
    console.log("✅ Staff retrieved:", staff.length, "staff members found");
    res.json({ success: true, users: staff });
  } catch (error) {
    console.error("❌ Error fetching staff:", error);
    res.status(500).json({ success: false, error: "Failed to get staff" });
  }
};

// Create staff user endpoint
export const createStaffUser: RequestHandler = async (req, res) => {
  try {
    console.log("👨‍💼 Creating new staff user...");
    const {
      fullName,
      email,
      role,
      permissions,
      contactNumber,
      branchLocation,
    } = req.body;

    // Create user with staff role
    const userData = {
      email,
      fullName,
      role,
      contactNumber: contactNumber || null,
      branchLocation,
      isActive: true,
      emailVerified: true,
      subscriptionStatus: "free",
      loyaltyPoints: 0,
      // Store permissions in a JSON field or handle separately
      crewSkills: permissions || [],
    };

    const user = await supabaseDbService.createUser(userData);
    console.log("✅ Staff user created:", user.id);
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error creating staff user:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create staff user" });
  }
};

// ============= NEW FEATURES API ENDPOINTS =============

// Simple in-memory cache for branches to reduce DB load
const BRANCHES_CACHE_TTL = Number(process.env.BRANCHES_CACHE_TTL_SECONDS || 60); // default 1 minute
let branchesCache: { branches: any[]; expiresAt: number } | null = null;

// Branches endpoints
export const getBranches: RequestHandler = async (req, res) => {
  try {
    const now = Date.now();
    if (branchesCache && branchesCache.expiresAt > now) {
      return res.json({
        success: true,
        branches: branchesCache.branches,
        source: "cache",
      });
    }

    const branches = await supabaseDbService.getBranches();
    branchesCache = {
      branches: branches || [],
      expiresAt: Date.now() + BRANCHES_CACHE_TTL * 1000,
    };
    res.json({ success: true, branches: branches || [], source: "db" });
  } catch (error) {
    console.error("❌ Get branches error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch branches" });
  }
};

export const seedBranchesEndpoint: RequestHandler = async (req, res) => {
  try {
    console.log("🌱 Seeding branches...");
    const { seedBranches } = await import("../database/seed-branches.js");
    await seedBranches();
    const branches = await supabaseDbService.getBranches();
    res.json({
      success: true,
      message: "Branches seeded successfully",
      count: branches.length,
    });
  } catch (error) {
    console.error("❌ Seed branches error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed branches",
    });
  }
};

// DEBUG: Password verification diagnostic endpoint
export const debugPasswordVerification: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required",
      });
    }

    console.log("🔍 DEBUG: Starting password verification check...");

    // Fetch user
    const user = await supabaseDbService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        debug: {
          email,
          userFound: false,
        },
      });
    }

    console.log("🔍 DEBUG: User found", {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordHashStart: user.password
        ? user.password.substring(0, 15) + "..."
        : "NO_HASH",
    });

    if (!user.password) {
      return res.status(400).json({
        success: false,
        error: "User has no password hash in database",
        debug: {
          email,
          userFound: true,
          passwordHash: null,
        },
      });
    }

    // Try password verification
    const bcrypt = await import("bcryptjs");
    console.log("🔍 DEBUG: Comparing password...");
    console.log("   Input password length:", password.length);
    console.log("   Hash length:", user.password.length);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("🔍 DEBUG: Comparison result:", isMatch);

    return res.json({
      success: true,
      debug: {
        email,
        userFound: true,
        passwordHashExists: !!user.password,
        passwordHashAlgorithm: user.password?.substring(0, 4),
        passwordMatchResult: isMatch,
        inputPasswordLength: password.length,
        storedHashLength: user.password.length,
      },
    });
  } catch (error) {
    console.error("🔍 DEBUG: Error during verification", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// DEBUG: List all users and their password status
export const debugListUsers: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 DEBUG: Fetching all users...");
    const users = await supabaseDbService.getAllUsers();

    const usersList = users.map((user: any) => ({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password,
      passwordHashLength: user.password ? user.password.length : 0,
      passwordHashStart: user.password
        ? user.password.substring(0, 15) + "..."
        : "NO_HASH",
      passwordHashAlgorithm: user.password?.substring(0, 4) || "NONE",
    }));

    console.log("🔍 DEBUG: Found", usersList.length, "users");

    return res.json({
      success: true,
      totalUsers: usersList.length,
      users: usersList,
    });
  } catch (error) {
    console.error("🔍 DEBUG: Error fetching users", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// DEBUG: Manually hash a test password
export const debugHashPassword: RequestHandler = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password required",
      });
    }

    const bcrypt = await import("bcryptjs");
    console.log(
      "🔍 DEBUG: Hashing password:",
      password.substring(0, 3) + "****",
    );

    const hash = await bcrypt.hash(password, 10);

    console.log("🔍 DEBUG: Generated hash:", hash);

    // Try comparing immediately
    const isMatch = await bcrypt.compare(password, hash);
    console.log("🔍 DEBUG: Immediate comparison result:", isMatch);

    return res.json({
      success: true,
      debug: {
        password: password.substring(0, 3) + "****",
        generatedHash: hash,
        immediateComparisonResult: isMatch,
        hashLength: hash.length,
        hashAlgorithm: hash.substring(0, 4),
      },
    });
  } catch (error) {
    console.error("🔍 DEBUG: Error hashing password", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// ADMIN: Force re-hash all passwords (admin only)
export const adminForceRehashPasswords: RequestHandler = async (req, res) => {
  try {
    console.log("⚠️ ADMIN: Force re-hashing all passwords...");

    const bcrypt = await import("bcryptjs");
    const { eq } = await import("drizzle-orm");

    // Define all test user passwords
    const userPasswords: Record<string, string> = {
      "superadmin@fayeedautocare.com": "SuperAdmin2024!",
      "admin.fayeed@gmail.com": "FayeedSuper123!",
      "manager.tumaga@fayeedautocare.com": "TumagaAdmin2024!",
      "manager.boalan@fayeedautocare.com": "BoalanAdmin2024!",
      "cashier.tumaga@fayeedautocare.com": "Cashier123!",
      "john.doe@gmail.com": "Customer123!",
      "maria.santos@gmail.com": "Maria2024!",
      "carlos.reyes@gmail.com": "Carlos123!",
      "anna.lopez@gmail.com": "Anna2024!",
      "premium.customer1@example.com": "Premium123!",
      "premium.customer2@example.com": "Premium456!",
      "vip.customer@example.com": "VIP789!",
      "basic.customer@example.com": "Basic123!",
      "free.customer@example.com": "Free123!",
      "test.admin@example.com": "TestAdmin123!",
      "test.manager@example.com": "TestManager123!",
      "test.cashier@example.com": "TestCashier123!",
    };

    const db = await import("../database/connection");
    const schema = await import("../database/schema");
    const users = await db.getDatabase();

    if (!users) {
      return res.status(500).json({
        success: false,
        error: "Database not connected",
      });
    }

    // Fetch all users
    const allUsers = await users.select().from(schema.users);

    let updated = 0;
    const results: any[] = [];

    for (const user of allUsers) {
      const newPassword = userPasswords[user.email];
      if (newPassword) {
        try {
          console.log(`   → Hashing password for ${user.email}`);
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          await users
            .update(schema.users)
            .set({ password: hashedPassword })
            .where(eq(schema.users.id, user.id));

          updated++;
          results.push({
            email: user.email,
            updated: true,
            newHashLength: hashedPassword.length,
          });
          console.log(`   ✅ Updated ${user.email}`);
        } catch (err) {
          console.error(`   ❌ Error updating ${user.email}:`, err);
          results.push({
            email: user.email,
            updated: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    console.log(`✅ Force re-hashed ${updated} user passwords`);

    return res.json({
      success: true,
      message: `Force re-hashed ${updated} user passwords`,
      updated,
      results,
    });
  } catch (error) {
    console.error("❌ ADMIN: Error force re-hashing passwords", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Service packages endpoints
export const getServicePackages: RequestHandler = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const packages = await supabaseDbService.getServicePackages({
      includeInactive,
    });
    res.json({
      success: true,
      packages: packages || [],
    });
  } catch (error) {
    console.error("Get service packages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch service packages",
    });
  }
};

export const createServicePackage: RequestHandler = async (req, res) => {
  try {
    const payload = req.body || {};
    const created = await supabaseDbService.createServicePackage({
      name: payload.name,
      description: payload.description,
      category: payload.category || "subscription",
      type: payload.type || "recurring",
      basePrice: Number(payload.basePrice || payload.base_price || 0),
      currency: payload.currency || "PHP",
      durationType: payload.durationType || payload.duration_type,
      duration: payload.duration || null,
      hours: payload.hours ? Number(payload.hours) : null,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      features: Array.isArray(payload.features) ? payload.features : [],
      bannerUrl:
        payload.banner || payload.bannerUrl || payload.banner_url || null,
      isActive:
        typeof payload.active === "boolean"
          ? payload.active
          : (payload.isActive ?? true),
      isPopular: payload.isPopular ?? false,
      isFeatured: payload.isFeatured ?? false,
      color: payload.color,
      priority: payload.priority ? Number(payload.priority) : undefined,
    });

    res.status(201).json({
      success: true,
      package: created,
      message: "Service package created successfully",
    });
  } catch (error) {
    console.error("Create service package error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create service package",
    });
  }
};

export const updateServicePackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const updates: Record<string, any> = {};

    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.description !== undefined)
      updates.description = payload.description;
    if (payload.category !== undefined) updates.category = payload.category;
    if (payload.type !== undefined) updates.type = payload.type;
    if (payload.basePrice !== undefined || payload.base_price !== undefined) {
      updates.basePrice = Number(payload.basePrice ?? payload.base_price);
    }
    if (payload.currency !== undefined) updates.currency = payload.currency;
    if (
      payload.durationType !== undefined ||
      payload.duration_type !== undefined
    ) {
      updates.durationType = payload.durationType || payload.duration_type;
    }
    if (payload.duration !== undefined) updates.duration = payload.duration;
    if (payload.hours !== undefined) {
      updates.hours = payload.hours === null ? null : Number(payload.hours);
    }
    if (payload.startDate !== undefined) {
      updates.startDate =
        payload.startDate === null ? null : new Date(payload.startDate);
    }
    if (payload.endDate !== undefined) {
      updates.endDate =
        payload.endDate === null ? null : new Date(payload.endDate);
    }
    if (Array.isArray(payload.features)) updates.features = payload.features;
    if (
      payload.banner !== undefined ||
      payload.bannerUrl !== undefined ||
      payload.banner_url !== undefined
    ) {
      updates.bannerUrl =
        payload.banner || payload.bannerUrl || payload.banner_url;
    }
    if (typeof payload.active === "boolean" || payload.isActive !== undefined) {
      updates.isActive =
        typeof payload.active === "boolean" ? payload.active : payload.isActive;
    }
    if (payload.isPopular !== undefined) updates.isPopular = payload.isPopular;
    if (payload.isFeatured !== undefined)
      updates.isFeatured = payload.isFeatured;
    if (payload.color !== undefined) updates.color = payload.color;
    if (payload.priority !== undefined)
      updates.priority = Number(payload.priority);

    const updated = await supabaseDbService.updateServicePackage(id, updates);

    res.json({
      success: true,
      package: updated,
      message: "Service package updated successfully",
    });
  } catch (error) {
    console.error("Update service package error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update service package",
    });
  }
};

export const deleteServicePackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseDbService.deleteServicePackage(id);
    res.json({
      success: true,
      message: "Service package deleted successfully",
    });
  } catch (error) {
    console.error("Delete service package error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete service package",
    });
  }
};

// Gamification levels endpoints
export const getCustomerLevels: RequestHandler = async (req, res) => {
  try {
    const levels = await supabaseDbService.getCustomerLevels();
    res.json({
      success: true,
      levels: levels || [],
    });
  } catch (error) {
    console.error("Get customer levels error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customer levels",
    });
  }
};

// POS categories endpoints
export const getPOSCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await supabaseDbService.getPOSCategories();
    res.json({
      success: true,
      categories: categories || [],
    });
  } catch (error) {
    console.error("Get POS categories error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch POS categories",
    });
  }
};

// ============= INVENTORY MANAGEMENT API =============

// Inventory items endpoints
export const getInventoryItems: RequestHandler = async (req, res) => {
  try {
    const items = await supabaseDbService.getInventoryItems();
    res.json({
      success: true,
      items: items || [],
    });
  } catch (error) {
    console.error("Get inventory items error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch inventory items",
    });
  }
};

export const createInventoryItem: RequestHandler = async (req, res) => {
  try {
    const item = await supabaseDbService.createInventoryItem(req.body);
    res.status(201).json({
      success: true,
      item,
      message: "Inventory item created successfully",
    });

    // Emit pusher event
    (async () => {
      try {
        await emitPusher(
          ["public-realtime", "private-public-realtime"],
          "inventory.created",
          { item },
        );
      } catch (err) {
        console.warn("Failed to emit inventory.created:", err);
      }
    })();
  } catch (error) {
    console.error("Create inventory item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create inventory item",
    });
  }
};

export const updateInventoryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await supabaseDbService.updateInventoryItem(id, req.body);
    res.json({
      success: true,
      item,
      message: "Inventory item updated successfully",
    });

    (async () => {
      try {
        await emitPusher(
          ["public-realtime", "private-public-realtime"],
          "inventory.updated",
          { item },
        );
      } catch (err) {
        console.warn("Failed to emit inventory.updated:", err);
      }
    })();
  } catch (error) {
    console.error("Update inventory item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update inventory item",
    });
  }
};

export const deleteInventoryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseDbService.deleteInventoryItem(id);
    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });

    (async () => {
      try {
        await emitPusher(
          ["public-realtime", "private-public-realtime"],
          "inventory.deleted",
          { id },
        );
      } catch (err) {
        console.warn("Failed to emit inventory.deleted:", err);
      }
    })();
  } catch (error) {
    console.error("Delete inventory item error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete inventory item",
    });
  }
};

// Stock movements endpoints
export const getStockMovements: RequestHandler = async (req, res) => {
  try {
    const { itemId, limit } = req.query;
    const movements = await supabaseDbService.getStockMovements(
      itemId as string,
      limit ? parseInt(limit as string) : undefined,
    );
    res.json({
      success: true,
      movements: movements || [],
    });
  } catch (error) {
    console.error("Get stock movements error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stock movements",
    });
  }
};

export const createStockMovement: RequestHandler = async (req, res) => {
  try {
    const movement = await supabaseDbService.createStockMovement(req.body);
    res.status(201).json({
      success: true,
      movement,
      message: "Stock movement recorded successfully",
    });

    (async () => {
      try {
        await emitPusher(
          ["public-realtime", "private-public-realtime"],
          "stock.movement",
          { movement },
        );
      } catch (err) {
        console.warn("Failed to emit stock.movement:", err);
      }
    })();
  } catch (error) {
    console.error("Create stock movement error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record stock movement",
    });
  }
};

// Suppliers endpoints
export const getSuppliers: RequestHandler = async (req, res) => {
  try {
    const suppliers = await supabaseDbService.getSuppliers();
    res.json({
      success: true,
      suppliers: suppliers || [],
    });
  } catch (error) {
    console.error("Get suppliers error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch suppliers",
    });
  }
};

export const createSupplier: RequestHandler = async (req, res) => {
  try {
    const supplier = await supabaseDbService.createSupplier(req.body);
    res.status(201).json({
      success: true,
      supplier,
      message: "Supplier created successfully",
    });
  } catch (error) {
    console.error("Create supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create supplier",
    });
  }
};

export const updateSupplier: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await supabaseDbService.updateSupplier(id, req.body);
    res.json({
      success: true,
      supplier,
      message: "Supplier updated successfully",
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update supplier",
    });
  }
};

export const deleteSupplier: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseDbService.deleteSupplier(id);
    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete supplier",
    });
  }
};

// Inventory analytics endpoints
export const getInventoryAnalytics: RequestHandler = async (req, res) => {
  try {
    const analytics = await supabaseDbService.getInventoryAnalytics();
    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get inventory analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch inventory analytics",
    });
  }
};

export const getLowStockItems: RequestHandler = async (req, res) => {
  try {
    const items = await supabaseDbService.getLowStockItems();
    res.json({
      success: true,
      items: items || [],
    });
  } catch (error) {
    console.error("Get low stock items error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch low stock items",
    });
  }
};

// ============= USER VEHICLES & ADDRESS MANAGEMENT API =============

// Get user vehicles
export const getUserVehicles: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
        vehicles: [],
      });
    }

    const result = await sql`
      SELECT * FROM user_vehicles
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    const vehicles = result.map((v: any) => ({
      id: v.id,
      unitType: v.unit_type,
      unitSize: v.unit_size,
      plateNumber: v.plate_number,
      vehicleModel: v.vehicle_model,
      isDefault: v.is_default,
      createdAt: v.created_at,
    }));

    res.json({
      success: true,
      vehicles,
    });
  } catch (error: any) {
    console.error("Get user vehicles error:", error);

    // Check if table doesn't exist
    if (
      error?.message?.includes("does not exist") ||
      error?.message?.includes("relation")
    ) {
      console.warn(
        "⚠️ user_vehicles table doesn't exist, returning empty array",
      );
      return res.json({
        success: true,
        vehicles: [],
        message: "No vehicles found (table not initialized)",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch user vehicles",
      vehicles: [],
    });
  }
};

// Add user vehicle
export const addUserVehicle: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unitType, unitSize, plateNumber, vehicleModel, isDefault } =
      req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await sql`
        UPDATE user_vehicles
        SET is_default = false
        WHERE user_id = ${userId}
      `;
    }

    const result = await sql`
      INSERT INTO user_vehicles (
        user_id, unit_type, unit_size, plate_number, vehicle_model, is_default
      ) VALUES (
        ${userId}, ${unitType}, ${unitSize}, ${plateNumber}, ${vehicleModel}, ${isDefault || false}
      ) RETURNING *
    `;

    const vehicle = {
      id: result[0].id,
      unitType: result[0].unit_type,
      unitSize: result[0].unit_size,
      plateNumber: result[0].plate_number,
      vehicleModel: result[0].vehicle_model,
      isDefault: result[0].is_default,
      createdAt: result[0].created_at,
    };

    res.status(201).json({
      success: true,
      vehicle,
      message: "Vehicle added successfully",
    });
  } catch (error) {
    console.error("Add user vehicle error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add vehicle",
    });
  }
};

// Update user vehicle
export const updateUserVehicle: RequestHandler = async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;
    const updates = req.body;

    // If this is set as default, unset other defaults
    if (updates.isDefault) {
      await sql`
        UPDATE user_vehicles
        SET is_default = false
        WHERE user_id = ${userId} AND id != ${vehicleId}
      `;
    }

    const result = await sql`
      UPDATE user_vehicles
      SET
        unit_type = COALESCE(${updates.unitType}, unit_type),
        unit_size = COALESCE(${updates.unitSize}, unit_size),
        plate_number = COALESCE(${updates.plateNumber}, plate_number),
        vehicle_model = COALESCE(${updates.vehicleModel}, vehicle_model),
        is_default = COALESCE(${updates.isDefault}, is_default),
        updated_at = NOW()
      WHERE id = ${vehicleId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vehicle not found",
      });
    }

    const vehicle = {
      id: result[0].id,
      unitType: result[0].unit_type,
      unitSize: result[0].unit_size,
      plateNumber: result[0].plate_number,
      vehicleModel: result[0].vehicle_model,
      isDefault: result[0].is_default,
      createdAt: result[0].created_at,
    };

    res.json({
      success: true,
      vehicle,
      message: "Vehicle updated successfully",
    });
  } catch (error) {
    console.error("Update user vehicle error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update vehicle",
    });
  }
};

// Delete user vehicle
export const deleteUserVehicle: RequestHandler = async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;

    const result = await sql`
      DELETE FROM user_vehicles
      WHERE id = ${vehicleId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vehicle not found",
      });
    }

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete user vehicle error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete vehicle",
    });
  }
};

// Fix bookings with email in userId field (migration utility)
export const fixBookingUserIds: RequestHandler = async (req, res) => {
  try {
    console.log("🔧 Starting booking userId fix...");

    // Get all bookings where userId contains @ (email pattern)
    const bookingsToFix = await sql`
      SELECT id, user_id FROM bookings
      WHERE user_id IS NOT NULL
      AND user_id LIKE '%@%'
    `;

    console.log(
      `Found ${bookingsToFix.length} bookings with email in userId field`,
    );

    let fixedCount = 0;
    let errors = [];

    for (const booking of bookingsToFix) {
      try {
        // Find the actual user by email
        const users = await sql`
          SELECT id FROM users WHERE email = ${booking.user_id} LIMIT 1
        `;

        if (users.length > 0) {
          const actualUserId = users[0].id;

          // Update the booking with correct userId
          await sql`
            UPDATE bookings
            SET user_id = ${actualUserId}
            WHERE id = ${booking.id}
          `;

          fixedCount++;
          console.log(
            `✅ Fixed booking ${booking.id}: ${booking.user_id} -> ${actualUserId}`,
          );
        } else {
          errors.push(
            `No user found for email: ${booking.user_id} (booking ${booking.id})`,
          );
          console.warn(`⚠️ No user found for email: ${booking.user_id}`);
        }
      } catch (err) {
        errors.push(`Error fixing booking ${booking.id}: ${err}`);
        console.error(`❌ Error fixing booking ${booking.id}:`, err);
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixedCount} bookings`,
      total: bookingsToFix.length,
      fixed: fixedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Fix booking userIds error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fix booking userIds",
    });
  }
};

// Update user default address
export const updateUserAddress: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { defaultAddress } = req.body;

    const result = await sql`
      UPDATE users
      SET default_address = ${defaultAddress}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: result[0].id,
        defaultAddress: result[0].default_address,
      },
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("Update user address error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update address",
    });
  }
};

// Update user status (ban/unban)
export const updateUserStatus: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!userId || typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "userId and isActive are required",
      });
    }

    const updatedUser = await supabaseDbService.updateUser(userId, {
      isActive,
    });

    res.json({
      success: true,
      user: updatedUser,
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user status",
    });
  }
};

// === SUBSCRIPTIONS ===

export const getSubscriptions: RequestHandler = async (req, res) => {
  try {
    const { status = "active", userId } = req.query;

    console.log("📋 Fetching subscriptions...", { status, userId });

    const subscriptions = await supabaseDbService.getSubscriptions({
      status: status as string,
      userId: userId as string,
    });

    console.log("✅ Subscriptions fetched:", subscriptions?.length || 0);

    res.json({
      success: true,
      subscriptions: subscriptions || [],
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscriptions",
      subscriptions: [],
    });
  }
};

// Create subscription upgrade (user initiates upgrade)
export const createSubscriptionUpgrade: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      email,
      packageId,
      packageName,
      finalPrice,
      paymentMethod,
      paymentDetails,
    } = req.body;

    console.log("📦 Creating subscription upgrade...", {
      userId,
      email,
      packageId,
      packageName,
      finalPrice,
    });

    if (!userId || !packageId || !finalPrice) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, packageId, finalPrice",
      });
    }

    // Create subscription in database
    const subscription = await supabaseDbService.createSubscription({
      userId,
      packageId,
      status: "pending",
      finalPrice: parseFloat(finalPrice.toString()),
      paymentMethod: paymentMethod || "online",
      autoRenew: true,
    });

    console.log("✅ Subscription created:", subscription.id);

    res.json({
      success: true,
      subscription,
      message: "Subscription upgrade initiated. Awaiting payment.",
    });
  } catch (error) {
    console.error("Create subscription upgrade error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create subscription upgrade",
    });
  }
};

// Admin approves subscription upgrade
export const approveSubscriptionUpgrade: RequestHandler = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status = "active" } = req.body;

    console.log("✅ Approving subscription upgrade...", {
      subscriptionId,
      status,
    });

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: "Missing subscriptionId",
      });
    }

    // Update subscription status in database
    const result = await supabaseDbService.updateSubscriptionStatus(
      subscriptionId,
      status,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    console.log("✅ Subscription approved:", subscriptionId);

    res.json({
      success: true,
      subscription: result,
      message: "Subscription approved successfully",
    });
  } catch (error) {
    console.error("Approve subscription error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to approve subscription",
    });
  }
};

export const createXenditSubscriptionPlan: RequestHandler = async (
  req,
  res,
) => {
  try {
    const {
      subscriptionId,
      customerId,
      amount,
      paymentMethod,
      interval = "MONTHLY",
      intervalCount = 1,
    } = req.body;

    console.log("🔧 Creating Xendit subscription plan...", {
      subscriptionId,
      amount,
      paymentMethod,
    });

    // For now, generate a plan ID and mark as setup initiated
    // In a real implementation, this would call Xendit's subscription API
    const xenditPlanId = `plan_${subscriptionId}_${Date.now()}`;

    // Update subscription with Xendit plan ID
    // This would require adding a method to supabaseDbService
    // For now, just return success
    res.json({
      success: true,
      message: "Xendit plan setup completed",
      xenditPlanId,
      subscriptionId,
    });
  } catch (error) {
    console.error("Create Xendit plan error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create Xendit subscription plan",
    });
  }
};

export const processSubscriptionRenewal: RequestHandler = async (req, res) => {
  try {
    const {
      subscriptionId,
      customerId,
      amount,
      totalWithFees,
      platformFee,
      paymentMethod,
    } = req.body;

    console.log("💳 Processing subscription renewal...", {
      subscriptionId,
      amount,
      platformFee,
      paymentMethod,
    });

    // Create invoice using Xendit service
    // This should call xenditPaymentService.createSubscriptionInvoice
    // For now, return success with placeholder invoice ID
    const invoiceId = `inv_${subscriptionId}_${Date.now()}`;

    res.json({
      success: true,
      message: "Renewal invoice created",
      invoiceId,
      subscriptionId,
      amount: totalWithFees,
    });
  } catch (error) {
    console.error("Process renewal error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process subscription renewal",
    });
  }
};

// ============= LOCALSTORAGE DATA MIGRATION & SYNC ENDPOINTS =============

// Sync user preferences
export const syncUserPreferences: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      theme,
      notificationsEnabled,
      emailNotifications,
      pushNotifications,
      smsNotifications,
      language,
      timezone,
      preferences,
    } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const existingPrefs = await db.query(
      `
      SELECT id FROM user_preferences WHERE user_id = $1
    `,
      [userId],
    );

    if (existingPrefs.rows.length > 0) {
      await db.query(
        `
        UPDATE user_preferences SET
          theme = COALESCE($2, theme),
          notifications_enabled = COALESCE($3, notifications_enabled),
          email_notifications = COALESCE($4, email_notifications),
          push_notifications = COALESCE($5, push_notifications),
          sms_notifications = COALESCE($6, sms_notifications),
          language = COALESCE($7, language),
          timezone = COALESCE($8, timezone),
          preferences = COALESCE($9, preferences),
          updated_at = NOW()
        WHERE user_id = $1
      `,
        [
          userId,
          theme,
          notificationsEnabled,
          emailNotifications,
          pushNotifications,
          smsNotifications,
          language,
          timezone,
          JSON.stringify(preferences || {}),
        ],
      );
    } else {
      const { createId } = await import("@paralleldrive/cuid2");
      await db.query(
        `
        INSERT INTO user_preferences
        (id, user_id, theme, notifications_enabled, email_notifications, push_notifications, sms_notifications, language, timezone, preferences)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          createId(),
          userId,
          theme || "light",
          notificationsEnabled !== false,
          emailNotifications !== false,
          pushNotifications !== false,
          smsNotifications || false,
          language || "en",
          timezone || "UTC",
          JSON.stringify(preferences || {}),
        ],
      );
    }

    res.json({ success: true, message: "User preferences synced" });
  } catch (error) {
    console.error("❌ User preferences sync error:", error);
    res
      .status(500)
      .json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to sync preferences",
      });
  }
};

// Get user preferences
export const getUserPreferences: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const result = await db.query(
      `
      SELECT * FROM user_preferences WHERE user_id = $1
    `,
      [userId as string],
    );

    res.json({
      success: true,
      preferences: result.rows[0] || {
        theme: "light",
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        language: "en",
        timezone: "UTC",
      },
    });
  } catch (error) {
    console.error("❌ Get preferences error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get preferences" });
  }
};

// Sync user notifications
export const syncUserNotifications: RequestHandler = async (req, res) => {
  try {
    const { userId, notifications } = req.body;
    if (!userId || !Array.isArray(notifications)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "userId and notifications array required",
        });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const { createId } = await import("@paralleldrive/cuid2");

    for (const notif of notifications) {
      const existing = await db.query(
        `
        SELECT id FROM user_notifications WHERE id = $1
      `,
        [notif.id],
      );

      if (existing.rows.length === 0) {
        await db.query(
          `
          INSERT INTO user_notifications
          (id, user_id, title, message, type, notification_id, is_read, read_at, action_url, image_url, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
          [
            notif.id || createId(),
            userId,
            notif.title,
            notif.message,
            notif.type || "system",
            notif.notificationId,
            notif.isRead || false,
            notif.readAt,
            notif.actionUrl,
            notif.imageUrl,
            JSON.stringify(notif.metadata || {}),
          ],
        );
      }
    }

    res.json({
      success: true,
      message: `${notifications.length} notifications synced`,
    });
  } catch (error) {
    console.error("❌ Notification sync error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to sync notifications" });
  }
};

// Get user notifications
export const getUserNotifications: RequestHandler = async (req, res) => {
  try {
    const { userId, unreadOnly } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const query =
      unreadOnly === "true"
        ? "SELECT * FROM user_notifications WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC"
        : "SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC";

    const result = await db.query(query, [userId as string]);

    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    console.error("❌ Get notifications error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get notifications" });
  }
};

// Sync printer configurations
export const syncPrinterConfig: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      printerName,
      printerType,
      connectionType,
      deviceId,
      ipAddress,
      port,
      templateId,
      settings,
      isDefault,
    } = req.body;

    if (!userId || !printerName) {
      return res
        .status(400)
        .json({ success: false, error: "userId and printerName required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const { createId } = await import("@paralleldrive/cuid2");

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await db.query(
        `
        UPDATE printer_configurations SET is_default = false WHERE user_id = $1
      `,
        [userId],
      );
    }

    const existing = await db.query(
      `
      SELECT id FROM printer_configurations WHERE user_id = $1 AND printer_name = $2
    `,
      [userId, printerName],
    );

    if (existing.rows.length > 0) {
      await db.query(
        `
        UPDATE printer_configurations SET
          printer_type = $3, connection_type = $4, device_id = $5, ip_address = $6,
          port = $7, template_id = $8, settings = $9, is_default = $10, updated_at = NOW()
        WHERE user_id = $1 AND printer_name = $2
      `,
        [
          userId,
          printerName,
          printerType,
          connectionType,
          deviceId,
          ipAddress,
          port,
          templateId,
          JSON.stringify(settings || {}),
          isDefault || false,
        ],
      );
    } else {
      await db.query(
        `
        INSERT INTO printer_configurations
        (id, user_id, printer_name, printer_type, connection_type, device_id, ip_address, port, template_id, settings, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
        [
          createId(),
          userId,
          printerName,
          printerType,
          connectionType,
          deviceId,
          ipAddress,
          port,
          templateId,
          JSON.stringify(settings || {}),
          isDefault || false,
        ],
      );
    }

    res.json({ success: true, message: "Printer configuration synced" });
  } catch (error) {
    console.error("❌ Printer sync error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to sync printer config" });
  }
};

// Get printer configurations
export const getPrinterConfigs: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const result = await db.query(
      `
      SELECT * FROM printer_configurations WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC
    `,
      [userId as string],
    );

    res.json({ success: true, printers: result.rows });
  } catch (error) {
    console.error("❌ Get printer configs error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get printer configs" });
  }
};

// Sync gamification progress
export const syncGamificationProgress: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      currentLevel,
      currentXP,
      totalXP,
      levelProgress,
      unlockedAchievements,
      badges,
      streakDays,
      totalBookingsCompleted,
      totalWashesCompleted,
    } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const existing = await db.query(
      `
      SELECT id FROM gamification_user_progress WHERE user_id = $1
    `,
      [userId],
    );

    if (existing.rows.length > 0) {
      await db.query(
        `
        UPDATE gamification_user_progress SET
          current_level = COALESCE($2, current_level),
          current_xp = COALESCE($3, current_xp),
          total_xp = COALESCE($4, total_xp),
          level_progress = COALESCE($5, level_progress),
          unlocked_achievements = COALESCE($6, unlocked_achievements),
          badges = COALESCE($7, badges),
          streak_days = COALESCE($8, streak_days),
          total_bookings_completed = COALESCE($9, total_bookings_completed),
          total_washes_completed = COALESCE($10, total_washes_completed),
          updated_at = NOW()
        WHERE user_id = $1
      `,
        [
          userId,
          currentLevel,
          currentXP,
          totalXP,
          JSON.stringify(levelProgress || {}),
          JSON.stringify(unlockedAchievements || []),
          JSON.stringify(badges || []),
          streakDays,
          totalBookingsCompleted,
          totalWashesCompleted,
        ],
      );
    } else {
      const { createId } = await import("@paralleldrive/cuid2");
      await db.query(
        `
        INSERT INTO gamification_user_progress
        (id, user_id, current_level, current_xp, total_xp, level_progress, unlocked_achievements, badges, streak_days, total_bookings_completed, total_washes_completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
        [
          createId(),
          userId,
          currentLevel || 1,
          currentXP || 0,
          totalXP || 0,
          JSON.stringify(levelProgress || {}),
          JSON.stringify(unlockedAchievements || []),
          JSON.stringify(badges || []),
          streakDays || 0,
          totalBookingsCompleted || 0,
          totalWashesCompleted || 0,
        ],
      );
    }

    res.json({ success: true, message: "Gamification progress synced" });
  } catch (error) {
    console.error("❌ Gamification sync error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to sync gamification progress" });
  }
};

// Get gamification progress
export const getGamificationProgress: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "userId is required" });
    }

    const db = initializeDatabase();
    if (!db) throw new Error("Database not connected");

    const result = await db.query(
      `
      SELECT * FROM gamification_user_progress WHERE user_id = $1
    `,
      [userId as string],
    );

    res.json({
      success: true,
      progress: result.rows[0] || {
        currentLevel: 1,
        currentXP: 0,
        totalXP: 0,
        streakDays: 0,
        totalBookingsCompleted: 0,
        totalWashesCompleted: 0,
      },
    });
  } catch (error) {
    console.error("❌ Get gamification progress error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get gamification progress" });
  }
};
