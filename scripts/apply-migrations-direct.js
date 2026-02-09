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
 * Split SQL into individual statements, respecting quotes and special syntax
 */
function splitSqlStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const nextChar = sql[i + 1];

        // Handle line comments
        if (char === '-' && nextChar === '-' && !inString) {
            inComment = true;
            currentStatement += char;
            continue;
        }

        if (inComment && char === '\n') {
            inComment = false;
            currentStatement += char;
            continue;
        }

        if (inComment) {
            currentStatement += char;
            continue;
        }

        // Handle strings
        if ((char === "'" || char === '"') && !inString) {
            inString = true;
            stringChar = char;
            currentStatement += char;
            continue;
        }

        if (char === stringChar && inString && sql[i - 1] !== '\\') {
            inString = false;
            currentStatement += char;
            continue;
        }

        // Handle statement terminator
        if (char === ';' && !inString) {
            currentStatement += char;
            const trimmed = currentStatement.trim();
            if (trimmed.length > 0) {
                statements.push(trimmed);
            }
            currentStatement = '';
            continue;
        }

        currentStatement += char;
    }

    // Add any remaining statement
    const trimmed = currentStatement.trim();
    if (trimmed.length > 0) {
        statements.push(trimmed);
    }

    return statements;
}

/**
 * Execute migration SQL
 */
async function executeMigration(sql, migrationName, sql_client) {
    try {
        // Remove SQL comments (lines starting with --)
        const cleanedSql = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .trim();

        if (cleanedSql.length === 0) {
            logSuccess(`${migrationName} (empty) - skipped`);
            return true;
        }

        // Split into individual statements
        const statements = splitSqlStatements(cleanedSql);

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim().length > 0) {
                logInfo(`  Executing: ${statement.substring(0, 50)}...`);
                await sql_client.unsafe(statement);
            }
        }

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
