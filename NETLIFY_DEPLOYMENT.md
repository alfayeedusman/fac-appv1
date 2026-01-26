# Netlify Deployment Guide

## ✅ Quick Start

Your project is already configured for Netlify! Follow these steps to deploy:

---

## 📋 Pre-Deployment Checklist

### 1. Verify Local Build Works
```bash
# Test the complete build process locally
npm run build

# This should create:
# - dist/spa/     (Frontend bundle)
# - dist/server/  (Server code)
```

### 2. Ensure Git is Clean
```bash
# Commit all changes
git add .
git commit -m "Prepare for Netlify deployment"

# Push to your branch
git push origin main  # or your working branch
```

### 3. Create Netlify Account
- Go to https://netlify.com
- Sign up with GitHub
- Authorize Netlify to access your repositories

---

## 🚀 Deploy to Netlify

### Option 1: Auto Deploy (Recommended)

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Click "Add new site"** → **"Import an existing project"**
3. **Select GitHub** and authorize
4. **Choose your repository**: `alfayeedusman/fac-appv1`
5. **Configure settings**:
   - **Build command**: `npm ci --legacy-peer-deps --include=dev --prefer-offline --no-audit && npm run build && npm run build:server`
   - **Publish directory**: `dist/spa`
   - **Functions directory**: `netlify/functions`
   - **Node version**: `20`

6. **Set Environment Variables** (see section below)
7. **Click "Deploy site"**

### Option 2: Manual Deploy with CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Or use the helper script
bash deploy-to-netlify.sh
```

---

## 🔐 Environment Variables

Set these in **Netlify Dashboard → Site Settings → Build & Deploy → Environment**:

### Required Variables

```
# Database
NEON_DATABASE_URL = postgresql://user:password@...
DATABASE_URL = postgresql://user:password@...

# Firebase (Frontend)
VITE_FIREBASE_API_KEY = AIza...
VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your-project-id
VITE_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
VITE_FIREBASE_APP_ID = 1:123456789:web:abc...
VITE_FIREBASE_MEASUREMENT_ID = G-ABC123
VITE_FIREBASE_FCM_KEY = AAAAABCDEF...

# Mapbox
VITE_MAPBOX_TOKEN = pk.eyJ...

# Pusher (Real-time)
VITE_PUSHER_KEY = abcdef...
VITE_PUSHER_CLUSTER = ap1
PUSHER_KEY = abcdef...
PUSHER_SECRET = secret...
PUSHER_APP_ID = 123456
PUSHER_CLUSTER = ap1

# Xendit (Payments)
XENDIT_SECRET_KEY = xnd_production_...
XENDIT_PUBLIC_KEY = xnd_public_...
XENDIT_WEBHOOK_TOKEN = token...
VITE_XENDIT_PUBLIC_KEY = xnd_public_...

# Build Environment
NODE_VERSION = 20
NPM_CONFIG_PRODUCTION = false
NODE_OPTIONS = --max_old_space_size=4096
NODE_ENV = production
SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES = AIzaSyAaH10Jpspj7t2N4QeVXmfwJYubb0LwkkM
```

---

## 🏗️ Build Process

Netlify will execute:

```bash
npm ci --legacy-peer-deps --include=dev --prefer-offline --no-audit && npm run build && npm run build:server
```

This:
1. ✅ Installs dependencies
2. ✅ Builds React frontend → `dist/spa/`
3. ✅ Builds server code → `dist/server/`
4. ✅ Creates Netlify function handler → `netlify/functions/api.ts`

---

## 📁 Deployment Structure

```
├── dist/spa/                 # Built frontend (served statically)
│   ├── index.html
│   ├── assets/
│   └── ...
├── dist/server/              # Built server code
│   └── ...
└── netlify/functions/
    └── api.ts               # Serverless function handler
