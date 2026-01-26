# 🚀 Netlify Deployment Checklist

## ✅ Pre-Deployment (Do This First)

- [ ] **Verify local build works**
  ```bash
  npm run build
  npm run build:server
  # Should create dist/spa and dist/server without errors
  ```

- [ ] **Test locally**
  ```bash
  npm run dev
  # Visit http://localhost:8080/login
  # Try logging in with test credentials
  ```

- [ ] **Commit all changes to Git**
  ```bash
  git add .
  git commit -m "Prepare for Netlify deployment - fix timeout errors and seed premium users"
  ```

- [ ] **Push to GitHub**
  ```bash
  git push origin main  # or your branch name
  ```

- [ ] **Verify push was successful**
  - Go to https://github.com/alfayeedusman/fac-appv1
  - Check latest commit appears in main branch

---

## 🔗 Deploy to Netlify (Easy Version)

### Step 1: Sign Up for Netlify
- [ ] Go to https://app.netlify.com
- [ ] Click **"Sign up"**
- [ ] Choose **"GitHub"** option
- [ ] Authorize Netlify to access your GitHub
- [ ] Select your repository

### Step 2: Connect Repository
- [ ] Click **"Add new site"**
- [ ] Choose **"Import an existing project"**
- [ ] Select GitHub
- [ ] Find and select: `alfayeedusman/fac-appv1`

### Step 3: Configure Build Settings
- [ ] **Build command**: Paste this exactly:
  ```
  npm ci --legacy-peer-deps --include=dev --prefer-offline --no-audit && npm run build && npm run build:server
  ```

- [ ] **Publish directory**: `dist/spa`

- [ ] **Functions directory**: `netlify/functions`

- [ ] Click **"Advanced: build settings"** and verify:
  - [ ] **Node version**: Set to `20`

### Step 4: Set Environment Variables
- [ ] Click **"Build & Deploy"** → **"Environment"**
- [ ] Click **"Edit variables"**
- [ ] Add all variables from `.env.example`:

**Required Variables to Add:**

```
NEON_DATABASE_URL = [Your Neon connection string]
DATABASE_URL = [Same as above]

VITE_FIREBASE_API_KEY = [From Firebase console]
VITE_FIREBASE_AUTH_DOMAIN = [From Firebase console]
VITE_FIREBASE_PROJECT_ID = [From Firebase console]
VITE_FIREBASE_STORAGE_BUCKET = [From Firebase console]
VITE_FIREBASE_MESSAGING_SENDER_ID = [From Firebase console]
VITE_FIREBASE_APP_ID = [From Firebase console]
VITE_FIREBASE_MEASUREMENT_ID = [From Firebase console]
VITE_FIREBASE_FCM_KEY = [From Firebase console]

VITE_MAPBOX_TOKEN = [From Mapbox]

VITE_PUSHER_KEY = [From Pusher]
VITE_PUSHER_CLUSTER = ap1
PUSHER_KEY = [From Pusher]
PUSHER_SECRET = [From Pusher]
PUSHER_APP_ID = [From Pusher]
PUSHER_CLUSTER = ap1

XENDIT_SECRET_KEY = [From Xendit]
XENDIT_PUBLIC_KEY = [From Xendit]
XENDIT_WEBHOOK_TOKEN = [From Xendit]
VITE_XENDIT_PUBLIC_KEY = [From Xendit]

NODE_VERSION = 20
NPM_CONFIG_PRODUCTION = false
NODE_OPTIONS = --max_old_space_size=4096
NODE_ENV = production
SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES = AIzaSyAaH10Jpspj7t2N4QeVXmfwJYubb0LwkkM
```

### Step 5: Deploy!
- [ ] Click **"Deploy site"**
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check build logs for any errors
- [ ] Once complete, you'll see your site URL

---

## ✅ Post-Deployment Testing

### Immediate Checks (First 5 Minutes)
- [ ] **Visit your site**: https://your-site.netlify.app
- [ ] Page loads without errors
- [ ] Login form displays correctly
- [ ] No console errors (Open DevTools → Console)

### API Testing
- [ ] Test health endpoint:
  ```
  https://your-site.netlify.app/api/health
  ```
  Should return: `{ "success": true, "status": "ok" }`

