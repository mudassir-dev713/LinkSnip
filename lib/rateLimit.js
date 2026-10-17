import { NextResponse } from 'next/server';

/**
 * Fixed-window rate limiter.
 *
 * - Single-instance / dev: in-memory Map (zero dependency).
 * - Multi-instance / serverless: set UPSTASH_REDIS_REST_URL and
 *   UPSTASH_REDIS_REST_TOKEN and the counters move to Redis so every
 *   instance shares the same limits. If Redis errors, we fail OPEN
 *   (availability beats an extra request) and log the failure.
 */

const buckets = new Map(); // `${identity}:${key}` -> { count, resetAt }

const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisEnabled = Boolean(REDIS_URL && REDIS_TOKEN);

/** Best-effort client IP from request headers (handles common proxies). */
export function getClientIp(req) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Bucket identity. Prefer the authenticated user id (limits follow the
 * account, not the IP) and fall back to IP for anonymous traffic.
 * `req` is only needed to read the forwarded IP headers.
 */
export function getRateLimitIdentity(req, sessionUserId) {
  if (sessionUserId) return `u:${sessionUserId}`;
  return `ip:${getClientIp(req)}`;
}

function memoryCheck(bucketKey, limit, windowMs) {
  const now = Date.now();
  let bucket = buckets.get(bucketKey);

  // New bucket or expired window -> start fresh
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(bucketKey, bucket);
    return { allowed: true, remaining: limit - 1, resetAt: bucket.resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/**
 * Redis fixed window: INCR the counter for the current window, PEXPIRE NX so
 * the key only gets a TTL once (when created).
 */
async function redisCheck(bucketKey, limit, windowMs) {
  const now = Date.now();
  const windowId = Math.floor(now / windowMs);
  const redisKey = `rl:${bucketKey}:${windowId}`;
  const resetAt = (windowId + 1) * windowMs;

  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', redisKey],
      ['PEXPIRE', redisKey, String(windowMs), 'NX'],
    ]),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
  const results = await res.json();
  const count = Number(results?.[0]?.result);
  if (!Number.isFinite(count)) throw new Error('Upstash returned an unexpected payload');

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

/**
 * Increment the counter for `identity:key`. Returns whether the request is
 * allowed and how many requests remain in the current window.
 */
export async function checkRateLimit({
  identity,
  key,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
}) {
  const bucketKey = `${identity}:${key}`;

  if (redisEnabled) {
    try {
      return await redisCheck(bucketKey, limit, windowMs);
    } catch (err) {
      console.error('Rate limiter: Redis unavailable, using in-memory fallback:', err.message);
      // fall through to memory
    }
  }
  return memoryCheck(bucketKey, limit, windowMs);
}

/** 429 response with Retry-After + standard rate-limit headers. */
export function rateLimitedResponse(resetAt, limit = DEFAULT_LIMIT) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  );
}

/** Success headers callers can attach to expose the limit state. */
export function rateLimitHeaders(result, limit) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}

// Periodic cleanup so the in-memory Map doesn't grow unbounded.
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt < now) buckets.delete(key);
      }
    },
    DEFAULT_WINDOW_MS
  ).unref?.();
}
