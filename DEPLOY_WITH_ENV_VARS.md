# Deploy with Environment Variables - Visual Guide

## The Problem (Before)

```
┌─────────────────────────────────────────┐
│ You have secrets in your code:          │
│  - Database URL                         │
│  - API Keys                             │
│  - Firebase config                      │
│  - Payment processor keys               │
│                                         │
│ Problem: Where do I put these on        │
│          Netlify without committing?    │
└─────────────────────────────────────────┘
         ↓
    ❌ STUCK!
```

---

## The Solution (After)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Your .env.example                                          │
│  ├─ VITE_MAPBOX_TOKEN = pk.eyJ...                           │
│  ├─ NEON_DATABASE_URL = postgresql://...                    │
│  ├─ FIREBASE_PROJECT_ID = my-project                        │
│  ├─ XENDIT_SECRET_KEY = xnd_...                             │
│  └─ PUSHER_KEY = abc123...                                  │
│                                                              │
│  ✅ Committed to Git (safe - no secrets)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         ↓                        ↓                    ↓
   ┌─────────┐         ┌──────────────┐       ┌─────────────┐
   │ Method 1│         │  Method 2    │       │  Method 3   │
   │   UI    │         │  Netlify CLI │       │   GitHub    │
   │ Manual  │         │  + Script    │       │   Actions   │
   │ 5 min   │         │   10 min     │       │   15 min    │
   └─────────┘         └──────────────┘       └─────────────┘
         ↓                     ↓                      ↓
    ┌───────────┐      ┌──────────────┐      ┌──────────────┐
    │ Dashboard │      │ netlify CLI  │      │ GitHub CI/CD │
    │ Copy/Paste│      │ Auto-upload  │      │ Auto-sync on │
    │ Variables │      │ From file    │      │ git push     │
    └───────────┘      └──────────────┘      └──────────────┘
         ↓                     ↓                      ↓
    ┌─────────────────────────────────────────────────────────┐
    │  🎯 Netlify Environment Variables                       │
    │                                                          │
    │  ✅ VITE_MAPBOX_TOKEN = pk.eyJ...                       │
    │  ✅ NEON_DATABASE_URL = postgresql://...                │
    │  ✅ FIREBASE_PROJECT_ID = my-project                    │
    │  ✅ XENDIT_SECRET_KEY = xnd_...                         │
    │  ✅ PUSHER_KEY = abc123...                              │
    │                                                          │
    └─────────────────────────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │  When you deploy:   │
    │  npm run build      │
    └─────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │  Build process:                     │
    │  1. Load variables from Netlify     │
    │  2. Build frontend with VITE_ vars  │
    │  3. Build server with process.env   │
    │  4. Deploy to production            │
    └─────────────────────────────────────┘
              ↓
    ┌─────────────────────────────────────┐
    │  ✅ App works!                      │
    │  ✅ Database connected              │
    │  ✅ Payments working                │
    │  ✅ Maps loading                    │
    │  ✅ Real-time features active       │
    └─────────────────────────────────────┘
```

---

## Method 1: Manual (UI)

**Timeline: 5 minutes**

```
1. Open Netlify Dashboard
   └─ https://app.netlify.com

2. Select your site
   └─ Your Site Name

3. Navigate to Build & Deploy
   └─ Site settings → Build & deploy → Environment

4. Edit Variables
   ┌─────────────────────────────────────┐
   │ Variable 1:                         │
   │ Key: VITE_MAPBOX_TOKEN             │
   │ Value: pk.eyJ...                    │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ Variable 2:                         │
   │ Key: NEON_DATABASE_URL             │
   │ Value: postgresql://...             │
   └─────────────────────────────────────┘
   ... repeat for all variables

5. Save

6. Deploy
   └─ Go to Deploys → Deploy site

✅ Done!
```

---

## Method 2: Netlify CLI (Recommended)

**Timeline: 10 minutes**

```
Terminal Session:
─────────────────────────────────────────

