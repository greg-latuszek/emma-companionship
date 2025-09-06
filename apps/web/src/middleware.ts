import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rate-limiter';

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

  // Check if this is an API route for rate limiting
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthEndpoint = pathname.startsWith('/api/auth/');
  const isAuthenticated = !!req.auth;

  // Apply rate limiting to all API routes
  if (isApiRoute) {
    const { headers, rateLimitExceeded } = applyRateLimit(req, isAuthenticated, isAuthEndpoint);
    
    if (rateLimitExceeded) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Continue with authentication checks for protected API routes
    const isPublicApiRoute = publicApiRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    if (!isPublicApiRoute && !isAuthenticated) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          message: 'Please authenticate to access this resource',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }
      );
    }
    
    return response;
  }

  // Check if the route is public (non-API routes)
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
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
