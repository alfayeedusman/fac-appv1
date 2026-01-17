# Netlify Troubleshooting Guide 🔧

## Common Build Errors and Fixes

### Error: Exit Code 127 (Command Not Found)

**Cause**: npm command not found in Netlify environment

**Fix**:

1. Run locally first: `npm run setup:netlify:clean`
2. Verify it works
3. Clear Netlify cache: **Deploys** → **Clear cache and retry**
4. Check `netlify.toml` build command is correct
5. Verify Node 22 is set in build environment

---

### Error: Exit Code 2 (Build Failed)

**Cause**: Build script returned error (compilation failed)

**Solutions**:

1. **Run locally to debug**:

   ```bash
   npm run setup:netlify:clean
   npm run build
   ```

2. **Check for TypeScript errors**:

   ```bash
   npm run typecheck
   ```

3. **Look for missing dependencies**:

   ```bash
   npm install --legacy-peer-deps --prefer-offline --no-audit
   npm run build:client
   npm run build:server
   ```

4. **Check environment variables** are set in Netlify

---

### Error: "Cannot find module" or "Module not found"

**Cause**: Dependency missing or installed incorrectly

**Fix**:

```bash
# Locally
npm run setup:netlify:clean

# In Netlify:
1. Go to Site Settings → Build & Deploy → Environment
2. Scroll to "Build command"
3. Click Trigger deploy → Deploy site
```

---

### Error: "ENOENT: no such file or directory"

**Cause**: Missing build artifacts

**Fix**:

1. Verify `dist/spa` and `dist/server` exist after build:

   ```bash
   npm run build
   ls -la dist/
   ```

2. Check `netlify.toml` publish path:

   ```toml
   publish = "dist/spa"
   ```

3. Clear cache in Netlify and redeploy

---

### Error: Peer Dependency Conflicts

**Cause**: npm dependencies have version conflicts

**Fix**: Already handled! Our command uses `--legacy-peer-deps`

If still seeing errors:

```bash
# Clean and reinstall
npm run setup:netlify:clean

# In Netlify, the flag is already in netlify.toml
```

---

### Error: "VITE\_\* not defined" or "process.env undefined"

**Cause**: Environment variables not set in Netlify

**Fix**:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add all VITE\_ variables:
   ```
   VITE_MAPBOX_TOKEN=...
   VITE_FIREBASE_API_KEY=...
   etc.
   ```
3. Save and redeploy: **Deploys** → **Trigger deploy**

---

### Error: "Cannot connect to database"

**Cause**: `NEON_DATABASE_URL` not set or incorrect

**Fix**:

1. Verify in Netlify: **Site Settings** → **Environment**
2. Check URL format (ends with `?sslmode=require`)
3. Test connection locally:
   ```bash
   psql $NEON_DATABASE_URL -c "SELECT 1"
   ```
4. If URL is wrong, update in Netlify and redeploy

---

### Error: "Timeout" or "Build taking too long"

**Cause**: Dependencies download too slow or build is hanging

**Fix**:

1. Use `--prefer-offline` flag (already in netlify.toml)
2. Clear npm cache locally:
   ```bash
   npm cache clean --force
   npm run setup:netlify:clean
   ```
3. In Netlify, increase timeout or clear cache
4. Check for infinite loops in build scripts

---

### Error: TypeScript Compilation Errors

**Cause**: TypeScript errors in code

**Fix**:

