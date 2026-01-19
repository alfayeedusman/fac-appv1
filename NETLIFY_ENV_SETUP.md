# ⚙️ Netlify Environment Variables Setup

## 📍 Where to Add Variables

1. Go to: **https://app.netlify.com**
2. Select your site
3. Go to: **Site settings → Build & Deploy → Environment**
4. Click: **Edit variables**
5. Add each variable below
6. **Redeploy** after adding

---

## 🔐 All Required Environment Variables

Copy and paste each variable name and value below:

### Database Connection (REQUIRED)
```
NEON_DATABASE_URL
postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

```
DATABASE_URL
postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Firebase (REQUIRED)
```
VITE_FIREBASE_API_KEY
AIzaSyAaH10Jpspj7t2N4QeVXmfwJYubb0LwkkM
```

```
VITE_FIREBASE_AUTH_DOMAIN
facapp-dbdc1.firebaseapp.com
```

```
VITE_FIREBASE_PROJECT_ID
facapp-dbdc1
```

```
VITE_FIREBASE_STORAGE_BUCKET
facapp-dbdc1.firebasestorage.app
```

```
VITE_FIREBASE_MESSAGING_SENDER_ID
964995288467
```

```
VITE_FIREBASE_APP_ID
1:964995288467:web:a933dcdc046b3f17422c66
```

```
VITE_FIREBASE_MEASUREMENT_ID
G-F2D86P30G5
```

```
VITE_FIREBASE_FCM_KEY
BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA
```

### Mapbox Maps (REQUIRED)
```
VITE_MAPBOX_TOKEN
pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg
```

### Pusher Real-time (REQUIRED)
```
VITE_PUSHER_KEY
bce5ef8f7770b2fea49d
```

```
VITE_PUSHER_CLUSTER
ap1
```

```
PUSHER_KEY
bce5ef8f7770b2fea49d
```

```
PUSHER_SECRET
3ae85fd35d9f8eb46586
```

```
PUSHER_APP_ID
2102895
```

```
PUSHER_CLUSTER
ap1
```

### Xendit Payment (REQUIRED)
```
XENDIT_SECRET_KEY
xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g
```

```
XENDIT_PUBLIC_KEY
xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg
```

```
XENDIT_WEBHOOK_TOKEN
Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39
```

---

## 🔧 Build Environment Variables (Auto-set)

These are already in `netlify.toml` - NO ACTION NEEDED:

```
NODE_VERSION = 20
NPM_CONFIG_PRODUCTION = false
NODE_OPTIONS = --max_old_space_size=4096
```

---

## ✅ After Adding Variables

1. Click **Save**
2. Go to **Deploys** tab
3. Click **Trigger deploy**
4. Wait for build to complete
5. Test: Visit your site URL and try to login

---

## 🧪 Quick Test Commands

After deployment, test with:

### Health Check
```bash
curl https://your-site.netlify.app/api/health
```

### Login
```bash
curl -X POST https://your-site.netlify.app/api/neon/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@fayeedautocare.com",
    "password": "SuperAdmin2024!"
  }'
```

---

## 📋 Verification Checklist

- [ ] All 18 variables added to Netlify
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] Redeploy triggered
- [ ] Build completed successfully (check Build log)
- [ ] Health check returns 200
- [ ] Login works
- [ ] Bookings load
- [ ] Payments work

---

## 🆘 If Something Goes Wrong

1. Check **Deploys → Latest build log**
2. Look for error messages
3. Verify **all variables are set** (typos are common)
4. Try **redeploying** after fixing
5. Check **Netlify Functions → api** for function errors

---

**Once all variables are set up, redeploy and you're ready to go! 🚀**
