#!/bin/bash

# 🚀 Fayeed Auto Care - One-Click Netlify Deployment Script
# This script automates the entire deployment process

set -e  # Exit on error

echo "🚀 Starting Fayeed Auto Care Deployment..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo ""
echo "📋 Step 1: Checking prerequisites..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# Step 2: Check if Netlify CLI is installed
echo ""
echo "🔧 Step 2: Checking Netlify CLI..."
echo "================================================"

if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}✅ Netlify CLI installed!${NC}"
else
    echo -e "${GREEN}✅ Netlify CLI already installed${NC}"
fi

# Step 3: Clean and Install Dependencies
echo ""
echo "📦 Step 3: Installing dependencies..."
echo "================================================"

# Clean previous builds
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning old node_modules..."
    rm -rf node_modules
fi

if [ -d "dist" ]; then
    echo "🧹 Cleaning old dist folder..."
    rm -rf dist
fi

# Install dependencies with legacy peer deps
echo "📥 Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps --prefer-offline --no-audit

echo -e "${GREEN}✅ Dependencies installed!${NC}"

# Step 4: Run Type Check
echo ""
echo "🔍 Step 4: Running TypeScript checks..."
echo "================================================"

npm run typecheck

echo -e "${GREEN}✅ TypeScript checks passed!${NC}"

# Step 5: Build the Project
echo ""
echo "🏗️  Step 5: Building the project..."
echo "================================================"

npm run build

if [ ! -d "dist/spa" ]; then
    echo -e "${RED}❌ Build failed! dist/spa folder not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo "📁 Build output: dist/spa"

# Step 6: Check Environment Variables
echo ""
echo "🔐 Step 6: Checking environment variables..."
echo "================================================"

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating template .env file..."
    cat > .env << 'EOF'
# Database
NEON_DATABASE_URL=your_database_url_here

# Firebase
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
VITE_FIREBASE_FCM_KEY=your_fcm_key_here

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Xendit
XENDIT_SECRET_KEY=your_xendit_secret_here
XENDIT_WEBHOOK_TOKEN=your_webhook_token_here
XENDIT_PUBLIC_KEY=your_public_key_here

# Pusher
PUSHER_KEY=your_pusher_key_here
PUSHER_SECRET=your_pusher_secret_here
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_CLUSTER=your_pusher_cluster_here
VITE_PUSHER_KEY=your_pusher_key_here
VITE_PUSHER_CLUSTER=your_pusher_cluster_here
EOF
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual values${NC}"
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ .env file found!${NC}"

# Step 7: Netlify Login
echo ""
echo "🔐 Step 7: Netlify Authentication..."
echo "================================================"

echo "Opening browser for Netlify login..."
netlify login

echo -e "${GREEN}✅ Authenticated with Netlify!${NC}"

# Step 8: Ask User for Deployment Type
echo ""
echo "🚀 Step 8: Choose Deployment Option..."
echo "================================================"
echo ""
echo "Choose your deployment option:"
echo "1) Deploy to EXISTING Netlify site (link and deploy)"
echo "2) Deploy to NEW Netlify site (create and deploy)"
echo "3) Deploy manually (I'll set up site myself)"
echo ""
read -p "Enter your choice (1, 2, or 3): " deploy_choice

case $deploy_choice in
    1)
        echo ""
        echo "🔗 Linking to existing Netlify site..."
        netlify link
        
        echo ""
        echo "📤 Deploying to production..."
        netlify deploy --prod
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "🌐 Your site is live!"
        netlify open:site
        ;;
    
    2)
        echo ""
        echo "🆕 Creating new Netlify site..."
        
        read -p "Enter a site name (or press Enter for random): " site_name
        
        if [ -z "$site_name" ]; then
            netlify init
        else
            netlify init --manual
        fi
        
        echo ""
        echo "📤 Deploying to production..."
        netlify deploy --prod
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "🌐 Your site is live!"
        netlify open:site
        ;;
    
    3)
        echo ""
        echo "📦 Build is ready in dist/spa folder"
        echo ""
        echo "To deploy manually:"
        echo "1. Go to https://app.netlify.com"
        echo "2. Drag and drop the 'dist/spa' folder"
        echo "3. Or connect your GitHub repository"
        echo ""
        echo "Don't forget to set environment variables in Netlify!"
        echo "See DEPLOY_NOW.md for detailed instructions."
        ;;
    
    *)
        echo -e "${RED}❌ Invalid choice!${NC}"
        exit 1
        ;;
esac

# Step 9: Set Environment Variables
if [ "$deploy_choice" == "1" ] || [ "$deploy_choice" == "2" ]; then
    echo ""
    echo "🔐 Step 9: Setting up environment variables..."
    echo "================================================"
    echo ""
    echo "Do you want to automatically sync environment variables to Netlify?"
    echo "(This will upload the variables from your .env file)"
    read -p "Sync env variables? (y/n): " sync_env
    
    if [ "$sync_env" == "y" ] || [ "$sync_env" == "Y" ]; then
        echo "Syncing environment variables..."
        
        # Read .env and set variables
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            if [[ ! $key =~ ^# && -n $key ]]; then
                # Remove any quotes from value
                value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
                
                echo "Setting $key..."
                netlify env:set "$key" "$value" --force 2>/dev/null || echo "Skipped $key"
            fi
        done < .env
        
        echo -e "${GREEN}✅ Environment variables synced!${NC}"
    else
        echo ""
        echo "You can set environment variables manually:"
        echo "1. Go to your Netlify site dashboard"
        echo "2. Site settings → Build & deploy → Environment"
        echo "3. Add each variable from your .env file"
        echo ""
        echo "Or run: netlify env:set KEY VALUE"
    fi
fi

# Final Summary
echo ""
echo "================================================"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "================================================"
echo ""

if [ "$deploy_choice" == "1" ] || [ "$deploy_choice" == "2" ]; then
    echo "✅ Your site is now live on Netlify!"
    echo ""
    echo "Next steps:"
    echo "1. Test your live site"
    echo "2. Set up custom domain (optional)"
    echo "3. Enable HTTPS (automatic)"
    echo ""
    echo "Useful commands:"
    echo "  netlify open           - Open Netlify dashboard"
    echo "  netlify open:site      - Open your live site"
    echo "  netlify env:list       - List environment variables"
    echo "  netlify deploy --prod  - Deploy again"
else
    echo "✅ Build completed successfully!"
    echo ""
    echo "Your build is ready in: dist/spa"
    echo ""
    echo "Follow manual deployment steps in DEPLOY_NOW.md"
fi

echo ""
echo "📚 Documentation:"
echo "  - Quick Start: DEPLOY_NOW.md"
echo "  - Full Guide: NETLIFY_DEPLOYMENT_GUIDE.md"
echo "  - Troubleshooting: NETLIFY_TROUBLESHOOTING.md"
echo ""
echo "Thank you for using Fayeed Auto Care! 🚗💨"
