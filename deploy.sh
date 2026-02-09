#!/bin/bash

# Fayeed Auto Care - Deployment Script
# This script handles deployment to production environment

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fayeed-auto-care"
BACKUP_DIR="./backups"
DEPLOY_ENV=${DEPLOY_ENV:-production}

echo -e "${BLUE}🚀 Starting Fayeed Auto Care Deployment...${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required files exist
check_requirements() {
    echo -e "${BLUE}📋 Checking requirements...${NC}"
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found! Please copy .env.example to .env and configure it."
        exit 1
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found!"
        exit 1
    fi
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_status "All requirements satisfied"
}

# Create backup of database
backup_database() {
    if [ "$DEPLOY_ENV" = "production" ]; then
        echo -e "${BLUE}💾 Creating database backup...${NC}"
        
        mkdir -p $BACKUP_DIR
        BACKUP_FILE="$BACKUP_DIR/fayeed_auto_care_$(date +%Y%m%d_%H%M%S).sql"
        
        # Try to backup using Docker if container is running
        if docker ps | grep -q fayeed_mysql; then
            docker exec fayeed_mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD fayeed_auto_care > $BACKUP_FILE 2>/dev/null || {
                print_warning "Database backup failed - this might be the first deployment"
            }
        else
            print_warning "MySQL container not running - skipping backup"
        fi
        
        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            print_status "Database backup created: $BACKUP_FILE"
        fi
    fi
}

# Build and deploy
deploy_application() {
    echo -e "${BLUE}🔨 Building and deploying application...${NC}"
    
    # Pull latest images
    docker-compose pull
    
    # Build the application
    print_status "Building application..."
    docker-compose build --no-cache
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down
    
    # Start the services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services are running"
    else
        print_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Initialize database
initialize_database() {
    echo -e "${BLUE}🗄️  Initializing database...${NC}"

    # Wait for MySQL to be ready
    echo "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if docker exec fayeed_mysql mysqladmin ping -h localhost --silent; then
            break
        fi
        sleep 2
    done

    # Check if database is initialized
    if docker exec fayeed_mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "USE fayeed_auto_care; SHOW TABLES;" &> /dev/null; then
        print_status "Database already initialized"
    else
        print_status "Setting up database schema..."

        # Run the schema creation
        if [ -f "database/mysql/schema.sql" ]; then
            docker exec -i fayeed_mysql mysql -u root -p$MYSQL_ROOT_PASSWORD < database/mysql/schema.sql
            print_status "Database schema created"
        fi

        # Add OTP table
        if [ -f "database/mysql/email_otp_schema.sql" ]; then
            docker exec -i fayeed_mysql mysql -u root -p$MYSQL_ROOT_PASSWORD fayeed_auto_care < database/mysql/email_otp_schema.sql
            print_status "OTP table created"
        fi
    fi
}

# Run database migrations
run_database_migrations() {
    echo -e "${BLUE}🔧 Running database migrations...${NC}"

    # Check if migrations exist
    if [ ! -d "server/database/migrations" ]; then
        print_warning "Migrations directory not found - skipping migrations"
        return 0
    fi

    MIGRATION_COUNT=$(find server/database/migrations -name "*.sql" 2>/dev/null | wc -l)

    if [ "$MIGRATION_COUNT" -eq 0 ]; then
        print_warning "No migration files found - skipping migrations"
        return 0
    fi

    print_status "Found $MIGRATION_COUNT migration file(s)"

    # Run migrations using Node.js script
    if [ -f "scripts/apply-migrations.js" ]; then
        if node scripts/apply-migrations.js; then
            print_status "Migrations completed successfully"
        else
            print_warning "Some migrations may have failed - check logs"
            return 1
        fi
    else
        print_warning "Migration script not found at scripts/apply-migrations.js"
        return 0
    fi
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health checks...${NC}"
    
    # Check application health
    for i in {1..10}; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            print_status "Application is healthy"
            break
        fi
        sleep 5
    done
    
    # Check database connection
    if docker exec fayeed_mysql mysqladmin ping -h localhost --silent; then
        print_status "Database is healthy"
    else
        print_error "Database health check failed"
    fi
    
    # Check Redis connection
    if docker exec fayeed_redis redis-cli ping | grep -q PONG; then
        print_status "Redis is healthy"
    else
        print_warning "Redis health check failed"
    fi
}

# Show deployment summary
show_summary() {
    echo -e "${GREEN}"
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "   Main Application: http://localhost:3000"
    echo "   Admin Panel:      http://localhost:3000/admin"
    echo "   Customer App:     http://localhost:3000/customer"
    echo "   phpMyAdmin:       http://localhost:8080"
    echo "   API Health:       http://localhost:3000/api/health"
    echo ""
    echo "🐳 Docker Services:"
    docker-compose ps
    echo -e "${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Fayeed Auto Care Deployment   ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    check_requirements
    backup_database
    deploy_application
    initialize_database
    health_check
    show_summary
    
    echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy"|"")
        main
        ;;
    "backup")
        backup_database
        ;;
    "health")
        health_check
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "stop")
        docker-compose down
        print_status "Services stopped"
        ;;
    "restart")
        docker-compose restart
        print_status "Services restarted"
        ;;
    *)
        echo "Usage: $0 {deploy|backup|health|logs|stop|restart}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  backup   - Create database backup"
        echo "  health   - Check service health"
        echo "  logs     - Show service logs"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        exit 1
        ;;
esac
