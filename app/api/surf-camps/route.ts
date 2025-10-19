import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API endpoint for getting all surf camps
export async function GET() {
  try {
    // Get all active surf camps
    const { data: surfCamps, error: surfCampsError } = await supabase
      .from('surf_camps')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch surf camps'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        surf_camps: surfCamps || []
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