$ npm install -g netlify-cli
  ✅ Installed

$ netlify login
  ✅ Browser opens, you authenticate

$ netlify link
  ✓ Select your site from list
  ✅ Site linked

$ cp .env.example .env.production.local
$ nano .env.production.local
  # Fill in your actual values
  ✅ File created with secrets

$ node scripts/sync-netlify-env.js .env.production.local
  📝 Found 25 variables in .env.production.local

  Variables to sync:
    🔐 NEON_DATABASE_URL = postgresql://...
    🔐 XENDIT_SECRET_KEY = xnd_...
    🔐 FIREBASE_PRIVATE_KEY = -----BEGIN...
    ... more variables ...

  Continue syncing to Netlify? (yes/no): yes

  🚀 Syncing 25 variables to Netlify...
    ✅ VITE_MAPBOX_TOKEN
    ✅ NEON_DATABASE_URL
    ✅ FIREBASE_PROJECT_ID
    ... more success ...

  ✅ Successfully synced: 25/25 variables

$ netlify env:list
  NEON_DATABASE_URL = postgresql://...
  VITE_MAPBOX_TOKEN = pk.eyJ...
  ... all variables listed ...

$ git push origin main
  ✅ Code pushed

✅ Done! Next deploy uses variables automatically
```

---

## Method 3: GitHub Actions (Automated)

**Timeline: 15 minutes (one-time setup)**

```
GitHub Setup:
─────────────────────────────────────────

1. Get Netlify Token
   └─ https://app.netlify.com/account/applications/personal-access-tokens
      └─ Create token: netlify-sync
      └─ Copy token

2. Get Netlify Site ID
   └─ https://app.netlify.com
      └─ Select site
      └─ Site settings → General
      └─ Copy "Site ID"

3. Add GitHub Secrets
   └─ Settings → Secrets and variables → Actions
      ├─ NETLIFY_AUTH_TOKEN = (your token from step 1)
      └─ NETLIFY_SITE_ID = (your site ID from step 2)

Local Machine:
─────────────────────────────────────────

$ cp .env.example .env.production
$ nano .env.production
  # Fill in your values

$ git add .
$ git commit -m "Add env vars"
$ git push origin main
  ✅ Pushed

On GitHub (Automatic):
─────────────────────────────────────────

Repository → Actions tab

┌─────────────────────────────────────┐
│ Sync Environment Variables...       │
│                                     │
│ ✅ Checkout code                    │
│ ✅ Setup Node.js                    │
│ ✅ Install Netlify CLI              │
│ ✅ Verify credentials               │
│ ✅ Sync env variables to Netlify    │
│   ├─ 📝 Found 25 variables          │
│   ├─ 🚀 Setting VITE_MAPBOX_TOKEN   │
│   ├─ 🚀 Setting NEON_DATABASE_URL   │
│   ├─ 🚀 Setting FIREBASE_*          │
│   └─ ✅ All 25 synced!              │
│ ✅ Notify on success                │
│                                     │
│ Workflow completed successfully     │
└─────────────────────────────────────┘

On Netlify (Automatic):
─────────────────────────────────────────

Netlify Dashboard:

┌──────────────────────────┐
│ Deploys                  │
│                          │
│ Latest Deploy            │
│ Status: Building         │
│ ├─ Installing deps...    │
│ ├─ Building client...    │
│ ├─ Building server...    │
│ ├─ Loading env vars... ✅│
│ └─ Deploying... ✅       │
│                          │
│ Status: Published        │
│ URL: yoursite.netlify.app│
└──────────────────────────┘

