import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('weekId')

    if (!weekId) {
      return NextResponse.json({ error: 'Week ID is required' }, { status: 400 })
    }

    console.log('Fetching participants for week:', weekId)

    // TODO: Implement real participant fetching from database
    // For now, return empty array until booking system creates real participants
    const participants: any[] = []

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error in participants API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
