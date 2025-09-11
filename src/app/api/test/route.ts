import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Temporarily use service role for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Test database connection by getting all surf camps
    const { data: allCamps, error } = await supabase
      .from('surf_camps')
      .select('id, name, is_active');

    const surf_camps_count = allCamps?.length || 0;

    // Also get a few sample records to verify data
    const samples = allCamps?.slice(0, 3) || [];

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      surf_camps_count: surf_camps_count,
      sample_records: samples,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
