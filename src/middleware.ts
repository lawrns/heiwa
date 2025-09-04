import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Force dynamic rendering for admin routes to prevent Firebase SSR issues
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};