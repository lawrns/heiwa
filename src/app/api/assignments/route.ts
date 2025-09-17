import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null as any;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('weekId')

    if (!weekId) {
      return NextResponse.json({ error: 'Week ID is required' }, { status: 400 })
    }

    console.log('Fetching assignments for week:', weekId)

    // Return empty assignments for now
    return NextResponse.json([])
  } catch (error) {
    console.error('Error in assignments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { weekId, assignments } = await request.json()

    if (!weekId || !assignments) {
      return NextResponse.json({ error: 'Week ID and assignments are required' }, { status: 400 })
    }

    const supabase = createSupabase()

    // Delete existing assignments for this week
    const { error: deleteError } = await supabase
      .from('surf_week_assignments')
      .delete()
      .eq('week_id', weekId)

    if (deleteError) {
      console.error('Error deleting existing assignments:', deleteError)
      return NextResponse.json({ error: 'Failed to clear existing assignments' }, { status: 500 })
    }

    // Insert new assignments
    const assignmentRecords = assignments.flatMap((assignment: any) =>
      assignment.participantIds.map((participantId: string) => ({
        week_id: weekId,
        room_id: assignment.roomId,
        participant_id: participantId,
        participant_name: 'Unknown', // Will be updated when we have participant data
        participant_email: 'unknown@example.com',
        surf_level: 'beginner',
        assigned_at: new Date().toISOString()
      }))
    )

    if (assignmentRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('surf_week_assignments')
        .insert(assignmentRecords)

      if (insertError) {
        console.error('Error inserting assignments:', insertError)
        return NextResponse.json({ error: 'Failed to save assignments' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: 'Assignments saved successfully' })
  } catch (error) {
    console.error('Error in assignments POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
