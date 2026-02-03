import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Connection state management
let sql: any;
let db: any;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_DELAY = 5000; // 5 seconds between retry attempts
const MAX_RETRIES = 3;

/**
 * Initialize database connection with retry logic and error handling
 * @param forceReconnect - Force a new connection even if one exists
 * @returns Database instance or null on failure
 */
export async function initializeDatabase(forceReconnect = false) {
  // Allow reconnection if forced or if enough time has passed since last attempt
  const now = Date.now();
  if (db && sql && !forceReconnect && (now - lastConnectionAttempt) < CONNECTION_RETRY_DELAY) {
    return db;
  }

  lastConnectionAttempt = now;

  try {
    // Get database URL from environment variables
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

    if (!databaseUrl) {
      const availableEnvVars = Object.keys(process.env).filter(
        (k) => k.includes("DATABASE") || k.includes("NEON")
      );
      console.error("❌ CRITICAL: No database URL found in environment variables");
      console.error("   Expected: NEON_DATABASE_URL or DATABASE_URL");
      console.error("   Available env vars:", availableEnvVars);
      
      throw new Error(
        "Database URL not configured. Please set NEON_DATABASE_URL or DATABASE_URL environment variable."
      );
    }

    console.log("🔄 Initializing database connection...");
    
    // Configure Neon client with proper options
    sql = neon(databaseUrl, {
      fetchOptions: {
        cache: 'no-store', // Disable caching for fresh connections
      },
    });
    
    db = drizzle(sql, { schema });

    // Test the connection immediately to ensure it works
    await sql`SELECT 1 as test`;
    
    console.log("✅ Neon database connection initialized and verified");
    return db;
  } catch (error) {
    console.error("❌ Failed to initialize database connection:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    
    // Clear the connection variables so next attempt will retry
    sql = null;
    db = null;
    
    throw error;
  }
}

/**
 * Test database connection with optional auto-reconnect
 * @param autoReconnect - Attempt to reconnect if connection is down
 * @param retryCount - Current retry attempt (internal use)
 * @returns true if connected, false otherwise
 */
export async function testConnection(autoReconnect = true, retryCount = 0): Promise<boolean> {
  try {
    // If no connection exists, try to initialize
    if (!db || !sql) {
      if (autoReconnect) {
        console.log("🔄 No connection found, attempting to initialize...");
        await initializeDatabase(true);
        return true;
      }
      return false;
    }

    // Test the actual connection with a simple query
    await sql`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    
    // Attempt reconnection if enabled and within retry limit
    if (autoReconnect && retryCount < MAX_RETRIES) {
      console.log(`🔄 Attempting to reconnect (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Wait a bit before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await initializeDatabase(true);
        
        // Verify the new connection works
        await sql`SELECT 1 as test`;
        console.log("✅ Reconnection successful");
        return true;
      } catch (retryError) {
        console.error(`❌ Reconnection attempt ${retryCount + 1} failed:`, retryError);
        
        // Try again if we haven't exceeded max retries
        if (retryCount + 1 < MAX_RETRIES) {
          return testConnection(autoReconnect, retryCount + 1);
        }
        
        return false;
      }
    }
    
    return false;
  }
}

/**
 * Get database instance with automatic initialization if needed
 * @returns Database instance
 */
export async function getDatabase() {
  if (!db) {
    console.log("🔄 Database not initialized, initializing now...");
    await initializeDatabase();
  }
  return db;
}

/**
 * Get database instance synchronously (for backward compatibility)
 * Use getDatabase() for better reliability
 * @returns Database instance or null
 */
export function getDatabaseSync() {
  if (!db) {
    console.warn("⚠️ Database accessed synchronously but not initialized. Use getDatabase() instead.");
    // Try to initialize synchronously (not recommended but maintains compatibility)
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (databaseUrl) {
      sql = neon(databaseUrl, { fetchOptions: { cache: 'no-store' } });
      db = drizzle(sql, { schema });
    }
  }
  return db;
}

/**
 * Check if database is currently connected
 * @returns true if connection exists (doesn't test if it's alive)
 */
export function isConnected(): boolean {
  return !!(db && sql);
}

/**
 * Force close and clear the database connection
 * Useful for testing or manual reconnection
 */
export function closeConnection() {
  console.log("🔌 Closing database connection...");
  sql = null;
  db = null;
  console.log("✅ Database connection closed");
}

// Initialize on module load with error handling
initializeDatabase().catch(err => {
  console.error("❌ Initial database connection failed:", err);
  console.error("   The application will attempt to reconnect on first database access");
});

// Export the database instance and SQL client
export { db, sql };
export default getDatabase;
