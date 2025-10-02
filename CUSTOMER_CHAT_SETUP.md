# Customer Chat Setup (Messenger alternative)

Facebook deprecated its Customer Chat plugin. This project includes a universal chat widget supporting:

- Crisp — preferred (fast, GDPR-friendly)
- Tawk.to — quick and free
- WhatsApp — floating button to start a chat

## Configure via environment variables
Set ONE provider (missing values will disable the widget gracefully):

- VITE_CHAT_ENABLED=true
- VITE_CHAT_PROVIDER=crisp | tawk | whatsapp

Provider-specific:
- Crisp: VITE_CRISP_WEBSITE_ID=your_crisp_id
- Tawk: VITE_TAWK_PROPERTY_ID=xxxxx VITE_TAWK_WIDGET_ID=xxxxx
- WhatsApp: VITE_WHATSAPP_NUMBER=15551234567
             VITE_WHATSAPP_MESSAGE=Hello! I need assistance.

## Files
- Component: client/components/ChatWidget.tsx
- Mounted in: client/main.tsx

## Notes
- Idempotent loader (no duplicate scripts)
- Skips initialization when offline and retries on reconnect
- No placeholders or TODOs; safe to keep enabled in all environments
