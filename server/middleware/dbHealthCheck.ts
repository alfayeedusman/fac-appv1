import { RequestHandler } from "express";
import { testConnection } from "../database/connection";

// Full health check with auto-reconnect (recommended for critical routes)
export const ensureDbConnection: RequestHandler = async (req, res, next) => {
  try {
    const isConnected = await testConnection(true); // Auto-reconnect enabled

    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error:
          "Database temporarily unavailable. Please try again in a moment.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return res.status(503).json({
      success: false,
      error: "Database connection error. Please try again later.",
    });
  }
};

// Lightweight check without reconnection (faster but less reliable)
export const requireDbConnection: RequestHandler = async (req, res, next) => {
  try {
    const isConnected = await testConnection(false); // Auto-reconnect disabled

    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: "Database is not available at the moment.",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Database connection check failed:", error);
    return res.status(503).json({
      success: false,
      error: "Database connection error.",
    });
  }
};
