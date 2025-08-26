import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

// Import routes
import demoRoutes from "./routes/demo.js";
import mysqlApiRoutes from "./routes/mysql-api.js";
import otpApiRoutes from "./routes/otp-api.js";
import realtimeApiRoutes from "./routes/realtime-api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID || "your-project-id",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
    client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
    client_id: process.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const createServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

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
        mysql: "connected",
        firebase: "connected",
      },
    });
  });

  // API Routes
  app.use("/api", demoRoutes);
  app.use("/api", mysqlApiRoutes);
  app.use("/api", otpApiRoutes);

  // Serve Flutter web app (replaces React customer pages)
  const flutterBuildPath = path.join(__dirname, "../flutter_app/build/web");
  app.use("/customer", express.static(flutterBuildPath));

  // Customer routes redirect to Flutter app
  app.get(
    ["/", "/login", "/register", "/dashboard", "/booking", "/profile"],
    (req, res) => {
      res.redirect("/customer");
    },
  );

  // Serve React admin app for everything else
  const reactBuildPath = path.join(__dirname, "../dist/spa");
  app.use("/admin", express.static(reactBuildPath));

  // Admin routes
  app.get(["/admin/*"], (req, res) => {
    res.sendFile(path.join(reactBuildPath, "index.html"));
  });

  // Default redirect
  app.get("*", (req, res) => {
    // If it's an admin route, serve React
    if (req.path.startsWith("/admin")) {
      res.sendFile(path.join(reactBuildPath, "index.html"));
    } else {
      // Otherwise, serve Flutter customer app
      res.sendFile(path.join(flutterBuildPath, "index.html"));
    }
  });

  return app;
};

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Fayeed Auto Care Server running on port ${PORT}`);
    console.log(`📱 Customer App (Flutter): http://localhost:${PORT}/customer`);
    console.log(`🔧 Admin Panel (React): http://localhost:${PORT}/admin`);
    console.log(`🗄️  Database: MySQL with phpMyAdmin on port 8080`);
    console.log(`🔑 Firebase Auth: Enabled`);
  });
}
