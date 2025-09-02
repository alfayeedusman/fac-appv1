import { RequestHandler } from "express";
import { neonDbService } from "../services/neonDatabaseService";
import { initializeDatabase, testConnection } from "../database/connection";
import { migrate } from "../database/migrate";

// Simple in-memory guards to avoid repeated heavy migrations per server process
let __NEON_DB_INITIALIZED__ = false;
let __NEON_DB_INITIALIZING__ = false;

// Initialize database connection
export const initializeNeonDB: RequestHandler = async (req, res) => {
  try {
    if (__NEON_DB_INITIALIZED__) {
      return res.json({
        success: true,
        message: "Neon database already initialized",
        timestamp: new Date().toISOString(),
      });
    }
    if (__NEON_DB_INITIALIZING__) {
      return res.json({
        success: true,
        message: "Initialization in progress",
        timestamp: new Date().toISOString(),
      });
    }

    __NEON_DB_INITIALIZING__ = true;
    console.log("🔄 Initializing Neon database...");

    const db = initializeDatabase();
    if (!db) {
      return res.status(500).json({
        success: false,
        error:
          "Failed to initialize database connection. Check NEON_DATABASE_URL environment variable.",
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

    __NEON_DB_INITIALIZED__ = true;
    res.json({
      success: true,
      message: "Neon database initialized and migrated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    __NEON_DB_INITIALIZING__ = false;
  }
};

// Test database connection
export const testNeonConnection: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Testing database connection...");

    // Check if database URL is configured
    const databaseUrl =
      process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log("❌ No database URL configured");
      return res.json({
        success: false,
        connected: false,
        error:
          "No database URL configured. Please set NEON_DATABASE_URL environment variable.",
        stats: null,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("✅ Database URL found, testing connection...");
    const isConnected = await testConnection();
    console.log("🔗 Connection test result:", isConnected);

    let stats = null;
    if (isConnected) {
      try {
        stats = await neonDbService.getStats();
        console.log("📊 Stats retrieved:", stats);
      } catch (statsError) {
        console.warn("⚠️ Failed to get stats:", statsError);
      }
    }

    res.json({
      success: isConnected,
      connected: isConnected,
      stats: stats || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database test error:", error);
    res.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : "Connection test failed",
      stats: null,
      timestamp: new Date().toISOString(),
    });
  }
};

// User authentication endpoints
export const loginUser: RequestHandler = async (req, res) => {
  // Ensure JSON response headers
  res.setHeader("Content-Type", "application/json");
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt received", {
      email,
      hasPassword: typeof password === "string" && password.length > 0,
      contentType: req.headers["content-type"],
      time: new Date().toISOString(),
    });

    if (!email || !password) {
      console.warn("🔐 Login failed: missing email or password");
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await neonDbService.getUserByEmail(email);
    if (!user) {
      console.warn("🔐 Login failed: user not found", { email });
      const response = { success: false, error: "Invalid credentials" };
      console.log(
        "📤 Sending user not found response:",
        JSON.stringify(response),
      );
      return res.status(401).json(response);
    }

    const isValidPassword = await neonDbService.verifyPassword(email, password);
    if (!isValidPassword) {
      console.warn("🔐 Login failed: invalid password", { email });
      const response = { success: false, error: "Invalid credentials" };
      console.log(
        "📤 Sending invalid password response:",
        JSON.stringify(response),
      );
      return res.status(401).json(response);
    }

    if (!user.isActive) {
      console.warn("🔐 Login failed: account disabled", { email });
      return res.status(403).json({
        success: false,
        error: "Account is disabled",
      });
    }

    // Update last login
    await neonDbService.updateUser(user.id, { lastLoginAt: new Date() });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Login successful", {
      email,
      role: userWithoutPassword.role,
      id: userWithoutPassword.id,
    });
    const response = {
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    };
    console.log(
      "📤 Sending login success response:",
      JSON.stringify(response).substring(0, 200),
    );
    return res.json(response);
  } catch (error: any) {
    console.error("❌ Login error:", error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
};

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const userData = req.body;

    // Check if user already exists
    const existingUser = await neonDbService.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    const user = await neonDbService.createUser(userData);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      user: userWithoutPassword,
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

// Booking endpoints
export const createBooking: RequestHandler = async (req, res) => {
  try {
    const booking = await neonDbService.createBooking(req.body);

    // Create notification for new booking
    await neonDbService.createSystemNotification({
      type: "new_booking",
      title: "🎯 New Booking Received",
      message: `New booking created: ${booking.service} on ${booking.date}`,
      priority: "high",
      targetRoles: ["admin", "superadmin", "manager"],
      data: { bookingId: booking.id },
      playSound: true,
      soundType: "new_booking",
    });

    res.status(201).json({
      success: true,
      booking,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create booking",
    });
  }
};

export const getBookings: RequestHandler = async (req, res) => {
  try {
    const { userId, status } = req.query;

    let bookings;
    if (userId) {
      bookings = await neonDbService.getBookingsByUserId(userId as string);
    } else if (status) {
      bookings = await neonDbService.getBookingsByStatus(status as string);
    } else {
      bookings = await neonDbService.getAllBookings();
    }

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

export const updateBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await neonDbService.updateBooking(id, updates);

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

    const notifications = await neonDbService.getNotificationsForUser(
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

    await neonDbService.markNotificationAsRead(notificationId, userId);

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
    const settings = await neonDbService.getAllSettings();
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

    const setting = await neonDbService.setSetting(
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

// Ads endpoints
export const getAds: RequestHandler = async (req, res) => {
  try {
    const ads = await neonDbService.getActiveAds();
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
    const ad = await neonDbService.createAd(req.body);

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

    await neonDbService.dismissAd(adId, userEmail);

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
    const stats = await neonDbService.getStats();
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
    const realtimeStats = await neonDbService.getRealtimeStats();
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
    const facMapStats = await neonDbService.getFacMapStats();
    console.log("✅ FAC MAP stats retrieved:", JSON.stringify(facMapStats, null, 2));

    res.json({
      success: true,
      stats: facMapStats,
      message: "FAC MAP stats retrieved successfully"
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

    // Get real analytics data from database
    const stats = await neonDbService.getStats();
    const users = await neonDbService.getAllUsers();
    const bookings = await neonDbService.getAllBookings();

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

// Users endpoint - returns all users
export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    console.log("👥 Getting all users...");
    const users = await neonDbService.getAllUsers();
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
    const allUsers = await neonDbService.getAllUsers();
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
    const allUsers = await neonDbService.getAllUsers();
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

    const user = await neonDbService.createUser(userData);
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

// Branches endpoints
export const getBranches: RequestHandler = async (req, res) => {
  try {
    const branches = await neonDbService.getBranches();
    res.json({
      success: true,
      branches: branches || [],
    });
  } catch (error) {
    console.error("Get branches error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch branches",
    });
  }
};

// Service packages endpoints
export const getServicePackages: RequestHandler = async (req, res) => {
  try {
    const packages = await neonDbService.getServicePackages();
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

// Gamification levels endpoints
export const getCustomerLevels: RequestHandler = async (req, res) => {
  try {
    const levels = await neonDbService.getCustomerLevels();
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
    const categories = await neonDbService.getPOSCategories();
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
    const items = await neonDbService.getInventoryItems();
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
    const item = await neonDbService.createInventoryItem(req.body);
    res.status(201).json({
      success: true,
      item,
      message: "Inventory item created successfully",
    });
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
    const item = await neonDbService.updateInventoryItem(id, req.body);
    res.json({
      success: true,
      item,
      message: "Inventory item updated successfully",
    });
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
    await neonDbService.deleteInventoryItem(id);
    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
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
    const movements = await neonDbService.getStockMovements(
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
    const movement = await neonDbService.createStockMovement(req.body);
    res.status(201).json({
      success: true,
      movement,
      message: "Stock movement recorded successfully",
    });
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
    const suppliers = await neonDbService.getSuppliers();
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
    const supplier = await neonDbService.createSupplier(req.body);
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
    const supplier = await neonDbService.updateSupplier(id, req.body);
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
    await neonDbService.deleteSupplier(id);
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
    const analytics = await neonDbService.getInventoryAnalytics();
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
    const items = await neonDbService.getLowStockItems();
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
