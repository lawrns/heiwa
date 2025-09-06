import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow access to login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // TEMPORARY: Bypass authentication for testing
  // TODO: Re-enable Supabase authentication for production
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
  matcher: '/admin/:path*',
};