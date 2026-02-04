import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Initialize the database connection
let sql: any;
let db: any;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_DELAY = 5000; // 5 seconds between reconnection attempts
const MAX_RETRY_ATTEMPTS = 3;

// Function to initialize database connection with retry logic
export async function initializeDatabase(forceReconnect = false) {
  // Prevent rapid retry attempts
  const now = Date.now();
  if (
    db &&
    sql &&
    !forceReconnect &&
    now - lastConnectionAttempt < CONNECTION_RETRY_DELAY
  ) {
    return db;
  }

  lastConnectionAttempt = now;

  try {
    const databaseUrl =
      process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "Database URL not configured. Please set SUPABASE_DATABASE_URL or DATABASE_URL environment variable.",
      );
    }

    console.log("🔄 Initializing database connection...");
    console.log("📝 Database URL being used:", databaseUrl.substring(0, 50) + "...");

    sql = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
    });

    db = drizzle(sql, { schema });

    // Test the connection immediately
    await sql`SELECT 1 as test`;

    console.log("✅ Supabase database connection initialized and verified");
    return db;
  } catch (error) {
    console.error("❌ Failed to initialize database connection:", error);

    // Clear the connection so next attempt will retry
    sql = null;
    db = null;

    throw error;
  }
}

// Test and auto-reconnect if needed
export async function testConnection(
  autoReconnect = true,
  retryCount = 0,
) {
  try {
    if (!db || !sql) {
      if (autoReconnect) {
        console.log("🔄 No connection found, attempting to reconnect...");
        await initializeDatabase(true);
        return true;
      }
      return false;
    }

    // Actually test the connection
    await sql`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);

    if (autoReconnect && retryCount < MAX_RETRY_ATTEMPTS) {
      console.log(
        `🔄 Attempting to reconnect (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`,
      );
      try {
        await initializeDatabase(true);
        return true;
      } catch (retryError) {
        console.error("❌ Reconnection failed:", retryError);
        return retryCount < MAX_RETRY_ATTEMPTS - 1
          ? await testConnection(autoReconnect, retryCount + 1)
          : false;
      }
    }

    return false;
  }
}

// Get database with automatic reconnection
export async function getDatabase() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}

export async function getSqlClient() {
  if (!sql) {
    await initializeDatabase();
  }
  return sql;
}

// Check if database is connected
export function isConnected(): boolean {
  return !!db && !!sql;
}

// Close database connection
export async function closeConnection() {
  try {
    if (sql) {
      sql = null;
    }
    if (db) {
      db = null;
    }
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
}

// Initialize on module load with error handling
initializeDatabase().catch((err) => {
  console.error("❌ Initial database connection failed:", err);
  console.warn(
    "⚠️ Server starting but database connection will be retried on first request",
  );
});

export { db, sql };
export default getDatabase;
