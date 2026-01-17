@echo off
REM 🚀 Fayeed Auto Care - One-Click Netlify Deployment Script (Windows)
REM This script automates the entire deployment process

setlocal enabledelayedexpansion

echo 🚀 Starting Fayeed Auto Care Deployment...
echo ================================================
echo.

REM Step 1: Check Prerequisites
echo 📋 Step 1: Checking prerequisites...
echo ================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm version: %NPM_VERSION%

REM Step 2: Check if Netlify CLI is installed
echo.
echo 🔧 Step 2: Checking Netlify CLI...
echo ================================================

where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Netlify CLI not found. Installing...
    call npm install -g netlify-cli
    echo ✅ Netlify CLI installed!
) else (
    echo ✅ Netlify CLI already installed
)

REM Step 3: Clean and Install Dependencies
echo.
echo 📦 Step 3: Installing dependencies...
echo ================================================

REM Clean previous builds
if exist "node_modules" (
    echo 🧹 Cleaning old node_modules...
    rmdir /s /q node_modules
)

if exist "dist" (
    echo 🧹 Cleaning old dist folder...
    rmdir /s /q dist
)

REM Install dependencies with legacy peer deps
echo 📥 Installing dependencies (this may take a few minutes)...
call npm install --legacy-peer-deps --prefer-offline --no-audit

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Dependency installation failed!
    pause
    exit /b 1
)

echo ✅ Dependencies installed!

REM Step 4: Run Type Check
echo.
echo 🔍 Step 4: Running TypeScript checks...
echo ================================================

call npm run typecheck

if %ERRORLEVEL% NEQ 0 (
    echo ❌ TypeScript checks failed!
    pause
    exit /b 1
)

echo ✅ TypeScript checks passed!

REM Step 5: Build the Project
echo.
echo 🏗️  Step 5: Building the project...
echo ================================================

call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

if not exist "dist\spa" (
    echo ❌ Build failed! dist\spa folder not found
    pause
    exit /b 1
)

echo ✅ Build successful!
echo 📁 Build output: dist\spa

REM Step 6: Check Environment Variables
echo.
echo 🔐 Step 6: Checking environment variables...
echo ================================================

if not exist ".env" (
    echo ⚠️  .env file not found!
    echo Creating template .env file...
    
    (
        echo # Database
        echo NEON_DATABASE_URL=your_database_url_here
        echo.
        echo # Firebase
        echo VITE_FIREBASE_API_KEY=your_api_key_here
        echo VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
        echo VITE_FIREBASE_PROJECT_ID=your_project_id_here
        echo VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
        echo VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
        echo VITE_FIREBASE_APP_ID=your_app_id_here
        echo VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
        echo VITE_FIREBASE_FCM_KEY=your_fcm_key_here
        echo.
        echo # Mapbox
        echo VITE_MAPBOX_TOKEN=your_mapbox_token_here
        echo.
        echo # Xendit
        echo XENDIT_SECRET_KEY=your_xendit_secret_here
        echo XENDIT_WEBHOOK_TOKEN=your_webhook_token_here
        echo XENDIT_PUBLIC_KEY=your_public_key_here
        echo.
        echo # Pusher
        echo PUSHER_KEY=your_pusher_key_here
        echo PUSHER_SECRET=your_pusher_secret_here
        echo PUSHER_APP_ID=your_pusher_app_id_here
        echo PUSHER_CLUSTER=your_pusher_cluster_here
        echo VITE_PUSHER_KEY=your_pusher_key_here
        echo VITE_PUSHER_CLUSTER=your_pusher_cluster_here
    ) > .env
    
    echo ⚠️  Please edit .env file with your actual values
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ .env file found!

REM Step 7: Netlify Login
echo.
echo 🔐 Step 7: Netlify Authentication...
echo ================================================

echo Opening browser for Netlify login...
call netlify login

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Netlify login failed!
    pause
    exit /b 1
)

echo ✅ Authenticated with Netlify!

REM Step 8: Ask User for Deployment Type
echo.
echo 🚀 Step 8: Choose Deployment Option...
echo ================================================
echo.
echo Choose your deployment option:
echo 1) Deploy to EXISTING Netlify site (link and deploy)
echo 2) Deploy to NEW Netlify site (create and deploy)
echo 3) Deploy manually (I'll set up site myself)
echo.
set /p deploy_choice="Enter your choice (1, 2, or 3): "

if "%deploy_choice%"=="1" (
    echo.
    echo 🔗 Linking to existing Netlify site...
    call netlify link
    
    echo.
    echo 📤 Deploying to production...
    call netlify deploy --prod
    
    echo ✅ Deployment complete!
    echo.
    echo 🌐 Your site is live!
    call netlify open:site
    
) else if "%deploy_choice%"=="2" (
    echo.
    echo 🆕 Creating new Netlify site...
    call netlify init
    
    echo.
    echo 📤 Deploying to production...
    call netlify deploy --prod
    
    echo ✅ Deployment complete!
    echo.
    echo 🌐 Your site is live!
    call netlify open:site
    
) else if "%deploy_choice%"=="3" (
    echo.
    echo 📦 Build is ready in dist\spa folder
    echo.
    echo To deploy manually:
    echo 1. Go to https://app.netlify.com
    echo 2. Drag and drop the 'dist\spa' folder
    echo 3. Or connect your GitHub repository
    echo.
    echo Don't forget to set environment variables in Netlify!
    echo See DEPLOY_NOW.md for detailed instructions.
    
) else (
    echo ❌ Invalid choice!
    pause
    exit /b 1
)

REM Final Summary
echo.
echo ================================================
echo 🎉 DEPLOYMENT COMPLETE!
echo ================================================
echo.

if "%deploy_choice%"=="1" (
    echo ✅ Your site is now live on Netlify!
    echo.
    echo Next steps:
    echo 1. Test your live site
    echo 2. Set up custom domain (optional)
    echo 3. Enable HTTPS (automatic)
    echo.
    echo Useful commands:
    echo   netlify open           - Open Netlify dashboard
    echo   netlify open:site      - Open your live site
    echo   netlify env:list       - List environment variables
    echo   netlify deploy --prod  - Deploy again
) else if "%deploy_choice%"=="2" (
    echo ✅ Your site is now live on Netlify!
    echo.
    echo Next steps:
    echo 1. Test your live site
    echo 2. Set up custom domain (optional)
    echo 3. Enable HTTPS (automatic)
    echo.
    echo Useful commands:
    echo   netlify open           - Open Netlify dashboard
    echo   netlify open:site      - Open your live site
    echo   netlify env:list       - List environment variables
    echo   netlify deploy --prod  - Deploy again
) else (
    echo ✅ Build completed successfully!
    echo.
    echo Your build is ready in: dist\spa
    echo.
    echo Follow manual deployment steps in DEPLOY_NOW.md
)

echo.
echo 📚 Documentation:
echo   - Quick Start: DEPLOY_NOW.md
echo   - Full Guide: NETLIFY_DEPLOYMENT_GUIDE.md
echo   - Troubleshooting: NETLIFY_TROUBLESHOOTING.md
echo.
echo Thank you for using Fayeed Auto Care! 🚗💨
echo.
pause
