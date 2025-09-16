import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('weekId')

    if (!weekId) {
      return NextResponse.json({ error: 'Week ID is required' }, { status: 400 })
    }

    console.log('Fetching participants for week:', weekId)

    // Return mock participants for testing
    const mockParticipants = [
      { id: 'p1', name: 'Sarah Johnson', email: 'sarah@email.com', surfLevel: 'intermediate', bookingId: 'b1' },
      { id: 'p2', name: 'Marcus Rodriguez', email: 'marcus@email.com', surfLevel: 'advanced', bookingId: 'b2' },
      { id: 'p3', name: 'Emily Chen', email: 'emily@email.com', surfLevel: 'beginner', bookingId: 'b3' },
      { id: 'p4', name: 'David Thompson', email: 'david@email.com', surfLevel: 'intermediate', bookingId: 'b4' },
    ]

    return NextResponse.json(mockParticipants)
  } catch (error) {
    console.error('Error in participants API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
