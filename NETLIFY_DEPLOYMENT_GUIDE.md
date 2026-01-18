# Netlify + Neon Production Deployment Guide

## ✅ What's Already Configured

Your app is **already set up for Netlify**:

- ✅ `netlify.toml` configured
- ✅ Netlify Functions wrapper ready (`netlify/functions/api.ts`)
- ✅ Frontend SPA configured (`dist/spa`)
- ✅ API routing to serverless functions
- ✅ Neon PostgreSQL database ready

---

## 🚀 Step-by-Step Deployment

### **Step 1: Connect Your GitHub Repository to Netlify**

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authenticate
4. Select your repository
5. Netlify should auto-detect settings from `netlify.toml`
6. Click **"Deploy site"**

### **Step 2: Configure Environment Variables in Netlify**

After connecting your repo, go to:
**Site settings** → **Build & deploy** → **Environment** → **Environment variables**

Add these variables:

#### **Database Configuration**

```
NEON_DATABASE_URL=postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL=postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### **Server Configuration**

```
NODE_ENV=production
PORT=8080
```

#### **Firebase Configuration** (Client + Server)

```
VITE_FIREBASE_API_KEY=<YOUR_FIREBASE_WEB_API_KEY>
VITE_FIREBASE_AUTH_DOMAIN=facapp-dbdc1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=facapp-dbdc1
VITE_FIREBASE_STORAGE_BUCKET=facapp-dbdc1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=964995288467
VITE_FIREBASE_APP_ID=1:964995288467:web:a933dcdc046b3f17422c66
VITE_FIREBASE_MEASUREMENT_ID=G-F2D86P30G5
VITE_FIREBASE_FCM_KEY=BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA
```

#### **Xendit Payment Configuration**

```
XENDIT_SECRET_KEY=xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g
XENDIT_PUBLIC_KEY=xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg
XENDIT_WEBHOOK_TOKEN=Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39
```

#### **Mapbox Configuration**

```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg
```

#### **Pusher Configuration**

```
PUSHER_KEY=bce5ef8f7770b2fea49d
PUSHER_SECRET=3ae85fd35d9f8eb46586
PUSHER_APP_ID=2102895
PUSHER_CLUSTER=ap1
VITE_PUSHER_KEY=bce5ef8f7770b2fea49d
VITE_PUSHER_CLUSTER=ap1
```

#### **Frontend URL** (Important!)

```
VITE_API_BASE_URL=https://your-netlify-site.netlify.app/api
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Replace `your-netlify-site` with your actual Netlify site name!

---

## 📋 Environment Variables Checklist

Use this to verify all variables are set:

```
DATABASE TIER:
☐ NEON_DATABASE_URL
☐ DATABASE_URL

SERVER TIER:
☐ NODE_ENV (production)
☐ PORT (8080)

FIREBASE TIER:
☐ VITE_FIREBASE_API_KEY
☐ VITE_FIREBASE_AUTH_DOMAIN
☐ VITE_FIREBASE_PROJECT_ID
☐ VITE_FIREBASE_STORAGE_BUCKET
☐ VITE_FIREBASE_MESSAGING_SENDER_ID
☐ VITE_FIREBASE_APP_ID
☐ VITE_FIREBASE_MEASUREMENT_ID
☐ VITE_FIREBASE_FCM_KEY

PAYMENT TIER:
☐ XENDIT_SECRET_KEY
☐ XENDIT_PUBLIC_KEY
☐ XENDIT_WEBHOOK_TOKEN

MAPS TIER:
☐ VITE_MAPBOX_TOKEN

REALTIME TIER:
☐ PUSHER_KEY
☐ PUSHER_SECRET
☐ PUSHER_APP_ID
☐ PUSHER_CLUSTER
☐ VITE_PUSHER_KEY
☐ VITE_PUSHER_CLUSTER

FRONTEND TIER:
☐ VITE_API_BASE_URL (https://your-site.netlify.app/api)
☐ FRONTEND_URL (https://your-site.netlify.app)
```

---

## 🔄 How Netlify Deployment Works

```
1. You push to GitHub
   ↓
2. Netlify auto-detects change
   ↓
3. Netlify runs: npm run build
   ↓
4. Frontend builds to: dist/spa/
   ↓
5. Backend builds to: dist/server/ (as Netlify Functions)
   ↓
6. API routes mapped: /api/* → /.netlify/functions/api/*
   ↓
7. Frontend served from Netlify CDN
   ↓
8. API calls go to Netlify Functions
   ↓
9. Functions connect to Neon PostgreSQL
```

