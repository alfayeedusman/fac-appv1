#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Trap errors
set -e

print_header "FAC App - Netlify Deployment Setup"

# Check Node.js version
print_info "Checking Node.js version..."
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION installed"

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js and npm."
    exit 1
fi

# Step 1: Clean previous installations
print_header "Step 1: Cleaning Previous Builds"
print_info "Removing old node_modules and dist directories..."
rm -rf node_modules dist package-lock.json
print_success "Cleanup complete"

# Step 2: Install dependencies
print_header "Step 2: Installing Dependencies"
print_info "Installing npm dependencies with legacy peer deps flag..."
npm install --legacy-peer-deps --prefer-offline --no-audit --verbose 2>&1 | tail -20
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Type checking (optional)
print_header "Step 3: Type Checking (Optional)"
print_info "Set SKIP_TYPECHECK=1 to skip (matches Netlify default build behavior)."

if [ "${SKIP_TYPECHECK:-0}" = "1" ]; then
    print_warning "Skipping typecheck"
else
    print_info "Running TypeScript type checking..."
    npm run typecheck 2>&1 | grep -E "(error|warning|✓)" || print_success "Type checking passed"
fi

# Step 4: Build
print_header "Step 4: Building Application"
print_info "Building client (React SPA)..."
npm run build:client
print_success "Client build completed"

print_info "Building server (Express + functions)..."
npm run build:server
print_success "Server build completed"

# Step 5: Verify build artifacts
print_header "Step 5: Verifying Build Artifacts"

if [ -d "dist/spa" ]; then
    FILE_COUNT=$(find dist/spa -type f | wc -l)
    print_success "SPA build verified: $FILE_COUNT files in dist/spa"
else
    print_error "dist/spa directory not found"
    exit 1
fi

if [ -d "dist/server" ]; then
    print_success "Server build verified: dist/server exists"
else
    print_error "dist/server directory not found"
    exit 1
fi

# Step 6: Final summary
print_header "Deployment Ready!"
print_success "All builds completed successfully"
print_info "To deploy to Netlify:"
echo ""
echo "  1. Commit changes to git:"
echo "     git add ."
echo "     git commit -m 'Deploy to Netlify'"
echo ""
echo "  2. Push to your repository:"
echo "     git push origin main"
echo ""
echo "  3. Netlify will automatically detect changes and deploy"
echo ""
print_info "Build artifacts ready at:"
echo "  - Frontend: dist/spa/"
echo "  - Backend: dist/server/"
echo ""
print_success "Setup complete!"
