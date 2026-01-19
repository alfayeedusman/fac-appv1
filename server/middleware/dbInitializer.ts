import { RequestHandler } from "express";
import { testConnection } from "../database/connection";
import { migrate } from "../database/migrate";

// Global initialization state
let dbInitialized = false;
let dbInitializing = false;
let lastInitError: Error | null = null;

/**
 * Ensures database is initialized before processing any request
 * This middleware runs automatically on first request to any API endpoint
 */
export const ensureDatabaseInitialized: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    // Skip if already initialized
    if (dbInitialized) {
      return next();
    }

    // Prevent multiple simultaneous initialization attempts
    if (dbInitializing) {
      console.log("⏳ Database initialization in progress, waiting...");
      // Wait a bit for initialization to complete
      let retries = 0;
      while (dbInitializing && retries < 30) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }

      if (dbInitialized) {
        console.log("✅ Database initialized by concurrent request");
        return next();
      }

      if (lastInitError) {
        console.error("❌ Database initialization failed");
        return res.status(503).json({
          success: false,
          error: "Database service unavailable",
          message: "Database failed to initialize",
        });
      }
    }

    // Start initialization
    dbInitializing = true;
    console.log("🔄 Starting database initialization...");

    try {
      // Test connection first
      console.log("🔌 Testing database connection...");
      const isConnected = await testConnection();

      if (!isConnected) {
        throw new Error(
          "Database connection failed. Check NEON_DATABASE_URL environment variable.",
        );
      }

      console.log("✅ Database connection successful");

      // Run migrations
      console.log("📊 Running database migrations...");
      await migrate();
      console.log("✅ Database migrations completed");

      dbInitialized = true;
      lastInitError = null;
      console.log(
        "✅ Database fully initialized and ready for requests at:",
        new Date().toISOString(),
      );
      dbInitializing = false;

      next();
    } catch (error) {
      dbInitializing = false;
      lastInitError = error instanceof Error ? error : new Error(String(error));

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Database initialization failed:", errorMessage);

      // Return error response
      return res.status(503).json({
        success: false,
        error: "Database initialization failed",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Unexpected error in dbInitializer middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get current initialization status
 */
export function getInitializationStatus() {
  return {
    initialized: dbInitialized,
    initializing: dbInitializing,
    lastError: lastInitError?.message || null,
  };
}

/**
 * Force re-initialization (useful for testing)
 */
export async function forceReinitialize() {
  console.log("🔄 Force re-initializing database...");
  dbInitialized = false;
  dbInitializing = true;

  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    await migrate();
    dbInitialized = true;
    lastInitError = null;
    console.log("✅ Force re-initialization successful");
    return true;
  } catch (error) {
    lastInitError = error instanceof Error ? error : new Error(String(error));
    console.error("❌ Force re-initialization failed:", error);
    return false;
  } finally {
    dbInitializing = false;
  }
}
