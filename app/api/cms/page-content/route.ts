// Page Content API
// CRUD operations for page content (Flow, Play, Surf, The Spot, Privacy, Terms)

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  validateCreatePageContent, 
  validateUpdatePageContent,
  validateSearchParams,
  handleValidationError,
  PageContent,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCodes,
  ValidationError
} from '@/lib/cms-validators'

// GET /api/cms/page-content - Get all page content or specific content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get('page_slug')
    const section = searchParams.get('section')
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'page_slug'
    const sortOrder = searchParams.get('sort_order') || 'asc'

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
      .from('page_content')
      .select('*', { count: 'exact' })

    // Apply filters
    if (pageSlug) {
      query = query.eq('page_slug', pageSlug)
    }
    if (section) {
      query = query.eq('section', section)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching page content:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch page content',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<PageContent> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Page content GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/cms/page-content - Create new page content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateCreatePageContent(body)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('page_content')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.VALIDATION_ERROR,
            message: 'Page content for this page and section already exists' 
          },
          { status: 409 }
        )
      }
      console.error('Error creating page content:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to create page content',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<PageContent> = {
      data,
      message: 'Page content created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Page content POST error:', error)
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: error.message,
          details: (error as ValidationError).details 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/cms/page-content - Update page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'ID is required for updates' 
        },
        { status: 400 }
      )
    }

    // Validate request body
    const validation = validateUpdatePageContent(updateData)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('page_content')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.NOT_FOUND,
            message: 'Page content not found' 
          },
          { status: 404 }
        )
      }
      console.error('Error updating page content:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to update page content',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<PageContent> = {
      data,
      message: 'Page content updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Page content PUT error:', error)
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: error.message,
          details: (error as ValidationError).details 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/cms/page-content - Delete page content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'ID is required for deletion' 
        },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('page_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting page content:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to delete page content',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Page content deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Page content DELETE error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
