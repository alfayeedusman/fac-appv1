@echo off
setlocal enabledelayedexpansion

REM Color codes using ANSI escape sequences
REM Requires Windows 10+ with ANSI support or ConEmu/Windows Terminal

cls
echo.
echo ════════════════════════════════════════════════════════════
echo   FAC App - Complete Setup Script (Windows)
echo ════════════════════════════════════════════════════════════
echo.

REM Step 1: Check Node.js and npm
echo Checking Node.js and npm installation...
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed. Please install Node.js LTS.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not installed. Please install npm.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% and npm %NPM_VERSION% found
echo.

REM Step 2: Check environment variables
echo Checking environment variables...
if not defined NEON_DATABASE_URL (
  if not defined DATABASE_URL (
    echo [WARNING] NEON_DATABASE_URL or DATABASE_URL not set
    echo   You can set these in a .env.local file
    echo   Setup will continue, but database operations will fail
  ) else (
    echo [OK] DATABASE_URL is set
  )
) else (
  echo [OK] NEON_DATABASE_URL is set
)
echo.

REM Step 3: Clean previous build artifacts
echo Cleaning previous build artifacts...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo [OK] Cleaned
echo.

REM Step 4: Install dependencies
echo Installing dependencies with legacy peer deps support...
call npm ci --legacy-peer-deps --include=dev --prefer-offline --no-audit
if errorlevel 1 (
  echo [ERROR] Failed to install dependencies
  pause
  exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 5: Build frontend
echo Building frontend (React SPA)...
call npm run build:client
if errorlevel 1 (
  echo [ERROR] Failed to build frontend
  pause
  exit /b 1
)
echo [OK] Frontend built successfully
echo.

REM Step 6: Build server
echo Building backend (Express server)...
call npm run build:server
if errorlevel 1 (
  echo [ERROR] Failed to build backend
  pause
  exit /b 1
)
echo [OK] Backend built successfully
echo.

REM Step 7: TypeScript validation
echo Running TypeScript type checking...
call npm run typecheck
if errorlevel 1 (
  echo [WARNING] TypeScript errors found (non-critical, deployment will continue)
) else (
  echo [OK] TypeScript validation passed
)
echo.

REM Step 8: Display setup summary
echo ════════════════════════════════════════════════════════════
echo Setup Complete!
echo ════════════════════════════════════════════════════════════
echo.
echo Package Build Output:
echo   Frontend: dist\spa\
echo   Backend:  dist\server\
echo   Functions: netlify\functions\
echo.
echo Next Steps:
echo.
echo   For LOCAL DEVELOPMENT:
echo     npm run dev
echo     - Starts both frontend and backend on http://localhost:8080
echo.
echo   For NETLIFY DEPLOYMENT:
echo     git add .
echo     git commit -m "Setup complete"
echo     git push
echo     - Netlify will automatically build and deploy
echo.
echo   For LOCAL PRODUCTION TEST:
echo     npm run build
echo     npm start
echo     - Runs the production build locally
echo.
echo Environment Variables Required:
echo   - NEON_DATABASE_URL (PostgreSQL connection string)
echo   - DATABASE_URL (backup for NEON_DATABASE_URL)
echo   - VITE_FIREBASE_API_KEY (and other Firebase vars)
echo   - VITE_MAPBOX_TOKEN
echo   - VITE_PUSHER_KEY, PUSHER_SECRET, PUSHER_APP_ID, PUSHER_CLUSTER
echo   - XENDIT_SECRET_KEY, XENDIT_PUBLIC_KEY, XENDIT_WEBHOOK_TOKEN
echo.
echo Testing API Endpoints:
echo   When running: npm run dev
echo     GET  http://localhost:8080/api/neon/test
echo     GET  http://localhost:8080/api/neon/diagnose
echo     POST http://localhost:8080/api/neon/auth/login
echo     POST http://localhost:8080/api/neon/auth/register
echo.
echo Troubleshooting:
echo   If you see '404' on API routes:
echo     1. Check NEON_DATABASE_URL is set
echo     2. Run 'npm run dev' to start the server
echo     3. Check http://localhost:8080/api/neon/diagnose for errors
echo.
pause
