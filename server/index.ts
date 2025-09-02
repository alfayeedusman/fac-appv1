import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import demoRoutes from "./routes/demo.js";
import customerApiRoutes from "./routes/customer-api.js";
import otpApiRoutes from "./routes/otp-api.js";
import * as neonApiRoutes from "./routes/neon-api.js";
import imagesApiRoutes from "./routes/images-api.js";

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
  app.use("/api/v2", customerApiRoutes);
  app.use("/api/images", imagesApiRoutes);

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
  app.get("/api/neon/packages", neonApiRoutes.getServicePackages);
  app.get("/api/neon/gamification/levels", neonApiRoutes.getCustomerLevels);
  app.get("/api/neon/pos/categories", neonApiRoutes.getPOSCategories);

  // Analytics endpoints
  app.get("/api/neon/analytics", neonApiRoutes.getAnalyticsData);

  // Users endpoints
  app.get("/api/neon/users", neonApiRoutes.getAllUsers);
  app.get("/api/neon/customers", neonApiRoutes.getCustomers);
  app.get("/api/neon/staff", neonApiRoutes.getStaffUsers);
  app.post("/api/neon/staff", neonApiRoutes.createStaffUser);

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
