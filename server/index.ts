import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import demoRoutes from "./routes/demo";
import customerApiRoutes from "./routes/customer-api";
import otpApiRoutes from "./routes/otp-api";
import databaseApiRoutes from "./routes/database-api";
import * as crewApiRoutes from "./routes/crew-api";
import * as xenditApiRoutes from "./routes/xendit-api";
import notificationsApiRoutes from "./routes/notifications-api";
import * as gamificationApiRoutes from "./routes/gamification-api";
import imagesApiRoutes from "./routes/images-api";
import cmsApiRoutes from "./routes/cms-api";
import posApiRoutes from "./routes/pos-api";
import realtimeApiRoutes from "./routes/realtime-api";
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

  // ============= CONSOLIDATED DATABASE API ROUTES =============
  console.log("📊 Registering Consolidated Database API routes...");
  app.use("/api/supabase", databaseApiRoutes);
  console.log("✅ Consolidated Database API routes registered successfully");

  // Add health check middleware to critical auth routes
  app.post("/api/supabase/auth/login", ensureDbConnection);
  app.post("/api/supabase/auth/register", ensureDbConnection);

  // ============= POS API ROUTES =============
  console.log("🛒 Registering POS API routes...");
  app.use("/api/pos", posApiRoutes);
  app.use("/api/supabase/pos", posApiRoutes);
  console.log("✅ POS API routes registered successfully");

  // ============= XENDIT PAYMENT API =============
  app.get(
    "/api/supabase/payment/xendit/methods",
    xenditApiRoutes.listPaymentMethods,
  );
  app.post(
    "/api/supabase/payment/xendit/create-invoice",
    xenditApiRoutes.createInvoice,
  );
  app.post("/api/supabase/payment/xendit/charge", xenditApiRoutes.chargeCard);
  app.post(
    "/api/supabase/payment/xendit/webhook",
    xenditApiRoutes.handleWebhook,
  );

  // ============= APP VERSION MANAGEMENT =============
  app.use("/api", appVersionRoutes);

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
  app.get(
    "/api/supabase/crew/commission-summary",
    crewApiRoutes.getCrewCommissionSummary,
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

  // ============= REAL-TIME API (Pusher, WebSockets, etc.) =============
  console.log("🔌 Registering Real-time API routes...");
  app.use("/api/realtime", realtimeApiRoutes);
  console.log("🔌 Real-time API routes registered successfully");

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

  // ============= GLOBAL ERROR HANDLERS (must be last) =============
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

  // 404 handler - only for API routes that don't match
  app.use("/api", (req: any, res: any) => {
    console.warn("🤷 404 Not Found:", req.method, req.path);
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
      path: req.path,
    });
  });

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
}
