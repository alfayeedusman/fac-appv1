import { getDatabase, getSqlClient } from "./connection";

interface MigrationRecord {
  id: string;
  name: string;
  executedAt: Date;
  duration: number; // in milliseconds
  status: "success" | "failed";
}

let migrationsCached: MigrationRecord[] | null = null;
let migrationsCheckInProgress = false;

/**
 * Create migrations_log table if it doesn't exist
 */
export async function initializeMigrationTracking(): Promise<boolean> {
  try {
    const sql = await getSqlClient();
    if (!sql) return false;

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('success', 'failed'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_log_name ON migrations_log(name);
      CREATE INDEX IF NOT EXISTS idx_migrations_log_executed_at ON migrations_log(executed_at DESC);
    `);

    console.log("✅ Migration tracking table initialized");
    return true;
  } catch (error) {
    console.warn("⚠️ Could not initialize migration tracking:", error);
    return false;
  }
}

/**
 * Get all executed migrations (with caching)
 */
export async function getExecutedMigrations(): Promise<Set<string>> {
  // Use cache if available
  if (migrationsCached !== null) {
    return new Set(migrationsCached.map((m) => m.name));
  }

  // If check is already in progress, wait for it
  if (migrationsCheckInProgress) {
    await new Promise((resolve) => {
      const checkCache = () => {
        if (migrationsCached !== null) {
          resolve(migrationsCached);
        } else {
          setTimeout(checkCache, 100);
        }
      };
      checkCache();
    });
    return new Set(migrationsCached!.map((m) => m.name));
  }

  migrationsCheckInProgress = true;

  try {
    const sql = await getSqlClient();
    if (!sql) {
      console.warn("⚠️ Could not get SQL client for migration check");
      return new Set();
    }

    const result = await sql.unsafe(`
      SELECT name, executed_at, duration, status 
      FROM migrations_log 
      WHERE status = 'success'
      ORDER BY executed_at ASC
    `);

    migrationsCached = (result as any[]) || [];
    return new Set(migrationsCached.map((m) => m.name));
  } catch (error) {
    console.warn("⚠️ Could not fetch executed migrations:", error);
    migrationsCached = [];
    return new Set();
  } finally {
    migrationsCheckInProgress = false;
  }
}

/**
 * Log a migration execution
 */
export async function logMigration(
  name: string,
  duration: number,
  status: "success" | "failed",
): Promise<void> {
  try {
    const sql = await getSqlClient();
    if (!sql) return;

    // Use INSERT ... ON CONFLICT to handle idempotency
    await sql.unsafe(`
      INSERT INTO migrations_log (id, name, duration, status)
      VALUES (
        ${genId()},
        '${name}',
        ${duration},
        '${status}'
      )
      ON CONFLICT (name) DO UPDATE SET
        executed_at = CURRENT_TIMESTAMP,
        duration = ${duration},
        status = '${status}'
    `);

    // Clear cache so it's refreshed next time
    migrationsCached = null;
  } catch (error) {
    console.warn(`⚠️ Could not log migration "${name}":`, error);
  }
}

/**
 * Check if a migration has been executed
 */
export async function hasMigrationRun(migrationName: string): Promise<boolean> {
  const executed = await getExecutedMigrations();
  return executed.has(migrationName);
}

/**
 * Simple ID generator
 */
function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Clear migration cache (useful for testing)
 */
export function clearMigrationCache(): void {
  migrationsCached = null;
  migrationsCheckInProgress = false;
}

/**
 * Get migration statistics
 */
export async function getMigrationStats(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  lastRun: Date | null;
}> {
  try {
    const sql = await getSqlClient();
    if (!sql) return { total: 0, succeeded: 0, failed: 0, lastRun: null };

    const result = await sql.unsafe(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as succeeded,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        MAX(executed_at) as last_run
      FROM migrations_log
    `);

    const row = (result as any[])[0];
    return {
      total: parseInt(row.total || "0"),
      succeeded: parseInt(row.succeeded || "0"),
      failed: parseInt(row.failed || "0"),
      lastRun: row.last_run ? new Date(row.last_run) : null,
    };
  } catch (error) {
    console.warn("⚠️ Could not get migration stats:", error);
    return { total: 0, succeeded: 0, failed: 0, lastRun: null };
  }
}
