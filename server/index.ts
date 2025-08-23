import express from "express";
import cors from "cors";
import demoRoutes from "./routes/demo.js";
import customerApiRoutes from "./routes/customer-api.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Customer API routes for Flutter app
  app.use("/api/v2", customerApiRoutes);

  return app;
}
