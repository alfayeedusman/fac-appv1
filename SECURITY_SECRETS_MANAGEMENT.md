# Security & Secrets Management Guide

## Issues Fixed

### 1. ✅ Hardcoded Firebase Credentials in Service Worker

**Problem**: `public/firebase-messaging-sw.js` contained hardcoded Firebase API keys
**Solution**: Removed hardcoded credentials. Firebase is now initialized only in the main app via environment variables.

### 2. ✅ Environment Variable Protection

**Changes Made**:

- Updated `.gitignore` to prevent `.env` files from being tracked
- Updated `netlify.toml` to properly configure secrets scanning
- Verified Vite only bundles `VITE_*` prefixed variables (safe for frontend)

---

## Environment Variable Guidelines

### ✅ Frontend-Safe Variables (VITE\_ prefix)

These CAN be exposed in the browser bundle:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_FCM_KEY
VITE_MAPBOX_TOKEN
VITE_PUSHER_KEY
VITE_PUSHER_CLUSTER
```

### ❌ Server-Only Variables (NO VITE\_ prefix)

These MUST NEVER be exposed in frontend code:

```
NEON_DATABASE_URL          # Database connection string
XENDIT_SECRET_KEY          # Payment processor secret
XENDIT_WEBHOOK_TOKEN       # Webhook authentication
PUSHER_SECRET              # Real-time messaging secret
PUSHER_APP_ID              # Real-time messaging app ID
```

---

## Development Best Practices

### 1. Never Import Server Secrets in Client Code

❌ **WRONG**:

```typescript
// client/components/MyComponent.tsx
const apiKey = process.env.XENDIT_SECRET_KEY; // ❌ Will be exposed!
```

✅ **CORRECT**:

```typescript
// server/routes/payment.ts
const apiKey = process.env.XENDIT_SECRET_KEY; // ✅ Safe on server

// Then create an API endpoint for client to call
```

### 2. Never Hardcode Credentials

❌ **WRONG**:

```typescript
// public/firebase-messaging-sw.js
const firebaseConfig = {
  apiKey: "<YOUR_FIREBASE_WEB_API_KEY>", // ❌ Exposed!
};
```

✅ **CORRECT**:

```typescript
// client/services/firebaseService.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // ✅ Via env var
};
```

### 3. Keep Static Files Clean

❌ Files in `public/` folder should NOT contain:

- API keys
- Secrets
- Credentials
- Any sensitive information

### 4. Use API Endpoints for Sensitive Operations

❌ **WRONG** - Client directly using secret:

```typescript
const response = await fetch("https://xendit-api.com", {
  headers: { Authorization: `Bearer ${XENDIT_SECRET_KEY}` },
});
```

✅ **CORRECT** - Client calls your API, server handles secret:

```typescript
// Client
const response = await fetch("/api/payment/process", {
  method: "POST",
  body: JSON.stringify({ amount: 100 }),
});

// Server (server/routes/payment.ts)
const XENDIT_SECRET = process.env.XENDIT_SECRET_KEY; // ✅ Safe here
```

---

## Deployment Configuration

### Netlify Secrets

1. **Set environment variables** in Netlify Dashboard:
   - Go to: Site Settings → Build & Deploy → Environment
   - Add all `VITE_*` and server variables here

2. **Secure Sensitive Variables**:
   - Mark backend secrets as "Protected" (Netlify Pro feature)
   - Never expose in logs or build artifacts

3. **Secrets Scanning**:
   - Netlify automatically scans for exposed secrets
   - Review the deployment log for warnings
   - Remove hardcoded credentials if detected

---

## Pre-Deployment Checklist

- [ ] No hardcoded API keys in code
- [ ] No secrets in `public/` folder
- [ ] `.env` files are in `.gitignore`
- [ ] Only `VITE_*` variables in frontend code
- [ ] Server-only code never imported in client files
- [ ] Environment variables set in deployment platform
- [ ] `npm run build` succeeds without warnings
- [ ] Netlify deployment log shows no secrets warnings

---

## If Secrets Are Exposed

1. **Immediate Action**:
   - Regenerate all exposed keys/tokens
   - Rotate credentials in the relevant services
   - Force redeploy after cleanup

2. **Cleanup**:
   - Remove hardcoded secrets from code
   - Commit cleanup to repository
   - Force push if already committed (only if not public yet)

3. **Prevention**:
   - Add pre-commit hooks to prevent secret commits
   - Use Netlify's secret scanning
   - Review CI/CD logs for accidental exposure

---

## Useful Commands

```bash
# Check for potential secrets in files
npm run typecheck

# Build and verify no secrets in output
npm run build

# Check if files contain sensitive patterns
grep -r "XENDIT_SECRET\|PUSHER_SECRET\|NEON_DATABASE_URL" dist/

# Scan for hardcoded credentials (requires installation)
# npm install -g @trufflesecurity/trufflehog
# trufflehog filesystem .
```

---

## References

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-modes.html)
- [Netlify Secrets Management](https://docs.netlify.com/environment-variables/overview/)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
