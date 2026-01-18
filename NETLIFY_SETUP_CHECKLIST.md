# ✅ Netlify Setup Checklist (10 minutes)

## 📝 Your Setup Info

```
Production: fayeedautocare.com
Test: facapptest.netlify.app
Database: Neon (PostgreSQL)
```

---

## 🔧 STEP 1: Set Environment Variables on PRODUCTION Site (5 min)

### Go to Netlify Dashboard
- [ ] Open https://app.netlify.com
- [ ] Click on **fayeedautocare.com** site
- [ ] Go to: **Site settings** (top menu)
- [ ] Left sidebar: **Build & deploy**
- [ ] Click: **Environment**

### Add 21 Environment Variables
- [ ] Click **"Edit variables"** button
- [ ] Click **"Add variable"** button (appears 21 times)

**Copy-paste these exactly:**

#### Database (2 variables)
```
Key: NEON_DATABASE_URL
Value: postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Firebase Frontend (8 variables)
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

#### Mapbox (1 variable)
```
VITE_MAPBOX_TOKEN = pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg
```

#### Pusher Frontend (2 variables)
```
VITE_PUSHER_KEY = bce5ef8f7770b2fea49d
VITE_PUSHER_CLUSTER = ap1
```

#### Pusher Backend (4 variables)
```
PUSHER_KEY = bce5ef8f7770b2fea49d
PUSHER_SECRET = 3ae85fd35d9f8eb46586
PUSHER_APP_ID = 2102895
PUSHER_CLUSTER = ap1
```

#### Xendit Payment (3 variables)
```
XENDIT_SECRET_KEY = xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g
XENDIT_PUBLIC_KEY = xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg
XENDIT_WEBHOOK_TOKEN = Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39
```

### Save All Variables
- [ ] Click **"Save"** button at bottom

---

## 🔧 STEP 2: Set Environment Variables on TEST Site (2 min)

### Repeat for facapptest.netlify.app
- [ ] Open https://app.netlify.com
- [ ] Click on **facapptest.netlify.app** site
- [ ] Go to: **Site settings** → **Build & deploy** → **Environment**
- [ ] Click **"Edit variables"**
- [ ] **Add the EXACT SAME 21 variables** (copy-paste from Production)
- [ ] Click **"Save"**

---

## 🔄 STEP 3: Redeploy Both Sites (2 min)

### Production Redeploy
- [ ] Go to **Deploys** tab
- [ ] Find the latest deploy (should show status like "Published")
- [ ] Click the deploy
- [ ] Click **"Trigger deploy"** button
- [ ] Wait for green checkmark (usually 3-5 minutes)

### Test Redeploy
- [ ] Switch to **facapptest.netlify.app** site
- [ ] Repeat the same redeploy steps
- [ ] Wait for green checkmark

---

## 🧪 STEP 4: Verify It Works (1 min)

### Test Database Connection
- [ ] Open: `https://fayeedautocare.com/api/neon/test`
- [ ] Should show: `{ "status": "healthy", "services": { "neon": "connected" } }`

### Test Login Page
- [ ] Go to: `https://fayeedautocare.com/login`
- [ ] Email: `superadmin@fayeedautocare.com`
- [ ] Password: `SuperAdmin2024!`
- [ ] Should login successfully ✅

### Test Admin Dashboard
- [ ] After login, should see: **Admin Dashboard**
- [ ] Check sidebar loads properly ✅

---

## 🎉 DONE!

When you complete all checkboxes above:

✅ **fayeedautocare.com** → Production (working with Neon)
✅ **facapptest.netlify.app** → Test (working with Neon)
✅ **Login system** → Functional
✅ **Database** → Connected

---

## ❌ If Something Goes Wrong

### No variables showing in Netlify dashboard?
- Make sure you're in the **correct site** (fayeedautocare.com, not facapptest)
- Clear browser cache and refresh

### Redeploy keeps failing?
- Check **Netlify deploy log** for error messages
- Look for: `DATABASE`, `NEON`, `ERROR`
- Most errors will be there with solutions

### Login still fails?
- Check if redeploy is **complete** (should have green checkmark)
- Try the **debug endpoint**:
  ```
  POST https://fayeedautocare.com/api/neon/auth/debug
  Body: {"email": "superadmin@fayeedautocare.com", "password": "SuperAdmin2024!"}
  ```

---

## 📞 Need Help?

If you get stuck:
1. Share the **error message** you see
2. Show the **Netlify deploy log** (Deploys → Latest → Log)
3. I'll fix it immediately

**Estimated time:** ~10 minutes total ⏱️
