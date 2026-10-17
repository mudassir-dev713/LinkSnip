import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { isValidMongoId } from '@/lib/validation';

/**
 * Resolve the caller's scope for link/QR ownership:
 * - logged in  -> { type: 'user', userId }
 * - anonymous  -> { type: 'anon', anonId } (from the httpOnly anonId cookie)
 * - neither    -> { type: null }
 */
export async function getAuthScope() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { type: 'user', userId: session.user.id, session };
  }
  const anonId = (await cookies()).get('anonId')?.value;
  if (anonId) {
    return { type: 'anon', anonId, session: null };
  }
  return { type: null, userId: null, anonId: null, session: null };
}

/** Mongo filter matching documents owned by the given scope. */
export function ownershipFilter(scope) {
  if (scope?.type === 'user') return { user: scope.userId };
  if (scope?.type === 'anon') return { anonId: scope.anonId };
  return null;
}

/** Guard for user-only endpoints. Returns the session or null. */
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

/**
 * Ensure every id in the list is a well-formed ObjectId; returns the array
 * or null when any entry is malformed (prevents casting errors / injection).
 */
export function sanitizeIdList(ids) {
  if (!Array.isArray(ids)) return null;
  if (ids.some((id) => !isValidMongoId(id))) return null;
  return ids;
}

/**
 * Safe projection for ShortUrl/QrCode documents. Strips the password hash,
 * owner ids and other fields the client should never see, and exposes
 * `hasPassword` instead.
 */
export function sanitizeUrlDoc(doc) {
  const o = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { password, anonId, user, verificationToken, __v, ...rest } = o;
  return { ...rest, hasPassword: !!password, user: undefined, anonId: undefined };
}
