# Netlify Environment Variables Setup Guide

This guide explains how to automatically sync environment variables with Netlify for seamless deployments.

## Overview

Environment variables in Netlify are **NOT automatically imported** from a `.env` file for security reasons. Instead, you need to set them in Netlify using one of these methods:

1. **Netlify UI** (Manual - for non-sensitive vars)
2. **Netlify CLI** (Automated - recommended)
3. **GitHub Actions** (CI/CD - advanced)

---

## Method 1: Netlify UI (Manual)

### For first-time setup or occasional updates:

1. **Go to Netlify Dashboard**
   - Navigate to your site at https://app.netlify.com
   - Select your site
   - Go to **Site settings** → **Build & deploy** → **Environment**

2. **Click "Edit variables"**
   - Add each environment variable from `.env.example`
   - For sensitive values (API keys, database URLs), use "**Scoped to: Production**" or "**Scoped to: Deploy previews**"

3. **Required Environment Variables** (copy from `.env.example`):
   - `NEON_DATABASE_URL` - Your database connection string
   - `DATABASE_URL` - Same as above (some functions may use this)
   - `VITE_FIREBASE_*` - All Firebase frontend keys
   - `FIREBASE_*` - Firebase backend/admin credentials
   - `XENDIT_SECRET_KEY`, `XENDIT_PUBLIC_KEY` - Payment processing
   - `PUSHER_*` - Real-time messaging
   - `VITE_MAPBOX_TOKEN` - Mapbox/map services
   - `VITE_PUSHER_*` - Frontend Pusher config
   - Optional: `EMAIL_USER`, `EMAIL_APP_PASSWORD`, Chat service tokens

4. **Click "Save"** and redeploy

---

## Method 2: Netlify CLI (Recommended - Automated)

### For developers who want to automate this process:

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
# or
brew install netlify-cli  # macOS
```

### Step 2: Authenticate with Netlify

```bash
netlify login
# Opens browser for authentication
```

### Step 3: Link your Netlify site

```bash
netlify link
# Select your site from the list
```

### Step 4: Set Environment Variables

**Option A: Set individual variables**
```bash
netlify env:set NEON_DATABASE_URL "postgresql://..."
netlify env:set VITE_MAPBOX_TOKEN "pk.eyJ..."
netlify env:set XENDIT_SECRET_KEY "xnd_..."
# ... repeat for all variables
```

**Option B: Sync from local .env file (Recommended)**

1. **Create `.env.production.local` in your project root:**
   ```bash
   # Copy template and fill in values
   cp .env.example .env.production.local
   
   # Edit with your actual values
   nano .env.production.local
   ```

2. **Create a sync script** (save as `scripts/sync-netlify-env.js`):

   ```javascript
   #!/usr/bin/env node
   const fs = require('fs');
   const path = require('path');
   const { exec } = require('child_process');
   const { promisify } = require('util');

   const execAsync = promisify(exec);

   // Load environment file
   const envFile = process.argv[2] || '.env.production.local';
   
   if (!fs.existsSync(envFile)) {
     console.error(`❌ Error: ${envFile} not found`);
     console.log('Create it first: cp .env.example .env.production.local');
     process.exit(1);
   }

   const envContent = fs.readFileSync(envFile, 'utf8');
   const lines = envContent.split('\n');

   const variables = {};
   
   for (const line of lines) {
     const trimmed = line.trim();
     
     // Skip comments and empty lines
     if (!trimmed || trimmed.startsWith('#')) continue;
     
     const [key, ...valueParts] = trimmed.split('=');
     const value = valueParts.join('=').trim();
     
     if (key && value) {
       variables[key] = value;
     }
   }

   console.log(`📝 Found ${Object.keys(variables).length} variables to sync...`);
   console.log('Variables to set:');
   Object.keys(variables).forEach(key => {
     const value = variables[key];
     const masked = value.length > 10 ? value.substring(0, 10) + '...' : value;
     console.log(`  ✓ ${key} = ${masked}`);
   });

   (async () => {
     try {
       for (const [key, value] of Object.entries(variables)) {
         console.log(`⏳ Setting ${key}...`);
         await execAsync(`netlify env:set ${key} "${value}"`);
         console.log(`✅ ${key} set successfully`);
       }
       console.log('\n🎉 All environment variables synced to Netlify!');
       console.log('📢 Next step: Push your code and trigger a new deploy');
     } catch (error) {
       console.error('❌ Error syncing environment variables:', error.message);
       process.exit(1);
     }
   })();
   ```

3. **Make it executable and run:**
   ```bash
   chmod +x scripts/sync-netlify-env.js
   node scripts/sync-netlify-env.js .env.production.local
   ```

### Step 5: Verify variables are set

```bash
netlify env:list
```

You should see all your variables listed.

---

## Method 3: GitHub Actions (Advanced CI/CD)

### For automatic syncing on every push to main:

**Create `.github/workflows/sync-netlify-env.yml`:**

```yaml
name: Sync Environment Variables to Netlify

