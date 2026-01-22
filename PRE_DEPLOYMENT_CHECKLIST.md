# FAC App - Pre-Deployment Checklist

Use this checklist before deploying to Netlify!

## ✅ Local Development Checklist

### Setup & Dependencies
- [ ] Run `bash setup.sh` (or `setup.bat` on Windows)
- [ ] No error messages during setup
- [ ] Dependencies installed successfully
- [ ] `npm run dev` starts without errors

### Frontend Build
- [ ] Frontend builds: `npm run build:client`
- [ ] No TypeScript errors
- [ ] No missing imports
- [ ] Assets are in `dist/spa/`

### Backend Build
- [ ] Backend builds: `npm run build:server`
- [ ] No TypeScript errors
- [ ] All routes are registered
- [ ] Server code compiles successfully

### Type Checking
- [ ] `npm run typecheck` passes
- [ ] No TS errors in console
- [ ] All imports are correct

### Local Testing
- [ ] Frontend loads: http://localhost:8080
- [ ] API responds: `/api/neon/test`
- [ ] Diagnostics work: `/api/neon/diagnose`
- [ ] No 404 errors on API routes

### Database
- [ ] NEON_DATABASE_URL is set locally
- [ ] Database initializes on startup
- [ ] Migrations run successfully
- [ ] Users table exists
- [ ] Can create test records

### API Endpoints
- [ ] `POST /api/neon/auth/login` responds
- [ ] `POST /api/neon/auth/register` responds
- [ ] `GET /api/neon/bookings` returns data
- [ ] `POST /api/neon/bookings` creates records
- [ ] All major endpoints tested

### Error Handling
- [ ] Errors don't crash the server
- [ ] Error middleware logs messages
- [ ] Invalid requests return proper errors
- [ ] Database errors are handled gracefully

---

## 🔐 Environment & Configuration Checklist

### Environment Variables
- [ ] NEON_DATABASE_URL is valid
- [ ] DATABASE_URL is set (backup)
- [ ] All Firebase variables are set
- [ ] VITE_MAPBOX_TOKEN is set
- [ ] VITE_PUSHER_KEY is set
- [ ] PUSHER_SECRET is set (NOT in frontend)
- [ ] XENDIT_SECRET_KEY is set (NOT in frontend)
- [ ] XENDIT_PUBLIC_KEY is set
- [ ] All variables are correct format

### Secrets
- [ ] No secrets in `.env.local` (in .gitignore)
- [ ] No hardcoded passwords in code
- [ ] No API keys in git history
- [ ] `.env` files are in .gitignore
- [ ] Consider rotating old secrets

### Configuration Files
- [ ] `netlify.toml` is valid TOML
- [ ] Build command is correct
- [ ] Functions directory is set
- [ ] Redirects are configured
- [ ] Environment variables block is commented
- [ ] `package.json` scripts are correct

---

## 🚀 Netlify Preparation Checklist

### Git Repository
- [ ] Code is committed: `git status` shows clean
- [ ] No uncommitted changes
- [ ] Branch is ready to deploy (usually 'main')
- [ ] Remote is set correctly: `git remote -v`

### GitHub Connection
- [ ] Repository is on GitHub
- [ ] Netlify has read access
- [ ] No authentication issues

### Netlify Settings
- [ ] Site is connected to GitHub
- [ ] Build command is set correctly
- [ ] Publish directory is `dist/spa`
- [ ] Functions directory is `netlify/functions`
- [ ] Node.js version is v18+

### Environment Variables (Netlify Dashboard)
- [ ] NEON_DATABASE_URL ✓
- [ ] DATABASE_URL ✓
- [ ] VITE_FIREBASE_API_KEY ✓
- [ ] VITE_FIREBASE_AUTH_DOMAIN ✓
- [ ] VITE_FIREBASE_PROJECT_ID ✓
- [ ] VITE_FIREBASE_STORAGE_BUCKET ✓
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID ✓
- [ ] VITE_FIREBASE_APP_ID ✓
- [ ] VITE_FIREBASE_MEASUREMENT_ID ✓
- [ ] VITE_MAPBOX_TOKEN ✓
- [ ] VITE_PUSHER_KEY ✓
- [ ] VITE_PUSHER_CLUSTER ✓
- [ ] PUSHER_KEY ✓
- [ ] PUSHER_SECRET ✓ (NOT in frontend vars)
- [ ] PUSHER_APP_ID ✓
- [ ] PUSHER_CLUSTER ✓
- [ ] XENDIT_SECRET_KEY ✓ (NOT in frontend vars)
- [ ] XENDIT_PUBLIC_KEY ✓
- [ ] XENDIT_WEBHOOK_TOKEN ✓

