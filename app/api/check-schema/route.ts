import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Checking database schema...')
    
    // Fallback: Try to describe the table structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('Schema check error:', sampleError)
      return NextResponse.json({
        success: false,
        error: sampleError.message,
        details: 'Cannot access bookings table'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Bookings table accessible',
      columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
      sampleData: sampleData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Schema check failed'
    })
  }
}
