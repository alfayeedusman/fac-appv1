#!/usr/bin/env node

/**
 * Database Initialization Script
 * Runs migrations and seeds the Supabase database
 */

const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Import the migration function
const { migrate } = require("../dist/server/database/migrate.mjs");

async function main() {
  console.log("🚀 Starting database initialization...\n");

  try {
    // Check if SUPABASE_DATABASE_URL is set
    const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error(
        "SUPABASE_DATABASE_URL or DATABASE_URL environment variable is not set",
      );
    }

    console.log("✅ Database URL configured");
    console.log(
      `📍 Database host: ${dbUrl.split("@")[1]?.split("/")[0] || "unknown"}\n`,
    );

    // Run migrations
    console.log("🔄 Running migrations and seeding database...\n");
    await migrate();

    console.log("\n✅ Database initialization completed successfully!");
    console.log("\n📝 Default credentials:");
    console.log("   Superadmin: superadmin@fayeedautocare.com");
    console.log("   Password: SuperAdmin2024!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database initialization failed:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.error("\nFull error:", error);
    }
    process.exit(1);
  }
}

main();
