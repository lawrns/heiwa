import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out' },
    { status: 200 }
  )

  // Clear both auth cookies
  // Server-side auth cookie
  response.cookies.set('admin_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  
  // Client-side admin indicator cookie
  response.cookies.set('admin_logged_in', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}