---

## 🧪 Testing Your Deployment

### **Test 1: Check Site is Live**

```bash
curl https://your-site.netlify.app
# Should return HTML (frontend)
```

### **Test 2: Check API is Responding**

```bash
curl https://your-site.netlify.app/api/health
# Should return: {"status":"healthy",...}
```

### **Test 3: Check Database Connection**

```bash
curl https://your-site.netlify.app/api/neon/test
# Should return: {"success":true,"connected":true,...}
```

### **Test 4: Test Login**

1. Go to `https://your-site.netlify.app/login`
2. Enter credentials:
   - Email: `superadmin@fayeedautocare.com`
   - Password: `password123`
3. Should redirect to admin dashboard

### **Test 5: Check Admin Dashboard**

1. Go to `https://your-site.netlify.app/admin-dashboard`
2. Should show stats and menu items

---

## 🚨 Common Issues & Fixes

### **Issue: "API not responding" or 404 errors**

**Check 1:** Verify environment variables are set

```
Netlify → Site settings → Build & deploy → Environment
```

**Check 2:** Check build logs

```
Netlify → Deploys → Click latest deploy → View deploy log
```

**Check 3:** Check function logs

```
Netlify → Functions → View logs in real-time
```

### **Issue: Login not working**

**Check:**

1. Is `NEON_DATABASE_URL` set? (without it, DB connection fails)
2. Is `NODE_ENV=production`?
3. Check function logs for database errors

### **Issue: "CORS" or "Cannot find module" errors**

**Solution:**

```bash
# Clear Netlify cache and rebuild
1. Netlify → Deploys → Trigger deploy → Clear cache and deploy
```

### **Issue: Frontend shows "Cannot connect to API"**

**Check:**

1. Is `VITE_API_BASE_URL` set to your Netlify domain?
2. Are API routes being called correctly?
3. Check browser console for CORS errors

---

## 📊 Deployment Checklist

Before deploying, complete this:

```
PRE-DEPLOYMENT:
☐ All code committed to GitHub
☐ Tests passing: npm test
☐ Build works: npm run build
☐ Database migrated (already done)
☐ Superadmin credentials set

NETLIFY SETUP:
☐ Repository connected to Netlify
☐ Build command correct (npm run build)
☐ Publish directory correct (dist/spa)
☐ Functions directory correct (netlify/functions)
☐ All environment variables added
☐ NEON_DATABASE_URL is set (CRITICAL!)
☐ VITE_API_BASE_URL points to your Netlify domain

POST-DEPLOYMENT:
☐ Site loads without errors
☐ API health check passes
☐ Database connection test passes
☐ Login page loads
☐ Can log in with superadmin credentials
☐ Admin dashboard accessible
☐ Bookings show data
☐ No console errors in browser
```

---

## 🎯 Your Netlify Build Settings

Your `netlify.toml` is already correct:

```toml
[build]
  command = "npm run build"           # Builds frontend + backend
  functions = "netlify/functions"    # Serverless functions location
  publish = "dist/spa"               # Publish frontend

[functions]
  external_node_modules = ["express"]    # Include Express
  node_bundler = "esbuild"              # Fast bundler

[[redirects]]
  force = true
  from = "/api/*"                    # All API requests
  status = 200
  to = "/.netlify/functions/api:splat"  # Route to serverless function
```

No changes needed! ✅

---

## 📞 Quick Links

- **Netlify Dashboard:** https://app.netlify.com
- **Neon Console:** https://console.neon.tech
- **Your Database:** ep-green-glitter-aefe3h65 (Neon project)
- **Netlify Docs:** https://docs.netlify.com/
- **Neon + Netlify:** https://neon.tech/docs/guides/netlify

---

## 🎉 You're Ready!

Your app is production-ready for Netlify + Neon:

1. ✅ Database (Neon) - already set up and migrated
2. ✅ Frontend (React SPA) - builds to `dist/spa`
3. ✅ Backend (Express) - wrapped as Netlify Functions
4. ✅ Environment variables - just need to configure in Netlify
5. ✅ Routing - already configured in `netlify.toml`

**Next Step:** Connect your GitHub repo to Netlify and set the environment variables!

---

**Deployment Status:** 🟢 READY  
**Time to Deploy:** ~5 minutes  
**Expected Downtime:** 0 minutes (no migration needed)
