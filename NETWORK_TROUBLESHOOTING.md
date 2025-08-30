# Network Troubleshooting Guide

This guide helps resolve common network errors in the Fayeed Auto Care application.

## Common Error Messages

### "NetworkError when attempting to fetch resource"
This error occurs when the browser cannot connect to the backend API.

**Possible Causes:**
- Backend server is not running
- CORS configuration issues
- Incorrect API URL configuration
- Network connectivity problems

**Solutions:**

1. **Check Backend Server**
   ```bash
   # Make sure the backend is running
   npm run dev
   # or
   npm run server
   ```

2. **Verify API Configuration**
   - Check `.env` file for `VITE_API_BASE_URL`
   - Default: `/api` for same-origin setup
   - For separate backend: `http://localhost:3001`

3. **Test API Connectivity**
   ```bash
   # Test if API is reachable
   curl http://localhost:8080/api/health
   ```

4. **Check CORS Configuration**
   - Ensure your frontend origin is in server CORS allowlist
   - Check `server/mysql-server.ts` or `server/index.ts`

### "Geolocation error: [object Object]"
This error has been fixed by implementing proper error formatting utilities.

**If you still see this error:**
- Clear browser cache and refresh
- Check browser console for detailed error messages
- Ensure location permissions are granted

## Diagnostic Tools

### 1. Network Diagnostics Utility
```typescript
import { logNetworkDiagnostics } from './client/utils/networkDiagnostics';

// Run in browser console
await logNetworkDiagnostics();
```

### 2. Manual API Test
```bash
# Test health endpoint
curl -I http://localhost:8080/api/health

# Test with CORS
curl -H "Origin: http://localhost:8080" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8080/api/health
```

## Environment Configuration

### Development Setup
Create `.env` file in project root:
```env
# For same-origin setup (default)
VITE_API_BASE_URL=/api

# For separate backend server
VITE_API_BASE_URL=http://localhost:3001
```

### Server CORS Configuration
Ensure your frontend origin is included in CORS allowlist:

```typescript
// server/mysql-server.ts
cors({
  origin: [
    "http://localhost:8080",   // Default dev server
    "http://localhost:3000",   // Alternative port
    "http://localhost:5173",   // Vite default
    process.env.FRONTEND_URL || "http://localhost:8080",
  ],
  credentials: true,
})
```

## Production Considerations

1. **Set Proper Environment Variables**
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **HTTPS Requirements**
   - Geolocation requires HTTPS in production
   - Ensure SSL certificates are properly configured

3. **Error Monitoring**
   - Implement proper error logging
   - Monitor network failures in production

## Quick Fixes

### Reset Local Development
```bash
# Stop all servers
pkill -f "node"

# Clear cache
rm -rf node_modules/.cache
rm -rf dist

# Restart
npm install
npm run dev
```

### Clear Browser State
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear all local storage and cookies
4. Hard refresh (Ctrl+Shift+R)

## Getting Help

If network issues persist:

1. Run network diagnostics and share output
2. Check browser network tab for failed requests
3. Share server logs and error messages
4. Include environment configuration details

For geolocation issues:
1. Check browser location permissions
2. Test on HTTPS or localhost
3. Review console for detailed error messages
