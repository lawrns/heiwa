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
    
    // Set cookie using NextResponse with headers
    const response = NextResponse.json(
      { message: 'Authenticated' },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `admin_auth=${password}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProduction ? '; Secure' : ''}`
        }
      }
    )

    // Also set via cookies API as fallback
    response.cookies.set('admin_auth', password, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
