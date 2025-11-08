// Activity Log API
// Read operations for activity audit trail

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  validateSearchParams,
  handleValidationError,
  ActivityLog,
  CMSListResponse,
  CMSErrorCodes
} from '@/lib/cms-validators'

// GET /api/cms/activity - Get activity log entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get('table_name')
    const action = searchParams.get('action')
    const userId = searchParams.get('user_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Validate search params
    const paramsValidation = validateSearchParams({
      search: searchParams.get('search') || undefined,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc'
    })
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation)
    }

    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact' })

    // Apply filters
    if (tableName) {
      query = query.eq('table_name', tableName)
    }
    if (action) {
      query = query.eq('action', action)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching activity log:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch activity log',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<ActivityLog> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Activity log GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST, PUT, DELETE are not allowed for activity log
// Activity log entries are created automatically by database triggers
export async function POST() {
  return NextResponse.json(
    { 
      error: CMSErrorCodes.FORBIDDEN,
      message: 'Activity log entries are created automatically' 
    },
    { status: 403 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { 
      error: CMSErrorCodes.FORBIDDEN,
      message: 'Activity log entries cannot be modified' 
    },
    { status: 403 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { 
      error: CMSErrorCodes.FORBIDDEN,
      message: 'Activity log entries cannot be deleted' 
    },
    { status: 403 }
  )
}
