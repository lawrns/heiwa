import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null as any;
  return createClient(url, key);
}

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
    const validApiKey = process.env.WORDPRESS_API_KEY || 'heiwa_wp_test_key_2024_secure_deployment';

    if (!apiKey || apiKey !== validApiKey) {
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

    // Build query for active surf camps (or fallback when Supabase not configured)
    const origin = new URL(request.url).origin;
    const client = createSupabase();
    if (!client) {
      const fallbackCamps = getFallbackCamps(origin);
      const response = NextResponse.json({
        success: true,
        data: {
          surf_camps: fallbackCamps,
          total_count: fallbackCamps.length,
          filters_applied: { location: locationFilter, level: levelFilter }
        },
        meta: {
          generated_at: new Date().toISOString(),
          api_version: '1.0',
          source: 'heiwa_house_backend',
          fallback: true
        }
      });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Heiwa-API-Key');
      return response;
    }

    let query = client
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
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    // Apply filters if provided
    if (levelFilter && ['beginner', 'intermediate', 'advanced', 'all'].includes(levelFilter)) {
      query = query.or(`level.eq.${levelFilter},level.eq.all`);
    }

    const { data: surfCamps, error } = await query;

    console.log('WordPress surf camps query result:', { surfCamps, error, count: surfCamps?.length });

    if (error) {
      console.error('Error fetching surf camps for WordPress:', error);
      const fallbackCamps = getFallbackCamps(origin);
      const response = NextResponse.json({
        success: true,
        data: {
          surf_camps: fallbackCamps,
          total_count: fallbackCamps.length,
          filters_applied: { location: locationFilter, level: levelFilter }
        },
        meta: {
          generated_at: new Date().toISOString(),
          api_version: '1.0',
          source: 'heiwa_house_backend',
          fallback: true,
          error: { message: (error as any)?.message, code: (error as any)?.code }
        }
      });

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Heiwa-API-Key');

      return response;
    }

    // Transform data for WordPress widget consumption
    const wordpressCamps = surfCamps?.map((camp: any) => ({
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
      filteredCamps = wordpressCamps.filter((camp: any) =>
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
 * Fallback surf camps when Supabase/env not available
 */
function getFallbackCamps(origin: string) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const makeCamp = (
    id: string,
    name: string,
    startOffsetDays: number,
    durationDays: number,
    price: number,
    level: 'beginner' | 'intermediate' | 'advanced' | 'all',
    images?: string[]
  ) => {
    const start = new Date(today);
    start.setDate(start.getDate() + startOffsetDays);
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    const startISO = iso(start);
    const endISO = iso(end);

    const imgs = images && images.length > 0 ? images : [`${origin}/room1.jpg`];

    return {
      id,
      name,
      description: `${name} — all-inclusive surf coaching, yoga, and community dinners.`,
      destination: extractDestination(name, ''),
      dates: {
        start_date: startISO,
        end_date: endISO,
        formatted_dates: formatDateRange(startISO, endISO)
      },
      pricing: {
        base_price: price,
        currency: 'EUR',
        display_price: `€${price}`
      },
      details: {
        max_participants: 12,
        skill_level: level,
        includes: ['coaching', 'equipment', 'breakfast'],
        available_spots: 12
      },
      media: {
        images: imgs,
        featured_image: imgs[0]
      },
      booking_info: {
        duration_days: calculateDurationDays(startISO, endISO),
        booking_deadline: calculateBookingDeadline(startISO)
      }
    };
  };

  return [
    makeCamp('camp-001', 'Basque Country Surf Week', 14, 7, 799, 'all', [`${origin}/room1.jpg`]),
    makeCamp('camp-002', 'Morocco Surf Retreat', 30, 7, 699, 'beginner', [`${origin}/room3.webp`]),
    makeCamp('camp-003', 'Portugal Intermediate Week', 45, 7, 749, 'intermediate', [`${origin}/dorm.webp`])
  ];
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
