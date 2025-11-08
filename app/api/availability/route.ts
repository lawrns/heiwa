import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: roomId, checkIn, checkOut' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    // Check for overlapping bookings
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('id, status, check_in_date, check_out_date, guests')
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed'])
      .or(`check_in_date.lt.${checkOut},check_out_date.gt.${checkIn}`)

    if (error) {
      console.error('Error checking availability:', error)
      return NextResponse.json(
        { success: false, error: 'Unable to check availability' },
        { status: 500 }
      )
    }

    // Get room details for pricing
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, capacity, pricing, booking_type')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Type assertion for room data
    const roomData = room as {
      id: string
      name: string
      capacity: number
      pricing: { standard?: number; offSeason?: number }
      booking_type: string
    }

    // Calculate nights and pricing
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const isPeakSeason = isPeakSeasonPeriod(checkInDate, checkOutDate)
    const basePrice = isPeakSeason ? roomData.pricing?.standard : roomData.pricing?.offSeason
    const totalPrice = basePrice ? basePrice * nights : 0

    const available = !existingBookings || existingBookings.length === 0

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        available,
        nights,
        totalPrice,
        basePrice,
        isPeakSeason,
        room: {
          id: roomData.id,
          name: roomData.name,
          capacity: roomData.capacity,
          bookingType: roomData.booking_type
        },
        conflictingBookings: existingBookings || []
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isPeakSeasonPeriod(checkIn: Date, checkOut: Date): boolean {
  // Define peak season months (May - September for Portugal)
  const peakSeasonMonths = [5, 6, 7, 8, 9] // May to September
  
  // Check if any part of the booking falls in peak season
  const current = new Date(checkIn)
  while (current < checkOut) {
    if (peakSeasonMonths.includes(current.getMonth() + 1)) {
      return true
    }
    current.setDate(current.getDate() + 1)
  }
  
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, checkIn, checkOut, guests } = body

    if (!roomId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get room capacity
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('capacity, booking_type')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      )
    }

    // Type assertion for room data
    const roomData = room as {
      capacity: number
      booking_type: string
    }

    // Check capacity
    if (guests > roomData.capacity) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          message: `Room capacity is ${roomData.capacity} guests`
        }
      })
    }

    // Check availability using GET logic
    const availabilityUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/availability`)
    availabilityUrl.searchParams.set('roomId', roomId)
    availabilityUrl.searchParams.set('checkIn', checkIn)
    availabilityUrl.searchParams.set('checkOut', checkOut)

    const response = await fetch(availabilityUrl.toString())
    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