- [ ] Test database connection:
  ```
  https://your-site.netlify.app/api/neon/test
  ```
  Should show database is connected

- [ ] Check function logs:
  - Go to Netlify Dashboard
  - Click **Functions**
  - Should see successful requests logged

### Login Testing
- [ ] Try login with test admin account
  ```
  Email: test.admin@example.com
  Password: password123
  ```
  Should redirect to admin dashboard

- [ ] Try login with premium customer
  ```
  Email: premium.customer1@example.com
  Password: password123
  ```
  Should redirect to customer dashboard

- [ ] Try login with invalid credentials
  Should show error message (not 500 error)

---

## 🔧 Troubleshooting

### Build Failed
1. [ ] Check build logs: Dashboard → Deploys → Click failed build → Logs
2. [ ] Common issues:
   - Missing environment variables → Add them and retry
   - Node version issue → Ensure `NODE_VERSION=20`
   - Dependency issue → Try `npm install --legacy-peer-deps`
3. [ ] Trigger rebuild: Dashboard → Deploys → Trigger Deploy

### Site Shows 404
1. [ ] Check if build completed successfully
2. [ ] Verify publish directory is `dist/spa`
3. [ ] Check that SPA redirect is in `netlify.toml`

### API Returns 500 Errors
1. [ ] Check function logs: Dashboard → Functions → Logs
2. [ ] Verify all environment variables are set
3. [ ] Check Neon database connection is working
4. [ ] Try redeploying: Dashboard → Deploys → Publish Deploy

### Database Connection Failed
1. [ ] Verify `NEON_DATABASE_URL` is correct
2. [ ] Check Neon connection is still active
3. [ ] Test connection locally first
4. [ ] Check IP allowlist in Neon dashboard

### Login Not Working
1. [ ] Check browser console for errors (F12)
2. [ ] Check function logs for login errors
3. [ ] Verify database is connected
4. [ ] Test with different user account

---

## 📊 Monitoring Your Deployment

### View Logs
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# View function logs in real-time
netlify logs --function=api --tail
```

### Dashboard Monitoring
- **Analytics**: Dashboard → Analytics → Page Performance
- **Deployments**: Dashboard → Deploys
- **Functions**: Dashboard → Functions → Logs
- **Environment**: Dashboard → Site Settings → Build & Deploy

### Set Up Alerts
- [ ] Netlify Dashboard → Notifications
- [ ] Enable build notifications
- [ ] Enable deployment notifications

---

## 🔄 Making Updates

After deployment, whenever you make changes:

1. **Make code changes locally**
2. **Test locally**:
   ```bash
   npm run dev
   ```
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your change message"
   git push origin main
   ```
4. **Netlify auto-deploys** (watch dashboard)
5. **Check logs** for any errors

---

## 🚨 Important Reminders

- ✅ **Never commit `.env` files** - Netlify loads from environment variables
- ✅ **Test locally first** - Before pushing to production
- ✅ **Monitor logs** - Check function logs for errors
- ✅ **Keep secrets safe** - Use Netlify environment variables only
- ✅ **Backup database** - Regular Neon backups recommended
- ✅ **Monitor costs** - Netlify free tier is generous, watch Neon usage

---

## 📱 Quick Reference

**Your Site**: https://your-site.netlify.app

**Netlify Dashboard**: https://app.netlify.com

**Neon Database**: https://console.neon.tech

**Firebase Console**: https://console.firebase.google.com

**Pusher Dashboard**: https://dashboard.pusher.com

**Xendit Dashboard**: https://dashboard.xendit.co

---

## ✨ Congratulations! 🎉

Once all checkboxes are complete, your app is live and production-ready!

- ✅ Frontend served via Netlify CDN
- ✅ API running on Netlify Functions
- ✅ Database connected to Neon
- ✅ Automatic HTTPS enabled
- ✅ Automatic rollbacks available
- ✅ Auto-deploys on push

**Next Steps**:
1. Share your site URL with team
2. Set up custom domain (optional)
3. Monitor performance regularly
4. Keep dependencies updated

---

**Status**: Ready for Production 🚀

**Last Updated**: January 26, 2026
