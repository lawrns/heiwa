import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET single add-on
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: addOn, error } = await supabaseAdmin
      .from('add_ons')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching add-on:', error)
      return NextResponse.json(
        { success: false, error: 'Add-on not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      addOn,
    })
  } catch (error) {
    console.error('Error in add-on GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update add-on
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.category) updateData.category = body.category
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.max_quantity !== undefined) updateData.max_quantity = body.max_quantity || null
    if (body.images) updateData.images = body.images

    const { data: addOn, error } = await supabaseAdmin
      .from('add_ons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating add-on:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update add-on' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      addOn,
    })
  } catch (error) {
    console.error('Error in add-on PUT API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete add-on
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('add_ons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting add-on:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete add-on' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Add-on deleted successfully',
    })
  } catch (error) {
    console.error('Error in add-on DELETE API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

