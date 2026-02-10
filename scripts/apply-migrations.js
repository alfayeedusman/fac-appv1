#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automated Migration Script for Supabase
 * Applies all security and performance migrations in sequence
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
 * Execute a migration file via psql
 */
async function executeMigration(filePath, dbUrl) {
    return new Promise((resolve, reject) => {
        const migrationContent = fs.readFileSync(filePath, 'utf-8');
        
        const psql = spawn('psql', [dbUrl], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        let output = '';
        let errorOutput = '';

        psql.stdout.on('data', (data) => {
            output += data.toString();
        });

        psql.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        psql.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, output });
            } else {
                reject({ success: false, error: errorOutput || output });
            }
        });

        psql.stdin.write(migrationContent);
        psql.stdin.end();

        // Timeout after 30 seconds
        setTimeout(() => {
            psql.kill();
            reject({ success: false, error: 'Migration timeout' });
        }, 30000);
    });
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
 * Main execution
 */
async function main() {
    console.clear();
    log('bright', '🚀 Supabase Database Migration Automation');
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
    const displayUrl = dbUrl.replace(/(:\/\/)(\w+):(.+)@/, '$1$2:****@');
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

    // Apply migrations in sequence
    let successCount = 0;
    let failedMigration = null;

    for (let i = 0; i < MIGRATIONS.length; i++) {
        const migration = MIGRATIONS[i];
        const migrationName = path.basename(migration);
        
        logStep(i + 1, MIGRATIONS.length, `Applying ${migrationName}`);

        try {
            await executeMigration(migration, dbUrl);
            logSuccess(`${migrationName} applied successfully`);
            successCount++;
        } catch (error) {
            logError(`Failed to apply ${migrationName}`);
            if (error.error) {
                console.error('Error details:', error.error.slice(0, 500));
            }
            failedMigration = migrationName;
            break;
        }
        console.log('');
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
    console.log('  2. Run verification queries in Supabase Dashboard');
    console.log('  3. Monitor query performance improvements');
    console.log('  4. Deploy application changes\n');

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
