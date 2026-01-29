# Login Error Debugging Guide for Live Server

## Quick Diagnosis Steps

### Step 1: Check Browser Console
1. Go to your live site login page
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Try to login and note the exact error message

### Step 2: Check Network Tab
1. Open **Network** tab in Developer Tools
2. Try to login
3. Look for failed requests to `/api/neon/auth/login`
4. Check the response - it should tell you what's wrong

### Step 3: Verify Environment Variables

On your hosting provider, ensure these are set:

**Critical:**
```
NEON_DATABASE_URL=postgresql://...your database url...
```

**Frontend Build:**
```
VITE_API_BASE_URL=/api
```
(or full URL if API is on different domain)

## Common Issues and Fixes

### Issue 1: "Login failed" with no error details
**Cause**: Frontend can't reach the API endpoint

**Fix**:
1. Check Network tab - is the API request being made?
2. If request is failing: Set `VITE_API_BASE_URL` environment variable
3. Rebuild frontend: `npm run build`
4. Restart server: `npm start`

### Issue 2: "Invalid email or password"
**Cause**: Database connection works, but user credentials wrong or user doesn't exist

**Fix**:
1. Verify user exists in database
2. Check if password is correct
3. Make sure you're using correct username/password for your test account

### Issue 3: Server Error (503)
**Cause**: Database not connected or NEON_DATABASE_URL not set

**Fix**:
1. Verify `NEON_DATABASE_URL` is set on hosting provider
2. Test database connection: Go to `/api/neon/test` in browser
3. If error persists, check database credentials

## Testing the API Directly

Test your API endpoints manually:

### Test Database Connection
```
GET https://yourdomain.com/api/neon/test
```
Should return: `{ success: true, connected: true, ... }`

### Test Login Endpoint
```
POST https://yourdomain.com/api/neon/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "yourpassword"
}
```

## Step-by-Step Fix Process

1. **Set NEON_DATABASE_URL**
   - Go to hosting provider environment variables
   - Add: `NEON_DATABASE_URL=postgresql://...`

2. **Set VITE_API_BASE_URL**
   - Add: `VITE_API_BASE_URL=/api`
   - (or `VITE_API_BASE_URL=https://yourdomain.com/api` if needed)

3. **Rebuild & Redeploy**
   ```bash
   npm run build
   npm start
   ```

4. **Test**
   - Visit `https://yourdomain.com/api/neon/test`
   - Try logging in

## Server Logs

Check server logs for detailed error messages:

Look for lines like:
- `🔐 Login attempt received` - Login attempt started
- `✅ User found in database` - User exists
- `🔐 Password verification result` - Password check
- `❌ Login failed:` - Reason for failure

These logs will tell you exactly where the login is failing.

## Still Stuck?

If you're still having issues after these steps, enable debug mode:

1. Set environment variable: `NODE_ENV=development`
2. Restart server
3. Try login again
4. Check server output for detailed error messages
5. Share the error message from browser console

The console will show which step is failing (database connection, user lookup, password verification, etc.)
