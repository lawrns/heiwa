import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Temporarily use service role for testing WordPress widget
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * WordPress API Surf Camps Endpoint
 * Returns active surf camps for WordPress booking widget
 * 
 * @route GET /api/wordpress/surf-camps
 * @auth X-Heiwa-API-Key header required
 * @query location - Optional filter by location/country
 * @query level - Optional filter by skill level
 * @returns {Object} Array of active surf camps with WordPress-optimized data
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('X-Heiwa-API-Key');
    const validApiKey = process.env.WORDPRESS_API_KEY;
    
    if (!apiKey || !validApiKey || apiKey !== validApiKey) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or missing API key'
        },
        { status: 401 }
      );

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Heiwa-API-Key');

      return response;
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const locationFilter = searchParams.get('location');
    const levelFilter = searchParams.get('level');

    // Build query for active surf camps
    let query = supabase
      .from('surf_camps')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        max_participants,
        price,
        level,
        includes,
        images,
        created_at,
        is_active
      `)
      .order('start_date', { ascending: true });

    // Apply filters if provided
    if (levelFilter && ['beginner', 'intermediate', 'advanced', 'all'].includes(levelFilter)) {
      query = query.or(`level.eq.${levelFilter},level.eq.all`);
    }

    const { data: surfCamps, error } = await query;

    console.log('WordPress surf camps query result:', { surfCamps, error, count: surfCamps?.length });

    if (error) {
      console.error('Error fetching surf camps for WordPress:', error);
      const response = NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to fetch surf camps',
          debug: { error: error.message, code: error.code }
        },
        { status: 500 }
      );

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Heiwa-API-Key');

      return response;
    }

    // Transform data for WordPress widget consumption
    const wordpressCamps = surfCamps?.map(camp => ({
      id: camp.id,
      name: camp.name,
      description: camp.description,
      destination: extractDestination(camp.name, camp.description),
      dates: {
        start_date: camp.start_date,
        end_date: camp.end_date,
        formatted_dates: formatDateRange(camp.start_date, camp.end_date)
      },
      pricing: {
        base_price: parseFloat(camp.price.toString()),
        currency: 'EUR', // Default currency, could be configurable
        display_price: `€${camp.price}`
      },
      details: {
        max_participants: camp.max_participants,
        skill_level: camp.level,
        includes: camp.includes || [],
        available_spots: camp.max_participants // Will be calculated in availability endpoint
      },
      media: {
        images: camp.images || [],
        featured_image: camp.images?.[0] || null
      },
      booking_info: {
        duration_days: calculateDurationDays(camp.start_date, camp.end_date),
        booking_deadline: calculateBookingDeadline(camp.start_date)
      }
    })) || [];

    // Filter by location if specified (client-side filtering for now)
    let filteredCamps = wordpressCamps;
    if (locationFilter) {
      filteredCamps = wordpressCamps.filter(camp => 
        camp.destination.toLowerCase().includes(locationFilter.toLowerCase()) ||
        camp.name.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    const response = NextResponse.json({
      success: true,
      data: {
        surf_camps: filteredCamps,
        total_count: filteredCamps.length,
        filters_applied: {
          location: locationFilter,
          level: levelFilter
        }
      },
      meta: {
        generated_at: new Date().toISOString(),
        api_version: '1.0',
        source: 'heiwa_house_backend'
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Heiwa-API-Key');

    return response;

  } catch (error: any) {
    console.error('WordPress surf-camps endpoint error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process surf camps request'
      },
      { status: 500 }
    );

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Heiwa-API-Key');

    return response;
  }
}

/**
 * Extract destination from camp name or description
 */
function extractDestination(name: string, description: string): string {
  // Common destination keywords
  const destinations = [
    'Basque', 'Basque Country', 'Biarritz', 'Hossegor',
    'Morocco', 'Taghazout', 'Essaouira',
    'California', 'Malibu', 'Santa Barbara',
    'Portugal', 'Ericeira', 'Peniche',
    'Costa Rica', 'Nosara', 'Tamarindo'
  ];

  const text = `${name} ${description}`.toLowerCase();
  
  for (const destination of destinations) {
    if (text.includes(destination.toLowerCase())) {
      return destination;
    }
  }

  // Fallback: extract first word that might be a location
  const words = name.split(' ');
  return words.find(word => word.length > 3) || 'Surf Camp';
}

/**
 * Format date range for display
 */
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Calculate duration in days
 */
function calculateDurationDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate booking deadline (e.g., 7 days before start)
 */
function calculateBookingDeadline(startDate: string): string {
  const start = new Date(startDate);
  const deadline = new Date(start.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days before
  return deadline.toISOString();
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Heiwa-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
