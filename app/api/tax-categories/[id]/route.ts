import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch a single tax category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const { data: taxCategory, error } = await supabaseAdmin
      .from('tax_categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching tax category:', error)
      return NextResponse.json({
        success: false,
        error: 'Tax category not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      taxCategory
    })
  } catch (error) {
    console.error('Error in tax-categories GET API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update a tax category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, rate, description, is_default } = body

    if (!name || rate === undefined || rate === null) {
      return NextResponse.json({
        success: false,
        error: 'Name and rate are required'
      }, { status: 400 })
    }

    // Validate rate is between 0 and 1
    const rateNum = parseFloat(rate)
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
      return NextResponse.json({
        success: false,
        error: 'Rate must be a decimal between 0 and 1 (e.g., 0.23 for 23%)'
      }, { status: 400 })
    }

    // If this is being set as default, unset existing default first
    if (is_default) {
      await supabaseAdmin
        .from('tax_categories')
        .update({ is_default: false })
        .neq('id', id)
    }

    const { data: taxCategory, error } = await supabaseAdmin
      .from('tax_categories')
      .update({
        name,
        rate: rateNum,
        description: description || null,
        is_default: is_default || false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating tax category:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update tax category'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      taxCategory
    })
  } catch (error) {
    console.error('Error in tax-categories PUT API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Delete a tax category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if any products are using this tax category
    const [roomsCheck, surfCampsCheck, experiencesCheck] = await Promise.all([
      supabaseAdmin.from('rooms').select('id').eq('tax_category_id', id).limit(1),
      supabaseAdmin.from('surf_camps').select('id').eq('tax_category_id', id).limit(1),
      supabaseAdmin.from('experiences').select('id').eq('tax_category_id', id).limit(1)
    ])

    const inUse =
      (roomsCheck.data && roomsCheck.data.length > 0) ||
      (surfCampsCheck.data && surfCampsCheck.data.length > 0) ||
      (experiencesCheck.data && experiencesCheck.data.length > 0)

    if (inUse) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete tax category that is in use by products. Please reassign products first.'
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('tax_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tax category:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete tax category'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Tax category deleted successfully'
    })
  } catch (error) {
    console.error('Error in tax-categories DELETE API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
