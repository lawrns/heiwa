import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const category = searchParams.get('category') || 'surf-week'
    
    // Get all active surf camps for specific category
    const { data: surfCamps, error: surfCampsError } = await supabase
      .from('surf_camps')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('start_date', { ascending: true })

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch surf camps'
      }, { status: 500 })
    }

    // Get enrollment counts for each surf camp
    const surfCampsWithAvailability = await Promise.all(
      (surfCamps || []).map(async (camp: SurfCamp) => {
        const { count: enrolledCount } = await supabase
          .from('surf_camp_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('surf_camp_id', camp.id)
          .eq('status', 'confirmed')
        
        const availableSpots = camp.max_participants - (enrolledCount || 0)
        
        return {
          id: camp.id,
          name: camp.name,
          description: camp.description,
          start_date: camp.start_date,
          end_date: camp.end_date,
          price: camp.price,
          max_participants: camp.max_participants,
          enrolled_count: enrolledCount || 0,
          available_spots: Math.max(0, availableSpots),
          is_full: availableSpots <= 0,
          level: camp.level,
          images: camp.images,
          includes: camp.includes
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        surf_camps: surfCampsWithAvailability
      }
    })

  } catch (error) {
    console.error('Error fetching surf camps:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
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
