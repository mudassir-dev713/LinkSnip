/**
 * Shared input validation for API routes.
 */

export const MAX_URL_LENGTH = 2048;
export const MAX_ALIAS_LENGTH = 64;
export const MAX_TITLE_LENGTH = 100;
export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 24;

// Slugs that would shadow app pages or API routes if used as short aliases.
export const RESERVED_SLUGS = new Set([
  'api',
  'dashboard',
  'login',
  'logout',
  'signup',
  'sign-in',
  'sign-up',
  'verify',
  'history',
  'my-qrcodes',
  'qr-generator',
  'settings',
  'profile',
  'admin',
  'blog',
  'shorten',
  'reset-password',
  'update-password',
  'check-email',
  'studio',
  'linksnip',
  'static',
  'public',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'sw.js',
  'workbox-*.js',
]);

const ALIAS_RE = /^[a-zA-Z0-9_-]+$/;

/**
 * Validate + normalize a destination URL.
 * Returns { ok: true, url } or { ok: false, error }.
 *
 * Uses the URL parser (not regex) so things like `https://evil.com\@good.com`
 * or embedded credentials are caught, and blocks non-http(s) protocols
 * (`javascript:`, `data:`, `file:`...) plus localhost / private ranges.
 */
export function validateUrl(input, { allowPrivate = false } = {}) {
  if (!input || typeof input !== 'string') {
    return { ok: false, error: 'URL is required' };
  }

  let candidate = input.trim();
  if (candidate.length > MAX_URL_LENGTH) {
    return { ok: false, error: `URL must be at most ${MAX_URL_LENGTH} characters` };
  }
  if (/\s/.test(candidate)) {
    return { ok: false, error: 'URL cannot contain whitespace' };
  }
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = 'https://' + candidate;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: 'URL must start with http:// or https://' };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: 'URLs with embedded credentials are not allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || !hostname.includes('.')) {
    return { ok: false, error: 'Invalid hostname' };
  }

  if (!allowPrivate) {
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '[::1]',
      'metadata.google.internal',
    ];
    if (
      blockedHosts.includes(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^169\.254\./.test(hostname)
    ) {
      return { ok: false, error: 'Links to private or local addresses are not allowed' };
    }
  }

  return { ok: true, url: parsed.toString() };
}

/** Validate a custom alias; returns an error string or null. */
export function validateAlias(alias) {
  if (!alias || typeof alias !== 'string') return 'Custom alias is required';
  if (alias.length > MAX_ALIAS_LENGTH) {
    return `Alias must be at most ${MAX_ALIAS_LENGTH} characters`;
  }
  if (!ALIAS_RE.test(alias)) {
    return 'Alias can only contain letters, numbers, - and _';
  }
  if (RESERVED_SLUGS.has(alias.toLowerCase())) {
    return 'That alias is reserved. Please choose another one.';
  }
  return null;
}

export function validateTitle(title) {
  if (typeof title !== 'string' || title.length > MAX_TITLE_LENGTH) {
    return `Title must be a string of at most ${MAX_TITLE_LENGTH} characters`;
  }
  return null;
}

export function validateTags(tags) {
  if (tags === undefined || tags === null) return { ok: true, tags: [] };
  if (!Array.isArray(tags)) return { ok: false, error: 'Tags must be an array' };
  if (tags.length > MAX_TAGS) return { ok: false, error: `At most ${MAX_TAGS} tags allowed` };
  const clean = [];
  for (const tag of tags) {
    if (typeof tag !== 'string') return { ok: false, error: 'Tags must be strings' };
    const t = tag.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (t && !clean.includes(t)) clean.push(t);
  }
  return { ok: true, tags: clean };
}

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Clamp + validate QR generator inputs. */
export function validateQrInput({ size, margin, color, bgColor, errorCorrection }) {
  const errors = {};
  const s = Number(size);
  if (!Number.isFinite(s) || s < 64 || s > 1024) errors.size = 'Size must be between 64 and 1024';
  const m = Number(margin);
  if (!Number.isFinite(m) || m < 0 || m > 10) errors.margin = 'Margin must be between 0 and 10';
  if (color !== undefined && !HEX_COLOR_RE.test(color)) errors.color = 'Color must be a hex value';
  if (bgColor !== undefined && !HEX_COLOR_RE.test(bgColor)) errors.bgColor = 'Background color must be a hex value';
  if (errorCorrection !== undefined && !['L', 'M', 'Q', 'H'].includes(errorCorrection)) {
    errors.errorCorrection = 'Error correction must be L, M, Q or H';
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

const MONGO_ID_RE = /^[0-9a-fA-F]{24}$/;
export function isValidMongoId(id) {
  return typeof id === 'string' && MONGO_ID_RE.test(id);
}

/** Only allow https/http redirect targets stored by link owners. */
export function isSafeRedirectUrl(url) {
  if (typeof url !== 'string' || url.length > MAX_URL_LENGTH) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
