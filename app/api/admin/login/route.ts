import { NextRequest, NextResponse } from 'next/server'

// Check authentication status
export async function GET(request: NextRequest) {
  try {
    const adminAuth = request.cookies.get('admin_auth')?.value
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'

    if (adminAuth && adminAuth === adminPassword) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Validate password
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'

    if (password !== adminPassword) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create response with auth cookie
    // On Netlify, always use secure=true for HTTPS
    const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true'
    
    // Use redirect response to set cookie (works better on Netlify Edge Functions)
    const redirectUrl = new URL('/admin', request.url)
    
    // Create redirect response
    const response = NextResponse.redirect(redirectUrl, {
      status: 302,
    })

    // Set cookie using cookies API - ensure it's set before redirect
    response.cookies.set('admin_auth', password, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Also set via Set-Cookie header as fallback for Netlify
    response.headers.set('Set-Cookie', `admin_auth=${password}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProduction ? '; Secure' : ''}`)

    return response
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
