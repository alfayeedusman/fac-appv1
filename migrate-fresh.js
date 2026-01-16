// Fresh migration runner
import { migrate } from "./server/database/migrate.js";

async function runFreshMigration() {
  try {
    console.log("🚀 Starting fresh migration...");
    await migrate();
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runFreshMigration();
