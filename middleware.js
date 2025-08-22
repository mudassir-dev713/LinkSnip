import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard/',
  '/dashboard',
  '/profile',
  '/settings',
  '/api/analytics',
  '/api/allqrcode',
  '/my-qrcodes',
];

const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users trying to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public routes
  if (publicRoutes.includes(pathname) && token) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/api/protected/:path*',
    '/login',
    '/signup',
    '/api/analytics',
    '/api/allqrcode',
    '/my-qrcodes',
    '/', // homepage
  ],
};
