# 🚀 Complete Netlify + Neon Setup Guide

## Your Deployment Info

- **Production Domain**: fayeedautocare.com
- **Test Domain**: facapptest.netlify.app
- **Database**: Neon (PostgreSQL Serverless)
- **Hosting**: Netlify (with serverless functions)

---

## 🎯 What You Need to Do

### Step 1: Set Environment Variables on BOTH Netlify Sites

#### For Production (fayeedautocare.com):
1. Go to https://app.netlify.com
2. Select your **fayeedautocare.com** site
3. Go to: **Site settings → Build & deploy → Environment**
4. Click **"Edit variables"**
5. Add each variable from the list below with **your actual values**

#### For Test (facapptest.netlify.app):
1. Go to https://app.netlify.com
2. Select your **facapptest.netlify.app** site
3. Go to: **Site settings → Build & deploy → Environment**
4. Click **"Edit variables"**
5. Add each variable from the list below with **your actual values**

---

## 📋 Required Environment Variables

### Database (REQUIRED - Same for both sites)
```
NEON_DATABASE_URL = postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL = postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Why both?**
- Backend server uses `NEON_DATABASE_URL`
- Some libraries use `DATABASE_URL` as fallback

---

### Frontend Services (REQUIRED - Copy from your .env file)

#### Firebase (Frontend)
```
VITE_FIREBASE_API_KEY = AIzaSyAaH10Jpspj7t2N4QeVXmfwJYubb0LwkkM
VITE_FIREBASE_AUTH_DOMAIN = facapp-dbdc1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = facapp-dbdc1
VITE_FIREBASE_STORAGE_BUCKET = facapp-dbdc1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 964995288467
VITE_FIREBASE_APP_ID = 1:964995288467:web:a933dcdc046b3f17422c66
VITE_FIREBASE_MEASUREMENT_ID = G-F2D86P30G5
VITE_FIREBASE_FCM_KEY = BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA
```

#### Mapbox (Maps)
```
VITE_MAPBOX_TOKEN = pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg
```

#### Pusher (Real-time) - Frontend Part
```
VITE_PUSHER_KEY = bce5ef8f7770b2fea49d
VITE_PUSHER_CLUSTER = ap1
```

---

### Backend Services (REQUIRED - Same for both sites)

#### Pusher (Real-time) - Backend Part
```
PUSHER_KEY = bce5ef8f7770b2fea49d
PUSHER_SECRET = 3ae85fd35d9f8eb46586
PUSHER_APP_ID = 2102895
PUSHER_CLUSTER = ap1
```

#### Xendit (Payment Processing)
```
XENDIT_SECRET_KEY = xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g
XENDIT_PUBLIC_KEY = xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg
XENDIT_WEBHOOK_TOKEN = Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39
```

---

## ⚠️ IMPORTANT NOTES

### 1. Keep Sensitive Keys Safe
- **SECRET_KEY, WEBHOOK_TOKEN, DATABASE_PASSWORD** = Never commit to Git
- Always set these in Netlify dashboard, not in `.env.production`

### 2. How to Set on Netlify Dashboard

1. **Click "Edit variables"**
2. **Add each variable:**
   - Key: `NEON_DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_...`
   - Scope: **Production** (if production only)
   - Click **"Add"**

3. **Repeat for all variables**

4. **Click "Save"** at the bottom

5. **Trigger redeploy:**
   - Go to **Deploys** tab
   - Click latest deploy
   - Click **"Trigger deploy"**
   - Wait for build to complete

### 3. Verify Setup

After redeploy, check Netlify deploy logs:
1. Go to **Deploys** tab
2. Click latest deploy
3. Look for these messages:
   - ✅ `Neon database connection initialized`
   - ✅ `Database connection test successful`
   - ❌ If you see errors about missing env vars, variables aren't set properly

---

## 🔧 Step-by-Step for fayeedautocare.com

### Production Setup

1. **Open**: https://app.netlify.com
2. **Select site**: fayeedautocare.com
3. **Navigate to**: Site settings → Build & deploy → Environment
4. **Click**: "Edit variables"
5. **Add these 21 variables** (copy from your local `.env` or from above):

| Variable | Value |
|----------|-------|
| NEON_DATABASE_URL | `postgresql://neondb_owner:npg_...` |
| DATABASE_URL | `postgresql://neondb_owner:npg_...` |
| VITE_FIREBASE_API_KEY | `AIzaSyA...` |
| VITE_FIREBASE_AUTH_DOMAIN | `facapp-dbdc1.firebaseapp.com` |
| VITE_FIREBASE_PROJECT_ID | `facapp-dbdc1` |
| VITE_FIREBASE_STORAGE_BUCKET | `facapp-dbdc1.firebasestorage.app` |
| VITE_FIREBASE_MESSAGING_SENDER_ID | `964995288467` |
| VITE_FIREBASE_APP_ID | `1:964995288467:web:a933dcdc046b3f17422c66` |
| VITE_FIREBASE_MEASUREMENT_ID | `G-F2D86P30G5` |
| VITE_FIREBASE_FCM_KEY | `BPZ7qJs...` |
| VITE_MAPBOX_TOKEN | `pk.eyJ1...` |
| VITE_PUSHER_KEY | `bce5ef8f7770b2fea49d` |
| VITE_PUSHER_CLUSTER | `ap1` |
| PUSHER_KEY | `bce5ef8f7770b2fea49d` |
| PUSHER_SECRET | `3ae85fd35d9f8eb46586` |
| PUSHER_APP_ID | `2102895` |
| PUSHER_CLUSTER | `ap1` |
| XENDIT_SECRET_KEY | `xnd_development_DOtbVD...` |
| XENDIT_PUBLIC_KEY | `xnd_public_development_0GsLab...` |
| XENDIT_WEBHOOK_TOKEN | `Q1kEJVOuDw5BUkkPNpJEu3K...` |

