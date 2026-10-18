import { isSafeRedirectUrl } from '@/lib/validation';

/**
 * Redirect engine.
 *
 * Given a ShortUrl document and the click context, decides the final
 * destination. Evaluation order:
 *   1. A/B test variants (weighted random)
 *   2. Geo redirects (country code match)
 *   3. Device redirects (ios / android / mobile / tablet / desktop)
 *   4. Retargeting rules (device / country / browser / referrer / time)
 *   5. Base destination (+ UTM parameters when configured)
 */

function withUtm(url, doc) {
  const utm = {};
  if (doc.utmSource) utm.utm_source = doc.utmSource;
  if (doc.utmMedium) utm.utm_medium = doc.utmMedium;
  if (doc.utmCampaign) utm.utm_campaign = doc.utmCampaign;
  if (Object.keys(utm).length === 0) return url;

  try {
    const parsed = new URL(url);
    for (const [k, v] of Object.entries(utm)) {
      if (!parsed.searchParams.has(k)) parsed.searchParams.set(k, v);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function pickAbVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const usable = variants.filter((v) => v?.url && isSafeRedirectUrl(v.url));
  if (usable.length === 0) return null;

  const totalWeight = usable.reduce((sum, v) => sum + (Number(v.weight) || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const variant of usable) {
    roll -= Number(variant.weight) || 1;
    if (roll <= 0) return variant.url;
  }
  return usable[usable.length - 1].url;
}

function matchGeoRedirects(geoRedirects, countryCode) {
  if (!Array.isArray(geoRedirects) || !countryCode) return null;
  const match = geoRedirects.find(
    (r) => r?.country && r?.url && r.country.toUpperCase() === String(countryCode).toUpperCase()
  );
  return match && isSafeRedirectUrl(match.url) ? match.url : null;
}

function matchDeviceRedirects(deviceRedirects, deviceType, userAgent) {
  if (!Array.isArray(deviceRedirects) || deviceRedirects.length === 0) return null;
  const ua = (userAgent || '').toLowerCase();
  const os = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')
    ? 'ios'
    : ua.includes('android')
      ? 'android'
      : null;

  // OS-level rules (deep links to App Store / Play Store) win over generic device rules.
  const ordered = [...deviceRedirects].sort(
    (a, b) => (a?.device === 'ios' || a?.device === 'android' ? -1 : 0) -
      (b?.device === 'ios' || b?.device === 'android' ? -1 : 0)
  );
  for (const rule of ordered) {
    if (!rule?.url || !isSafeRedirectUrl(rule.url)) continue;
    const target = String(rule.device || '').toLowerCase();
    if (!target) continue;
    if (target === 'ios' || target === 'android') {
      if (os === target) return rule.url;
    } else if (target === deviceType.toLowerCase()) {
      return rule.url;
    }
  }
  return null;
}

function matchRetargetingRules(rules, ctx) {
  if (!Array.isArray(rules) || rules.length === 0) return null;
  for (const rule of rules) {
    if (!rule?.redirectUrl || !isSafeRedirectUrl(rule.redirectUrl)) continue;
    const value = String(rule.value || '').toLowerCase();
    let matches = false;
    switch (rule.condition) {
      case 'device':
        matches = ctx.deviceType.toLowerCase() === value;
        break;
      case 'country':
        matches = (ctx.country || '').toLowerCase() === value ||
          (ctx.countryCode || '').toLowerCase() === value;
        break;
      case 'browser':
        matches = (ctx.browser || '').toLowerCase().includes(value);
        break;
      case 'referrer':
        matches = (ctx.referrer || '').toLowerCase().includes(value);
        break;
      case 'time': {
        const hour = ctx.hour ?? new Date().getHours();
        const [from, to] = value.split('-').map((n) => parseInt(n, 10));
        if (Number.isFinite(from) && Number.isFinite(to)) {
          matches = from <= to ? hour >= from && hour < to : hour >= from || hour < to;
        }
        break;
      }
      default:
        break;
    }
    if (matches) return rule.redirectUrl;
  }
  return null;
}

/** Returns the resolved destination URL for this click. */
export function resolveRedirectUrl(doc, ctx) {
  // Resolve the winning destination from the targeting rules…
  let url = doc.fullUrl;
  let matchedBy = 'default';

  const ab = pickAbVariant(doc.abTesting);
  if (ab) {
    url = ab;
    matchedBy = 'ab-testing';
  } else {
    const geo = matchGeoRedirects(doc.geoRedirects, ctx.countryCode);
    if (geo) {
      url = geo;
      matchedBy = 'geo';
    } else {
      const device = matchDeviceRedirects(doc.deviceRedirects, ctx.deviceType, ctx.userAgent);
      if (device) {
        url = device;
        matchedBy = 'device';
      } else {
        const retarget = matchRetargetingRules(doc.retargetingRules, ctx);
        if (retarget) {
          url = retarget;
          matchedBy = 'retargeting';
        }
      }
    }
  }

  // …then stamp campaign tags onto whatever destination won, so UTM
  // parameters are never dropped just because a redirect rule matched.
  return { url: withUtm(url, doc), matchedBy };
}

/**
 * Link availability gates shared by the redirect API and the interstitial
 * page. Returns an error code or null when the link is usable.
 */
export function getLinkAvailabilityError(doc, { now = new Date() } = {}) {
  if (doc.expiresAt && new Date(doc.expiresAt) < now) return 'expired';
  if (doc.status && doc.status !== 'active') return 'inactive';

  if (doc.oneTimeLink && doc.usedAt) return 'one-time-used';

  const windows = doc.scheduledActiveTimes;
  if (Array.isArray(windows) && windows.length > 0) {
    const inWindow = windows.some((w) => {
      if (!w?.start || !w?.end) return false;
      const start = new Date(w.start);
      const end = new Date(w.end);
      return now >= start && now <= end;
    });
    if (!inWindow) return 'not-scheduled';
  }
  return null;
}
