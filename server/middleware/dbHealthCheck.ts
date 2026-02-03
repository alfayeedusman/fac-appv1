import { RequestHandler } from "express";
import { testConnection } from "../database/connection";

/**
 * Middleware to ensure database connection is healthy before processing requests
 * Automatically attempts to reconnect if connection is down
 */
export const ensureDbConnection: RequestHandler = async (req, res, next) => {
  try {
    const isConnected = await testConnection(true); // Auto-reconnect enabled
    
    if (!isConnected) {
      console.error("❌ Database connection check failed for request:", {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(503).json({
        success: false,
        error: "Database temporarily unavailable. Please try again in a moment.",
        retryAfter: 5, // Suggest retry after 5 seconds
      });
    }
    
    // Connection is healthy, proceed to next middleware/route
    next();
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return res.status(503).json({
      success: false,
      error: "Database connection error. Please try again later.",
    });
  }
};

/**
 * Lightweight middleware that only checks if connection exists
 * Does not test or reconnect - faster but less reliable
 */
export const requireDbConnection: RequestHandler = (req, res, next) => {
  const { isConnected } = require("../database/connection");
  
  if (!isConnected()) {
    console.error("❌ Database not connected for request:", {
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(503).json({
      success: false,
      error: "Database not available. Please try again.",
    });
  }
  
  next();
};