```bash
# Check errors locally
npm run typecheck

# Fix them in your editor, then:
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

---

### Error: "Unexpected token" or Syntax Error

**Cause**: Invalid JavaScript/TypeScript in source

**Fix**:

1. Check build log for file path
2. Open that file and verify syntax
3. Compare with other files in same folder
4. Common causes:
   - Missing semicolon
   - Unclosed bracket
   - Invalid import statement
   - Wrong component syntax

---

### Error: "dist/spa is empty"

**Cause**: Vite build didn't generate files

**Fix**:

1. Run locally to debug:

   ```bash
   npm run build:client
   ls -la dist/spa/
   ```

2. Check `vite.config.ts`:

   ```ts
   build: {
     outDir: "dist/spa",
   }
   ```

3. Verify no errors in build output

---

## Deployment Not Happening

### Git Push But No Deploy Triggered

**Cause**: Git not connected to Netlify

**Fix**:

1. Go to **Site Settings** → **Build & Deploy** → **Connected repositories**
2. Connect your GitHub/GitLab repo
3. Select main branch
4. Make a commit and push

---

### Changes Made But Site Not Updated

**Cause**: Netlify cache not cleared

**Fix**:

1. Go to **Deploys**
2. Click **Clear cache and retry**
3. Watch deploy log

Or deploy manually:

```bash
# Make changes
git add .
git commit -m "Update"
git push origin main
# Netlify will auto-deploy
```

---

### Build Succeeded But Site Not Updated

**Cause**: Changes not published properly

**Fix**:

1. Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Clear browser cache
3. Check Netlify deploy log for publish errors
4. Verify publish directory in `netlify.toml`:
   ```toml
   publish = "dist/spa"
   ```

---

## Quick Diagnostic Steps

When anything goes wrong, run this sequence:

### Step 1: Test Locally

```bash
npm run setup:netlify:clean
npm run typecheck
```

If fails locally, fix it first before pushing.

### Step 2: Check Git

```bash
git status
git log -1
git push origin main
```

### Step 3: Monitor Netlify

1. Go to **Deploys**
2. Watch the new deployment
3. Click it to see full log
4. Look for error messages

### Step 4: Clear Cache & Retry

1. Go to **Deploys**
2. Click **Clear cache and retry**
3. Watch new deploy

### Step 5: Check Environment

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Verify all VITE\_ and backend variables present
3. No typos in variable names
4. Redeploy if changes made

### Step 6: Check Configuration

1. Review `netlify.toml`
2. Verify build command
3. Verify publish directory
4. Verify functions directory

---

## Emergency Rollback

If live site is broken:

1. Go to **Deploys**
2. Find last known good deployment (green checkmark)
3. Click the **...** menu
4. Select **Publish deploy**
5. Site reverts immediately

To prevent future issues:

1. Test locally first: `npm run dev`
2. Build locally: `npm run build`
3. Only push if tests pass

---

## Performance Issues

### Site Loading Slowly

1. Check **Deploys** → **Deploy time** (should be <30s)
2. If slow build, check:
   - `npm install` taking long (npm cache issue)
   - Vite build slow (check bundle size: `dist/stats.html`)
3. Fix:
   ```bash
   npm cache clean --force
   npm run setup:netlify:clean
   ```

### Deploy Takes Too Long (>10 min)

1. Clear npm cache: `npm cache clean --force`
2. Check for large files being installed
3. Reduce dependencies if possible
4. Consider monorepo optimization

---

## Debugging Build Log

### Reading the Netlify Build Log

Look for these sections:

```
1. Downloading cache (0s)
2. Installing dependencies (npm ci or npm install) - takes 30-60s
3. Building (npm run build) - takes 10-30s
4. Publishing (uploading files) - takes 10-30s
```

**Green logs** = Success ✅
**Yellow logs** = Warnings ⚠️
**Red logs** = Errors ❌

Focus on red logs to find issues.

---

## Still Having Issues?

1. **Check Netlify Status**: [status.netlify.com](https://status.netlify.com)
2. **Review Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
3. **Search Netlify Community**: [community.netlify.com](https://community.netlify.com)
4. **Contact Netlify Support**: In **Site Settings** → **Support**

---

## Prevention Checklist

Before pushing to main:

- [ ] Ran `npm run dev` - site works locally
- [ ] Ran `npm run typecheck` - no TS errors
- [ ] Ran `npm run build` - build succeeds locally
- [ ] Checked browser console - no errors
- [ ] All environment variables set locally (in `.env` or terminal)
- [ ] Tested main features work
- [ ] Committed with descriptive message
- [ ] Ready for Netlify deploy

---

**You're well-equipped to handle any Netlify issues! 💪**
