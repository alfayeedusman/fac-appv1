#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Direct Database Migration Script for Supabase
 * Uses postgres library to apply migrations directly
 */

const MIGRATIONS = [
    'server/database/migrations/001_enable_rls_migrations_log.sql',
    'server/database/migrations/002_fix_foreign_key_indexes.sql',
    'server/database/migrations/003_cleanup_unused_indexes.sql',
    'server/database/migrations/004_optimize_rls_policies.sql',
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(color, message) {
    console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

function logError(message) {
    log('red', `❌ ${message}`);
}

function logSuccess(message) {
    log('green', `✅ ${message}`);
}

function logInfo(message) {
    log('cyan', `ℹ️  ${message}`);
}

function logStep(step, total, message) {
    log('blue', `📋 [${step}/${total}] ${message}`);
}

/**
 * Verify migration file exists
 */
function verifyMigrationFile(filePath) {
    if (!fs.existsSync(filePath)) {
        logError(`Migration file not found: ${filePath}`);
        return false;
    }
    return true;
}

/**
 * Read and parse SQL migration
 */
function readMigration(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        logError(`Failed to read migration file: ${filePath}`);
        throw error;
    }
}

/**
 * Execute migration SQL
 */
async function executeMigration(sql, migrationName, sql_client) {
    try {
        // Execute the entire SQL file as one transaction
        // Remove comments and extra whitespace
        const cleanedSql = sql
            .split('\n')
            .map(line => {
                // Remove comments
                const commentIndex = line.indexOf('--');
                return commentIndex !== -1 ? line.substring(0, commentIndex) : line;
            })
            .join('\n')
            .trim();

        if (cleanedSql.length === 0) {
            logSuccess(`${migrationName} (empty) - skipped`);
            return true;
        }

        // Execute as a single query to maintain transaction integrity
        await sql_client.unsafe(cleanedSql);

        logSuccess(`${migrationName} applied successfully`);
        return true;
    } catch (error) {
        logError(`Failed to apply ${migrationName}`);
        console.error('Error details:', error.message);
        return false;
    }
}

/**
 * Main execution
 */
async function main() {
    console.clear();
    log('bright', '🚀 Supabase Database Migration (Direct)');
    log('bright', '==========================================\n');

    // Check environment variables
    const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

    if (!dbUrl) {
        logError('SUPABASE_DATABASE_URL or DATABASE_URL environment variable not set');
        console.log('\nPlease set your Supabase database URL:');
        console.log('  export SUPABASE_DATABASE_URL="postgresql://user:password@host:port/database"');
        process.exit(1);
    }

    // Mask the password for display
    const displayUrl = dbUrl.replace(/(:\/\/)([^:]+):(.+)@/, '$1$2:****@');
    logInfo(`Database: ${displayUrl}`);
    console.log('');

    // Verify all migration files exist
    log('cyan', '📂 Checking migration files...');
    for (const migration of MIGRATIONS) {
        if (!verifyMigrationFile(migration)) {
            process.exit(1);
        }
    }
    logSuccess(`All ${MIGRATIONS.length} migration files found\n`);

    // Create database connection
    let sql;
    try {
        logInfo('Connecting to database...');
        sql = postgres(dbUrl, {
            max: 1,
            idle_timeout: 30,
            connect_timeout: 10,
        });
        logSuccess('Connected to database\n');
    } catch (error) {
        logError('Failed to connect to database');
        console.error('Error:', error.message);
        process.exit(1);
    }

    // Apply migrations in sequence
    let successCount = 0;
    let failedMigration = null;

    for (let i = 0; i < MIGRATIONS.length; i++) {
        const migration = MIGRATIONS[i];
        const migrationName = path.basename(migration);

        logStep(i + 1, MIGRATIONS.length, `Applying ${migrationName}`);

        try {
            const sqlContent = readMigration(migration);
            const success = await executeMigration(sqlContent, migrationName, sql);

            if (success) {
                successCount++;
            } else {
                failedMigration = migrationName;
                break;
            }
        } catch (error) {
            failedMigration = migrationName;
            break;
        }
        console.log('');
    }

    // Close database connection
    try {
        await sql.end();
    } catch (error) {
        logError('Error closing database connection');
    }

    // Summary
    console.log('==========================================\n');

    if (failedMigration) {
        logError(`Migration stopped at: ${failedMigration}`);
        logError(`${successCount} of ${MIGRATIONS.length} migrations completed`);
        process.exit(1);
    }

    logSuccess(`All ${MIGRATIONS.length} migrations applied successfully!\n`);

    log('bright', '📊 Summary of Changes:');
    console.log('  ✓ RLS enabled on migrations_log table');
    console.log('  ✓ Foreign key index added (payment_uploads.user_id)');
    console.log('  ✓ Unused indexes removed (20+ indexes)');
    console.log('  ✓ RLS policies optimized (60+ policies)\n');

    log('bright', '🎉 Database optimization complete!\n');

    log('cyan', 'Next steps:');
    console.log('  1. Review changes in SUPABASE_SECURITY_FIXES.md');
    console.log('  2. Monitor query performance improvements');
    console.log('  3. Deploy application changes\n');

    log('green', '✨ All done!');
    process.exit(0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    logError('Unexpected error occurred:');
    console.error(error);
    process.exit(1);
});

// Run main function
main().catch((error) => {
    logError('Migration script failed:');
    console.error(error);
    process.exit(1);
});
