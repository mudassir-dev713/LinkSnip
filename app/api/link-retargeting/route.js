import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ShortUrl from '@/models/ShortUrl';
import { checkRateLimit, getRateLimitIdentity, rateLimitedResponse } from '@/lib/rateLimit';
import { isSafeRedirectUrl } from '@/lib/validation';

const VALID_CONDITIONS = ['device', 'country', 'browser', 'time', 'referrer'];
const MAX_RULES = 20;

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'link-retargeting',
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  await dbConnect();

  try {
    const body = await request.json().catch(() => null);
    const { linkId, rules } = body || {};

    if (!Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json({ error: 'Invalid rules format' }, { status: 400 });
    }
    if (rules.length > MAX_RULES) {
      return NextResponse.json({ error: `At most ${MAX_RULES} rules allowed` }, { status: 400 });
    }

    // Validate every rule's shape before persisting.
    for (const rule of rules) {
      if (!rule || !VALID_CONDITIONS.includes(rule.condition)) {
        return NextResponse.json({ error: 'Invalid rule condition' }, { status: 400 });
      }
      if (typeof rule.value !== 'string' || rule.value.length > 200) {
        return NextResponse.json({ error: 'Invalid rule value' }, { status: 400 });
      }
      if (!isSafeRedirectUrl(rule.redirectUrl)) {
        return NextResponse.json(
          { error: 'Rule redirect URLs must be valid http(s) URLs' },
          { status: 400 }
        );
      }
    }

    const cleanRules = rules.map((rule) => ({
      condition: rule.condition,
      value: rule.value,
      redirectUrl: rule.redirectUrl,
    }));

    // Find the link and ensure it belongs to the user
    const link = await ShortUrl.findOne({
      _id: linkId,
      user: session.user.id,
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    link.retargetingRules = cleanRules;
    await link.save();

    return NextResponse.json({
      success: true,
      message: 'Retargeting rules saved successfully',
    });
  } catch (error) {
    console.error('Error saving retargeting rules:', error);
    return NextResponse.json({ error: 'Failed to save retargeting rules' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rl = await checkRateLimit({
    identity: getRateLimitIdentity(request, session.user.id),
    key: 'link-retargeting-delete',
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  await dbConnect();

  try {
    const body = await request.json().catch(() => null);
    const { linkId } = body || {};
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    // Only the owner's link can have its rules cleared.
    const result = await ShortUrl.updateOne(
      { _id: linkId, user: session.user.id },
      { $set: { retargetingRules: [] } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting retargeting rules:', error);
    return NextResponse.json({ error: 'Failed to delete retargeting rules' }, { status: 500 });
  }
}
