import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const participants = searchParams.get('participants');

    // Proxy to the existing WordPress API endpoint
    const apiUrl = new URL('/api/wordpress/rooms/availability', request.url);
    apiUrl.searchParams.set('start_date', start_date || '');
    apiUrl.searchParams.set('end_date', end_date || '');
    apiUrl.searchParams.set('participants', participants || '1');
    
    // Forward the request to our existing endpoint with proper headers
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'X-Heiwa-API-Key': 'heiwa_wp_test_key_2024_secure_deployment',
        'X-WP-Nonce': request.headers.get('X-WP-Nonce') || 'test_nonce_12345'
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': 'https://heiwahouse.com',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-WP-Nonce',
        'Access-Control-Allow-Credentials': 'true'
      }
    });

  } catch (error) {
    console.error('WordPress REST API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Proxy error', message: 'Failed to fetch room availability' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://heiwahouse.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-WP-Nonce',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}
