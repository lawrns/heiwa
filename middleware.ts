import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin authentication cookie
    const adminAuth = request.cookies.get('admin_auth')?.value

    // If no auth cookie, redirect to login
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'
    if (!adminAuth || adminAuth !== adminPassword) {
      // Allow access to /admin/login
      if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/(auth)/login') {
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
