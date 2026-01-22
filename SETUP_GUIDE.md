# FAC App - Complete Setup & Deployment Guide

## Overview

This guide covers the complete setup, configuration, and deployment of the FAC App (frontend + backend) to Netlify.

## What Was Fixed

### 1. **Netlify Serverless Function Integration** ✅

- Enhanced `netlify/functions/api.ts` with robust error handling
- Proper initialization of Express server on first request
- Better error reporting for debugging

### 2. **Build Configuration** ✅

- Updated `netlify.toml` to properly build both frontend and backend
- Added server build step to build command
- Configured external node modules for Netlify Functions

### 3. **Environment Variables** ✅

- Created `.env.example` template with all required variables
- Updated Netlify configuration to read environment variables

### 4. **Setup Scripts** ✅

- Created `setup.sh` (macOS/Linux) for one-command setup
- Created `setup.bat` (Windows) for one-command setup
- Updated `package.json` with convenient npm scripts

### 5. **Database Initialization** ✅

- Improved middleware for graceful database initialization
- Better error handling in connection tests
- Fallback mechanisms for unavailable database

## Prerequisites

- Node.js LTS (v18+)
- npm or yarn
- Git account with GitHub access
- Netlify account (https://netlify.com)
- Neon PostgreSQL database (https://neon.tech)

## Quick Start

### For macOS/Linux:

```bash
bash setup.sh
```

### For Windows:

```cmd
setup.bat
```

### Manual Setup:

```bash
npm install --legacy-peer-deps --include=dev
npm run build
npm run build:server
npm run typecheck
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory with all required variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
NEON_DATABASE_URL=postgresql://...
VITE_FIREBASE_API_KEY=AIza...
VITE_MAPBOX_TOKEN=pk.eyJ...
# ... etc
```

### 2. Netlify Deployment

#### Step 1: Connect Git Repository

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Click "Deploy site"

#### Step 2: Configure Environment Variables

1. Go to Site Settings → Build & Deploy → Environment
2. Add all variables from `.env.example`
3. Click "Save"

#### Step 3: Trigger Redeploy

1. Go to Deployments
2. Click "Trigger deploy" → "Deploy site"

The deployment will:

1. Install dependencies
2. Build frontend (React SPA)
3. Build backend (Express server)
4. Deploy to Netlify Functions

## Development

### Local Development

```bash
npm run dev
```

This starts:

- Frontend: http://localhost:8080 (Vite dev server)
- Backend: http://localhost:8080/api/\* (Express server)

### Testing API Endpoints

#### Test database connection:

```bash
curl http://localhost:8080/api/neon/test
```

#### Run diagnostics:

```bash
curl http://localhost:8080/api/neon/diagnose
```

#### Initialize database:

```bash
curl -X POST http://localhost:8080/api/neon/init
```

#### Test login (invalid credentials expected):

```bash
curl -X POST http://localhost:8080/api/neon/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Running in Production Mode Locally

```bash
npm run build
npm start
```

## Project Structure

```
.
├── client/                    # Frontend (React SPA)
│   ├── pages/                 # Route pages
│   ├── components/            # React components
│   ├── services/              # API services
│   └── main.tsx               # App entry point
├── server/                    # Backend (Express)
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic
│   ├── database/              # Database setup & migrations
│   ├── middleware/            # Express middleware
│   └── index.ts               # Server setup
├── netlify/                   # Netlify Functions
│   └── functions/api.ts       # Serverless function handler
├── dist/                      # Build output
│   ├── spa/                   # Frontend build
│   └── server/                # Backend build
├── netlify.toml               # Netlify configuration
├── vite.config.ts             # Frontend build config
├── vite.config.server.ts      # Backend build config
├── package.json               # Dependencies & scripts
├── setup.sh                   # Setup script (macOS/Linux)
├── setup.bat                  # Setup script (Windows)
└── .env.example               # Environment variables template
```

## API Endpoints

### Authentication

- `POST /api/neon/auth/login` - User login
- `POST /api/neon/auth/register` - User registration
- `POST /api/neon/auth/logout` - User logout

### Database

- `GET /api/neon/test` - Test database connection
- `GET /api/neon/diagnose` - Run diagnostics
- `POST /api/neon/init` - Initialize database

### Bookings

- `POST /api/neon/bookings` - Create booking
- `GET /api/neon/bookings` - Get bookings
- `GET /api/neon/bookings/availability` - Check slot availability
- `GET /api/neon/bookings/garage-settings` - Get garage settings
- `PUT /api/neon/bookings/:id` - Update booking

## Troubleshooting

### 404 Errors on API Routes

**Symptom**: Requests to `/api/neon/*` return 404

**Solutions**:

1. **Check Environment Variables**

   ```bash
   # On Netlify dashboard, verify all env vars are set
   # Especially: NEON_DATABASE_URL, DATABASE_URL
   ```

2. **Check Deployment Build Log**
   - Go to Netlify → Deployments
   - Click on the failed deployment
   - Look for build errors in the logs

3. **Test Locally**

   ```bash
   npm run dev
   curl http://localhost:8080/api/neon/diagnose
   ```

4. **Run Setup Again**
   ```bash
   npm run setup:netlify:clean  # Clean install
   ```

### Database Connection Failed

**Symptom**: `/api/neon/diagnose` shows "Database connection failed"

**Solutions**:

1. **Verify Database URL**

   ```bash
   # Check NEON_DATABASE_URL format
   # Should be: postgresql://user:password@host:port/database
   ```

2. **Test Connection Locally**
   - Add DATABASE_URL to your `.env.local`
   - Run `npm run dev`
   - Check `/api/neon/test` endpoint

3. **Check Neon Dashboard**
   - https://console.neon.tech
   - Verify project and database exist
   - Check connection limits

### Build Fails on Netlify

**Symptom**: Deployment fails with build errors

**Solutions**:

1. **Check Node Memory**
   - Netlify has a 4GB limit
   - `netlify.toml` includes: `NODE_OPTIONS = "--max_old_space_size=4096"`

2. **Clear Build Cache**
   - Netlify dashboard → Build & Deploy → Triggers
   - Click "Clear cache and rebuild"

3. **Check Dependencies**
   ```bash
   npm install --legacy-peer-deps --include=dev --prefer-offline
   npm run typecheck
   ```

### Slow Deployments

**Causes**: Large dependencies, slow network

**Solutions**:

1. Use `npm ci` instead of `npm install` (faster, more reliable)
2. The setup scripts already use this by default
3. Netlify caches `node_modules` between builds (usually fast)

## Advanced Configuration

### Custom Domain

1. Netlify dashboard → Domain settings
2. Add custom domain
3. Update DNS records (follow Netlify instructions)

### Custom Functions

To add more API endpoints:

1. Create handler in `server/routes/neon-api.ts`
2. Register route in `server/index.ts`
3. No changes needed in Netlify configuration

### SSL/HTTPS

- Netlify automatically provides SSL certificates
- HTTPS is enabled by default
- No configuration needed

## Security Considerations

### Environment Variables

- Never commit `.env.local` to git (already in `.gitignore`)
- Store secrets in Netlify dashboard, not in code
- Use separate keys for development and production

### API Keys

- Firebase, Mapbox, Xendit, Pusher keys should be public/frontend safe
- Secrets (Pusher Secret, Xendit Secret) should be backend-only
- Netlify Functions run server-side, so secrets are safe

### CORS

- Frontend and backend are on same origin (Netlify subdomain)
- CORS is configured in `server/index.ts`
- Production allows all origins (same domain)

## Monitoring

### Check Deployment Status

```bash
# View latest deployment
curl https://facapptest.netlify.app/api/neon/diagnose

# Check health
curl https://facapptest.netlify.app/api/health
```

### View Server Logs

1. Netlify dashboard → Functions
2. Click on `api` function
3. View real-time logs

## Performance Tips

1. **Frontend Build**
   - Vite is fast (usually < 1 minute)
   - React 18 with SWC compiler

2. **Backend Build**
   - Server build is quick (< 30 seconds)
   - Uses esbuild for bundling

3. **Database**
   - Use Neon Serverless driver for optimal performance
   - Connection pooling is automatic

4. **Caching**
   - Frontend assets cached forever (immutable hashes)
   - HTML cached with no-cache policy
   - API responses depend on your logic

## Next Steps

1. **Verify Setup**

   ```bash
   npm run dev
   curl http://localhost:8080/api/neon/diagnose
   ```

2. **Deploy to Netlify**

   ```bash
   git add .
   git commit -m "Setup complete"
   git push
   ```

3. **Test Deployed Version**
   - Visit `https://facapptest.netlify.app`
   - Check browser console for errors
   - Test API endpoints

4. **Monitor & Debug**
   - Check Netlify Functions logs
   - Monitor database usage in Neon dashboard
   - Track API errors with error logging

## Support

### Error Reporting

- Check `/api/neon/diagnose` endpoint for detailed system status
- Review Netlify Functions logs for backend errors
- Check browser console for frontend errors

### Database Issues

- Neon status: https://status.neon.tech
- Neon docs: https://neon.tech/docs
- Connection help: https://neon.tech/docs/connect/connection-details

### Netlify Issues

- Netlify docs: https://docs.netlify.com
- Support: https://support.netlify.com

## Changelog

### Latest Changes

- ✅ Enhanced Netlify serverless function with better error handling
- ✅ Improved build configuration for both frontend and backend
- ✅ Created one-command setup scripts (macOS/Linux/Windows)
- ✅ Added comprehensive environment variable template
- ✅ Updated package.json with convenient npm scripts
- ✅ Improved database initialization middleware
- ✅ Better error logging and debugging output

---

**Last Updated**: 2024
**Version**: 1.0.0
