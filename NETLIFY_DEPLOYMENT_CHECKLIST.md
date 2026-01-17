# Netlify Deployment Checklist

## ✅ What I Fixed

1. **Updated netlify.toml** ✓
   - Added `npm ci --legacy-peer-deps` to install dependencies
   - Set Node.js version to 22
   - Configured external modules (express, cors, drizzle-orm, @neondatabase/serverless)
   - Proper build environment variables
   - Security headers and cache control

2. **Verified Dependencies** ✓
   - All required packages in package.json
   - serverless-http available for Netlify functions
   - Neon and Drizzle dependencies installed

3. **Created Deployment Guide** ✓
   - NETLIFY_DEPLOYMENT_SETUP.md with step-by-step instructions
   - Environment variables checklist
   - Troubleshooting guide

## 🚀 Before Deploying to Netlify

### Step 1: Test Locally
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start production server
npm start

# Test health endpoint
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T...",
  "services": {
    "neon": "connected"
  }
}
```

### Step 2: Set Environment Variables in Netlify

Go to your Netlify site dashboard:
1. **Site Settings** → **Build & Deploy** → **Environment**
2. Add these variables:

```
# Database (Required)
NEON_DATABASE_URL=postgresql://...

# Firebase (Required)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=facapp-dbdc1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=facapp-dbdc1
VITE_FIREBASE_STORAGE_BUCKET=facapp-dbdc1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=964995288467
VITE_FIREBASE_APP_ID=1:964995288467:web:a933dcdc046b3f17422c66
VITE_FIREBASE_MEASUREMENT_ID=G-F2D86P30G5
VITE_FIREBASE_FCM_KEY=BPZ7q...

# Payment (Required)
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_PUBLIC_KEY=xnd_public_development_...
XENDIT_WEBHOOK_TOKEN=Q1kEJVOu...

# Real-time (Required)
PUSHER_APP_ID=2102895
PUSHER_KEY=bce5ef8f...
PUSHER_SECRET=3ae85fd35...
PUSHER_CLUSTER=ap1
VITE_PUSHER_KEY=bce5ef8f...
VITE_PUSHER_CLUSTER=ap1

# Maps (Required)
VITE_MAPBOX_TOKEN=pk.eyJ1...

# Build
NODE_ENV=production
```

### Step 3: Deploy

Option A: Push to main branch (automatic)
```bash
git add .
git commit -m "fix: update netlify configuration for proper build"
git push origin main
```

Option B: Manual deploy in Netlify Dashboard
- Go to **Deployments**
- Click **Deploy site** → **Deploy from Git**
- Select your branch

### Step 4: Monitor Build

1. Go to **Deployments** tab
2. Click the latest deployment
3. Watch the build logs in real-time
4. Should see:
   - ✅ Dependencies installing
   - ✅ Building client (Vite)
   - ✅ Building server
   - ✅ Deploy success

### Step 5: Verify Production

After deploy completes, test:

1. **Health Check**:
   ```
   https://your-site.netlify.app/.netlify/functions/api/health
   ```

2. **Payment Test**:
   ```
   https://your-site.netlify.app/.netlify/functions/api/neon/payment/xendit/test
   ```

3. **Frontend Access**:
   ```
   https://your-site.netlify.app/
   ```

4. **Browser Console**:
   - No errors about missing API endpoints
   - Firebase initialized
   - Pusher connected
   - Mapbox token valid

## 🔧 Build Process Flow

```
netlify.toml (npm ci → npm run build)
    ↓
package.json (npm run build:client && npm run build:server)
    ↓
1. build:client → vite build (creates dist/spa)
2. build:server → vite build --config vite.config.server.ts (creates dist/server)
    ↓
netlify/functions/api.ts wraps Express app with serverless-http
    ↓
Deploy to Netlify Edge (CDN for spa, Functions for API)
```

## 🐛 Common Issues & Fixes

### Issue: "exit code 127: command not found"
**Fix**: `npm ci --legacy-peer-deps` installs dependencies
- Netlify build environment now has this in the build command

### Issue: "Cannot find module 'serverless-http'"
**Fix**: Already in package.json dependencies
- Ensure npm ci runs before build

### Issue: Database connection fails
**Fix**: Check NEON_DATABASE_URL in environment variables
- Test locally first: `npm run build && npm start`

### Issue: API returns 404
**Fix**: Verify netlify.toml redirects
- `/api/*` should route to `/.netlify/functions/api/:splat`
- Already configured in updated netlify.toml

### Issue: Build times out
**Fix**: Clear Netlify cache
- **Settings** → **Build & Deploy** → **Cache** → **Clear cache and retry**

## 📊 Expected Build Time

- Dependencies install: ~2-3 minutes (first deploy)
- Vite client build: ~30-60 seconds
- Vite server build: ~20-30 seconds
- Deploy: ~30 seconds

**Total**: ~5-10 minutes for first deploy (cached after)

## ✨ Post-Deployment

1. **Monitor Logs**
   - Netlify Analytics
   - Check function execution logs

2. **Set Up Alerts**
   - Failed builds
   - High function duration
   - Errors in logs

3. **Optimize**
   - Check bundle size (dist/stats.html)
   - Monitor API performance
   - Set up error tracking (optional)

## 🆘 Still Having Issues?

1. **Check Netlify Logs**
   - Go to **Functions** tab
   - Look for deployment errors

2. **Clear Cache**
   - Settings → Build & Deploy → Clear cache

3. **Rebuild**
   - Deployments → Select deployment → Retry

4. **Local Testing**
   ```bash
   npm install
   npm run build
   npm start
   # Test all API endpoints before deploying
   ```

5. **Check Documentation**
   - https://docs.netlify.com/
   - https://neon.tech/docs

---

**Changes Made**:
- ✅ netlify.toml updated with proper build setup
- ✅ Environment variables documented
- ✅ Deployment checklist created
- ✅ Troubleshooting guide provided

**Next**: Follow the "Before Deploying to Netlify" section above!