✅ Done! Auto-synced on every push!
```

---

## Files Created

```
Your Project
│
├── .env.example ✅ (Template - commit this)
│   ├─ VITE_MAPBOX_TOKEN = pk.eyJ...
│   ├─ NEON_DATABASE_URL = postgresql://...
│   └─ ... 20+ more variables ...
│
├── .env.production.local ✅ (Your secrets - ignore in Git)
│   ├─ VITE_MAPBOX_TOKEN = pk.eyJ1234567890...
│   ├─ NEON_DATABASE_URL = postgresql://user:pass@host/db
│   └─ ... actual values ...
│
├── scripts/
│   └── sync-netlify-env.js ✅ (Sync tool - commit this)
│       └─ Automatically sends variables to Netlify
│
├── .github/
│   └── workflows/
│       └── sync-netlify-env.yml ✅ (Auto CI/CD - commit this)
│           └─ Runs on git push → auto syncs to Netlify
│
└── netlify.toml ✅ (Updated - commit this)
    └─ Configured to use environment variables
```

---

## Environment Flow

```
Your Local Machine
       ↓
   .env.production.local
   (your actual values)
       ↓
   ┌───────────────────────────────────────┐
   │ Choose one method:                    │
   ├───────────────────────────────────────┤
   │ 1️⃣  Manual:    Copy-paste in UI      │
   │ 2️⃣  CLI:       node sync script      │
   │ 3️⃣  GitHub:    git push (automatic)  │
   └───────────────────────────────────────┘
       ↓
   Netlify Dashboard
   (variables stored securely)
       ↓
   npm run build (during deploy)
       ↓
   ┌─────────────────────────────────┐
   │ Frontend                        │
   │ import.meta.env.VITE_*          │
   └─────────────────────────────────┘
   │
   ├─ process.env (server)
   │  ├─ NEON_DATABASE_URL
   │  ├─ FIREBASE_*
   │  ├─ XENDIT_*
   │  └─ ...
   │
   ├─ import.meta.env (browser)
   │  ├─ VITE_MAPBOX_TOKEN
   │  ├─ VITE_FIREBASE_*
   │  ├─ VITE_PUSHER_*
   │  └─ ...
   │
   └─ Both layers available!
       ↓
   🚀 Deployed App Works!
```

---

## Quick Reference Matrix

| Aspect            | Manual UI | Netlify CLI   | GitHub Actions |
| ----------------- | --------- | ------------- | -------------- |
| **Time**          | 5 min     | 10 min        | 15 min (setup) |
| **Setup**         | Easy      | Medium        | Medium         |
| **Automation**    | ❌ Manual | ⚠️ Per-update | ✅ Auto        |
| **Error-prone**   | ⚠️ Risky  | ✅ Safe       | ✅ Safe        |
| **Best for**      | Testing   | Development   | Production     |
| **Cost**          | Free      | Free          | Free           |
| **Team-friendly** | ❌ No     | ⚠️ Individual | ✅ Yes         |

---

## After Setup

### First Deploy

```
git push origin main
  ↓
Netlify builds your app
  ↓
Variables loaded from Netlify
  ↓
App deployed and working!
```

### Later Updates

```
Edit .env.production.local
  ↓
Run: node scripts/sync-netlify-env.js .env.production.local
(or GitHub Actions does it automatically)
  ↓
Variables updated in Netlify
  ↓
Next deployment uses new variables
```

---

## ✅ Verification Checklist

After deployment, verify:

```
[ ] Variables appear in Netlify dashboard
    └─ https://app.netlify.com → Site settings → Build & deploy → Environment

[ ] Build logs show variables loaded
    └─ Netlify → Deploys → Latest → Deploy log

[ ] App connects to database
    └─ Check if pages load with data

[ ] Payment processing works
    └─ Test a payment

[ ] Maps display correctly
    └─ Visit location-based pages

[ ] Real-time features work
    └─ Test live updates if applicable

[ ] API endpoints respond
    └─ Check network tab in browser

[ ] No environment variable errors
    └─ Check browser console for missing vars
```

---

**You're ready to go! Choose your method and follow the steps above. 🚀**
