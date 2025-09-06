import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication token in cookies
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
  const isAuthenticated = !!tokenMatch;

  // Handle login route
  if (pathname === '/login') {
    if (isAuthenticated) {
      // Authenticated user trying to access login, redirect to admin
      console.log('Authenticated user accessing login, redirecting to admin');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Unauthenticated user accessing login, allow
    return NextResponse.next();
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      // No auth token found, redirect to login
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Token exists, allow access
    // Note: Token validation is handled by individual API endpoints
    return NextResponse.next();
  }

  // All other routes
  return NextResponse.next();

  /* ORIGINAL AUTH CODE - COMMENTED OUT FOR TESTING
  try {
    // Get token from cookies (set by client after login)
    const token = request.cookies.get('firebase-token')?.value;

    if (!token) {
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(token);

    // Check if user has admin claim
    const isAdmin = await checkAdminClaim(decodedToken.uid);

    if (!isAdmin) {
      console.log('User is not admin, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // User is authenticated and has admin privileges
    return NextResponse.next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('firebase-token');
    return response;
  }
  */
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};