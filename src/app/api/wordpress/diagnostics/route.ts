import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const info = {
      runtime: 'nodejs',
      node_version: process.versions?.node || 'unknown',
      env: {
        WORDPRESS_API_KEY_present: !!process.env.WORDPRESS_API_KEY,
        NEXT_PUBLIC_SUPABASE_URL_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      platform: {
        netlify: !!process.env.NETLIFY,
        region: process.env.AWS_LAMBDA_FUNCTION_REGION || null,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, diagnostics: info })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'error' }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Heiwa-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  })
}