```

**How it works**:
- Static files (`dist/spa/`) served by Netlify CDN
- API routes (`/api/*`) proxied to `/.netlify/functions/api`
- Express server handles all routes in the function

---

## 🔄 Automatic Deployments

Once connected:
- **Every push to `main` branch** → Auto-deploys to production
- **Every push to other branches** → Creates preview deploy
- **Rollbacks**: Available in Netlify Dashboard

To disable auto-deploy:
1. Go to **Site Settings → Build & Deploy → Deploy contexts**
2. Turn off **"Auto publish"** for specific branches

---

## 🧪 Test Deployment

After deployment completes:

### 1. Check Site Health
```bash
curl https://your-site.netlify.app/api/health
```

Expected response:
```json
{ "success": true, "status": "ok" }
```

### 2. Test Database Connection
```bash
curl https://your-site.netlify.app/api/neon/test
```

Expected response:
```json
{ "success": true, "connected": true }
```

### 3. Test Login
Visit: `https://your-site.netlify.app/login`

Use credentials:
```
Email: test.admin@example.com
Password: password123
```

---

## 🐛 Troubleshooting

### Build Fails
**Check**: Netlify build logs (Dashboard → Deploys → Pick failed deploy → Logs)

Common issues:
- Missing environment variables → Add to Netlify env settings
- Node version mismatch → Ensure `NODE_VERSION=20`
- Dependency issues → `npm install --legacy-peer-deps`

### API Routes Not Working
**Check**: 
1. Function logs: **Dashboard → Functions → Logs**
2. Ensure `netlify.toml` redirects are correct
3. Verify environment variables are set

### CORS Errors
- Netlify automatically adds CORS headers (configured in `netlify.toml`)
- Headers set for `/api/*` routes

### Database Connection Fails
- Verify `NEON_DATABASE_URL` is in Netlify environment
- Check Neon dashboard for connection limits
- Ensure IP whitelist allows Netlify's IPs (usually all)

---

## 📊 Monitoring

### Netlify Dashboard
- **Analytics**: Dashboard → Analytics
- **Logs**: Dashboard → Logs → Functions
- **Performance**: Dashboard → Analytics → Page Speed

### Real-time Logs
```bash
netlify logs --function=api --tail
```

---

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com
- **Site Domain**: https://your-site.netlify.app
- **Site Settings**: Dashboard → Site Settings
- **Functions**: Dashboard → Functions
- **Environment Variables**: Dashboard → Site Settings → Build & Deploy → Environment
- **Deployment History**: Dashboard → Deploys

---

## 💡 Tips

### 1. Custom Domain
1. Go to **Site settings → Domain management**
2. Click **Add domain**
3. Point your DNS to Netlify nameservers
4. Automatic HTTPS certificate (Let's Encrypt)

### 2. Rollback to Previous Deploy
1. Dashboard → Deploys
2. Right-click previous deploy
3. **Publish deploy**

### 3. Preview URLs
Each branch gets a preview URL:
```
https://branch-name--site-name.netlify.app
```

### 4. Split Testing
1. Dashboard → Site Settings → Build & Deploy → Continuous Deployment
2. Set up branch deployments
3. A/B test different versions

---

## ✨ Deployment Complete!

Once deployed:
- ✅ Frontend served via Netlify CDN (fast!)
- ✅ API routes via Netlify Functions (serverless)
- ✅ Database connected to Neon
- ✅ Automatic HTTPS
- ✅ Automatic rollbacks available

**Your site is live at**: `https://your-site.netlify.app`

---

## 🚨 Important Notes

1. **Never commit secrets**: Use Netlify environment variables
2. **Test locally first**: `npm run build && npm start`
3. **Monitor function duration**: Netlify has limits (default 10s)
4. **Database connections**: Keep them efficient (connection pooling via Neon)
5. **Cold starts**: First request may be slow (normal for serverless)

---

**Last Updated**: January 26, 2026
**Status**: Ready for Production Deployment ✅
