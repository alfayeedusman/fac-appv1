# Netlify Deployment Setup Guide with Neon Database

This guide walks you through deploying your FAC (Fayeed Auto Care) application on Netlify with Neon as the database backend.

## Prerequisites

- ✅ Neon project created with your database
- ✅ Netlify account
- ✅ Git repository pushed to GitHub
- ✅ All environment variables configured

## Step 1: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Select your Git provider (GitHub)
4. Authorize Netlify and select your repository
5. Click "Deploy site"

## Step 2: Configure Environment Variables

In Netlify Dashboard:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click **Add environment variables**

### Required Variables

Add these variables (get values from your `.env` file):

```
# Database
NEON_DATABASE_URL=postgresql://...

# Firebase Configuration (safe for frontend)
VITE_FIREBASE_API_KEY=<YOUR_FIREBASE_WEB_API_KEY>
VITE_FIREBASE_AUTH_DOMAIN=facapp-dbdc1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=facapp-dbdc1
VITE_FIREBASE_STORAGE_BUCKET=facapp-dbdc1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=964995288467
VITE_FIREBASE_APP_ID=1:964995288467:web:a933dcdc046b3f17422c66
VITE_FIREBASE_MEASUREMENT_ID=G-F2D86P30G5
VITE_FIREBASE_FCM_KEY=BPZ7q...

# Payment Gateway (Xendit)
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_PUBLIC_KEY=xnd_public_development_...
XENDIT_WEBHOOK_TOKEN=Q1kEJVOu...

# Real-time Communications (Pusher)
PUSHER_APP_ID=2102895
PUSHER_KEY=bce5ef8f...
PUSHER_SECRET=3ae85fd35...
PUSHER_CLUSTER=ap1
VITE_PUSHER_KEY=bce5ef8f...
VITE_PUSHER_CLUSTER=ap1

# Map Token (Mapbox)
VITE_MAPBOX_TOKEN=pk.eyJ1...

# Build Environment
NODE_ENV=production
```

**⚠️ IMPORTANT - Security:**

- Only `VITE_*` prefixed variables are exposed to the frontend
- Backend secrets (XENDIT_SECRET_KEY, PUSHER_SECRET, NEON_DATABASE_URL) are safe - kept on server only
- Never add backend secrets to your frontend code

## Step 3: Verify Netlify Configuration

Your `netlify.toml` is already configured with:

✅ **Build Command**: `npm ci --legacy-peer-deps && npm run build`

- Installs dependencies using npm ci (clean install)
- Builds both client (Vite) and server

✅ **Publish Directory**: `dist/spa` (static frontend files)

✅ **Functions Directory**: `netlify/functions` (serverless APIs)

✅ **External Modules**: express, cors, drizzle-orm, @neondatabase/serverless

✅ **Redirects**: Properly configured for SPA routing and API proxying

## Step 4: Database Setup

Before your first deploy:

1. **Create Neon Project**:

   - Go to [console.neon.tech](https://console.neon.tech)
   - Create a new project
   - Get your connection string

2. **Initialize Database Schema**:

   ```bash
   npm run build  # Builds the server migrations
   ```

3. **Verify Connection**:
   - After deploy, check the health endpoint:
   - Visit: `https://your-netlify-site/.netlify/functions/api/health`
   - You should see: `{"status":"healthy","services":{"neon":"connected"}}`

## Step 5: Deploy & Test

1. **First Deploy**:

   - Netlify automatically deploys when you push to your main branch
   - Monitor build logs in Netlify Dashboard

2. **Check Build Logs**:

   - Go to **Deployments** tab
   - Click on the latest deployment
   - View real-time build logs

3. **Test API Endpoints**:

   ```bash
   # Health check
   curl https://your-site.netlify.app/.netlify/functions/api/health

   # Test payment endpoint
   curl https://your-site.netlify.app/.netlify/functions/api/neon/payment/xendit/test
   ```

## Troubleshooting

### Build Fails with "command not found"

**Solution**: The build command expects `npm ci` to install dependencies.

- Check Node.js version (set to 22 in netlify.toml)
- Verify package.json has no syntax errors
- Clear Netlify cache: **Settings** → **Build & Deploy** → **Clear cache and retry**

### Database Connection Fails

**Solution**:

- Verify `NEON_DATABASE_URL` in environment variables
- Check that Neon project is active and not in sleep mode
- Test locally: `npm run build && npm start`

### Firebase/Xendit Not Working

**Solution**:

- Ensure `VITE_` prefixed variables are set for Firebase
- Backend secrets should NOT have `VITE_` prefix
- Check console errors in browser DevTools

### API Routes Return 404

**Solution**:

- Verify `netlify.toml` redirects are correct
- Check that `/api/*` routes go to `/.netlify/functions/api/:splat`
- Rebuild: **Deployments** → **Trigger Deploy** → **Deploy site**

## Environment Variables Checklist

- [ ] `NEON_DATABASE_URL` set
- [ ] Firebase variables set (VITE*FIREBASE*\*)
- [ ] Xendit keys set (XENDIT\_\*)
- [ ] Pusher credentials set (PUSHER*\*, VITE_PUSHER*\*)
- [ ] Mapbox token set (VITE_MAPBOX_TOKEN)
- [ ] `NODE_ENV` set to production

## Local Testing Before Deploy

```bash
# Build locally
npm run build

# Start production server
npm start

# Test health check
curl http://localhost:8080/api/health

# Test API endpoints
curl http://localhost:8080/api/neon/test
```

## Production Best Practices

1. **Always test locally first**

   ```bash
   npm run build && npm start
   ```

2. **Use environment variables** - Never hardcode secrets

3. **Monitor deployments**:

   - Enable email notifications in Netlify
   - Check build logs for warnings

4. **Database backups**:

   - Enable Neon automated backups
   - Regular export of critical data

5. **Performance optimization**:
   - Check bundle size: `dist/stats.html` after build
   - Monitor API response times
   - Set up error tracking (optional: Sentry)

## Next Steps

After successful deployment:

1. ✅ Verify all API endpoints working
2. ✅ Test payment processing (Xendit)
3. ✅ Test real-time features (Pusher)
4. ✅ Monitor error logs
5. ✅ Set up CI/CD for automatic deploys on git push

## Support & Help

- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **GitHub Issues**: Check your repository issues

---

**Last Updated**: January 2026
**Node Version**: 22
**Build Tool**: Vite + Express
