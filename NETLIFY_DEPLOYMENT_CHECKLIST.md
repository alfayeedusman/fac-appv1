# ✅ Netlify Deployment Checklist

## Phase 1: Pre-Deployment (DO THIS FIRST)

### Repository Setup

- [ ] Push all code changes to GitHub main branch
- [ ] TypeScript errors fixed (✅ Already done)
- [ ] No build warnings or errors locally

### Netlify Site Connection

- [ ] Netlify account created (https://app.netlify.com)
- [ ] GitHub repository connected
- [ ] Automatic deployments enabled
- [ ] Build settings confirmed:
  - Build command: `npm ci --legacy-peer-deps --include=dev && npm run build`
  - Publish directory: `dist/spa`
  - Functions directory: `netlify/functions`

---

## Phase 2: Environment Variables Setup

### ✅ REQUIRED: Add 18 Environment Variables

Go to: **Netlify Dashboard → Site Settings → Build & Deploy → Environment**

**Database** (2 variables)

- [ ] `NEON_DATABASE_URL`
- [ ] `DATABASE_URL`

**Firebase** (8 variables)

- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID`
- [ ] `VITE_FIREBASE_FCM_KEY`

**Mapbox** (1 variable)

- [ ] `VITE_MAPBOX_TOKEN`

**Pusher** (5 variables)

- [ ] `VITE_PUSHER_KEY`
- [ ] `VITE_PUSHER_CLUSTER`
- [ ] `PUSHER_KEY`
- [ ] `PUSHER_SECRET`
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_CLUSTER`

**Xendit** (3 variables)

- [ ] `XENDIT_SECRET_KEY`
- [ ] `XENDIT_PUBLIC_KEY`
- [ ] `XENDIT_WEBHOOK_TOKEN`

> See `NETLIFY_ENV_SETUP.md` for exact values

---

## Phase 3: First Deployment

### Trigger Deployment

- [ ] Go to **Deploys** tab
- [ ] Click **Trigger deploy → Deploy site**
- [ ] Wait for build to complete (5-10 minutes)

### Monitor Build

- [ ] Check **Build log** for errors
- [ ] Verify no TypeScript errors
- [ ] Verify database migrations ran
- [ ] Check functions built successfully

### Deploy Success Indicators

- [ ] Build status shows ✅ (green)
- [ ] Netlify URL is accessible
- [ ] No "Deploy failed" messages

---

## Phase 4: Post-Deployment Testing

### API Health

- [ ] `/api/health` returns 200 with status "healthy"
- [ ] Database connection shows "connected"

### Authentication

- [ ] Login page loads
- [ ] Can login with superadmin credentials
  - Email: `superadmin@fayeedautocare.com`
  - Password: `SuperAdmin2024!`
- [ ] Redirects to dashboard on success
- [ ] Logout works

### Core Features

- [ ] Home page loads correctly
- [ ] Browse services works
- [ ] View branches/locations works
- [ ] Guest booking flow starts
- [ ] Registered user booking works

### Booking System

- [ ] Can select service and date
- [ ] Availability check works
- [ ] Time slots load correctly
- [ ] Slot selection works
- [ ] Confirmation code generated

### Payments

- [ ] Xendit payment page loads
- [ ] Payment methods display
- [ ] Payment processing works (test mode)
- [ ] Booking confirmed after payment

### Real-time Features

- [ ] Notifications appear (if enabled)
- [ ] Live updates work (if enabled)
- [ ] No WebSocket errors in console

### Admin Panel

- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Can view bookings
- [ ] Can view analytics
- [ ] Settings accessible

---

## Phase 5: Performance Verification

### Frontend Performance

- [ ] Page loads in < 3 seconds
- [ ] Images load correctly
- [ ] Maps load properly
- [ ] No console errors

### Backend Performance

- [ ] API responses < 500ms
- [ ] Database queries respond quickly
- [ ] No timeout errors
- [ ] Function cold starts acceptable

### Monitoring

- [ ] Check Netlify Analytics
- [ ] Monitor function invocations
- [ ] Check error rates (should be 0)

---

## Phase 6: Final Verification

### Remove Old Deployments

- [ ] Fly.dev URLs no longer used
- [ ] DNS points to Netlify domain
- [ ] Custom domain configured (if applicable)

### Documentation

- [ ] Deployment guide saved
- [ ] Environment variables documented
- [ ] Troubleshooting guide available
- [ ] Team members informed

### Security

- [ ] HTTPS enabled (automatic on Netlify)
- [ ] No sensitive data in logs
- [ ] Environment variables secure
- [ ] API keys not exposed in frontend

---

## 🚨 Rollback Plan (If Needed)

If deployment fails:

1. **Check Build Log**
   - Look for error messages
   - Fix TypeScript errors
   - Verify all env vars set

2. **Redeploy**
   - Go to previous successful deploy
   - Click **Publish deploy**
   - Previous version restored

3. **Diagnose**
   - Check database connection
   - Verify environment variables
   - Test locally first

---

## 📊 After 24 Hours

- [ ] Monitor error rates (should be < 0.1%)
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Monitor uptime (target: 99.9%)
- [ ] Check build times (should be consistent)

---

## 📞 Support Resources

- **Netlify Status**: https://www.netlify.com/status/
- **Neon Status**: https://status.neon.tech/
- **Build Logs**: Dashboard → Deploys → Click build
- **Function Logs**: Dashboard → Functions → Click function
- **Error Messages**: Check browser console (F12)

---

## ✨ Success Criteria

All items below should be true:

- ✅ Build completes without errors
- ✅ All environment variables set
- ✅ Health check returns 200
- ✅ Login works
- ✅ Database connected and migrated
- ✅ Can create bookings
- ✅ Payments process
- ✅ No console errors
- ✅ Performance acceptable
- ✅ Uptime stable

**Once all checked: 🎉 MIGRATION COMPLETE - FULL TRANSITION TO NETLIFY SUCCESSFUL!**

---

## 🔄 Next Deployment Instructions

For future deployments:

1. Make code changes locally
2. Test with `npm run dev`
3. Push to main branch
4. Netlify automatically builds and deploys
5. Check build status in Netlify dashboard
6. Done! (usually 2-3 minutes)

No more manual branch creation or PR process needed!

---

**Last Updated**: January 19, 2026  
**Status**: Ready for Production  
**Database**: Neon PostgreSQL  
**Hosting**: Netlify (Serverless Functions)
