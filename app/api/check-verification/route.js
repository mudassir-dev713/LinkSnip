// /app/api/check-verification/route.js
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { dbConnect } from '@/lib/dbConnect';
import { checkRateLimit, getClientIp, rateLimitedResponse } from '@/lib/rateLimit';

export async function GET(req) {
  const rl = await checkRateLimit({ identity: `ip:${getClientIp(req)}`, key: 'check-verification', limit: 30, windowMs: 60 * 1000 });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!email || email.length > 254) {
    return NextResponse.json({ verified: false });
  }

  await dbConnect();

  const user = await User.findOne({ email });

  return NextResponse.json({ verified: user?.isVerified || false });
}
