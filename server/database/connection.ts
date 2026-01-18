import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Initialize the database connection
let sql: any;
let db: any;

// Function to initialize database connection
export function initializeDatabase() {
  if (db && sql) {
    return db; // Already initialized
  }

  try {
    // Get database URL from environment variables
    const databaseUrl =
      process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error(
        "❌ CRITICAL: No database URL found in environment variables",
      );
      console.error("   Expected: NEON_DATABASE_URL or DATABASE_URL");
      console.error(
        "   Available env vars:",
        Object.keys(process.env).filter(
          (k) => k.includes("DATABASE") || k.includes("NEON"),
        ),
      );
      return null;
    }

    console.log("🔄 Initializing database connection...");
    sql = neon(databaseUrl);
    db = drizzle(sql, { schema });

    console.log("✅ Neon database connection initialized successfully");
    return db;
  } catch (error) {
    console.error("❌ Failed to initialize database connection:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    return null;
  }
}

// Initialize on module load
initializeDatabase();

// Get database instance
export function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

// Test database connection
export async function testConnection() {
  try {
    const database = getDatabase();
    if (!database) {
      throw new Error("Database not initialized");
    }

    // Simple test query
    const result = await sql`SELECT 1 as test`;
    console.log("✅ Database connection test successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}

// Export the database instance
export { db, sql };
export default getDatabase;
