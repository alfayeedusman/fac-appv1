import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Connection state management
let sql: any;
let db: any;
let connectionFailed = false;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_DELAY = 10000; // 10 seconds between reconnection attempts

// Track if we're currently attempting a connection
let isConnecting = false;

// Function to initialize database connection - NO RETRIES, SAFE
export async function initializeDatabase(
  forceReconnect = false,
): Promise<typeof db | null> {
  // If we already have a connection and not forcing reconnect, return it
  if (db && sql && !forceReconnect) {
    return db;
  }

  // Prevent rapid retry attempts
  const now = Date.now();
  if (
    connectionFailed &&
    !forceReconnect &&
    now - lastConnectionAttempt < CONNECTION_RETRY_DELAY
  ) {
    console.log("⏳ Skipping connection attempt - too soon after last failure");
    return null;
  }

  // Prevent concurrent connection attempts
  if (isConnecting) {
    console.log("⏳ Connection attempt already in progress");
    // Return existing connection if available, even if currently connecting
    if (db && sql) {
      return db;
    }
    return null;
  }

  isConnecting = true;
  lastConnectionAttempt = now;

  try {
    const databaseUrl =
      process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error(
        "❌ Database URL not configured. Please set SUPABASE_DATABASE_URL environment variable.",
      );
      connectionFailed = true;
      isConnecting = false;
      return null;
    }

    console.log("🔄 Initializing database connection...");
    console.log("📝 Database URL:", databaseUrl.substring(0, 50) + "...");

    // Create postgres client with timeout
    sql = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
      connect_timeout: 30, // 30 second connection timeout
      idle_timeout: 20, // Close idle connections after 20 seconds
      max_lifetime: 60 * 30, // Max connection lifetime 30 minutes
    });

    db = drizzle(sql, { schema });

    // Test the connection with a timeout (30 seconds for slow connections)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection test timeout")), 30000);
    });

    await Promise.race([sql`SELECT 1 as test`, timeoutPromise]);

    console.log("✅ Supabase database connection initialized and verified");
    connectionFailed = false;
    isConnecting = false;
    return db;
  } catch (error) {
    console.error(
      "❌ Failed to initialize database connection:",
      error instanceof Error ? error.message : error,
    );

    // Clean up failed connection
    try {
      if (sql) {
        await sql.end();
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    sql = null;
    db = null;
    connectionFailed = true;
    isConnecting = false;

    // Return null instead of throwing - NEVER throw from this function
    return null;
  }
}

// Simple connection test - NO RETRIES, NO RECURSION, SAFE
export async function testConnection(): Promise<boolean> {
  try {
    // If we don't have a connection, try once to initialize
    if (!db || !sql) {
      const result = await initializeDatabase();
      return result !== null;
    }

    // Test existing connection with timeout
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error("Connection test timeout")), 5000);
    });

    await Promise.race([sql`SELECT 1 as test`, timeoutPromise]);
    return true;
  } catch (error) {
    console.warn(
      "⚠️ Database connection test failed:",
      error instanceof Error ? error.message : error,
    );

    // Mark connection as failed and clear it
    sql = null;
    db = null;
    connectionFailed = true;

    return false;
  }
}

// Get database with automatic initialization (returns null if unavailable)
export async function getDatabase(): Promise<typeof db | null> {
  if (db) {
    return db;
  }

  try {
    return await initializeDatabase();
  } catch (error) {
    console.warn(
      "⚠️ Database unavailable:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

// Get SQL client (returns null if unavailable)
export async function getSqlClient(): Promise<typeof sql | null> {
  if (sql) {
    return sql;
  }

  try {
    await initializeDatabase();
    return sql;
  } catch (error) {
    console.warn(
      "⚠️ Database unavailable:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

// Check if database is connected
export function isConnected(): boolean {
  return !!db && !!sql && !connectionFailed;
}

// Check if connection has failed
export function hasConnectionFailed(): boolean {
  return connectionFailed;
}

// Close database connection safely
export async function closeConnection(): Promise<void> {
  try {
    if (sql) {
      await sql.end();
    }
  } catch (error) {
    console.warn("⚠️ Error closing database connection:", error);
  } finally {
    sql = null;
    db = null;
    connectionFailed = false;
    console.log("✅ Database connection closed");
  }
}

// Export for direct access (may be null)
export { db, sql };
export default getDatabase;
