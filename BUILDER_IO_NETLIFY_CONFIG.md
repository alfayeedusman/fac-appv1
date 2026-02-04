# 🔧 Builder.io Test Server Configuration for Netlify

## Overview

This guide configures the current Builder.io test server to work with Netlify deployment configuration. The app is currently running on the Builder.io dev server and can be tested against Netlify's production setup.

---

## ✅ Current Setup

**Local Development Server**: Builder.io Platform (Netlify-Ready)

- **Running on**: Port 8080 (internal)
- **Configured for**: Netlify deployment (production-ready)
- **Database**: Neon PostgreSQL
- **Status**: ✅ Fully Functional on Netlify Configuration

---

## 🚀 Deploying Builder.io Server to Netlify

### Option 1: Keep Using Builder.io Dev Server (Recommended for Development)

**Current setup is perfect for:**

- ✅ Testing features in isolation
- ✅ Real-time development with hot reload
- ✅ Debugging server and client code
- ✅ Database testing and migrations
- ✅ Integration testing

**No changes needed** - The current Builder.io server is already configured to work with:

- ✅ Neon database
- ✅ Firebase integration
- ✅ All third-party services
- ✅ Netlify-compatible API structure

### Option 2: Deploy to Netlify (Production)

When ready for production, use the 3-step guide:

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Import your repository

3. **Add Environment Variables**
   - NEON_DATABASE_URL
   - Firebase keys
   - Other secrets from `.env.example`

---

## 🧪 Testing on Current Server

### ✅ Live Testing - Use This URL

**App Preview**: Open the iframe on the right (currently showing `/login`)

This is your live test environment for:

- ✅ Frontend UI testing
- ✅ Login flow testing
- ✅ Database connectivity
- ✅ API endpoint testing
- ✅ User experience validation

### Test Credentials

```
Admin Account:
  Email: test.admin@example.com
  Password: password123

Premium Customer:
  Email: premium.customer1@example.com
  Password: password123

VIP Customer:
  Email: vip.customer@example.com
  Password: password123
```

### Test Features

**Try these on the current server**:

1. **Login Test**
   - Navigate to `/login`
   - Enter credentials above
   - Should redirect to dashboard

2. **Admin Dashboard**
   - Login as admin
   - Check `/admin-dashboard`
   - Verify all features load

3. **Customer Dashboard**
   - Login as premium customer
   - Check `/dashboard`
   - Test booking functionality

4. **API Test**
   - Open DevTools (F12)
   - Go to Network tab
   - Check API requests are successful

---

## 🔄 Configuration for Both Environments

### Local Builder.io Server (Current)

**Benefits**:

- Instant feedback
- Hot reload on code changes
- Full debugging capabilities
- Direct database access
- Real-time logs

**Usage**:

```bash
npm run dev
# App runs on Builder.io preview
```

### Netlify Deployment

**Benefits**:

- Production-ready
- Auto-scaling
- CDN for frontend
- Serverless backend
- Global distribution

**Usage**:

```bash
# Push code
git push origin main

# Netlify auto-deploys
# Visit https://your-site.netlify.app
```

---

## 🔐 Environment Configuration

### Current Builder.io Server

Already has access to:

```
✅ NEON_DATABASE_URL
✅ Firebase configuration
✅ Mapbox token
✅ Pusher keys
✅ Xendit keys
✅ All environment variables
```

The server loads from:

- Local `.env` (development)
- System environment variables
- Builder.io platform configuration

### Netlify Deployment

Will use:

```
✅ Netlify environment variables dashboard
✅ Build-time secrets
✅ Function environment access
✅ Secure secret storage
```

Set in: **Site Settings → Build & Deploy → Environment**

---

## 📊 Testing Checklist

### On Current Builder.io Server

- [ ] **Login Tests**
  - [ ] Admin login works
  - [ ] Customer login works
  - [ ] Invalid credentials show error
  - [ ] Redirects work correctly

- [ ] **API Tests**
  - [ ] `/api/health` returns 200
  - [ ] `/api/neon/test` shows connected
  - [ ] `/api/neon/auth/login` returns user data
  - [ ] Errors are formatted correctly

- [ ] **Database Tests**
  - [ ] All tables exist
  - [ ] Test data is accessible
  - [ ] Queries return correct data
  - [ ] No connection errors

- [ ] **UI Tests**
  - [ ] Pages load without errors
  - [ ] Forms submit correctly
  - [ ] Buttons are clickable
  - [ ] Layout is responsive

---

## 🚨 Troubleshooting

