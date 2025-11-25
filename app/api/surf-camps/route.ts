import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { executeWithTimeout } from '@/lib/supabase-timeout'

// TypeScript interface for surf camp data
interface SurfCamp {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  max_participants: number
  price: number
  level: string
  category: string
  images: string[]
  includes: string[]
  is_active: boolean
}

// API endpoint for getting all surf camps
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const showAll = searchParams.get('admin') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    // Build query with timeout protection
    let query = supabase
      .from('surf_camps')
      .select('*')
      .order('start_date', { ascending: true })

    // Only filter active camps for non-admin requests
    if (!showAll) {
      query = query.eq('is_active', true)
      
      // Filter out past surf weeks - only show future ones
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query = query.gte('end_date', today.toISOString().split('T')[0])
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit)
    }
    
    // Execute with timeout to prevent long waits
    const { data: surfCamps, error: surfCampsError } = await executeWithTimeout(
      query,
      1000 // 1 second timeout for fast failure
    )

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      
      // Check if it's a timeout/network error - return empty array gracefully
      const errorMessage = surfCampsError?.message || String(surfCampsError)
      const isNetworkError = errorMessage.includes('timeout') ||
                            errorMessage.includes('NETWORK_ERROR') ||
                            errorMessage.includes('TIMEOUT') ||
                            errorMessage.includes('Supabase may be unreachable')
      
      // Return empty array instead of error to prevent site breakage
      if (isNetworkError) {
        console.warn('⚠️ Supabase unreachable - returning empty surf camps list')
        return NextResponse.json({
          success: true,
          data: {
            surf_camps: []
          }
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch surf camps'
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    // Handle null data (connection failure)
    if (!surfCamps) {
      console.warn('⚠️ No surf camps data returned - returning empty array')
      return NextResponse.json({
        success: true,
        data: {
          surf_camps: []
        }
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    // Get enrollment counts for each surf camp (with timeout protection)
    const surfCampsWithAvailability = await Promise.all(
      (surfCamps || []).map(async (camp: SurfCamp) => {
        const enrollmentQuery = supabase
          .from('surf_camp_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('surf_camp_id', camp.id)
          .eq('status', 'confirmed')
        
        const { count: enrolledCount } = await executeWithTimeout(
          enrollmentQuery,
          500 // 500ms timeout for enrollment count
        )
        
        // Handle both old schema (max_participants) and new schema (total_spots)
        const totalSpots = (camp as any).total_spots || camp.max_participants || 18
        const dbAvailableSpots = (camp as any).available_spots
        const calculatedAvailableSpots = totalSpots - (enrolledCount || 0)
        const availableSpots = dbAvailableSpots !== undefined ? dbAvailableSpots : calculatedAvailableSpots
        
        return {
          id: camp.id,
          name: camp.name,
          description: camp.description,
          start_date: camp.start_date,
          end_date: camp.end_date,
          price: camp.price,
          max_participants: totalSpots,
          total_spots: totalSpots,
          available_spots: Math.max(0, availableSpots),
          enrolled_count: enrolledCount || 0,
          is_full: availableSpots <= 0,
          level: camp.level || 'all',
          images: camp.images || [],
          includes: camp.includes || []
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        surf_camps: surfCampsWithAvailability
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching surf camps:', error)
    
    // Check if it's a network/DNS error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const isNetworkError = errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
                          errorMessage.includes('getaddrinfo') ||
                          errorMessage.includes('ENOTFOUND') ||
                          errorMessage.includes('fetch failed')
    
    return NextResponse.json({
      success: false,
      error: isNetworkError 
        ? 'Unable to connect to database. Please check your Supabase configuration.'
        : errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          message: errorMessage,
          type: isNetworkError ? 'network_error' : 'unknown_error'
        }
      })
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
