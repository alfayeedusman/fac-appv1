# 🚀 Quick Start: Deploy to Netlify (3 Steps)

## STEP 1️⃣: Push to GitHub (2 min)

```bash
# Open terminal in your project folder
git add .
git commit -m "Production ready: Fix timeouts, seed users, optimize for Netlify"
git push origin main
```

✅ Done! Your code is now on GitHub

---

## STEP 2️⃣: Connect Netlify (5 min)

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Find and select: **`alfayeedusman/fac-appv1`**
5. On next screen, leave defaults:
   - Build command: `npm ci --legacy-peer-deps --include=dev --prefer-offline --no-audit && npm run build && npm run build:server`
   - Publish directory: `dist/spa`
   - Functions directory: `netlify/functions`
6. Click **"Deploy site"**

✅ Netlify starts building (5-10 minutes)

---

## STEP 3️⃣: Add Environment Variables (10 min)

While Netlify is building:

1. In Netlify Dashboard, click **"Site settings"** → **"Build & deploy"** → **"Environment"**
2. Click **"Edit variables"**
3. Copy/paste all these variables (get values from your services):

```
NEON_DATABASE_URL = postgresql://...
DATABASE_URL = postgresql://...

VITE_FIREBASE_API_KEY = AIza...
VITE_FIREBASE_AUTH_DOMAIN = yourproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = yourproject-id
VITE_FIREBASE_STORAGE_BUCKET = yourproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
VITE_FIREBASE_APP_ID = 1:123456789:web:abc...
VITE_FIREBASE_MEASUREMENT_ID = G-ABC123
VITE_FIREBASE_FCM_KEY = AAAAA...

VITE_MAPBOX_TOKEN = pk.eyJ...
VITE_PUSHER_KEY = abcdef...
VITE_PUSHER_CLUSTER = ap1
PUSHER_KEY = abcdef...
PUSHER_SECRET = secret...
PUSHER_APP_ID = 123456
PUSHER_CLUSTER = ap1

XENDIT_SECRET_KEY = xnd_production_...
XENDIT_PUBLIC_KEY = xnd_public_...
XENDIT_WEBHOOK_TOKEN = token...
VITE_XENDIT_PUBLIC_KEY = xnd_public_...

NODE_VERSION = 20
NPM_CONFIG_PRODUCTION = false
NODE_OPTIONS = --max_old_space_size=4096
NODE_ENV = production
SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES = AIzaSyAaH10Jpspj7t2N4QeVXmfwJYubb0LwkkM
```

4. Click **"Save"**
5. Go back to **Deploys** tab
6. Click **"Trigger deploy"** to rebuild with env vars

✅ Done! Now your app will deploy with all the secrets it needs

---

## ⏳ Wait for Deploy to Complete

Watch the **Deploys** tab:
- 🟡 Building... (5-10 min)
- 🟢 Published ✅

Once green, your site is live!

---

## 🎉 Your App is Live!

**Visit**: https://your-site.netlify.app

### Test with these credentials:

**Admin Account**:
```
Email: test.admin@example.com
Password: password123
```

**Premium Customer**:
```
Email: premium.customer1@example.com
Password: password123
```

---

## 🆘 If Build Fails

1. Click the failed deploy
2. Scroll down to see error
3. Common issues:
   - Missing environment variables → Add them and trigger rebuild
   - Node version → Already set to 20 in netlify.toml
   - Dependencies → Should install automatically

4. After fixing → **Trigger deploy** again

---

## 📊 Where to Check Status

- **Build logs**: Dashboard → Deploys → [click latest]
- **Function logs**: Dashboard → Functions → Logs
- **Your site**: https://your-site.netlify.app

---

## ✨ That's It!

You've deployed to Netlify! 🎊

### What happens next:
- ✅ Every push to `main` auto-deploys
- ✅ Frontend served via CDN (fast!)
- ✅ API runs on serverless functions
- ✅ Database on Neon (PostgreSQL)
- ✅ HTTPS automatic (Let's Encrypt)

---

## 📚 For More Details

- **NETLIFY_DEPLOYMENT.md** - Full guide
- **NETLIFY_DEPLOYMENT_CHECKLIST.md** - Complete checklist
- **.env.example** - All variables explained
- **DEPLOYMENT_STATUS.md** - Current status

---

**Status**: ✅ Ready to Deploy

**Time to deploy**: ~30 minutes (mostly automated)

Let's go! 🚀
