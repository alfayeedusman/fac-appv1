# FAC App - Quick Start Guide

## One-Command Setup

### macOS/Linux:

```bash
bash setup.sh
```

### Windows:

```cmd
setup.bat
```

## What the Setup Does

The setup script automatically:

- ✅ Checks Node.js and npm
- ✅ Installs all dependencies
- ✅ Builds frontend (React)
- ✅ Builds backend (Express)
- ✅ Validates TypeScript
- ✅ Prepares for Netlify deployment

## After Setup

### 1. Start Local Development

```bash
npm run dev
```

Then visit: **http://localhost:8080**

### 2. Test API

```bash
# Test database connection
curl http://localhost:8080/api/neon/test

# Run diagnostics
curl http://localhost:8080/api/neon/diagnose

# Initialize database
curl -X POST http://localhost:8080/api/neon/init
```

### 3. Deploy to Netlify

```bash
git add .
git commit -m "Setup complete"
git push
```

Netlify will automatically deploy both frontend and backend.

## Environment Variables

Before deploying to Netlify, set these in the Netlify Dashboard:
**Site Settings → Build & Deploy → Environment**

```
NEON_DATABASE_URL=postgresql://...
DATABASE_URL=postgresql://...
VITE_FIREBASE_API_KEY=AIza...
VITE_MAPBOX_TOKEN=pk.eyJ...
VITE_PUSHER_KEY=...
PUSHER_SECRET=...
XENDIT_SECRET_KEY=...
XENDIT_PUBLIC_KEY=...
```

(See `.env.example` for all required variables)

## Project Structure

```
├── client/              Frontend (React SPA)
├── server/              Backend (Express)
├── netlify/functions/   Netlify serverless function
├── dist/                Build output
└── netlify.toml         Netlify configuration
```

## Key Files Created/Modified

✅ **netlify/functions/api.ts** - Enhanced serverless function with error handling
✅ **netlify.toml** - Updated build and deployment configuration
✅ **server/middleware/errorLogger.ts** - Comprehensive error logging
✅ **server/index.ts** - Added error logging middleware
✅ **package.json** - Added setup scripts
✅ **.env.example** - Environment variables template
✅ **setup.sh** - macOS/Linux setup script
✅ **setup.bat** - Windows setup script
✅ **verify-setup.sh** - Verification script

## Troubleshooting

### If you see "404" on API routes:

1. Make sure `npm run dev` is running
2. Check that NEON_DATABASE_URL is set
3. Run: `curl http://localhost:8080/api/neon/diagnose`

### If Netlify deployment fails:

1. Check build logs in Netlify Dashboard
2. Verify all environment variables are set
3. Run locally: `npm run build` to test build

### If database won't connect:

1. Verify NEON_DATABASE_URL in environment
2. Check Neon dashboard: https://console.neon.tech
3. Ensure connection string is correct format

## Verify Installation

```bash
bash verify-setup.sh local      # For local development
bash verify-setup.sh netlify    # For deployed version
```

## API Endpoints

| Method | Endpoint                  | Purpose                  |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/neon/test`          | Test database connection |
| GET    | `/api/neon/diagnose`      | Run system diagnostics   |
| POST   | `/api/neon/init`          | Initialize database      |
| POST   | `/api/neon/auth/login`    | User login               |
| POST   | `/api/neon/auth/register` | User registration        |
| GET    | `/api/neon/bookings`      | Get bookings             |
| POST   | `/api/neon/bookings`      | Create booking           |
| GET    | `/api/neon/branches`      | Get branches             |

## Scripts Available

```bash
npm run setup               # Run complete setup
npm run dev               # Start development server
npm run build             # Build frontend and backend
npm run build:client      # Build frontend only
npm run build:server      # Build backend only
npm run start             # Run production build
npm run typecheck         # Validate TypeScript
npm test                  # Run tests
npm run format.fix        # Format code
```

## Next Steps

1. ✅ Run setup: `bash setup.sh`
2. ✅ Start dev: `npm run dev`
3. ✅ Test API: `bash verify-setup.sh local`
4. ✅ Deploy: `git push` (automatic on Netlify)
5. ✅ Verify: `bash verify-setup.sh netlify`

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev

---

**You're all set!** 🚀

The app is ready for development and deployment. All configuration is in place, and both frontend and backend will run on Netlify.