6. **Click "Save"**
7. **Redeploy**: Trigger a new deploy from Netlify dashboard
8. **Wait** for build to complete (usually 5-10 minutes)
9. **Test**: https://fayeedautocare.com/login

---

## 🔧 Step-by-Step for facapptest.netlify.app

Repeat the **exact same steps** above, but for the test site:

1. **Open**: https://app.netlify.com
2. **Select site**: facapptest.netlify.app (instead of fayeedautocare.com)
3. **Add the same 21 variables**
4. **Redeploy** and test at: https://facapptest.netlify.app/login

---

## ✅ Verification Checklist

After setup, verify everything works:

### Test 1: Database Connection
- URL: `https://fayeedautocare.com/api/neon/test` (or facapptest.netlify.app)
- Should return: `{ "status": "healthy", "services": { "neon": "connected" } }`

### Test 2: User Login
- URL: `https://fayeedautocare.com/login` (or facapptest.netlify.app)
- Email: `superadmin@fayeedautocare.com`
- Password: `SuperAdmin2024!`
- Expected: Successful login and redirect to dashboard

### Test 3: Debug Endpoint
- URL: `https://fayeedautocare.com/api/neon/auth/debug` (POST request)
- Body:
  ```json
  {
    "email": "superadmin@fayeedautocare.com",
    "password": "SuperAdmin2024!"
  }
  ```
- Expected: `{ "success": true, "debugInfo": { ... } }`

---

## 🐛 Troubleshooting

### Problem: Login fails with "Service temporarily unavailable"
**Solution:**
1. Check Netlify deploy logs for database connection errors
2. Verify `NEON_DATABASE_URL` is set correctly
3. Check URL doesn't have typos (copy-paste from Neon dashboard)

### Problem: Variables are set but app still fails
**Solution:**
1. **Trigger a redeploy** - Settings don't apply until rebuild:
   - Go to Deploys → Latest deploy → "Trigger deploy"
2. **Clear browser cache** - Old build may be cached:
   - Hard refresh: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)
3. **Check deploy logs** - Go to Netlify → Deploys → Latest → "Deploy log"

### Problem: Domain not working (fayeedautocare.com)
**Solution:**
1. Verify DNS is pointing to Netlify:
   - Go to Netlify dashboard
   - Select your site
   - Go to "Domain settings"
   - Check DNS records are pointing to Netlify
2. Wait 24-48 hours for DNS propagation if recently updated

---

## 🎉 You're All Set!

Once all variables are set and redeploy completes:

✅ fayeedautocare.com → Production (with Neon database)
✅ facapptest.netlify.app → Test (with same Neon database)
✅ Users can login
✅ Bookings work
✅ All services connected

---

## 📚 Need Help?

**If something fails:**
1. Check Netlify deploy logs (most common issues are there)
2. Look for error messages with "DATABASE", "NEON", "CONNECT", "TIMEOUT"
3. Verify all 21 variables are set in Netlify dashboard
4. Trigger a manual redeploy to apply new variables

**Test the debug endpoint** to get detailed error info:
```
POST https://fayeedautocare.com/api/neon/auth/debug
Body: { "email": "superadmin@fayeedautocare.com", "password": "SuperAdmin2024!" }
```

Good luck! 🚀
