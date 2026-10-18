import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/api/analytics',
  '/api/allqrcode',
  '/my-qrcodes',
  '/dashboard/analytics',
  '/dashboard/links',
  '/dashboard/settings',
  '/api/user',
  '/api/export',
];

const publicRoutes = ['/login', '/signup', '/'];

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(process.env.NODE_ENV === 'production'
    ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' }
    : {}),
};

function withSecurityHeaders(response) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users trying to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    if (pathname.startsWith('/api/')) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }
    const loginUrl = new URL('/login', req.url);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Redirect authenticated users away from public routes
  if (publicRoutes.includes(pathname) && token) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return withSecurityHeaders(NextResponse.redirect(dashboardUrl));
  }

  // Allow all other requests
  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // Run on every route except Next.js internals and service worker assets —
  // this is what applies the security headers site-wide. Auth checks inside
  // the handler are no-ops for unmatched protected routes.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
