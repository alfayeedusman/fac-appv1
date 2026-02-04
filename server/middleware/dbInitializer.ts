import { RequestHandler } from "express";
import { testConnection, hasConnectionFailed } from "../database/connection";

// Global initialization state
let dbInitialized = false;
let dbInitializing = false;
let lastInitError: Error | null = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

// Paths that don't require database
const DB_OPTIONAL_PATHS = [
  "/health",
  "/neon/test",
  "/neon/init",
  "/neon/diagnose",
  "/neon/login", // Login can use demo mode
  "/api-catalog",
];

/**
 * Ensures database is initialized before processing any request
 * This middleware runs automatically and allows graceful degradation
 */
export const ensureDatabaseInitialized: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    // Always bypass for certain paths
    const shouldBypass = DB_OPTIONAL_PATHS.some((path) =>
      req.path.includes(path),
    );
    if (shouldBypass) {
      return next();
    }

    // If already initialized, continue
    if (dbInitialized) {
      return next();
    }

    // If we've tried too many times, just continue with degraded mode
    if (initAttempts >= MAX_INIT_ATTEMPTS && hasConnectionFailed()) {
      console.log("⚠️ Database unavailable - continuing in degraded mode");
      return next();
    }

    // If currently initializing, wait briefly then continue
    if (dbInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return next();
    }

    // Attempt initialization
    dbInitializing = true;
    initAttempts++;
    console.log(
      `🔄 Database initialization attempt ${initAttempts}/${MAX_INIT_ATTEMPTS}...`,
    );

    try {
      const isConnected = await testConnection();

      if (isConnected) {
        dbInitialized = true;
        lastInitError = null;
        console.log("✅ Database initialized successfully");
      } else {
        console.warn(
          "⚠️ Database connection not available - continuing in degraded mode",
        );
        lastInitError = new Error("Database connection unavailable");
      }
    } catch (error) {
      lastInitError = error instanceof Error ? error : new Error(String(error));
      console.warn("⚠️ Database initialization failed:", lastInitError.message);
    } finally {
      dbInitializing = false;
    }

    // Always continue - let routes handle the missing database
    next();
  } catch (error) {
    console.error("❌ Unexpected error in dbInitializer:", error);
    // Still continue - don't block the server
    next();
  }
};

/**
 * Get current initialization status
 */
export function getInitializationStatus() {
  return {
    initialized: dbInitialized,
    initializing: dbInitializing,
    attempts: initAttempts,
    maxAttempts: MAX_INIT_ATTEMPTS,
    lastError: lastInitError?.message || null,
    connectionFailed: hasConnectionFailed(),
  };
}

/**
 * Force re-initialization (useful for testing)
 */
export async function forceReinitialize(): Promise<boolean> {
  console.log("🔄 Force re-initializing database...");
  dbInitialized = false;
  dbInitializing = true;
  initAttempts = 0;

  try {
    const isConnected = await testConnection();
    if (isConnected) {
      dbInitialized = true;
      lastInitError = null;
      console.log("✅ Force re-initialization successful");
      return true;
    } else {
      lastInitError = new Error("Database connection failed");
      console.warn("⚠️ Force re-initialization failed: connection unavailable");
      return false;
    }
  } catch (error) {
    lastInitError = error instanceof Error ? error : new Error(String(error));
    console.error("❌ Force re-initialization error:", error);
    return false;
  } finally {
    dbInitializing = false;
  }
}

/**
 * Reset initialization state (for testing)
 */
export function resetInitializationState() {
  dbInitialized = false;
  dbInitializing = false;
  lastInitError = null;
  initAttempts = 0;
}
