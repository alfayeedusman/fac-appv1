#!/bin/sh

# Fayeed Auto Care - Docker Entrypoint Script
# This script runs migrations and starts the application

set -e

echo "🚀 Starting Fayeed Auto Care..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to log messages
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1"
}

log_warn() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] $1"
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1"
}

# Check if database URL is configured
if [ -z "$SUPABASE_DATABASE_URL" ]; then
    log_warn "SUPABASE_DATABASE_URL not set - skipping migrations"
else
    # Run migrations if migration script exists
    if [ -f "scripts/apply-migrations.js" ] && [ -d "server/database/migrations" ]; then
        MIGRATION_COUNT=$(find server/database/migrations -name "*.sql" 2>/dev/null | wc -l)
        
        if [ "$MIGRATION_COUNT" -gt 0 ]; then
            log_info "Found $MIGRATION_COUNT migration file(s) - running migrations..."
            
            if node scripts/apply-migrations.js; then
                log_info "✅ Migrations completed successfully"
            else
                log_warn "⚠️  Migrations encountered issues - continuing with startup"
            fi
        else
            log_info "No migration files found - skipping migrations"
        fi
    else
        log_info "Migration setup not found - skipping automatic migrations"
    fi
fi

# Start the application
log_info "Starting application..."
exec node dist/server/node-build.mjs
