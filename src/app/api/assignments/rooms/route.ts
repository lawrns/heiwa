import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Get rooms for assignments page without admin auth requirement
 * Uses service role key for direct database access
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching rooms for assignments page');

    const supabase = createSupabase();
    if (!supabase) {
      console.error('Failed to create Supabase client - missing environment variables');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Fetch active rooms with all necessary fields for assignments
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, capacity, is_active, images, amenities, pricing, description, booking_type')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (roomsError) {
      console.error('Error fetching rooms for assignments:', roomsError);
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }

    // Transform rooms data for assignments interface
    const transformedRooms = (rooms || []).map((room: any) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity || 2,
      type: room.booking_type === 'perBed' ? 'dorm' : 
            room.capacity === 1 ? 'private' : 'shared',
      maxOccupancy: room.capacity || 2,
      pricePerNight: room.pricing?.standard || room.pricing?.offSeason || 80,
      amenities: room.amenities || [],
      images: room.images || [],
      isAvailable: true, // For assignments, we assume all rooms are available
      description: room.description || '',
      // Additional fields for assignment interface
      currentOccupancy: 0, // Will be calculated based on assignments
      availableSpots: room.capacity || 2
    }));

    console.log(`Found ${transformedRooms.length} rooms for assignments`);
    return NextResponse.json(transformedRooms);

  } catch (error) {
    console.error('Error in assignments rooms API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
