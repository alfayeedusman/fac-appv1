import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import demoRoutes from "./routes/demo";
import customerApiRoutes from "./routes/customer-api";
import otpApiRoutes from "./routes/otp-api";
import * as neonApiRoutes from "./routes/neon-api";
import * as crewApiRoutes from "./routes/crew-api";
import * as xenditApiRoutes from "./routes/xendit-api";
import notificationsApiRoutes from "./routes/notifications-api";
import * as gamificationApiRoutes from "./routes/gamification-api";
import imagesApiRoutes from "./routes/images-api";
import cmsApiRoutes from "./routes/cms-api";
import { seedBranches } from "./database/seed-branches";
import { seedUsers } from "./database/seed-users";
import { migrate } from "./database/migrate";
import * as branchesApi from "./routes/branches-api";
import { validateEnvironment } from "./utils/validateEnvironment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment on startup
validateEnvironment();

export const createServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware - CORS configuration
  const corsOptions = {
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow localhost and development URLs
      const allowedOrigins = [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
      ];

      // Add FRONTEND_URL if configured
      if (
        process.env.FRONTEND_URL &&
        !allowedOrigins.includes(process.env.FRONTEND_URL)
      ) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }

      // In production, also allow same-origin requests (frontend served from same domain)
      // and requests from the current host
      if (process.env.NODE_ENV === "production") {
        // Allow all requests in production to same domain (Netlify, Builder.io, etc.)
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`⚠️ CORS request from origin: ${origin}`);
        callback(null, true); // Allow in dev, restrict in prod if needed
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Cache control middleware - prevent browser from caching index.html and stale assets
  app.use((req, res, next) => {
    // Never cache HTML files (index.html)
    if (req.path === "/" || req.path.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    // Cache static assets with versioning for 1 year
    else if (
      /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(req.path)
    ) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
    // Default: no caching for dynamic content
    else {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    next();
  });

  // Error logging middleware
  app.use(requestLogger);

  // ============= CRITICAL: DATABASE INITIALIZATION =============
  // Ensure database is initialized before ANY API request
  // This runs automatically on first request to any /api endpoint
  app.use("/api", ensureDatabaseInitialized);

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      // Actually test database connectivity
      const { testConnection } = await import("./database/connection");
      const dbConnected = await testConnection();

      res.json({
        status: dbConnected ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        services: {
          neon: dbConnected ? "connected" : "disconnected",
        },
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          neon: "error",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // API Routes
  app.use("/api", demoRoutes);
  app.use("/api", otpApiRoutes);
  app.use("/api/v2", customerApiRoutes);
  app.use("/api/images", imagesApiRoutes);
  app.use("/api/notifications", notificationsApiRoutes);

  // Gamification endpoints (mobile-ready)
  app.get("/api/gamification/levels", gamificationApiRoutes.getCustomerLevels);
  app.post(
    "/api/gamification/levels",
    gamificationApiRoutes.createCustomerLevel,
  );
  app.put(
    "/api/gamification/levels/:id",
    gamificationApiRoutes.updateCustomerLevel,
  );
  app.get(
    "/api/gamification/levels/user/:userId",
    gamificationApiRoutes.getUserLevel,
  );
  app.get(
    "/api/gamification/achievements",
    gamificationApiRoutes.getAchievements,
  );
  app.post(
    "/api/gamification/achievements",
    gamificationApiRoutes.createAchievement,
  );
  app.get(
    "/api/gamification/achievements/user/:userId",
    gamificationApiRoutes.getUserAchievements,
  );
  app.post(
    "/api/gamification/achievements/award",
    gamificationApiRoutes.awardAchievement,
  );
  app.post(
    "/api/gamification/achievements/complete",
    gamificationApiRoutes.completeAchievement,
  );
  app.get(
    "/api/gamification/loyalty/:userId",
    gamificationApiRoutes.getLoyaltyTransactions,
  );
  app.post(
    "/api/gamification/loyalty/add",
    gamificationApiRoutes.addLoyaltyPoints,
  );
  app.post(
    "/api/gamification/loyalty/redeem",
    gamificationApiRoutes.redeemLoyaltyPoints,
  );
  app.get(
    "/api/gamification/dashboard/:userId",
    gamificationApiRoutes.getGamificationDashboard,
  );

  // ============= CRITICAL PRODUCTION ROUTES =============
  app.use("/api/realtime", realtimeApiRoutes);
  app.use("/api/cms", cmsApiRoutes);
  app.use("/api/pos", posApiRoutes);

  // Supabase Database API Routes
  app.post("/api/supabase/init", neonApiRoutes.initializeSupabaseDB);
  app.get("/api/supabase/test", neonApiRoutes.testSupabaseConnection);
  app.get("/api/supabase/diagnose", neonApiRoutes.diagnoseDatabase);
  app.get("/api/supabase/stats", neonApiRoutes.getDatabaseStats);
  app.get("/api/supabase/realtime-stats", neonApiRoutes.getRealtimeStats);
  app.get("/api/supabase/fac-map-stats", neonApiRoutes.getFacMapStats);

  // Auth endpoints
  app.post("/api/supabase/auth/login", neonApiRoutes.loginUser);
  app.post("/api/supabase/auth/register", neonApiRoutes.registerUser);
  app.post("/api/supabase/auth/logout", neonApiRoutes.logoutUser); // invalidate current session token
  app.post("/api/supabase/auth/debug", neonApiRoutes.debugLogin); // Debug endpoint for testing passwords

  // Session management (admin)
  app.post("/api/supabase/sessions/revoke", neonApiRoutes.revokeSession);
  app.get("/api/supabase/sessions", neonApiRoutes.getSessions);

  // Booking endpoints
  app.post("/api/supabase/bookings", neonApiRoutes.createBooking);
  app.get("/api/supabase/bookings", neonApiRoutes.getBookings);
  app.get(
    "/api/supabase/bookings/availability",
    neonApiRoutes.getSlotAvailability,
  );
  app.get(
    "/api/supabase/bookings/garage-settings",
    neonApiRoutes.getGarageSettings,
  );
  app.put("/api/supabase/bookings/:id", neonApiRoutes.updateBooking);

  // Subscription endpoints
  app.get("/api/supabase/subscriptions", neonApiRoutes.getSubscriptions);
  app.post(
    "/api/supabase/subscriptions/upgrade",
    neonApiRoutes.createSubscriptionUpgrade,
  );
  app.put(
    "/api/supabase/subscriptions/:subscriptionId/approve",
    neonApiRoutes.approveSubscriptionUpgrade,
  );
  app.post(
    "/api/supabase/subscriptions/create-plan",
    neonApiRoutes.createXenditSubscriptionPlan,
  );
  app.post(
    "/api/supabase/subscriptions/process-renewal",
    neonApiRoutes.processSubscriptionRenewal,
  );

  // Notification endpoints
  app.get("/api/supabase/notifications", neonApiRoutes.getNotifications);
  app.put(
    "/api/supabase/notifications/:notificationId/read",
    neonApiRoutes.markNotificationRead,
  );

  // Admin settings endpoints
  app.get("/api/supabase/settings", neonApiRoutes.getSettings);
  app.put("/api/supabase/settings", neonApiRoutes.updateSetting);
  app.get("/api/supabase/admin/api-catalog", neonApiRoutes.getApiCatalog);

  // Daily income endpoints
  app.get("/api/supabase/daily-income", neonApiRoutes.getDailyIncome);
  app.post("/api/supabase/daily-income", neonApiRoutes.createDailyIncome);

  // Ads endpoints
  app.get("/api/supabase/ads", neonApiRoutes.getAds);
  app.post("/api/supabase/ads", neonApiRoutes.createAd);
  app.post("/api/supabase/ads/:adId/dismiss", neonApiRoutes.dismissAd);

  // New features endpoints
  app.get("/api/supabase/branches", neonApiRoutes.getBranches);
  app.post("/api/supabase/branches/seed", neonApiRoutes.seedBranchesEndpoint);
  app.post("/api/supabase/branches", branchesApiRoutes.createBranch);
  app.put("/api/supabase/branches/:id", branchesApiRoutes.updateBranch);
  app.delete("/api/supabase/branches/:id", branchesApiRoutes.deleteBranch);
  app.get("/api/supabase/packages", neonApiRoutes.getServicePackages);
  app.post("/api/supabase/packages", neonApiRoutes.createServicePackage);
  app.put("/api/supabase/packages/:id", neonApiRoutes.updateServicePackage);
  app.delete("/api/supabase/packages/:id", neonApiRoutes.deleteServicePackage);
  app.get("/api/supabase/gamification/levels", neonApiRoutes.getCustomerLevels);
  app.get("/api/supabase/pos/categories", neonApiRoutes.getPOSCategories);

  // Analytics endpoints
  app.get("/api/supabase/analytics", neonApiRoutes.getAnalyticsData);

  // Voucher endpoints
  app.get("/api/supabase/vouchers", neonApiRoutes.getVouchers);
  app.post("/api/supabase/vouchers/validate", neonApiRoutes.validateVoucher);
  app.post("/api/supabase/vouchers/redeem", neonApiRoutes.redeemVoucher);

  // Xendit Payment endpoints - TEST
  app.get("/api/supabase/payment/xendit/test", (req, res) => {
    res.json({ success: true, message: "Xendit routes are working!" });
  });

  // Explicitly handle OPTIONS for CORS preflight on all xendit endpoints
  app.options("/api/supabase/payment/xendit/*", cors());

  app.post(
    "/api/supabase/payment/xendit/create-invoice",
    xenditApiRoutes.createInvoice,
  );
  app.get(
    "/api/supabase/payment/xendit/methods",
    xenditApiRoutes.listPaymentMethods,
  );
  app.post(
    "/api/supabase/payment/xendit/create-subscription-invoice",
    xenditApiRoutes.createSubscriptionInvoice,
  );
  app.post("/api/supabase/payment/xendit/charge", xenditApiRoutes.chargeCard);
  app.post(
    "/api/supabase/payment/xendit/confirm-offline",
    xenditApiRoutes.confirmOfflinePayment,
  );
  app.post(
    "/api/supabase/payment/xendit/webhook",
    xenditApiRoutes.handleWebhook,
  );
  app.get(
    "/api/supabase/payment/xendit/invoice-status/:id",
    xenditApiRoutes.getInvoiceStatus,
  );
  app.get(
    "/api/supabase/payment/xendit/booking-status/:bookingId",
    xenditApiRoutes.checkBookingPaymentStatus,
  );
  app.get(
    "/api/supabase/payment/xendit/subscription-status/:subscriptionId",
    xenditApiRoutes.checkSubscriptionPaymentStatus,
  );

  // Users endpoints
  app.get("/api/supabase/users", neonApiRoutes.getAllUsers);
  app.get("/api/supabase/customers", neonApiRoutes.getCustomers);
  app.get("/api/supabase/staff", neonApiRoutes.getStaffUsers);
  app.post("/api/supabase/staff", neonApiRoutes.createStaffUser);
  app.put("/api/supabase/users/:userId/status", neonApiRoutes.updateUserStatus);

  // Admin invite (protected by ADMIN_INVITE_SECRET header: x-admin-invite-secret)
  app.post("/api/supabase/admin/invite", adminInviteRoutes.createAdminInvite);

  // ============= CREW MANAGEMENT API =============
  app.get("/api/supabase/crew/stats", crewApiRoutes.getCrewStats);
  app.get("/api/supabase/crew/activity", crewApiRoutes.getCrewActivity);
  app.get("/api/supabase/crew/list", crewApiRoutes.getCrewList);
  app.get("/api/supabase/crew/groups", crewApiRoutes.getCrewGroups);
  app.put(
    "/api/supabase/crew/:userId/group",
    crewApiRoutes.updateCrewGroupAssignment,
  );
  app.put(
    "/api/supabase/crew/:userId/wash-bay",
    crewApiRoutes.updateCrewWashBayAssignment,
  );
  app.get(
    "/api/supabase/crew/commission-rates",
    crewApiRoutes.getCommissionRates,
  );
  app.post(
    "/api/supabase/crew/commission-rates",
    crewApiRoutes.upsertCommissionRate,
  );
  app.get(
    "/api/supabase/crew/commission-entries",
    crewApiRoutes.getCommissionEntries,
  );
  app.post(
    "/api/neon/crew/commission-entries",
    crewApiRoutes.createCommissionEntry,
  );
  app.put(
    "/api/neon/crew/commission-entries/:id/status",
    crewApiRoutes.updateCommissionEntryStatus,
  );
  app.get("/api/neon/crew/payouts", crewApiRoutes.getCrewPayouts);
  app.post("/api/neon/crew/payouts", crewApiRoutes.createCrewPayout);
  app.put(
    "/api/neon/crew/payouts/:id/status",
    crewApiRoutes.updateCrewPayoutStatus,
  );
  app.get("/api/neon/crew/payroll", crewApiRoutes.getCrewPayroll);
  app.get(
    "/api/neon/crew/commission-summary",
    crewApiRoutes.getCrewCommissionSummary,
  );
  app.post("/api/neon/crew/seed", crewApiRoutes.seedCrew);

  // Inventory endpoints
  app.get("/api/neon/inventory/items", neonApiRoutes.getInventoryItems);
  app.post("/api/neon/inventory/items", neonApiRoutes.createInventoryItem);
  app.put("/api/neon/inventory/items/:id", neonApiRoutes.updateInventoryItem);
  app.delete(
    "/api/neon/inventory/items/:id",
    neonApiRoutes.deleteInventoryItem,
  );

  // Stock movements endpoints
  app.get("/api/neon/inventory/movements", neonApiRoutes.getStockMovements);
  app.post("/api/neon/inventory/movements", neonApiRoutes.createStockMovement);

  // Suppliers endpoints
  app.get("/api/neon/inventory/suppliers", neonApiRoutes.getSuppliers);
  app.post("/api/neon/inventory/suppliers", neonApiRoutes.createSupplier);
  app.put("/api/neon/inventory/suppliers/:id", neonApiRoutes.updateSupplier);
  app.delete("/api/neon/inventory/suppliers/:id", neonApiRoutes.deleteSupplier);

  // Inventory analytics endpoints
  app.get("/api/neon/inventory/analytics", neonApiRoutes.getInventoryAnalytics);
  app.get("/api/neon/inventory/low-stock", neonApiRoutes.getLowStockItems);

  // Initialize database and seed data on server startup
  setTimeout(async () => {
    try {
      const skipDbInit =
        process.env.SKIP_MIGRATIONS === "true" ||
        process.env.DISABLE_MIGRATIONS === "true" ||
        (!process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL);

      if (skipDbInit) {
        logInit("Skipping database migrations and seeding (DB init disabled).");
        return;
      }

      logInit("Initializing database and running migrations...");
      await import("./database/migrate").then((m) => m.migrate());
      logInit("Database initialization and migrations completed successfully");

      logInit("Auto-seeding branch data...");
      await seedBranches();
      logInit("Branch seeding completed successfully");

      logInit("Auto-seeding user data...");
      await seedUsers();
      logInit("User seeding completed successfully");
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      console.log(
        "⚠️ Server is running but database may not be properly initialized",
      );
    }
  }, 1000);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
