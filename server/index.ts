import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import demoRoutes from "./routes/demo.js";
import customerApiRoutes from "./routes/customer-api.js";
import otpApiRoutes from "./routes/otp-api.js";
import * as neonApiRoutes from "./routes/neon-api.js";
import * as crewApiRoutes from "./routes/crew-api.js";
import * as xenditApiRoutes from "./routes/xendit-api.js";
import imagesApiRoutes from "./routes/images-api.js";
import notificationsApiRoutes from "./routes/notifications-api.js";
import realtimeApiRoutes from "./routes/realtime-api.js";
import cmsApiRoutes from "./routes/cms-api.js";
import posApiRoutes from "./routes/pos-api.js";
import { seedBranches } from "./database/seed-branches.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.FRONTEND_URL || "http://localhost:8080",
      ],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      // Actually test database connectivity
      const { testConnection } = await import("./database/connection.js");
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

  // ============= CRITICAL PRODUCTION ROUTES =============
  app.use("/api/realtime", realtimeApiRoutes);
  app.use("/api/cms", cmsApiRoutes);
  app.use("/api/pos", posApiRoutes);

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

  // New features endpoints
  app.get("/api/neon/branches", neonApiRoutes.getBranches);
  app.post("/api/neon/branches/seed", neonApiRoutes.seedBranchesEndpoint);
  app.get("/api/neon/packages", neonApiRoutes.getServicePackages);
  app.get("/api/neon/gamification/levels", neonApiRoutes.getCustomerLevels);
  app.get("/api/neon/pos/categories", neonApiRoutes.getPOSCategories);

  // Analytics endpoints
  app.get("/api/neon/analytics", neonApiRoutes.getAnalyticsData);

  // Voucher endpoints
  app.get("/api/neon/vouchers", neonApiRoutes.getVouchers);
  app.post("/api/neon/vouchers/validate", neonApiRoutes.validateVoucher);
  app.post("/api/neon/vouchers/redeem", neonApiRoutes.redeemVoucher);

  // Xendit Payment endpoints - TEST
  app.get("/api/neon/payment/xendit/test", (req, res) => {
    res.json({ success: true, message: "Xendit routes are working!" });
  });
  app.post(
    "/api/neon/payment/xendit/create-invoice",
    xenditApiRoutes.createInvoice,
  );
  app.post("/api/neon/payment/xendit/charge", xenditApiRoutes.chargeCard);
  app.post("/api/neon/payment/xendit/webhook", xenditApiRoutes.handleWebhook);
  app.get(
    "/api/neon/payment/xendit/invoice-status/:id",
    xenditApiRoutes.getInvoiceStatus,
  );

  // Users endpoints
  app.get("/api/neon/users", neonApiRoutes.getAllUsers);
  app.get("/api/neon/customers", neonApiRoutes.getCustomers);
  app.get("/api/neon/staff", neonApiRoutes.getStaffUsers);
  app.post("/api/neon/staff", neonApiRoutes.createStaffUser);

  // ============= CREW MANAGEMENT API =============
  app.get("/api/neon/crew/stats", crewApiRoutes.getCrewStats);
  app.get("/api/neon/crew/activity", crewApiRoutes.getCrewActivity);
  app.get("/api/neon/crew/list", crewApiRoutes.getCrewList);
  app.get("/api/neon/crew/groups", crewApiRoutes.getCrewGroups);
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

  return app;
}
