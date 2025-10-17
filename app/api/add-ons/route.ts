import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API endpoint for getting all add-ons
export async function GET() {
  try {
    console.log('🛍️ Fetching all add-ons')

    // Get all active add-ons
    const { data: addOns, error: addOnsError } = await supabase
      .from('add_ons')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (addOnsError) {
      console.error('Error fetching add-ons:', addOnsError)
      // Return empty array if table doesn't exist yet
      return NextResponse.json({
        success: true,
        addOns: []
      })
    }

    console.log('✅ Add-ons fetched successfully:', addOns?.length || 0)

    return NextResponse.json({
      success: true,
      addOns: addOns || []
    })

  } catch (error) {
    console.error('Error fetching add-ons:', error)
    return NextResponse.json({
      success: true,
      addOns: [] // Return empty array for graceful degradation
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
