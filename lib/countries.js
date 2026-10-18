/**
 * Presentation helpers for analytics geo/traffic data.
 *
 * Clicks store the ISO 3166-1 alpha-2 country code (from geoip-lite) and the
 * raw `referer` header. These turn both into readable labels without pulling
 * in a data dependency: region names come from the built-in Intl API and the
 * flag is derived from the two letters.
 */

let regionNames;

/** ISO code ("US") → full region name ("United States"). */
export function countryName(code) {
  if (!code || code === 'Unknown') return 'Unknown';
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return code;
  try {
    if (!regionNames) {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    }
    return regionNames.of(cc) || cc;
  } catch {
    return cc;
  }
}

/** ISO code ("US") → flag emoji ("🇺🇸"). */
export function countryFlag(code) {
  if (!code || code === 'Unknown') return '🌐';
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '🌐';
  return cc.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const SOURCE_NAMES = [
  ['google.', 'Google'],
  ['bing.', 'Bing'],
  ['duckduckgo', 'DuckDuckGo'],
  ['yahoo.', 'Yahoo'],
  ['mail.google', 'Gmail'],
  ['outlook.', 'Outlook'],
  ['facebook.', 'Facebook'],
  ['instagram.', 'Instagram'],
  ['linkedin.', 'LinkedIn'],
  ['twitter.', 'X (Twitter)'],
  ['x.com', 'X (Twitter)'],
  ['t.co', 'X (Twitter)'],
  ['reddit.', 'Reddit'],
  ['youtube.', 'YouTube'],
  ['pinterest.', 'Pinterest'],
  ['whatsapp', 'WhatsApp'],
  ['telegram', 'Telegram'],
  ['tiktok.', 'TikTok'],
  ['snapchat.', 'Snapchat'],
  ['producthunt.', 'Product Hunt'],
  ['news.ycombinator', 'Hacker News'],
];

/**
 * Raw referrer → { label, host }. Search/social domains collapse to a friendly
 * name; everything else shows its hostname; Direct stays Direct.
 */
export function referrerInfo(raw) {
  if (!raw || raw === 'Direct') return { label: 'Direct', host: null };
  let host = null;
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    host = u.hostname.replace(/^www\./, '');
  } catch {
    return { label: raw, host: null };
  }
  const match = SOURCE_NAMES.find(([key]) => host.includes(key));
  return { label: match ? match[1] : host, host };
}
