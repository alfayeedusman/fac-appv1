import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import demoRoutes from "./routes/demo.js";
import otpApiRoutes from "./routes/otp-api.js";
import * as neonApiRoutes from "./routes/neon-api.js";

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

  // ============= NEW FEATURES API ROUTES =============

  // Branches endpoint - basic implementation
  app.get("/api/branches", async (req, res) => {
    try {
      res.json({
        success: true,
        branches: [
          {
            id: "branch_main_001",
            name: "Main Branch",
            code: "MAIN",
            address: "123 Main Street, Makati City",
            city: "Makati",
            isActive: true,
            isMainBranch: true
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch branches" });
    }
  });

  // Service packages endpoint - basic implementation
  app.get("/api/packages", async (req, res) => {
    try {
      res.json({
        success: true,
        packages: [
          {
            id: "pkg_basic_carwash",
            name: "Basic Car Wash",
            description: "Essential car wash service",
            category: "carwash",
            basePrice: 150,
            isActive: true,
            isPopular: true
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch packages" });
    }
  });

  // Gamification levels endpoint - basic implementation
  app.get("/api/gamification/levels", async (req, res) => {
    try {
      res.json({
        success: true,
        levels: [
          {
            id: "level_bronze",
            name: "Bronze Member",
            minPoints: 0,
            maxPoints: 999,
            discountPercentage: 0,
            isActive: true
          },
          {
            id: "level_silver",
            name: "Silver Member",
            minPoints: 1000,
            maxPoints: 4999,
            discountPercentage: 5,
            isActive: true
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch levels" });
    }
  });

  // POS categories endpoint - basic implementation
  app.get("/api/pos/categories", async (req, res) => {
    try {
      res.json({
        success: true,
        categories: [
          {
            id: "cat_carwash",
            name: "Car Wash Services",
            description: "Professional car washing services",
            icon: "Car",
            color: "#3B82F6",
            isActive: true
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
  });

  // Note: Full API implementations are available in separate route files
  // These are simplified endpoints to test basic functionality

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
