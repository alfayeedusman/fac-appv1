@echo off
setlocal enabledelayedexpansion

REM Colors - requires Windows 10+
REM Using basic color codes

title FAC App - Netlify Deployment Setup

echo.
echo ========================================
echo FAC App - Netlify Deployment Setup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install Node.js and npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [✓] Node.js %NODE_VERSION% installed

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm not found. Please install Node.js and npm.
    pause
    exit /b 1
)

REM Step 1: Cleanup
echo.
echo ========================================
echo Step 1: Cleaning Previous Builds
echo ========================================
echo.
echo [i] Removing old node_modules and dist directories...
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
if exist "dist" rmdir /s /q "dist" >nul 2>&1
if exist "package-lock.json" del "package-lock.json" >nul 2>&1
echo [✓] Cleanup complete

REM Step 2: Install dependencies
echo.
echo ========================================
echo Step 2: Installing Dependencies
echo ========================================
echo.
echo [i] Installing npm dependencies with legacy peer deps flag...
call npm install --legacy-peer-deps --prefer-offline --no-audit
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Failed to install dependencies
    pause
    exit /b 1
)
echo [✓] Dependencies installed successfully

REM Step 3: Type checking
echo.
echo ========================================
echo Step 3: Type Checking
echo ========================================
echo.
echo [i] Running TypeScript type checking...
call npm run typecheck
if %ERRORLEVEL% EQU 0 (
    echo [✓] Type checking passed
) else (
    echo [⚠] Type checking had warnings/errors (non-fatal)
)

REM Step 4: Build
echo.
echo ========================================
echo Step 4: Building Application
echo ========================================
echo.
echo [i] Building client (React SPA)...
call npm run build:client
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Client build failed
    pause
    exit /b 1
)
echo [✓] Client build completed

echo.
echo [i] Building server (Express + functions)...
call npm run build:server
if %ERRORLEVEL% NEQ 0 (
    echo [✗] Server build failed
    pause
    exit /b 1
)
echo [✓] Server build completed

REM Step 5: Verify build artifacts
echo.
echo ========================================
echo Step 5: Verifying Build Artifacts
echo ========================================
echo.

if exist "dist\spa" (
    echo [✓] SPA build verified: dist\spa exists
) else (
    echo [✗] dist\spa directory not found
    pause
    exit /b 1
)

if exist "dist\server" (
    echo [✓] Server build verified: dist\server exists
) else (
    echo [✗] dist\server directory not found
    pause
    exit /b 1
)

REM Step 6: Final summary
echo.
echo ========================================
echo Deployment Ready!
echo ========================================
echo.
echo [✓] All builds completed successfully
echo [i] To deploy to Netlify:
echo.
echo   1. Commit changes to git:
echo      git add .
echo      git commit -m "Deploy to Netlify"
echo.
echo   2. Push to your repository:
echo      git push origin main
echo.
echo   3. Netlify will automatically detect changes and deploy
echo.
echo [i] Build artifacts ready at:
echo   - Frontend: dist\spa\
echo   - Backend: dist\server\
echo.
echo [✓] Setup complete!
echo.

pause
endlocal
