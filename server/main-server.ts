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
import imagesApiRoutes from "./routes/images-api";
import cmsApiRoutes from "./routes/cms-api";
import { seedBranches } from "./database/seed-branches";
import { seedUsers } from "./database/seed-users";
import { migrate } from "./database/migrate";
import * as branchesApi from "./routes/branches-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createServer = () => {
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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        neon: "connected",
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

  // API Routes
  app.use("/api", demoRoutes);
  app.use("/api", customerApiRoutes);
  app.use("/api", otpApiRoutes);

  // Neon Database API Routes
  app.post("/api/neon/init", neonApiRoutes.initializeNeonDB);
  app.get("/api/neon/test", neonApiRoutes.testNeonConnection);
  app.get("/api/neon/stats", neonApiRoutes.getDatabaseStats);
  app.get("/api/neon/realtime-stats", neonApiRoutes.getRealtimeStats);
  app.get("/api/neon/fac-map-stats", neonApiRoutes.getFacMapStats);

  // Auth endpoints
  app.post("/api/neon/auth/login", neonApiRoutes.loginUser);
  app.post("/api/neon/auth/register", neonApiRoutes.registerUser);

  // Booking endpoints
  app.post("/api/neon/bookings", neonApiRoutes.createBooking);
  app.get("/api/neon/bookings", neonApiRoutes.getBookings);
  app.put("/api/neon/bookings/:id", neonApiRoutes.updateBooking);

  // Subscription endpoints
  app.get("/api/neon/subscriptions", neonApiRoutes.getSubscriptions);
  app.post(
    "/api/neon/subscriptions/upgrade",
    neonApiRoutes.createSubscriptionUpgrade,
  );
  app.put(
    "/api/neon/subscriptions/:subscriptionId/approve",
    neonApiRoutes.approveSubscriptionUpgrade,
  );
  app.post(
    "/api/neon/subscription/xendit/create-plan",
    neonApiRoutes.createXenditSubscriptionPlan,
  );
  app.post(
    "/api/neon/subscription/xendit/process-renewal",
    neonApiRoutes.processSubscriptionRenewal,
  );

  // Notification endpoints
  app.get("/api/neon/notifications", neonApiRoutes.getNotifications);
  app.put(
    "/api/neon/notifications/:notificationId/read",
    neonApiRoutes.markNotificationRead,
  );

  // Admin settings endpoints
  app.get("/api/neon/settings", neonApiRoutes.getSettings);
  app.put("/api/neon/settings", neonApiRoutes.updateSetting);

  // Ads endpoints
  app.get("/api/neon/ads", neonApiRoutes.getAds);
  app.post("/api/neon/ads", neonApiRoutes.createAd);
  app.post("/api/neon/ads/:adId/dismiss", neonApiRoutes.dismissAd);

  // ============= NEW FEATURES API ROUTES =============

  // Branches endpoints
  app.get("/api/neon/branches", neonApiRoutes.getBranches);
  app.post("/api/neon/branches", branchesApi.createBranch);

  // Service packages endpoints
  app.get("/api/neon/packages", neonApiRoutes.getServicePackages);

  // Gamification endpoints
  app.get("/api/neon/gamification/levels", neonApiRoutes.getCustomerLevels);

  // POS endpoints
  app.get("/api/neon/pos/categories", neonApiRoutes.getPOSCategories);

  // Analytics endpoints
  app.get("/api/neon/analytics", neonApiRoutes.getAnalyticsData);

  // Xendit Payment endpoints
  app.post(
    "/api/neon/payment/xendit/create-invoice",
    xenditApiRoutes.createInvoice,
  );
  app.post("/api/neon/payment/xendit/charge", xenditApiRoutes.chargeCard);
  app.post("/api/neon/payment/xendit/webhook", xenditApiRoutes.handleWebhook);

  // Users endpoints (for customer management)
  app.get("/api/neon/users", neonApiRoutes.getAllUsers);

  // Admin utilities
  app.post(
    "/api/neon/admin/fix-booking-userids",
    neonApiRoutes.fixBookingUserIds,
  );

  // User vehicles and address endpoints
  app.get("/api/neon/users/:userId/vehicles", neonApiRoutes.getUserVehicles);
  app.post("/api/neon/users/:userId/vehicles", neonApiRoutes.addUserVehicle);
  app.put(
    "/api/neon/users/:userId/vehicles/:vehicleId",
    neonApiRoutes.updateUserVehicle,
  );
  app.delete(
    "/api/neon/users/:userId/vehicles/:vehicleId",
    neonApiRoutes.deleteUserVehicle,
  );
  app.put("/api/neon/users/:userId/address", neonApiRoutes.updateUserAddress);

  // ============= CREW MANAGEMENT API =============
  app.get("/api/neon/crew/stats", crewApiRoutes.getCrewStats);
  app.get("/api/neon/crew/activity", crewApiRoutes.getCrewActivity);
  app.get("/api/neon/crew/list", crewApiRoutes.getCrewList);
  app.get("/api/neon/crew/groups", crewApiRoutes.getCrewGroups);
  app.post("/api/neon/crew/seed", crewApiRoutes.seedCrew); // For development only

  // ============= FIREBASE PUSH NOTIFICATIONS API =============
  app.use("/api/notifications", notificationsApiRoutes);

  // ============= IMAGE MANAGEMENT API =============
  app.use("/api/images", imagesApiRoutes);

  // ============= CMS CONTENT MANAGEMENT API =============
  console.log("🎨 Registering CMS API routes...");
  app.use("/api/cms", cmsApiRoutes);
  console.log("🎨 CMS API routes registered successfully");

  // Serve React admin app for everything that's NOT an API route
  const reactBuildPath = path.join(__dirname, "../dist/spa");
  app.use(express.static(reactBuildPath));

  // Only serve React app for non-API routes
  app.get("*", (req, res, next) => {
    // Skip if it's an API route
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(reactBuildPath, "index.html"));
  });

  return app;
};

// Only start server if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = createServer();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 FAC Server running on port ${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin-dashboard`);
    console.log(`🏠 Home: http://localhost:${PORT}/`);

    // Initialize database and seed data on server startup
    setTimeout(async () => {
      try {
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
}