on:
  push:
    branches: [main]
    paths:
      - '.env.production'
      - '.env.production.local'

jobs:
  sync-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Netlify CLI
        run: npm install -g netlify-cli
      
      - name: Sync Environment Variables
        run: node scripts/sync-netlify-env.js .env.production
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Setup GitHub Secrets:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `NETLIFY_AUTH_TOKEN`: Get from Netlify → Account → Applications → Tokens → Create new token
   - `NETLIFY_SITE_ID`: Get from Netlify site settings

---

## Best Practices

### 🔒 Security

- **NEVER commit `.env` files** with actual values
- **Only commit `.env.example`** with placeholder values
- **Use Netlify UI for sensitive values** (API keys, secrets)
- **Mark sensitive variables as "sensitive"** in Netlify UI if available
- **Rotate keys regularly** - update Netlify when keys are rotated

### 📦 Organization

1. **Local Development:**
   ```bash
   .env.local                # Git ignored - your local values
   .env.production.local     # Git ignored - production values
   .env.example              # Git committed - template
   ```

2. **Commit to Git:**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   .env.production.local
   ```

3. **Staging vs Production:**
   - Use Netlify branch deploys with different environment variables
   - Deploy preview (staging): Different API keys, test database
   - Production: Production keys, production database

### 🔄 Workflow

1. **Initial Setup:**
   ```bash
   netlify link
   node scripts/sync-netlify-env.js .env.production.local
   ```

2. **For each update:**
   - Update `.env.production.local` locally
   - Run: `node scripts/sync-netlify-env.js .env.production.local`
   - Push code: `git push origin main`

3. **Deployment:**
   - Netlify automatically uses environment variables during build
   - Both client (`VITE_*`) and server (`process.env.*`) vars are available

---

## Troubleshooting

### Variables not working after deploy?

1. **Check Netlify build logs:**
   - Site settings → Deploys → Click latest deploy → Deploy log
   - Look for environment variable loading

2. **Verify in netlify.toml:**
   - Environment variables in `[build.environment]` are read-only
   - Dynamic vars must be set in Netlify UI or CLI

3. **Clear cache and redeploy:**
   ```bash
   netlify deploy --prod --clear-cache
   ```

4. **Check variable scope:**
   - Some variables might be scoped to "Production only"
   - Deploy previews won't see them

### "Command not found: netlify"?

```bash
# Install globally
npm install -g netlify-cli

# Or use npx
npx netlify-cli env:list
```

### Database URL showing error on deploy?

1. Verify `NEON_DATABASE_URL` is set (not `DATABASE_URL`)
2. Check connection string format:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```
3. Ensure Neon database is accessible from Netlify's IP

---

## Quick Reference

| Task | Command |
|------|---------|
| Setup CLI | `netlify login` |
| Link site | `netlify link` |
| List variables | `netlify env:list` |
| Set variable | `netlify env:set KEY value` |
| Delete variable | `netlify env:unset KEY` |
| Sync from file | `node scripts/sync-netlify-env.js .env.production.local` |
| Deploy | `netlify deploy --prod` |
| View logs | `netlify logs` |

---

## Need Help?

- **Netlify Docs:** https://docs.netlify.com/environment-variables/overview/
- **CLI Reference:** https://cli.netlify.com/
- **Neon Docs:** https://neon.tech/docs
- **Firebase Docs:** https://firebase.google.com/docs
