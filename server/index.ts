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
import posApiRoutes from "./routes/pos-api";
import appVersionRoutes from "./routes/appVersion";
import { seedBranches } from "./database/seed-branches";
import { seedUsers } from "./database/seed-users";
import { migrate } from "./database/migrate";
import * as branchesApi from "./routes/branches-api";
import { validateEnvironment } from "./utils/validateEnvironment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment on startup
validateEnvironment();

export const createServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        // Reflect the request origin to support any frontend domain (including https)
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
    }),
  );
  // Ensure preflight requests are handled
  app.options("*", cors());
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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        supabase: "connected",
      },
    });
  });

  // Request logging middleware for debugging
  app.use("/api", (req, res, next) => {
    if (req.url.includes("users")) {
      console.log(`🌐 API Request: ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Import health check middleware
  const { ensureDbConnection } = await import("./middleware/dbHealthCheck");

  // API Routes
  app.use("/api", demoRoutes);
  app.use("/api", customerApiRoutes);
  app.use("/api", otpApiRoutes);

  // Neon Database API Routes
  app.post("/api/supabase/init", neonApiRoutes.initializeSupabaseDB);
  app.get("/api/supabase/test", neonApiRoutes.testSupabaseConnection);
  app.get("/api/supabase/db-check", neonApiRoutes.dbCheck);
  app.get("/api/supabase/stats", neonApiRoutes.getDatabaseStats);
  app.get("/api/supabase/realtime-stats", neonApiRoutes.getRealtimeStats);
  app.get("/api/supabase/fac-map-stats", neonApiRoutes.getFacMapStats);

  // DEBUG endpoints (for development only)
  app.post(
    "/api/supabase/debug/password-verify",
    neonApiRoutes.debugPasswordVerification,
  );
  app.get("/api/supabase/debug/list-users", neonApiRoutes.debugListUsers);
  app.post(
    "/api/supabase/debug/hash-password",
    neonApiRoutes.debugHashPassword,
  );
  app.post(
    "/api/supabase/admin/force-rehash-passwords",
    neonApiRoutes.adminForceRehashPasswords,
  );

  // Auth endpoints with database health check (critical routes)
  app.post(
    "/api/supabase/auth/login",
    ensureDbConnection,
    neonApiRoutes.loginUser,
  );
  app.post(
    "/api/supabase/auth/register",
    ensureDbConnection,
    neonApiRoutes.registerUser,
  );

  // Booking endpoints
  app.post("/api/supabase/bookings", neonApiRoutes.createBooking);
  app.get("/api/supabase/bookings", neonApiRoutes.getBookings);
  app.get("/api/supabase/bookings/garage-settings", neonApiRoutes.getGarageSettings);
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
    "/api/supabase/subscription/xendit/create-plan",
    neonApiRoutes.createXenditSubscriptionPlan,
  );
  app.post(
    "/api/supabase/subscription/xendit/process-renewal",
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

  // Daily income endpoints
  app.get("/api/supabase/daily-income", neonApiRoutes.getDailyIncome);
  app.post("/api/supabase/daily-income", neonApiRoutes.createDailyIncome);

  // Ads endpoints
  app.get("/api/supabase/ads", neonApiRoutes.getAds);
  app.post("/api/supabase/ads", neonApiRoutes.createAd);
  app.post("/api/supabase/ads/:adId/dismiss", neonApiRoutes.dismissAd);

  // ============= NEW FEATURES API ROUTES =============

  // Branches endpoints
  app.get("/api/supabase/branches", neonApiRoutes.getBranches);
  app.post("/api/supabase/branches", branchesApi.createBranch);

  // Service packages endpoints
  app.get("/api/supabase/packages", neonApiRoutes.getServicePackages);
  app.post("/api/supabase/packages", neonApiRoutes.createServicePackage);
  app.put("/api/supabase/packages/:id", neonApiRoutes.updateServicePackage);
  app.delete("/api/supabase/packages/:id", neonApiRoutes.deleteServicePackage);

  // Gamification endpoints
  app.get("/api/supabase/gamification/levels", neonApiRoutes.getCustomerLevels);

  // POS endpoints - register router for all POS routes
  // Register at both /api/pos and /api/supabase/pos for compatibility
  app.use("/api/pos", posApiRoutes);
  app.use("/api/supabase/pos", posApiRoutes);
  app.get("/api/supabase/pos/categories", neonApiRoutes.getPOSCategories);

  // Analytics endpoints
  app.get("/api/supabase/analytics", neonApiRoutes.getAnalyticsData);

  // App Version Management endpoints
  app.use("/api", appVersionRoutes);

  // Xendit Payment endpoints
  app.post(
    "/api/supabase/payment/xendit/create-invoice",
    xenditApiRoutes.createInvoice,
  );
  app.post("/api/supabase/payment/xendit/charge", xenditApiRoutes.chargeCard);
  app.post(
    "/api/supabase/payment/xendit/webhook",
    xenditApiRoutes.handleWebhook,
  );

  // Users endpoints (for customer management)
  app.get("/api/supabase/users", neonApiRoutes.getAllUsers);
  app.get("/api/supabase/customers", neonApiRoutes.getCustomers);
  app.get("/api/supabase/staff", neonApiRoutes.getStaffUsers);

  // Admin utilities
  app.post(
    "/api/supabase/admin/fix-booking-userids",
    neonApiRoutes.fixBookingUserIds,
  );

  // User vehicles and address endpoints
  app.get(
    "/api/supabase/users/:userId/vehicles",
    neonApiRoutes.getUserVehicles,
  );
  app.post(
    "/api/supabase/users/:userId/vehicles",
    neonApiRoutes.addUserVehicle,
  );
  app.put(
    "/api/supabase/users/:userId/vehicles/:vehicleId",
    neonApiRoutes.updateUserVehicle,
  );
  app.delete(
    "/api/supabase/users/:userId/vehicles/:vehicleId",
    neonApiRoutes.deleteUserVehicle,
  );
  app.put(
    "/api/supabase/users/:userId/address",
    neonApiRoutes.updateUserAddress,
  );
  app.put("/api/supabase/users/:userId/status", neonApiRoutes.updateUserStatus);

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
    "/api/supabase/crew/commission-entries",
    crewApiRoutes.createCommissionEntry,
  );
  app.put(
    "/api/supabase/crew/commission-entries/:id/status",
    crewApiRoutes.updateCommissionEntryStatus,
  );
  app.get("/api/supabase/crew/payouts", crewApiRoutes.getCrewPayouts);
  app.post("/api/supabase/crew/payouts", crewApiRoutes.createCrewPayout);
  app.put(
    "/api/supabase/crew/payouts/:id/status",
    crewApiRoutes.updateCrewPayoutStatus,
  );
  app.get("/api/supabase/crew/payroll", crewApiRoutes.getCrewPayroll);
  // Crew commission summary with safety wrapper
  app.get(
    "/api/supabase/crew/commission-summary",
    async (req, res, next) => {
      try {
        await crewApiRoutes.getCrewCommissionSummary(req, res, next);
      } catch (err) {
        console.error("Unhandled error in crew commission summary route:", err);
        if (!res.headersSent) {
          res.json({
            success: true,
            summary: {
              period: {
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
              },
              totalBookings: 0,
              totalRevenue: 0,
              totalCommission: 0,
              crewCount: 0,
              crew: [],
              breakdown: [],
            },
          });
        }
      }
    },
  );
  app.post("/api/supabase/crew/seed", crewApiRoutes.seedCrew); // For development only

  // ============= FIREBASE PUSH NOTIFICATIONS API =============
  app.use("/api/notifications", notificationsApiRoutes);

  // ============= GAMIFICATION API (mobile-ready) =============
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

  // ============= IMAGE MANAGEMENT API =============
  app.use("/api/images", imagesApiRoutes);

  // ============= CMS CONTENT MANAGEMENT API =============
  console.log("🎨 Registering CMS API routes...");
  app.use("/api/cms", cmsApiRoutes);
  console.log("🎨 CMS API routes registered successfully");

  // Fallback handler for SPA routing - MUST BE LAST
  // In production, serve built React app
  if (process.env.NODE_ENV === "production") {
    const reactBuildPath = path.join(__dirname, "../dist/spa");
    app.use(express.static(reactBuildPath));

    app.get("*", (req, res) => {
      // For any non-API route, serve index.html (SPA fallback)
      res.sendFile(path.join(reactBuildPath, "index.html"));
    });
  }
  // In development, Vite's appType: 'spa' configuration handles SPA fallback
  // Express just provides API routes, Vite handles everything else

  return app;
};

// Only start server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const app = await createServer();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 FAC Server running on port ${PORT}`);
      console.log(
        `📊 Admin Dashboard: http://localhost:${PORT}/admin-dashboard`,
      );
      console.log(`🏠 Home: http://localhost:${PORT}/`);

      // Initialize database and seed data on server startup
      setTimeout(async () => {
        try {
          const skipDbInit =
            process.env.SKIP_MIGRATIONS === "true" ||
            process.env.DISABLE_MIGRATIONS === "true" ||
            (!process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL);

          if (skipDbInit) {
            console.log(
              "⚠️ Skipping database migrations and seeding (DB init disabled).",
            );
            return;
          }

          console.log("🔄 Initializing database and running migrations...");
          await migrate();
          console.log(
            "✅ Database initialization and migrations completed successfully",
          );

          console.log("🏪 Auto-seeding branch data...");
          await seedBranches();
          console.log("✅ Branch seeding completed successfully");

          console.log("👥 Auto-seeding user data...");
          await seedUsers();
          console.log("✅ User seeding completed successfully");
        } catch (error) {
          console.error("❌ Initialization failed:", error);
          console.log(
            "⚠️ Server is running but database may not be properly initialized",
          );
        }
      }, 1000);
    });
  })();

  // Global error handler - catch any unhandled errors and return JSON
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("🚨 Global error handler caught error:", err?.message || err);

    // Check if response has already been sent
    if (res.headersSent) {
      return next(err);
    }

    // Ensure we always return JSON
    try {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: err?.message || "Unknown error occurred",
      });
    } catch (responseError) {
      console.error("Error sending error response:", responseError);
      return res.status(500).send("Internal server error");
    }
  });

  // 404 handler
  app.use((req: any, res: any) => {
    console.warn("🤷 404 Not Found:", req.method, req.path);
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
      path: req.path,
    });
  });
}
