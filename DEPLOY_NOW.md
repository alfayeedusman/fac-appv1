# 🚀 Deploy Your App to Netlify - EASY GUIDE

## For Complete Beginners - No Code Required!

This guide will help you deploy your app live to the internet in **3 simple steps**.

---

## ✅ STEP 1: Set Up Your Netlify Account

1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Click **"Sign up"** (it's FREE!)
3. Sign up with GitHub (recommended) or Email
4. Verify your email if needed

---

## ✅ STEP 2: Connect Your Project

### Option A: Deploy from GitHub (Recommended - Auto-updates!)

1. **Push your code to GitHub first:**
   - Go to [https://github.com](https://github.com)
   - Click **"New repository"**
   - Name it (e.g., "fayeed-auto-care")
   - Click **"Create repository"**
   - Follow the instructions to push your code

2. **Connect to Netlify:**
   - Go to your Netlify dashboard
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **"GitHub"**
   - Select your repository
   - **IMPORTANT**: Netlify will auto-detect settings ✅
   - Click **"Deploy"**

### Option B: Drag & Drop (Quick Test - Manual Updates)

1. **Build your project locally:**
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```
   
2. **Drag & Drop:**
   - Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `dist/spa` folder to the page
   - Done! Your site is live

---

## ✅ STEP 3: Add Environment Variables

Your app needs these settings to work. Copy them from your local `.env` file:

1. Go to your Netlify site dashboard
2. Click **"Site settings"**
3. Click **"Build & deploy"** → **"Environment"**
4. Click **"Edit variables"**
5. **Add these variables ONE BY ONE:**

### Database (Required)
```
NEON_DATABASE_URL = postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Firebase (Required)
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

### Mapbox (Required for Maps)
```
VITE_MAPBOX_TOKEN = pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg
```

### Xendit Payment (Required for Payments)
```
XENDIT_SECRET_KEY = xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g
XENDIT_WEBHOOK_TOKEN = Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39
XENDIT_PUBLIC_KEY = xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg
```

### Pusher Realtime (Required for Notifications)
```
PUSHER_KEY = bce5ef8f7770b2fea49d
PUSHER_SECRET = 3ae85fd35d9f8eb46586
PUSHER_APP_ID = 2102895
PUSHER_CLUSTER = ap1
VITE_PUSHER_KEY = bce5ef8f7770b2fea49d
VITE_PUSHER_CLUSTER = ap1
```

6. Click **"Save"**
7. Go back to **"Deploys"** tab
8. Click **"Trigger deploy"** → **"Deploy site"**

---

## 🎉 YOU'RE DONE!

Your site is now live! You'll get a URL like:
```
https://your-site-name.netlify.app
```

---

## 📱 Want a Custom Domain?

1. Buy a domain (from Namecheap, GoDaddy, etc.)
2. In Netlify: **"Domain management"** → **"Add custom domain"**
3. Follow the DNS setup instructions
4. Wait 24 hours for DNS to update
5. Done! Your site is at `yourdomain.com`

---

## 🔄 Automatic Updates

If you used **GitHub connection** (Option A):
- Every time you push code to GitHub
- Netlify automatically rebuilds and deploys
- No manual work needed! 🎉

---

## ❌ Troubleshooting

### Build Failed?
1. Click on the failed deploy
2. Read the error log
3. Most common fixes:
   - Check environment variables are set correctly
   - Make sure all variables from Step 3 are added
   - Try **"Clear cache and retry"** button

### Site Not Loading?
1. Wait 2-5 minutes after deploy completes
2. Hard refresh: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check browser console for errors (F12)

### Database Not Working?
- Verify `NEON_DATABASE_URL` is set correctly
- Make sure it ends with `?sslmode=require`
- Check Neon dashboard for connection issues

### Still Stuck?
- Check the deploy log for specific errors
- Contact support: [https://answers.netlify.com/](https://answers.netlify.com/)
- Or reach out to your developer

---

## 🎯 Quick Checklist

Before deploying, make sure:

- [ ] All code is committed to GitHub (if using Option A)
- [ ] `.env` file is NOT committed (it should be in `.gitignore`)
- [ ] Environment variables are ready to copy
- [ ] Database (Neon) is set up and accessible
- [ ] Firebase project is configured
- [ ] Payment keys (Xendit) are for correct environment (dev/prod)

---

## 🚀 Advanced: One-Command Deploy Script

If you're comfortable with terminal:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

That's it! Your site is live.

---

## 📚 Need More Help?

- **Full Documentation**: See `NETLIFY_DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: See `NETLIFY_TROUBLESHOOTING.md`
- **Environment Setup**: See `NETLIFY_ENVIRONMENT_SETUP.md`

**Good luck! Your app will be live soon! 🎊**