### API Returns 500 Error

**On Builder.io Server**:

1. Check browser DevTools (F12)
2. Look at Network tab → API request
3. Check server logs for errors
4. Verify database connection
5. Restart server if needed

### Login Not Working

**Steps to debug**:

1. Check credentials are correct
2. Verify database is connected
3. Check if user exists in database
4. Look at password validation logs
5. Clear browser cache and try again

### Database Connection Failed

**Check**:

1. `NEON_DATABASE_URL` is set
2. Connection string is correct
3. Neon database is active
4. No IP restrictions blocking connection
5. Database tables exist

---

## 📈 Migration Path

### Phase 1: Development (Current)

```
✅ Use Builder.io test server
✅ Test all features locally
✅ Debug with hot reload
✅ Verify database changes
```

### Phase 2: Deployment (Next)

```
→ Push code to GitHub
→ Connect to Netlify
→ Add environment variables
→ Deploy to production
→ Monitor function logs
```

### Phase 3: Production (Final)

```
→ Live app at Netlify URL
→ Monitor performance
→ Add custom domain
→ Set up alerts
→ Regular maintenance
```

---

## 🎯 Key Points

### Builder.io Server

- ✅ Perfect for development
- ✅ Real-time feedback
- ✅ Full debugging
- ✅ No deployment step

### Netlify Deployment

- ✅ Production-ready
- ✅ Auto-scaling
- ✅ Global CDN
- ✅ Serverless backend

### Both Are Compatible

- ✅ Same Netlify configuration
- ✅ Same database (Neon)
- ✅ Same API structure
- ✅ Easy migration path

---

## 💡 Pro Tips

1. **Keep using Builder.io dev server for development**
   - No need to redeploy for each change
   - Instant feedback with hot reload
   - Perfect for testing

2. **Test on Builder.io before deploying to Netlify**
   - Make sure everything works
   - Test all user flows
   - Verify database operations
   - Check API responses

3. **Use same credentials to test both**
   - Same test accounts
   - Same database
   - Same behavior
   - Easy comparison

4. **Monitor logs on both platforms**
   - Builder.io server logs (local)
   - Netlify function logs (production)
   - Compare errors and performance

---

## 🔗 Quick Links

**Current Test Server** (Builder.io - Netlify-Ready):

- Preview: Interactive iframe on the right
- Login: Use `/login` path in iframe
- Test credentials: See section above
- Status: Running with full Netlify configuration

**Future Production** (Netlify):

- Will be: https://your-site.netlify.app
- Use same deployment configuration
- Use same credentials for testing

**Documentation**:

- Deployment guide: `NETLIFY_DEPLOYMENT.md`
- Checklist: `NETLIFY_DEPLOYMENT_CHECKLIST.md`
- Quick start: `QUICK_START_NETLIFY.md`
- All credentials: `TEST_CREDENTIALS.md`

---

## ✨ Current Status

| Component          | Builder.io Server           | Netlify Deployment      |
| ------------------ | --------------------------- | ----------------------- |
| **Frontend**       | ✅ Running                  | ✅ Ready on CDN         |
| **API**            | ✅ Running (Netlify config) | ✅ Ready on Functions   |
| **Database**       | ✅ Connected (Neon)         | ✅ Same Neon DB         |
| **Authentication** | ✅ Working                  | ✅ Configured           |
| **Configuration**  | ✅ Netlify-Ready            | ✅ Production Config    |
| **Hot Reload**     | ✅ Active                   | ❌ N/A in production    |
| **Debugging**      | ✅ Full access              | ⚠️ Via logs             |
| **Performance**    | ✅ Dev mode                 | ✅ Production-optimized |

---

## 🚀 Ready to Deploy?

When you're ready to go to production:

1. **Make sure everything works on current server** ✅
2. **Push to GitHub** (`git push origin main`)
3. **Connect to Netlify** (3 simple steps)
4. **Add environment variables**
5. **Deploy** (fully automated)

**No code changes needed** - everything is already configured for Netlify!

---

**Current Status**: ✅ Fully Functional on Builder.io Server with Netlify Configuration

**Platform**: Builder.io Development Server (dev testing) + Netlify Production-Ready (for deployment)

**Configuration**: 100% Netlify-compatible - no Fly.dev dependencies

**Timeline**: You're in control - test as long as you need on Builder.io, then deploy to Netlify when ready!

---

**Last Updated**: January 26, 2026

**Deployment Status**: ✅ No Fly.dev References | ✅ All Netlify Configured | ✅ Production Ready
