import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import demoRoutes from "./routes/demo.js";
import otpApiRoutes from "./routes/otp-api.js";
import * as neonApiRoutes from "./routes/neon-api.js";
import * as packagesApiRoutes from "./routes/packages-api.js";
import * as branchesApiRoutes from "./routes/branches-api.js";
import * as gamificationApiRoutes from "./routes/gamification-api.js";
import * as posApiRoutes from "./routes/pos-api.js";

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

  // API Routes
  app.use("/api", demoRoutes);
  app.use("/api", otpApiRoutes);
  
  // Neon Database API Routes
  app.post("/api/neon/init", neonApiRoutes.initializeNeonDB);
  app.get("/api/neon/test", neonApiRoutes.testNeonConnection);
  app.get("/api/neon/stats", neonApiRoutes.getDatabaseStats);
  
  // Auth endpoints
  app.post("/api/neon/auth/login", neonApiRoutes.loginUser);
  app.post("/api/neon/auth/register", neonApiRoutes.registerUser);
  
  // Booking endpoints
  app.post("/api/neon/bookings", neonApiRoutes.createBooking);
  app.get("/api/neon/bookings", neonApiRoutes.getBookings);
  app.put("/api/neon/bookings/:id", neonApiRoutes.updateBooking);
  
  // Notification endpoints
  app.get("/api/neon/notifications", neonApiRoutes.getNotifications);
  app.put("/api/neon/notifications/:notificationId/read", neonApiRoutes.markNotificationRead);
  
  // Admin settings endpoints
  app.get("/api/neon/settings", neonApiRoutes.getSettings);
  app.put("/api/neon/settings", neonApiRoutes.updateSetting);
  
  // Ads endpoints
  app.get("/api/neon/ads", neonApiRoutes.getAds);
  app.post("/api/neon/ads", neonApiRoutes.createAd);
  app.post("/api/neon/ads/:adId/dismiss", neonApiRoutes.dismissAd);

  // ============= SERVICE PACKAGES API ROUTES =============

  // Service packages endpoints
  app.get("/api/packages", packagesApiRoutes.getServicePackages);
  app.get("/api/packages/:id", packagesApiRoutes.getServicePackageById);
  app.post("/api/packages", packagesApiRoutes.createServicePackage);
  app.put("/api/packages/:id", packagesApiRoutes.updateServicePackage);
  app.delete("/api/packages/:id", packagesApiRoutes.deleteServicePackage);

  // Package subscriptions endpoints
  app.get("/api/packages/subscriptions/:userId", packagesApiRoutes.getUserSubscriptions);
  app.post("/api/packages/subscribe", packagesApiRoutes.subscribeToPackage);
  app.put("/api/packages/subscriptions/:id", packagesApiRoutes.updateSubscriptionStatus);

  // ============= BRANCHES API ROUTES =============

  // Branches endpoints
  app.get("/api/branches", branchesApiRoutes.getBranches);
  app.get("/api/branches/:id", branchesApiRoutes.getBranchById);
  app.get("/api/branches/code/:code", branchesApiRoutes.getBranchByCode);
  app.post("/api/branches", branchesApiRoutes.createBranch);
  app.put("/api/branches/:id", branchesApiRoutes.updateBranch);
  app.delete("/api/branches/:id", branchesApiRoutes.deleteBranch);
  app.get("/api/branches/nearby", branchesApiRoutes.getNearbyBranches);
  app.get("/api/branches/:id/stats", branchesApiRoutes.getBranchStats);
  app.get("/api/branches/:id/hours", branchesApiRoutes.getBranchHours);

  // ============= GAMIFICATION API ROUTES =============

  // Customer levels endpoints
  app.get("/api/gamification/levels", gamificationApiRoutes.getCustomerLevels);
  app.post("/api/gamification/levels", gamificationApiRoutes.createCustomerLevel);
  app.put("/api/gamification/levels/:id", gamificationApiRoutes.updateCustomerLevel);
  app.get("/api/gamification/users/:userId/level", gamificationApiRoutes.getUserLevel);

  // Achievements endpoints
  app.get("/api/gamification/achievements", gamificationApiRoutes.getAchievements);
  app.post("/api/gamification/achievements", gamificationApiRoutes.createAchievement);
  app.get("/api/gamification/users/:userId/achievements", gamificationApiRoutes.getUserAchievements);
  app.post("/api/gamification/achievements/award", gamificationApiRoutes.awardAchievement);
  app.post("/api/gamification/achievements/complete", gamificationApiRoutes.completeAchievement);

  // Loyalty transactions endpoints
  app.get("/api/gamification/users/:userId/transactions", gamificationApiRoutes.getLoyaltyTransactions);
  app.post("/api/gamification/loyalty/add", gamificationApiRoutes.addLoyaltyPoints);
  app.post("/api/gamification/loyalty/redeem", gamificationApiRoutes.redeemLoyaltyPoints);
  app.get("/api/gamification/users/:userId/dashboard", gamificationApiRoutes.getGamificationDashboard);

  // ============= POS API ROUTES =============

  // POS categories endpoints
  app.get("/api/pos/categories", posApiRoutes.getPOSCategories);
  app.post("/api/pos/categories", posApiRoutes.createPOSCategory);
  app.put("/api/pos/categories/:id", posApiRoutes.updatePOSCategory);

  // POS products endpoints
  app.get("/api/pos/products", posApiRoutes.getPOSProducts);
  app.get("/api/pos/products/:id", posApiRoutes.getPOSProductById);
  app.post("/api/pos/products", posApiRoutes.createPOSProduct);
  app.put("/api/pos/products/:id", posApiRoutes.updatePOSProduct);
  app.put("/api/pos/products/:id/stock", posApiRoutes.updateProductStock);

  // POS transactions endpoints
  app.get("/api/pos/transactions", posApiRoutes.getPOSTransactions);
  app.get("/api/pos/transactions/:id", posApiRoutes.getPOSTransactionById);
  app.post("/api/pos/transactions", posApiRoutes.createPOSTransaction);
  app.post("/api/pos/transactions/:id/refund", posApiRoutes.refundPOSTransaction);
  app.get("/api/pos/analytics", posApiRoutes.getPOSAnalytics);

  // Serve React admin app for everything
  const reactBuildPath = path.join(__dirname, "../dist/spa");
  app.use(express.static(reactBuildPath));

  // All routes serve React app
  app.get("*", (req, res) => {
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
  });
}
