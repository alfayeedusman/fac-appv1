# 🚀 Netlify Environment Variables - Quick Setup Checklist

Choose your preferred method below:

---

## ⚡ Fast Setup (5 minutes)

### For the impatient developer - Manual UI setup

- [ ] Go to https://app.netlify.com
- [ ] Select your site
- [ ] Go to **Site settings** → **Build & deploy** → **Environment**
- [ ] Click **Edit variables**
- [ ] Copy variables from `.env.example` (one at a time)
- [ ] Paste your actual values for each key
- [ ] Click **Save**
- [ ] Trigger a new deploy from the Deploys tab
- ✅ Done! Variables are now available in production

---

## 🔧 Recommended Setup (10 minutes)

### Use Netlify CLI for easier management

**Prerequisites:**
- [ ] Have npm or Homebrew installed
- [ ] Netlify account created

**Steps:**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   # or: brew install netlify-cli
   ```

2. **Authenticate**
   ```bash
   netlify login
   # Opens browser for login
   ```

3. **Link your site**
   ```bash
   netlify link
   # Select your site from the list
   ```

4. **Set up your environment file**
   ```bash
   cp .env.example .env.production.local
   # Edit with your actual values
   nano .env.production.local
   ```

5. **Sync variables to Netlify**
   ```bash
   node scripts/sync-netlify-env.js .env.production.local
   # Confirm when prompted
   ```

6. **Verify**
   ```bash
   netlify env:list
   # Should show all your variables
   ```

7. **Push code**
   ```bash
   git add .
   git commit -m "Add env var sync script"
   git push origin main
   ```

8. ✅ Done! Future deploys will use these variables automatically

---

## 🤖 Automated Setup (15 minutes)

### Use GitHub Actions for automatic syncing

**Prerequisites:**
- [ ] Repository connected to GitHub
- [ ] Netlify authenticated

**Steps:**

1. **Get your Netlify tokens**
   - Go to https://app.netlify.com/account/applications/personal-access-tokens
   - Create a **Personal access token**
   - Copy the token

2. **Add GitHub Secrets**
   - Go to your GitHub repo
   - Settings → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add `NETLIFY_AUTH_TOKEN` with your token from step 1
   - Add `NETLIFY_SITE_ID` (get from Netlify Site settings → General → Site ID)

3. **Prepare environment file**
   ```bash
   cp .env.example .env.production
   # Edit with your actual values
   nano .env.production
   ```

4. **Push to GitHub**
   ```bash
   git add .github/workflows/sync-netlify-env.yml .env.production scripts/sync-netlify-env.js
   git commit -m "Add automated Netlify env sync"
   git push origin main
   ```

5. **Verify workflow**
   - Go to GitHub repo → Actions tab
   - Should see "Sync Environment Variables to Netlify" running
   - Check if green checkmark appears

6. ✅ Done! Now every time you update `.env.production` and push to main, variables are automatically synced

---

## 📋 What Gets Synced

These variables are automatically managed:

**Frontend (Client)**
- `VITE_MAPBOX_TOKEN`
- `VITE_FIREBASE_*`
- `VITE_PUSHER_*`
- `VITE_CRISP_WEBSITE_ID`
- `VITE_TAWK_*`
- `VITE_WHATSAPP_NUMBER`
- `VITE_CHAT_ENABLED`

**Backend (Server)**
- `NEON_DATABASE_URL` / `DATABASE_URL`
- `FIREBASE_*` (admin SDK)
- `PUSHER_*`
- `XENDIT_*`
- `EMAIL_*`
- `PORT`, `FRONTEND_URL`
- `NODE_ENV`

---

## ✅ Verification Steps

After setup, verify everything works:

1. **Check Netlify Dashboard**
   ```
   https://app.netlify.com/sites/YOUR_SITE/settings/build
   ```
   Look for your variables in Environment section

2. **Check build logs**
   ```
   Go to Deploys → Click latest deploy → Deploy log
   Should show variables being loaded
   ```

3. **Test your app**
   - Visit your deployed site
   - Check if it connects to database
   - Verify payments work
   - Check if maps load

4. **Check production**
   - API calls should work
   - Database connections should work
   - Payment processing should work

---

## 🔒 Security Reminders

- ✅ **DO:** Commit `.env.example` with placeholder values
- ✅ **DO:** Use `.gitignore` to ignore actual `.env` files
- ✅ **DO:** Rotate sensitive keys regularly
- ✅ **DO:** Use different keys for staging vs production

- ❌ **DON'T:** Commit actual `.env` files with real values
- ❌ **DON'T:** Paste keys in chat or emails
- ❌ **DON'T:** Share your Netlify auth tokens
- ❌ **DON'T:** Use the same keys across environments

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Variables not appearing in app** | Check Netlify build logs. Redeploy manually. Variables take effect on new deploy only. |
| **"Command not found: netlify"** | Install globally: `npm install -g netlify-cli` |
| **"Not authenticated"** | Run `netlify login` and select your account |
| **"Site not linked"** | Run `netlify link` in project directory |
| **Sync script fails** | Check your `.env.production.local` exists and has valid format |
| **Database connection fails** | Verify `NEON_DATABASE_URL` is correct and Neon allows Netlify IPs |
| **Firebase errors** | Make sure all `FIREBASE_*` variables are set correctly |

---

## 📚 Full Documentation

For detailed info, see: [`NETLIFY_ENVIRONMENT_SETUP.md`](./NETLIFY_ENVIRONMENT_SETUP.md)

---

## 🎯 Your Next Step

**Choose one:**
- ⚡ **Fast?** → Use UI method (5 min)
- 🔧 **Medium?** → Use Netlify CLI (10 min)  
- 🤖 **Want automation?** → Use GitHub Actions (15 min)

Then verify with the ✅ Verification Steps above.

Good luck! 🚀
