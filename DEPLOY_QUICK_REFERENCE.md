# 🎯 Deployment Quick Reference Card

**Print this or keep it handy!**

---

## 🚀 ONE-LINE DEPLOYMENT

### Mac/Linux:
```bash
bash deploy-to-netlify.sh
```

### Windows:
```
deploy-to-netlify.bat
```

---

## 📋 MUST-HAVE ENVIRONMENT VARIABLES

Add these 17 variables to Netlify:

```
1.  NEON_DATABASE_URL
2.  VITE_FIREBASE_API_KEY
3.  VITE_FIREBASE_AUTH_DOMAIN
4.  VITE_FIREBASE_PROJECT_ID
5.  VITE_FIREBASE_STORAGE_BUCKET
6.  VITE_FIREBASE_MESSAGING_SENDER_ID
7.  VITE_FIREBASE_APP_ID
8.  VITE_FIREBASE_MEASUREMENT_ID
9.  VITE_FIREBASE_FCM_KEY
10. VITE_MAPBOX_TOKEN
11. XENDIT_SECRET_KEY
12. XENDIT_WEBHOOK_TOKEN
13. XENDIT_PUBLIC_KEY
14. PUSHER_KEY
15. PUSHER_SECRET
16. PUSHER_APP_ID
17. PUSHER_CLUSTER
18. VITE_PUSHER_KEY
19. VITE_PUSHER_CLUSTER
```

**Get values from:** `ENV_CHECKLIST.md`

---

## 🔧 MANUAL BUILD COMMANDS

If automation fails:

```bash
# 1. Install
npm install --legacy-peer-deps --prefer-offline --no-audit

# 2. Build
npm run build

# 3. Deploy (if Netlify CLI installed)
netlify deploy --prod
```

---

## ✅ DEPLOYMENT CHECKLIST

Before clicking deploy:

- [ ] Code saved/committed
- [ ] `.env` file has correct values
- [ ] Netlify account created
- [ ] All 17 environment variables ready
- [ ] Node.js installed (version 20+)
- [ ] npm installed

---

## 🆘 EMERGENCY FIXES

### Build fails with exit code 127?
→ Run: `npm install --legacy-peer-deps`

### "Cannot find module" error?
→ Delete `node_modules` and `dist`, then rebuild

### Environment variables not working?
→ Click "Save" in Netlify, then "Trigger deploy"

### Database connection fails?
→ Check `NEON_DATABASE_URL` ends with `?sslmode=require`

### Firebase errors?
→ Verify all Firebase variables are set

### Site not updating?
→ Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 📱 USEFUL NETLIFY CLI COMMANDS

```bash
# Login
netlify login

# Link existing site
netlify link

# Create new site
netlify init

# Deploy draft
netlify deploy

# Deploy to production
netlify deploy --prod

# List environment variables
netlify env:list

# Set environment variable
netlify env:set KEY VALUE

# Open dashboard
netlify open

# Open live site
netlify open:site

# Check build status
netlify status

# View logs
netlify logs
```

---

## 🌐 WHERE TO SET ENVIRONMENT VARIABLES

**Netlify UI:**
1. Go to https://app.netlify.com
2. Select your site
3. Site settings → Build & deploy → Environment
4. Click "Edit variables"
5. Add all 17 variables
6. Click "Save"
7. Trigger new deploy

**Netlify CLI:**
```bash
netlify env:set KEY "VALUE"
```

**Bulk import:**
```bash
netlify env:import .env
```

---

## 📍 KEY FILES LOCATIONS

```
netlify.toml              # Netlify build config (fixed!)
package.json              # npm scripts
deploy-to-netlify.sh      # Auto-deploy script (Mac/Linux)
deploy-to-netlify.bat     # Auto-deploy script (Windows)
DEPLOY_NOW.md             # Full beginner guide
ENV_CHECKLIST.md          # All environment variables
START_HERE_DEPLOYMENT.md  # Quick start guide
```

---

## 🎯 DEPLOYMENT WORKFLOW

```
1. Write code locally
   ↓
2. Test with: npm run dev
   ↓
3. Build with: npm run build
   ↓
4. Push to GitHub (optional)
   ↓
5. Deploy to Netlify
   ↓
6. Add environment variables
   ↓
7. Trigger deploy
   ↓
8. Test live site
   ↓
9. 🎉 Success!
```

---

## 🔗 QUICK LINKS

- **Netlify Dashboard:** https://app.netlify.com
- **Netlify Deploy:** https://app.netlify.com/drop
- **GitHub:** https://github.com
- **Neon Dashboard:** https://console.neon.tech
- **Firebase Console:** https://console.firebase.google.com
- **Xendit Dashboard:** https://dashboard.xendit.co
- **Pusher Dashboard:** https://dashboard.pusher.com
- **Netlify Support:** https://answers.netlify.com

---

## 💡 BEST PRACTICES

✅ **DO:**
- Test locally before deploying
- Use GitHub for automatic deploys
- Keep separate dev/prod environments
- Monitor deploy logs
- Use custom domain for production
- Enable HTTPS (automatic)
- Set up deploy notifications

❌ **DON'T:**
- Commit `.env` files to Git
- Use development keys in production
- Deploy without testing
- Ignore build warnings
- Share API keys publicly
- Skip environment variables

---

## 🎊 SUCCESS INDICATORS

Your deployment succeeded if:
- ✅ Build log shows "Deploy complete"
- ✅ Site URL opens without errors
- ✅ Database connections work
- ✅ Login/signup works (Firebase)
- ✅ Maps display (Mapbox)
- ✅ Payments process (Xendit)
- ✅ Notifications work (Pusher)

---

## 📊 TYPICAL BUILD TIME

- npm install: 30-60 seconds
- Build client: 10-30 seconds
- Build server: 5-10 seconds
- Deploy/publish: 10-30 seconds

**Total: 1-2 minutes**

If longer: Clear cache and retry

---

## 🆘 GET HELP

1. Check deploy log for errors
2. Read `NETLIFY_TROUBLESHOOTING.md`
3. Search Netlify Community
4. Contact support
5. Check Netlify status page

---

**Keep this handy! 📌**

**Print, bookmark, or pin to your desk!**
