import crypto from 'crypto';
import geoip from 'geoip-lite';

/**
 * IP utilities: country lookup (offline, via geoip-lite — no per-click
 * external API call) and privacy-preserving IP storage.
 */

const SALT =
  process.env.IP_HASH_SALT ||
  process.env.NEXTAUTH_SECRET ||
  'linksnip-dev-salt';

/** Hash an IP so unique-visitor counts work without storing raw IPs (GDPR). */
export function hashIp(ip) {
  if (!ip || ip === 'unknown') return 'unknown';
  return crypto.createHmac('sha256', SALT).update(ip).digest('hex');
}

export function extractIp(req) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/** Resolve country name + ISO code offline. */
export function lookupCountry(ip) {
  if (!ip || ip === 'unknown' || !/^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-fA-F:]+$/.test(ip)) {
    return { country: 'Unknown', countryCode: undefined };
  }
  try {
    const geo = geoip.lookup(ip);
    if (!geo?.country) return { country: 'Unknown', countryCode: undefined };
    return { country: geo.country, countryCode: geo.country };
  } catch {
    return { country: 'Unknown', countryCode: undefined };
  }
}
