#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  FAC App - Complete Setup Script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

# Function to log messages
log_step() {
  echo -e "${BLUE}→${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check Node.js and npm
log_step "Checking Node.js and npm installation..."
if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed. Please install Node.js LTS."
  exit 1
fi
if ! command -v npm &> /dev/null; then
  log_error "npm is not installed. Please install npm."
  exit 1
fi
log_success "Node.js $(node -v) and npm $(npm -v) found"

# Step 2: Check environment variables
log_step "Checking environment variables..."
MISSING_VARS=()

# Check critical variables
if [ -z "$NEON_DATABASE_URL" ] && [ -z "$DATABASE_URL" ]; then
  MISSING_VARS+=("NEON_DATABASE_URL or DATABASE_URL")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  log_warning "Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  log_warning "You can set these in a .env.local file, or as system environment variables"
  log_warning "Setup will continue, but database operations will fail without these"
else
  log_success "All critical environment variables are set"
fi

# Step 3: Clean previous build artifacts (optional)
log_step "Cleaning previous build artifacts..."
rm -rf dist node_modules/.vite dist-server 2>/dev/null || true
log_success "Cleaned"

# Step 4: Install dependencies
log_step "Installing dependencies with legacy peer deps support..."
npm ci --legacy-peer-deps --include=dev --prefer-offline --no-audit
if [ $? -ne 0 ]; then
  log_error "Failed to install dependencies"
  exit 1
fi
log_success "Dependencies installed"

# Step 5: Build frontend
log_step "Building frontend (React SPA)..."
npm run build:client
if [ $? -ne 0 ]; then
  log_error "Failed to build frontend"
  exit 1
fi
log_success "Frontend built successfully"

# Step 6: Build server
log_step "Building backend (Express server)..."
npm run build:server
if [ $? -ne 0 ]; then
  log_error "Failed to build backend"
  exit 1
fi
log_success "Backend built successfully"

# Step 7: TypeScript validation
log_step "Running TypeScript type checking..."
npm run typecheck
if [ $? -ne 0 ]; then
  log_warning "TypeScript errors found (non-critical, deployment will continue)"
else
  log_success "TypeScript validation passed"
fi

# Step 8: Display setup summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📦 Build Output:${NC}"
echo "  Frontend: dist/spa/"
echo "  Backend:  dist/server/"
echo "  Functions: netlify/functions/"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo ""
echo "  For LOCAL DEVELOPMENT:"
echo "    npm run dev"
echo "    → Starts both frontend (Vite) and backend (Express) on http://localhost:8080"
echo ""
echo "  For NETLIFY DEPLOYMENT:"
echo "    git add ."
echo "    git commit -m 'Setup complete'"
echo "    git push"
echo "    → Netlify will automatically build and deploy"
echo ""
echo "  For LOCAL PRODUCTION TEST:"
echo "    npm run build"
echo "    npm start"
echo "    → Runs the production build locally"
echo ""
echo -e "${YELLOW}🔧 Environment Variables Required:${NC}"
echo "  - NEON_DATABASE_URL (PostgreSQL connection string)"
echo "  - DATABASE_URL (backup for NEON_DATABASE_URL)"
echo "  - VITE_FIREBASE_API_KEY (and other Firebase vars)"
echo "  - VITE_MAPBOX_TOKEN"
echo "  - VITE_PUSHER_KEY, PUSHER_SECRET, PUSHER_APP_ID, PUSHER_CLUSTER"
echo "  - XENDIT_SECRET_KEY, XENDIT_PUBLIC_KEY, XENDIT_WEBHOOK_TOKEN"
echo ""
echo -e "${YELLOW}📝 Testing API Endpoints:${NC}"
echo "  When running: npm run dev"
echo "    GET  http://localhost:8080/api/neon/test"
echo "    GET  http://localhost:8080/api/neon/diagnose"
echo "    POST http://localhost:8080/api/neon/auth/login"
echo "    POST http://localhost:8080/api/neon/auth/register"
echo ""
echo -e "${YELLOW}🐛 Troubleshooting:${NC}"
echo "  If you see '404' on API routes:"
echo "    1. Check NEON_DATABASE_URL is set"
echo "    2. Run 'npm run dev' to start the server"
echo "    3. Check http://localhost:8080/api/neon/diagnose for detailed errors"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "  See netlify.toml for Netlify configuration"
echo "  See vite.config.server.ts for server build configuration"
echo "  See netlify/functions/api.ts for serverless function setup"
echo ""
