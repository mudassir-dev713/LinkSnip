import { withAuth } from 'next-auth/middleware';

export default withAuth({
  // Middleware will protect these routes:
  // This applies to both pages and API routes
  callbacks: {
    authorized: ({ token }) => !!token, // Only allow if user is logged in
  },
  pages: {
    signIn: '/login', // custom login route
  },
});

export const config = {
  matcher: [
    // Protect all routes under /dashboard, /profile, /settings, etc.
    // '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',

    // Protect specific API routes
    '/api/protected/:path*',
  ],
};
