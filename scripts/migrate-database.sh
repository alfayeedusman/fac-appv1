#!/bin/bash

# Database Migration Script for Real-time Location Tracking
# This script sets up the complete database schema for the FAC MAP system

echo "🚀 Starting Fayeed Auto Care Real-time Database Migration..."
echo "=================================================="

# Load environment variables if .env exists
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Warning: .env file not found. Using default values."
fi

# Set default database configuration
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-fayeed_auto_care}
DB_PORT=${DB_PORT:-3306}

echo "🔗 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo "   Port: $DB_PORT"
echo ""

# Check if MySQL is running
echo "🔍 Checking MySQL connection..."
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ Error: Cannot connect to MySQL database."
    echo "   Please check your database connection and credentials."
    echo "   Make sure MySQL is running and accessible."
    exit 1
fi
echo "✅ MySQL connection successful!"

# Create database if it doesn't exist
echo "🏗️  Creating database if it doesn't exist..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"
if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' is ready!"
else
    echo "❌ Error: Failed to create database '$DB_NAME'"
    exit 1
fi

# Check if migration file exists
MIGRATION_FILE="database/migrations/001_realtime_location_tracking.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file '$MIGRATION_FILE' not found!"
    echo "   Please make sure the file exists in the correct location."
    exit 1
fi

# Backup existing database (optional)
echo "💾 Creating backup of existing database..."
BACKUP_FILE="database/backups/backup_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p database/backups
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" --single-transaction "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
else
    echo "⚠️  Warning: Could not create backup (database might be empty)"
fi

# Run the migration
echo "🔄 Running real-time location tracking migration..."
echo "   This will create/update the following tables:"
echo "   - crew_groups (team management)"
echo "   - crew_members (crew information)"
echo "   - crew_locations (GPS tracking)"
echo "   - crew_status (online/offline status)"
echo "   - service_types (service configurations)"
echo "   - jobs (wash jobs and assignments)"
echo "   - job_progress (real-time progress tracking)"
echo "   - customer_locations (customer addresses)"
echo "   - customer_status (customer activity)"
echo "   - realtime_messages (communication)"
echo "   - location_alerts (geofence alerts)"
echo "   - location_analytics (performance data)"
echo "   - realtime_settings (system configuration)"
echo ""

# Execute the migration
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" "$DB_NAME" < "$MIGRATION_FILE"
if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Error: Migration failed!"
    echo "   Check the error messages above for details."
    echo "   You can restore from backup if needed: $BACKUP_FILE"
    exit 1
fi

# Verify tables were created
echo "🔍 Verifying database schema..."
EXPECTED_TABLES=(
    "crew_groups"
    "crew_members" 
    "crew_locations"
    "crew_status"
    "service_types"
    "jobs"
    "job_progress"
    "customer_locations"
    "customer_status"
    "realtime_messages"
    "location_alerts"
    "location_analytics"
    "realtime_settings"
)

MISSING_TABLES=()
for table in "${EXPECTED_TABLES[@]}"; do
    if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" "$DB_NAME" -e "DESCRIBE $table;" >/dev/null 2>&1; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    echo "✅ All required tables created successfully!"
else
    echo "⚠️  Warning: Some tables are missing:"
    for table in "${MISSING_TABLES[@]}"; do
        echo "   - $table"
    done
fi

# Check sample data
echo "📊 Checking sample data..."
CREW_GROUPS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" "$DB_NAME" -se "SELECT COUNT(*) FROM crew_groups;" 2>/dev/null)
SERVICE_TYPES=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" "$DB_NAME" -se "SELECT COUNT(*) FROM service_types;" 2>/dev/null)
SETTINGS=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" "$DB_NAME" -se "SELECT COUNT(*) FROM realtime_settings;" 2>/dev/null)

echo "   - Crew Groups: $CREW_GROUPS"
echo "   - Service Types: $SERVICE_TYPES" 
echo "   - System Settings: $SETTINGS"

# Display system configuration
echo ""
echo "⚙️  System Configuration:"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"${DB_PASSWORD}" "$DB_NAME" -e "
SELECT 
    setting_key as 'Setting',
    setting_value as 'Value',
    description as 'Description'
FROM realtime_settings 
ORDER BY category, setting_key;" 2>/dev/null

# Performance recommendations
echo ""
echo "🚀 Performance Recommendations:"
echo "   For production use, consider these MySQL optimizations:"
echo "   - innodb_buffer_pool_size = 70% of available RAM"
echo "   - innodb_log_file_size = 256M"
echo "   - max_connections = 500"
echo "   - query_cache_size = 128M"
echo ""
echo "   You can add these to your MySQL configuration file (my.cnf)"

# Next steps
echo ""
echo "🎉 Database Migration Complete!"
echo "=================================================="
echo ""
echo "✅ Next Steps:"
echo "   1. Set up your Mapbox access token in .env file:"
echo "      VITE_MAPBOX_TOKEN=pk.your-mapbox-token-here"
echo ""
echo "   2. Start the development server:"
echo "      npm run dev"
echo ""
echo "   3. Navigate to FAC MAP in admin dashboard to test"
echo ""
echo "   4. Add crew members to start tracking locations"
echo ""
echo "📖 For detailed setup instructions, see: REALTIME_SETUP_GUIDE.md"
echo ""
echo "🔧 To verify the system is working:"
echo "   - Check /api/realtime/health endpoint"
echo "   - View FAC MAP in admin dashboard"
echo "   - Monitor console for any errors"
echo ""
echo "🎯 Your real-time location tracking system is ready for launch!"
