import { useEffect } from "react";

type Provider = "crisp" | "tawk" | "whatsapp";

interface ChatWidgetProps {
  provider?: Provider;
  crispWebsiteId?: string;
  tawkPropertyId?: string;
  tawkWidgetId?: string;
  whatsappNumber?: string; // e.g. 15551234567
  whatsappMessage?: string;
  enabled?: boolean;
}

function loadScriptOnce(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  s.crossOrigin = "anonymous";
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(s, first);
}

export default function ChatWidget(props: ChatWidgetProps) {
  const env = (import.meta as any).env || {};
  const enabled = props.enabled ?? (env.VITE_CHAT_ENABLED !== "false");
  const provider: Provider | undefined = props.provider || (env.VITE_CHAT_PROVIDER as Provider | undefined);

  const crispWebsiteId = props.crispWebsiteId || env.VITE_CRISP_WEBSITE_ID;
  const tawkPropertyId = props.tawkPropertyId || env.VITE_TAWK_PROPERTY_ID;
  const tawkWidgetId = props.tawkWidgetId || env.VITE_TAWK_WIDGET_ID;
  const whatsappNumber = props.whatsappNumber || env.VITE_WHATSAPP_NUMBER;
  const whatsappMessage = props.whatsappMessage || env.VITE_WHATSAPP_MESSAGE || "Hello! I need assistance.";

  useEffect(() => {
    if (!enabled) return;

    const init = () => {
      if (!provider) {
        console.warn("[ChatWidget] No provider configured. Set VITE_CHAT_PROVIDER to 'crisp' | 'tawk' | 'whatsapp'.");
        return;
      }

      if (provider === "crisp") {
        if (!crispWebsiteId) {
          console.warn("[ChatWidget] Missing VITE_CRISP_WEBSITE_ID");
          return;
        }
        if ((window as any).__CHAT_WIDGET_LOADED__ === "crisp") return;
        (window as any).$crisp = (window as any).$crisp || [];
        (window as any).CRISP_WEBSITE_ID = crispWebsiteId;
        loadScriptOnce("crisp-chat-sdk", "https://client.crisp.chat/l.js");
        (window as any).__CHAT_WIDGET_LOADED__ = "crisp";
      }

      if (provider === "tawk") {
        if (!tawkPropertyId || !tawkWidgetId) {
          console.warn("[ChatWidget] Missing VITE_TAWK_PROPERTY_ID or VITE_TAWK_WIDGET_ID");
          return;
        }
        if ((window as any).__CHAT_WIDGET_LOADED__ === "tawk") return;
        loadScriptOnce(
          "tawk-chat-sdk",
          `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`
        );
        (window as any).__CHAT_WIDGET_LOADED__ = "tawk";
      }

      // WhatsApp handled via rendered button; no script required
      if (provider === "whatsapp") {
        (window as any).__CHAT_WIDGET_LOADED__ = "whatsapp";
      }
    };

    // Initialize immediately if online; otherwise wait for 'online'
    if (typeof navigator === "undefined" || navigator.onLine) {
      init();
    } else {
      const onOnline = () => {
        init();
        window.removeEventListener("online", onOnline);
      };
      window.addEventListener("online", onOnline);
      return () => window.removeEventListener("online", onOnline);
    }
  }, [enabled, provider, crispWebsiteId, tawkPropertyId, tawkWidgetId]);

  if (!enabled) return null;

  if (provider === "whatsapp" && whatsappNumber) {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg w-14 h-14 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M20.52 3.48A11.9 11.9 0 0012.06 0C5.46 0 .1 5.36.1 11.96c0 2.1.55 4.16 1.6 5.98L0 24l6.22-1.63a11.9 11.9 0 005.83 1.53h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.25-6.2-3.5-8.46zm-8.46 18.4a9.9 9.9 0 01-5.05-1.38l-.36-.21-3.7.97.99-3.6-.23-.37a9.93 9.93 0 01-1.52-5.25c0-5.49 4.47-9.96 9.96-9.96 2.66 0 5.16 1.04 7.04 2.93a9.9 9.9 0 012.92 7.03c0 5.49-4.47 9.96-9.96 9.96zm5.73-7.48c-.31-.16-1.83-.9-2.11-1.01-.28-.1-.48-.16-.68.16-.2.31-.78 1.01-.96 1.21-.18.2-.35.23-.66.08-.31-.16-1.29-.48-2.46-1.52-.91-.81-1.52-1.81-1.7-2.12-.18-.31-.02-.48.14-.64.14-.14.31-.36.46-.54.15-.18.2-.31.31-.52.1-.2.05-.39-.02-.54-.08-.16-.68-1.62-.93-2.22-.25-.6-.5-.52-.68-.52h-.58c-.2 0-.52.07-.79.39-.27.31-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.16.2 2.08 3.17 5.04 4.45.7.3 1.24.48 1.66.62.7.22 1.33.19 1.83.11.56-.08 1.83-.75 2.09-1.48.26-.73.26-1.35.18-1.48-.07-.13-.26-.2-.57-.36z"/>
        </svg>
      </a>
    );
  }

  return null;
}
