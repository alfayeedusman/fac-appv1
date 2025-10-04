# Facebook Messenger Integration

This project now supports Facebook Messenger Customer Chat.

## Configure

1. Get your Facebook Page ID.
2. Add the environment variable:
   - VITE_FB_MESSENGER_PAGE_ID=<YOUR_PAGE_ID>
3. Ensure your site domain is added to the Facebook Page whitelist (Page Settings → Messaging → Add your domain).

## How it works
- Component: `client/components/FacebookMessenger.tsx`
- Mounted globally in `client/main.tsx` so chat appears across the app.
- Loads the SDK once and re-parses XFBML when needed.
- Respects offline state; safe to load in SPA navigation.

## Notes
- No placeholders are used. If `VITE_FB_MESSENGER_PAGE_ID` is missing, the component logs a warning and does not initialize.
- To disable, remove `<FacebookMessenger />` in `client/main.tsx`.
