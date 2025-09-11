import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * WordPress API Test Endpoint
 * Tests connectivity between WordPress plugin and Heiwa backend
 * 
 * @route GET /api/wordpress/test
 * @auth X-Heiwa-API-Key header required
 * @returns {Object} Connection status and backend info
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key from WordPress plugin
    const apiKey = request.headers.get('X-Heiwa-API-Key');
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key required',
          message: 'Please provide X-Heiwa-API-Key header'
        }, 
        { status: 401 }
      );
    }

    // Check against environment variable (with safe default for testing)
    const validApiKey = process.env.WORDPRESS_API_KEY || 'heiwa_wp_test_key_2024_secure_deployment';

    if (apiKey !== validApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key',
          message: 'The provided API key is not valid'
        }, 
        { status: 401 }
      );
    }

    // Return success response with backend info
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Heiwa House backend',
      backend_info: {
        name: 'Heiwa House Booking System',
        version: '2.0',
        endpoints_available: [
          '/api/wordpress/surf-camps',
          '/api/wordpress/rooms/availability',
          '/api/wordpress/bookings',
          '/api/wordpress/room-bookings'
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('WordPress test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to process test request'
      }, 
      { status: 500 }
    );
  }
}

// Handle CORS preflight for WordPress domains
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Will be restricted in production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Heiwa-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
