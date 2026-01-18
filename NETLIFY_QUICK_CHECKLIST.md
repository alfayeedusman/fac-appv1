# Netlify Deployment Quick Checklist ✅

## Before First Deployment

- [ ] Run local setup: `npm run setup:netlify:clean`
- [ ] Verify build succeeds locally
- [ ] All dist folders are created:
  - `dist/spa/` (React frontend)
  - `dist/server/` (Express backend)
- [ ] Commit changes: `git add . && git commit -m "Setup netlify"`
- [ ] Push to git: `git push origin main`

## Netlify Console Setup

- [ ] Go to [netlify.com](https://netlify.com)
- [ ] Click "Add new site"
- [ ] Connect your git repository
- [ ] Select branch (main)
- [ ] Wait for first auto-deploy

## Environment Variables in Netlify UI

Go to **Site Settings** → **Build & Deploy** → **Environment**

### Frontend Variables (VITE\_\*)

- [ ] `VITE_MAPBOX_TOKEN` = `pk.eyJ1IjoiZGV2eWVlZCIsImEiOiJjbWV4c2RyZ2kxMnJzMmxvb3RiajZmbG81In0.42VNp3is3gk2jVwxoNAqzg`
- [ ] `VITE_FIREBASE_API_KEY` = `<YOUR_FIREBASE_WEB_API_KEY>`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `facapp-dbdc1.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `facapp-dbdc1`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `facapp-dbdc1.firebasestorage.app`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `964995288467`
- [ ] `VITE_FIREBASE_APP_ID` = `1:964995288467:web:a933dcdc046b3f17422c66`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` = `G-F2D86P30G5`
- [ ] `VITE_FIREBASE_FCM_KEY` = `BPZ7qJsAwjsYN03miKRrNbnPR2oU1y0wpHPmsHnz6Z9U12spAZi5L0ilwRFNVhpXknVOSmmcnFmLMIlpV4PgzeA`
- [ ] `VITE_PUSHER_KEY` = `bce5ef8f7770b2fea49d`
- [ ] `VITE_PUSHER_CLUSTER` = `ap1`
- [ ] `XENDIT_PUBLIC_KEY` = `xnd_public_development_0GsLabVLX_CfyXBlEErMSO7jjhbNI7ZcUhYKhS6zhwBugx8ZnYV6UGD9yCP1sg`

### Backend Variables (Server-only, NOT in frontend code)

- [ ] `NEON_DATABASE_URL` = `postgresql://neondb_owner:npg_DX9H0KGFzuiZ@ep-green-glitter-aefe3h65-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require`
- [ ] `PUSHER_APP_ID` = `2102895`
- [ ] `PUSHER_CLUSTER` = `ap1`
- [ ] `PUSHER_KEY` = `bce5ef8f7770b2fea49d`
- [ ] `PUSHER_SECRET` = `3ae85fd35d9f8eb46586`
- [ ] `XENDIT_SECRET_KEY` = `xnd_development_DOtbVDk9E83dYEUgJGpiJT7RKmUZtrbLcEQRFKDu2qpJTMFHYi8I6PnwxB4g`
- [ ] `XENDIT_WEBHOOK_TOKEN` = `Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39`

## After Adding Environment Variables

- [ ] Click "Save"
- [ ] Go to **Deploys** section
- [ ] Click **Trigger deploy** → **Deploy site**
- [ ] Wait for deployment to complete
- [ ] Check **Deploy log** for any errors

## Verify Deployment

- [ ] Site loads at your Netlify URL
- [ ] Frontend pages display correctly
- [ ] API calls work: `/api/` endpoints respond
- [ ] Database connects (if applicable)
- [ ] Check browser console for errors (F12)

## For Future Deployments

Every time you make changes:

```bash
# 1. Test locally
npm run dev

# 2. Verify build works
npm run setup:netlify

# 3. Push to git
git add .
git commit -m "Your message"
git push origin main

# 4. Netlify auto-deploys (watch Deploys tab)
```

---

## Emergency: Clear Cache & Rebuild

If build fails:

1. Go to **Deploys**
2. Click **Clear cache and retry**
3. Watch the log for errors
4. Fix locally and push again

## Emergency: Rollback

If deployed version has issues:

1. Go to **Deploys**
2. Find previous successful deployment
3. Click **...** → **Publish deploy**
4. Your site reverts to that version

---

## Commands Reference

```bash
# One-time setup
npm run setup:netlify

# Full clean setup (if issues)
npm run setup:netlify:clean

# Local dev
npm run dev

# Build locally to test
npm run build

# Check for TypeScript errors
npm run typecheck
```

---

**All set! Your automated deployment is ready! 🚀**