---

## 🧪 Final Testing Checklist

### Production Build Locally
- [ ] Run: `npm run build`
- [ ] Check `dist/spa/` exists
- [ ] Check `dist/server/` exists
- [ ] Build is less than 100MB
- [ ] No build warnings (OK if TypeScript warnings)

### Verify Builds
- [ ] Frontend HTML is in `dist/spa/index.html`
- [ ] CSS is compiled and minified
- [ ] JavaScript is bundled
- [ ] Images and assets are copied
- [ ] Server files are in `dist/server/`

### Security Check
- [ ] No secrets in built files
- [ ] API keys are NOT in frontend bundle
- [ ] Database password is NOT in code
- [ ] CORS configuration is correct
- [ ] Headers are set properly

### Performance Check
- [ ] Frontend bundle is < 1MB gzipped
- [ ] Initial page load is fast
- [ ] API responses are reasonable
- [ ] No memory leaks in dev tools
- [ ] No unnecessary re-renders

---

## 📋 Deployment Checklist

### Before Push
- [ ] All checklist items above are complete
- [ ] Local `npm run dev` works perfectly
- [ ] No error messages in console
- [ ] All API endpoints respond correctly

### Push to GitHub
```bash
git add .
git commit -m "Complete setup with all fixes and configurations"
git push origin main
```

- [ ] Push completes successfully
- [ ] No Git errors
- [ ] Code appears on GitHub

### Monitor Netlify Deployment
- [ ] Netlify detects new commit
- [ ] Build starts automatically
- [ ] Build completes without errors
- [ ] Functions are deployed
- [ ] Frontend is published
- [ ] DNS updates (if using custom domain)

### Verify Deployed Site
- [ ] Site loads: https://facapptest.netlify.app
- [ ] No 404 errors
- [ ] API responds: https://facapptest.netlify.app/api/neon/test
- [ ] Database is reachable
- [ ] Can login with test account

### Test Production API
```bash
bash verify-setup.sh netlify
```
- [ ] All endpoint tests pass
- [ ] No connection errors
- [ ] Response times are acceptable

---

## 🎯 Deployment Day Checklist

### Morning (Before Deploy)
- [ ] Make backup of database (Neon console)
- [ ] Notify team of planned deployment
- [ ] Have rollback plan ready
- [ ] Check Netlify status page for any incidents

### Deploy
- [ ] Run all checklist items above
- [ ] Push to GitHub
- [ ] Monitor Netlify build
- [ ] Verify deployment succeeded
- [ ] Test all features

### After Deploy
- [ ] Check Netlify Functions logs
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify user can login
- [ ] Test booking flow
- [ ] Check API response times

### Post-Deployment
- [ ] Document any issues found
- [ ] Notify team deployment is complete
- [ ] Monitor for 24 hours
- [ ] Have on-call support ready

---

## 🚨 Rollback Checklist

If something goes wrong:

1. [ ] Document the issue
2. [ ] Check Netlify Functions logs
3. [ ] Check database status
4. [ ] Option A: Redeploy previous version
   ```bash
   # Go to Netlify → Deployments → Select previous
   # Click "Publish deploy"
   ```
5. [ ] Option B: Revert Git commit
   ```bash
   git revert HEAD
   git push
   ```
6. [ ] Verify site is working
7. [ ] Notify team
8. [ ] Investigate root cause
9. [ ] Fix and redeploy

---

## 📞 Emergency Contacts

- **Netlify Support**: https://support.netlify.com
- **Neon Support**: https://neon.tech/docs/support
- **GitHub Status**: https://www.githubstatus.com
- **Your Team Lead**: [Contact info]

---

## ✅ Ready to Deploy?

Make sure ALL items are checked before proceeding!

If any items are not complete:
1. Go back to that section
2. Complete the required tasks
3. Return to this checklist
4. Continue verification

**Never skip items or deploy if something is broken!**

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Status**: ☐ Successful  ☐ Rolled Back  ☐ Pending

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Good luck with your deployment! 🚀**
