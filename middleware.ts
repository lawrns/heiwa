import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin authentication cookie
    const adminAuth = request.cookies.get('admin_auth')?.value

    // If no auth cookie, redirect to login
    if (!adminAuth || adminAuth !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      // Allow access to /admin/login
      if (request.nextUrl.pathname === '/admin/login') {
        return NextResponse.next()
      }

      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
