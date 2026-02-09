#!/bin/bash

# Automated Supabase Migration Script
# This script applies all database migrations to fix security and performance issues

set -e  # Exit on error

echo "🚀 Starting Supabase Database Migrations..."
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$SUPABASE_DATABASE_URL" ] && [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: SUPABASE_DATABASE_URL or DATABASE_URL environment variable not set"
    echo "Please set your Supabase database URL and try again"
    exit 1
fi

# Use SUPABASE_DATABASE_URL or DATABASE_URL
DB_URL="${SUPABASE_DATABASE_URL:-$DATABASE_URL}"

echo "📍 Database: ${DB_URL:0:50}..."
echo ""

# Array of migration files
MIGRATIONS=(
    "server/database/migrations/001_enable_rls_migrations_log.sql"
    "server/database/migrations/002_fix_foreign_key_indexes.sql"
    "server/database/migrations/003_cleanup_unused_indexes.sql"
    "server/database/migrations/004_optimize_rls_policies.sql"
)

# Counter for tracking progress
MIGRATION_COUNT=0
TOTAL_MIGRATIONS=${#MIGRATIONS[@]}

# Apply each migration
for MIGRATION in "${MIGRATIONS[@]}"; do
    MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
    
    if [ ! -f "$MIGRATION" ]; then
        echo "❌ Migration file not found: $MIGRATION"
        exit 1
    fi
    
    MIGRATION_NAME=$(basename "$MIGRATION")
    echo "📋 [$MIGRATION_COUNT/$TOTAL_MIGRATIONS] Applying: $MIGRATION_NAME"
    
    # Apply migration using psql
    if psql "$DB_URL" -f "$MIGRATION" > /dev/null 2>&1; then
        echo "✅ Success: $MIGRATION_NAME"
    else
        echo "⚠️  Attempting with error handling for: $MIGRATION_NAME"
        # Try again with error reporting
        if psql "$DB_URL" -f "$MIGRATION"; then
            echo "✅ Success: $MIGRATION_NAME"
        else
            echo "❌ Failed: $MIGRATION_NAME"
            echo "Please check the error above and try again"
            exit 1
        fi
    fi
    echo ""
done

echo "=========================================="
echo "✅ All migrations applied successfully!"
echo ""
echo "📊 Summary:"
echo "  ✓ RLS enabled on migrations_log"
echo "  ✓ Foreign key index added (payment_uploads.user_id)"
echo "  ✓ Unused indexes removed (20 indexes)"
echo "  ✓ RLS policies optimized (60+ policies)"
echo ""
echo "🎉 Database optimization complete!"
echo ""
echo "Next steps:"
echo "  1. Run verification queries (see SUPABASE_SECURITY_FIXES.md)"
echo "  2. Monitor query performance improvements"
echo "  3. Deploy application changes"
echo ""
