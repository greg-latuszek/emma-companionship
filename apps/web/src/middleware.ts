import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  // Get the pathname of the request (e.g. /, /protected)
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/api/health',
    '/auth/signin',
    '/auth/signout',
    '/auth/error',
    '/auth/verify-request',
  ];

  // Define API routes that should be public
  const publicApiRoutes = [
    '/api/health',
    '/api/auth',
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a public route or public API route, allow access
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // If the user is not authenticated and trying to access a protected route
  if (!req.auth && !isPublicRoute) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated, allow access
  return NextResponse.next();
});

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
