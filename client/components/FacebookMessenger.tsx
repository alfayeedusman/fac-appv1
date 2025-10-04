import { useEffect } from "react";

interface FacebookMessengerProps {
  pageId?: string;
  language?: string; // e.g., 'en_US'
  minimized?: boolean;
}

// Facebook Messenger Customer Chat integration
export default function FacebookMessenger({
  pageId,
  language = "en_US",
  minimized = false,
}: FacebookMessengerProps) {
  useEffect(() => {
    const envPageId = (import.meta as any).env?.VITE_FB_MESSENGER_PAGE_ID as string | undefined;
    const resolvedPageId = pageId || envPageId || (window as any).__FB_MESSENGER_PAGE_ID;

    // Require a page ID; if missing, skip mounting to avoid placeholders
    if (!resolvedPageId) {
      console.warn("[Messenger] VITE_FB_MESSENGER_PAGE_ID is not set. Skipping Messenger initialization.");
      return;
    }

    // Avoid running when offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.info("[Messenger] Offline - delaying Messenger initialization");
    }

    // Ensure fb-root exists
    let fbRoot = document.getElementById("fb-root");
    if (!fbRoot) {
      fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    // Ensure customer chat container exists and has correct attributes
    let chat = document.getElementById("fb-customer-chat");
    if (!chat) {
      chat = document.createElement("div");
      chat.id = "fb-customer-chat";
      chat.className = "fb-customerchat";
      document.body.appendChild(chat);
    }

    chat.setAttribute("page_id", resolvedPageId);
    chat.setAttribute("attribution", "biz_inbox");
    if (minimized) chat.setAttribute("minimized", "true");

    // Load SDK once
    const sdkId = "facebook-jssdk";
    if (!document.getElementById(sdkId)) {
      (window as any).fbAsyncInit = function () {
        try {
          (window as any).FB?.init({
            xfbml: true,
            version: "v19.0",
          });
        } catch (e) {
          console.warn("[Messenger] FB.init error:", e);
        }
      };

      const js = document.createElement("script");
      js.id = sdkId;
      js.src = `https://connect.facebook.net/${language}/sdk/xfbml.customerchat.js`;
      js.async = true;
      js.crossOrigin = "anonymous";
      const fjs = document.getElementsByTagName("script")[0];
      fjs.parentNode?.insertBefore(js, fjs);
    } else {
      // If SDK already present, just re-parse XFBML
      try {
        (window as any).FB?.XFBML?.parse?.();
      } catch (e) {
        // no-op
      }
    }

    return () => {
      // Do not remove SDK to avoid flicker across route changes
      // Keep chat container in DOM; Messenger manages its own lifecycle
    };
  }, [pageId, language, minimized]);

  return null;
}
