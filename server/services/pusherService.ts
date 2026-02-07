import crypto from 'crypto';

const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
const PUSHER_KEY = process.env.PUSHER_KEY;
const PUSHER_SECRET = process.env.PUSHER_SECRET;
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER || 'mt1';

if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET) {
  console.warn('⚠️ Pusher credentials not fully configured. Pusher will be disabled.');
  console.warn('  PUSHER_APP_ID:', PUSHER_APP_ID ? '✅ Set' : '❌ Missing');
  console.warn('  PUSHER_KEY:', PUSHER_KEY ? '✅ Set' : '❌ Missing');
  console.warn('  PUSHER_SECRET:', PUSHER_SECRET ? '✅ Set' : '❌ Missing');
  console.warn('  PUSHER_CLUSTER:', PUSHER_CLUSTER);
} else {
  console.log('✅ Pusher credentials configured successfully');
  console.log('  APP_ID:', PUSHER_APP_ID);
  console.log('  CLUSTER:', PUSHER_CLUSTER);
}

const buildQueryString = (obj: Record<string, string>) =>
  Object.keys(obj)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');

export async function triggerPusherEvent(
  channels: string[] | string,
  eventName: string,
  data: any,
): Promise<{ success: boolean; response?: any; error?: string }> {
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET) {
    return { success: false, error: 'Pusher not configured' };
  }

  const channelList = Array.isArray(channels) ? channels : [channels];

  const body = JSON.stringify({ name: eventName, channels: channelList, data });
  const bodyMd5 = crypto.createHash('md5').update(body).digest('hex');

  const path = `/apps/${PUSHER_APP_ID}/events`;
  const method = 'POST';

  const authTimestamp = Math.floor(Date.now() / 1000).toString();
  const authVersion = '1.0';

  const queryParams: Record<string, string> = {
    auth_key: PUSHER_KEY!,
    auth_timestamp: authTimestamp,
    auth_version: authVersion,
    body_md5: bodyMd5,
  };

  const queryString = buildQueryString(queryParams);
  const stringToSign = `${method}\n${path}\n${queryString}`;
  const authSignature = crypto
    .createHmac('sha256', PUSHER_SECRET!)
    .update(stringToSign)
    .digest('hex');

  const url = `https://api-${PUSHER_CLUSTER}.pusher.com${path}?${queryString}&auth_signature=${authSignature}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { success: false, error: `Pusher API responded with ${res.status}: ${text}` };
    }

    const json = await res.json().catch(() => ({}));
    return { success: true, response: json };
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}
