import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, clientIds } = body

    if (!action || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and clientIds are required' },
        { status: 400 }
      )
    }

    let result
    let updatedCount = 0

    switch (action) {
      case 'update_status':
        const { status } = body
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for update_status action' },
            { status: 400 }
          )
        }

        const { data, error } = await supabaseAdmin
          .from('clients')
          .update({ status, updated_at: new Date().toISOString() })
          .in('id', clientIds)
          .select('id')

        if (error) {
          console.error('Error updating clients:', error)
          return NextResponse.json(
            { success: false, error: 'Failed to update clients' },
            { status: 500 }
          )
        }

        updatedCount = data?.length || 0
        result = { updated: updatedCount }
        break

      case 'delete':
        // Soft delete by archiving
        const { error: deleteError } = await supabaseAdmin
          .from('clients')
          .update({
            archived_at: new Date().toISOString(),
            status: 'archived',
            updated_at: new Date().toISOString(),
          })
          .in('id', clientIds)

        if (deleteError) {
          console.error('Error archiving clients:', deleteError)
          return NextResponse.json(
            { success: false, error: 'Failed to archive clients' },
            { status: 500 }
          )
        }

        updatedCount = clientIds.length
        result = { deleted: updatedCount }
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully processed ${updatedCount} client(s)`
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

