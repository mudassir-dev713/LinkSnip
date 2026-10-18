import NextAuth from 'next-auth';
import { authOptions } from './authOptions';
import { checkRateLimit, getClientIp, rateLimitedResponse } from '@/lib/rateLimit';

const handler = NextAuth(authOptions);

export async function GET(req, ctx) {
  return handler(req, ctx);
}

// Wrap the NextAuth handler with per-IP rate limiting so credentials
// sign-in (POST /api/auth/callback/credentials) can't be brute-forced.
export async function POST(req, ctx) {
  const rl = await checkRateLimit({
    identity: `ip:${getClientIp(req)}`,
    key: 'nextauth',
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  return handler(req, ctx);
}
