# Automated Netlify Deployment Guide

## Quick Start (One-Click Deployment)

### For Mac/Linux Users:
```bash
bash scripts/setup-netlify.sh
```

### For Windows Users:
```bash
scripts/setup-netlify.bat
```

### Alternative (npm command):
```bash
npm run setup:netlify
```

---

## What These Commands Do

1. **Clean Installation** - Removes old dependencies and builds
2. **Install Dependencies** - Uses `--legacy-peer-deps` flag for compatibility
3. **Type Checking** - Validates TypeScript code
4. **Build Client** - Builds React SPA to `dist/spa`
5. **Build Server** - Builds Express backend to `dist/server`
6. **Verification** - Confirms all build artifacts exist

---

## Full Automated Setup (Clean Start)

If you're starting fresh and want to clean everything:

```bash
npm run setup:netlify:clean
```

This will:
- Remove all node_modules
- Remove all dist folders
- Fresh install of all dependencies
- Complete build

---

## Netlify Configuration

The `netlify.toml` file is already configured with:

### Build Settings
- **Node Version**: 22 (Latest LTS)
- **Build Command**: `npm install --legacy-peer-deps --prefer-offline --no-audit && npm run build && npm run build:server`
- **Publish Directory**: `dist/spa`
- **Functions Directory**: `netlify/functions`

### External Node Modules
```
- express
- cors
- drizzle-orm
- @neondatabase/serverless
```

### Environment Variables
The following environment variables must be set in Netlify UI:

#### Frontend Variables (VITE_ prefixed - safe for client bundling)
- `VITE_MAPBOX_TOKEN`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_FCM_KEY`
- `VITE_PUSHER_KEY`
- `VITE_PUSHER_CLUSTER`
- `XENDIT_PUBLIC_KEY` (client-safe Xendit key)

#### Backend Variables (Server-only - NOT exposed to frontend)
- `NEON_DATABASE_URL`
- `NETLIFY_DATABASE_URL` (if using)
- `PUSHER_APP_ID`
- `PUSHER_CLUSTER`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `XENDIT_SECRET_KEY`
- `XENDIT_WEBHOOK_TOKEN`

---

## Step-by-Step: Connecting to Netlify

### 1. Prepare Your Repository
```bash
# Make sure everything is committed
git add .
git commit -m "Setup automated Netlify deployment"
git push origin main
```

### 2. Connect to Netlify
- Go to [netlify.com](https://netlify.com)
- Click "Add new site"
- Choose "Connect to Git"
- Select your repository
- Click "Deploy site"

### 3. Configure Environment Variables
Netlify will start building. Once connected:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click "Edit variables"
3. Add all variables from the **Environment Variables** section above
4. Save changes

### 4. Trigger a New Deployment
After adding environment variables:
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger Netlify build with env vars"
git push origin main
```

Netlify will automatically deploy!

---

## Troubleshooting

### Build Fails with Exit Code 127
**Solution**: This usually means a command wasn't found.
- Run `npm run setup:netlify` locally first to verify
- Check that all environment variables are set in Netlify
- Clear cache: Go to **Deploys** → **Clear cache and retry**

### Build Fails with Peer Dependency Errors
**Solution**: Already handled by the `--legacy-peer-deps` flag
- If you still see errors, run locally: `npm run setup:netlify:clean`

### "dist/spa" Directory Not Found
**Solution**: Vite build failed
- Run `npm run build:client` locally to debug
- Check for TypeScript errors: `npm run typecheck`

### Missing Environment Variables
**Solution**: Variables are not set in Netlify
- Verify each variable in Netlify **Site Settings** → **Environment**
- Redeploy after adding variables: **Deploys** → **Trigger Deploy** → **Deploy Site**

### Database Connection Issues
**Solution**: Database URL might be wrong or unavailable
- Verify `NEON_DATABASE_URL` is correct
- Test connection: `psql $NEON_DATABASE_URL -c "SELECT version();"`
- Check Neon console for connection limits

---

## Monitoring Deployments

### Real-Time Logs
1. Go to **Deploys** in Netlify
2. Click the deployment you want to monitor
3. Scroll to **Deploy log** at the bottom
4. Watch logs in real-time

### Deploy History
1. Go to **Deploys**
2. See all deployments with timestamps
3. Click any deployment to see details
4. Rollback to previous version if needed

### Debugging Failed Builds
```bash
# Reproduce the build locally
npm run setup:netlify:clean

# If it fails locally, fix it before pushing to git
```

---

## Automated Workflow

### Every time you want to deploy:

```bash
# 1. Make your changes
# 2. Test locally
npm run dev

# 3. Build to verify
npm run setup:netlify

# 4. Commit and push
git add .
git commit -m "Your feature message"
git push origin main

# 5. Netlify auto-deploys! (check Netlify UI)
```

---

## Advanced: Custom Build Tweaks

If you need to modify the build process, edit `netlify.toml`:

```toml
[build]
  command = "npm install --legacy-peer-deps --prefer-offline --no-audit && npm run build && npm run build:server"
  functions = "netlify/functions"
  publish = "dist/spa"
```

Or edit the npm scripts in `package.json`:

```json
"build": "npm run build:client && npm run build:server",
"build:client": "vite build",
"build:server": "vite build --config vite.config.server.ts"
```

---

## Performance Tips

### Reduce Build Time
1. **Clear cache regularly**: Netlify UI → **Deploys** → **Clear cache and retry**
2. **Use prefetch**: `--prefer-offline` flag speeds up npm installs
3. **Check bundle size**: Build logs show final bundle size

### Reduce Deployed Size
1. Check build stats: `dist/stats.html` (generated after build)
2. Remove unused dependencies: `npm audit --audit-level=moderate`
3. Compress images before uploading

---

## Security Best Practices

1. **Never commit secrets**: Use environment variables only
2. **Regenerate keys periodically**: Especially `XENDIT_SECRET_KEY`
3. **Review environment variables**: Only expose necessary ones
4. **Use role-based access**: In Netlify team settings

---

## Support

If you encounter issues:

1. **Check Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
2. **Review Build Logs**: Most errors are in the deploy log
3. **Test Locally First**: Run `npm run setup:netlify` to reproduce issues
4. **Clear Cache and Retry**: Often solves intermittent issues

---

## Next Steps

After successful deployment:

1. Set up **Build Hooks** for webhooks (optional)
2. Configure **Split Testing** for A/B testing (optional)
3. Set up **Analytics** to track traffic (optional)
4. Enable **Branch Deploy Previews** (optional)

---

**You're all set! Your app is now automated for Netlify deployment.** 🚀
