# 🔐 Environment Variables Checklist for Netlify

## ✅ Copy & Paste This Into Netlify

Go to your Netlify site → **Site settings** → **Build & deploy** → **Environment** → **Edit variables**

Then copy and paste each section below:

---

## 📊 Database Configuration

### Neon PostgreSQL

```
Variable name: NEON_DATABASE_URL
Value: postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🔥 Firebase Configuration

### Firebase API Key

```
Variable name: VITE_FIREBASE_API_KEY
Value: <YOUR_FIREBASE_WEB_API_KEY>
```

### Firebase Auth Domain

```
Variable name: VITE_FIREBASE_AUTH_DOMAIN
Value: facapp-dbdc1.firebaseapp.com
```

### Firebase Project ID

```
Variable name: VITE_FIREBASE_PROJECT_ID
Value: facapp-dbdc1
```

### Firebase Storage Bucket

```
Variable name: VITE_FIREBASE_STORAGE_BUCKET
Value: facapp-dbdc1.firebasestorage.app
```

### Firebase Messaging Sender ID

```
Variable name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 964995288467
```

### Firebase App ID

```
Variable name: VITE_FIREBASE_APP_ID
Value: 1:964995288467:web:a933dcdc046b3f17422c66
```

### Firebase Measurement ID

```
Variable name: VITE_FIREBASE_MEASUREMENT_ID
Value: G-F2D86P30G5
```

### Firebase FCM Key

```
Variable name: VITE_FIREBASE_FCM_KEY
Value: BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA
```

---

## 🗺️ Mapbox Configuration

### Mapbox Access Token

```
Variable name: VITE_MAPBOX_TOKEN
Value: pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg
```

---

## 💳 Xendit Payment Configuration

### Xendit Secret Key (Backend)

```
Variable name: XENDIT_SECRET_KEY
Value: xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g
```

### Xendit Webhook Token (Backend)

```
Variable name: XENDIT_WEBHOOK_TOKEN
Value: Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39
```

### Xendit Public Key (Frontend)

```
Variable name: XENDIT_PUBLIC_KEY
Value: xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg
```

---

## 🔔 Pusher Realtime Configuration

### Pusher App ID (Backend)

```
Variable name: PUSHER_APP_ID
Value: 2102895
```

### Pusher Key (Backend)

```
Variable name: PUSHER_KEY
Value: bce5ef8f7770b2fea49d
```

### Pusher Secret (Backend)

```
Variable name: PUSHER_SECRET
Value: 3ae85fd35d9f8eb46586
```

### Pusher Cluster (Backend)

```
Variable name: PUSHER_CLUSTER
Value: ap1
```

### Pusher Key (Frontend)

```
Variable name: VITE_PUSHER_KEY
Value: bce5ef8f7770b2fea49d
```

### Pusher Cluster (Frontend)

```
Variable name: VITE_PUSHER_CLUSTER
Value: ap1
```

---

## ✅ Verification Checklist

After adding all variables, verify:

- [ ] Total of **17 environment variables** added
- [ ] No typos in variable names (case-sensitive!)
- [ ] All values pasted correctly (no extra spaces)
- [ ] Clicked "Save" button
- [ ] Triggered a new deploy

---

## 🔄 After Adding Variables

1. Click **"Save"** at the bottom
2. Go to **"Deploys"** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait for deploy to complete (2-5 minutes)
5. Test your live site!

---

## 🔒 Security Notes

**⚠️ IMPORTANT:**

- These are **DEVELOPMENT** keys - shown in this file for convenience
- For **PRODUCTION**, use separate keys:
  - Get production Xendit keys from: https://dashboard.xendit.co
  - Create new Firebase project for production
  - Generate new Pusher app for production
  - Use production database URL from Neon

**Never commit `.env` files to Git!**

---

## 📋 Quick Copy Format

If you prefer to copy all at once for CLI:

```bash
NEON_DATABASE_URL="postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
VITE_FIREBASE_API_KEY="<YOUR_FIREBASE_WEB_API_KEY>"
VITE_FIREBASE_AUTH_DOMAIN="facapp-dbdc1.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="facapp-dbdc1"
VITE_FIREBASE_STORAGE_BUCKET="facapp-dbdc1.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="964995288467"
VITE_FIREBASE_APP_ID="1:964995288467:web:a933dcdc046b3f17422c66"
VITE_FIREBASE_MEASUREMENT_ID="G-F2D86P30G5"
VITE_FIREBASE_FCM_KEY="BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA"
VITE_MAPBOX_TOKEN="pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg"
XENDIT_SECRET_KEY="xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g"
XENDIT_WEBHOOK_TOKEN="Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39"
XENDIT_PUBLIC_KEY="xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg"
PUSHER_KEY="bce5ef8f7770b2fea49d"
PUSHER_SECRET="3ae85fd35d9f8eb46586"
PUSHER_APP_ID="2102895"
PUSHER_CLUSTER="ap1"
VITE_PUSHER_KEY="bce5ef8f7770b2fea49d"
VITE_PUSHER_CLUSTER="ap1"
```

You can save this as `.env` file locally or use with Netlify CLI:

```bash
netlify env:import .env
```

---

## 🆘 Troubleshooting

### Variables Not Working?

- Make sure you clicked "Save"
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- Remove any quotes around values in Netlify UI

### Database Connection Fails?

- Check `NEON_DATABASE_URL` is correct
- Verify it ends with `?sslmode=require`
- Test connection: Visit your Neon dashboard

### Firebase Errors?

- All Firebase variables must be set
- Double-check Project ID matches
- Verify API key is correct

### Payment Not Working?

- Using correct Xendit keys (dev vs prod)
- Webhook token set correctly
- Public key accessible from frontend

---

## 📚 Related Documentation

- **Quick Setup**: See `DEPLOY_NOW.md`
- **Automated Deploy**: Run `deploy-to-netlify.sh` (Mac/Linux) or `deploy-to-netlify.bat` (Windows)
- **Full Guide**: See `NETLIFY_DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: See `NETLIFY_TROUBLESHOOTING.md`

---

**You're all set! 🎉**
