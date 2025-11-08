import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('rooms')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Database connection failed'
      })
    }

    // Test activities table
    const { data: activities, error: activitiesError } = await supabase
      .from('experiences')
      .select('count')
      .limit(1)

    if (activitiesError) {
      console.error('Activities table error:', activitiesError)
      return NextResponse.json({
        success: false,
        error: activitiesError.message,
        details: 'Activities table access failed'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      rooms: data?.length || 0,
      activities: activities?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Unexpected database error'
    })
  }
}
