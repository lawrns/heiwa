import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy to the existing WordPress API endpoint
    const apiUrl = new URL('/api/wordpress/bookings', request.url);
    
    // Forward the request to our existing endpoint with proper headers
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Heiwa-API-Key': 'heiwa_wp_test_key_2024_secure_deployment',
        'X-WP-Nonce': request.headers.get('X-WP-Nonce') || 'test_nonce_12345'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-WP-Nonce'
      }
    });

  } catch (error) {
    console.error('WordPress REST API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Proxy error', message: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-WP-Nonce',
    }
  });
}
