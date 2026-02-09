#!/bin/bash

# Fayeed Auto Care - Setup and Migration Script
# This script sets up the environment and runs database migrations
# Used during deployment and initial setup

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MIGRATIONS_DIR="server/database/migrations"
LOG_FILE="migration-setup.log"

# Utility functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1" >> $LOG_FILE
}

print_step() {
    echo -e "${BLUE}📍 $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 📍 $1" >> $LOG_FILE
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1" >> $LOG_FILE
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1" >> $LOG_FILE
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1" >> $LOG_FILE
}

# Header
show_header() {
    clear
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  Fayeed Auto Care - Setup & Migration${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_info "Node.js version: $(node --version)"
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_info "npm version: $(npm --version)"
    
    # Check if .env file exists
    if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
        print_warning ".env file not found. Please create one with database configuration."
        print_info "Required variables: SUPABASE_DATABASE_URL"
        return 0  # Don't exit, migrations might work anyway
    fi
    
    print_status "All prerequisites satisfied"
}

# Load environment variables
load_environment() {
    print_step "Loading environment variables..."
    
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
        print_status "Loaded from .env"
    elif [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        print_status "Loaded from .env.local"
    else
        print_warning "No .env file found - using system environment variables"
    fi
    
    # Check if database URL is set
    if [ -z "$SUPABASE_DATABASE_URL" ]; then
        print_error "SUPABASE_DATABASE_URL is not set"
        print_info "Please set this environment variable and try again"
        exit 1
    fi
    print_status "Database configuration loaded"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    if npm ls > /dev/null 2>&1; then
        print_status "Dependencies already installed"
    else
        print_info "Running npm install..."
        npm install --prefer-offline --no-audit || {
            print_error "Failed to install dependencies"
            exit 1
        }
        print_status "Dependencies installed"
    fi
}

# Run migrations
run_migrations() {
    print_step "Running database migrations..."
    
    if [ ! -f "scripts/apply-migrations.js" ]; then
        print_error "Migration script not found at scripts/apply-migrations.js"
        exit 1
    fi
    
    # Check if migrations directory exists
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        print_warning "Migrations directory not found at $MIGRATIONS_DIR"
        print_info "Creating migrations directory..."
        mkdir -p "$MIGRATIONS_DIR"
    fi
    
    # Count migration files
    MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.sql" 2>/dev/null | wc -l)
    
    if [ "$MIGRATION_COUNT" -eq 0 ]; then
        print_warning "No migration files found in $MIGRATIONS_DIR"
        print_info "Skipping migrations"
        return 0
    fi
    
    print_info "Found $MIGRATION_COUNT migration file(s)"
    
    # Run migrations using Node.js script
    if node scripts/apply-migrations.js; then
        print_status "Migrations completed successfully"
    else
        print_error "Migration execution failed"
        print_info "Check database connection and migration files"
        return 1
    fi
}

# Verify migrations
verify_migrations() {
    print_step "Verifying migrations..."
    
    # Run verification if script exists
    if [ -f "scripts/verify-migrations.js" ]; then
        if node scripts/verify-migrations.js; then
            print_status "Migrations verified successfully"
        else
            print_warning "Migration verification failed - manual check recommended"
        fi
    else
        print_info "Verification script not found - skipping automatic verification"
    fi
}

# Show completion summary
show_summary() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  🎉 Setup & Migration Completed!      ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "  1. Start development: npm run dev"
    echo "  2. Start production: npm run start"
    echo "  3. View logs: tail -f $LOG_FILE"
    echo ""
    echo -e "${CYAN}Additional Commands:${NC}"
    echo "  • npm run migrate:apply   - Re-run migrations"
    echo "  • npm run migrate:verify  - Verify migration status"
    echo "  • npm run build           - Build for production"
    echo ""
}

# Main setup function
main() {
    show_header
    
    # Create or clear log file
    > $LOG_FILE
    
    print_info "Starting setup process..."
    echo ""
    
    check_prerequisites
    echo ""
    
    load_environment
    echo ""
    
    install_dependencies
    echo ""
    
    # Run migrations if database is configured
    if [ ! -z "$SUPABASE_DATABASE_URL" ]; then
        run_migrations || {
            print_warning "Migrations failed but continuing with setup"
        }
        echo ""
        
        verify_migrations
        echo ""
    fi
    
    show_summary
    
    print_status "Setup script completed at $(date)"
}

# Handle script arguments
case "${1:-setup}" in
    "setup"|"")
        main
        ;;
    "migrate-only")
        show_header
        > $LOG_FILE
        load_environment
        run_migrations
        ;;
    "verify")
        show_header
        > $LOG_FILE
        verify_migrations
        ;;
    *)
        echo "Usage: $0 {setup|migrate-only|verify}"
        echo ""
        echo "Commands:"
        echo "  setup          - Full setup and migration (default)"
        echo "  migrate-only   - Run migrations only"
        echo "  verify         - Verify migrations only"
        exit 1
        ;;
esac
