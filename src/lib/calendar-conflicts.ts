import { supabase } from '@/lib/supabase/client';

export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: ConflictDetails[];
  warnings: string[];
}

export interface ConflictDetails {
  type: 'surf_camp' | 'booking' | 'custom_event' | 'room_unavailable';
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface EventConflictParams {
  startDate: Date;
  endDate: Date;
  eventType: 'surfCamp' | 'booking' | 'custom';
  roomIds?: string[];
  capacity?: number;
  excludeEventId?: string; // For updates, exclude the current event
}

/**
 * Check for scheduling conflicts when creating or updating calendar events
 */
export async function checkEventConflicts(params: EventConflictParams): Promise<ConflictCheck> {
  const conflicts: ConflictDetails[] = [];
  const warnings: string[] = [];

  try {
    // Check for overlapping surf camps
    await checkSurfCampConflicts(params, conflicts, warnings);

    // Check for room availability conflicts
    if (params.roomIds && params.roomIds.length > 0) {
      await checkRoomAvailabilityConflicts(params, conflicts, warnings);
    }

    // Check for overlapping custom events
    await checkCustomEventConflicts(params, conflicts, warnings);

    // Check for booking conflicts
    await checkBookingConflicts(params, conflicts, warnings);

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      warnings,
    };
  } catch (error) {
    console.error('Error checking event conflicts:', error);
    return {
      hasConflict: false,
      conflicts: [],
      warnings: ['Unable to check for conflicts. Please verify manually.'],
    };
  }
}

/**
 * Check for overlapping surf camps
 */
async function checkSurfCampConflicts(
  params: EventConflictParams,
  conflicts: ConflictDetails[],
  warnings: string[]
): Promise<void> {
  const { data: surfCamps, error } = await supabase
    .from('surf_camps')
    .select('id, name, start_date, end_date, max_participants')
    .or(`and(start_date.lte.${params.endDate.toISOString()},end_date.gte.${params.startDate.toISOString()})`)
    .neq('id', params.excludeEventId || '');

  if (error) {
    console.error('Error checking surf camp conflicts:', error);
    warnings.push('Unable to check surf camp conflicts');
    return;
  }

  if (surfCamps && surfCamps.length > 0) {
    surfCamps.forEach(camp => {
      conflicts.push({
        type: 'surf_camp',
        id: camp.id,
        title: camp.name,
        startDate: new Date(camp.start_date),
        endDate: new Date(camp.end_date),
        description: `Overlapping surf camp: ${camp.name}`,
      });
    });
  }
}

/**
 * Check for room availability conflicts
 */
async function checkRoomAvailabilityConflicts(
  params: EventConflictParams,
  conflicts: ConflictDetails[],
  warnings: string[]
): Promise<void> {
  if (!params.roomIds || params.roomIds.length === 0) return;

  // Check for existing bookings that use these rooms during the same period
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, items, client_ids')
    .neq('id', params.excludeEventId || '');

  if (error) {
    console.error('Error checking room availability:', error);
    warnings.push('Unable to check room availability');
    return;
  }

  if (bookings) {
    bookings.forEach(booking => {
      booking.items?.forEach((item: any, index: number) => {
        if (item.type === 'room' && params.roomIds!.includes(item.itemId) && item.dates) {
          const itemStart = new Date(item.dates.checkIn);
          const itemEnd = new Date(item.dates.checkOut);

          // Check for date overlap
          if (itemStart < params.endDate && itemEnd > params.startDate) {
            conflicts.push({
              type: 'booking',
              id: `${booking.id}-${index}`,
              title: `Room Booking (${booking.client_ids?.length || 0} guests)`,
              startDate: itemStart,
              endDate: itemEnd,
              description: `Room already booked during this period`,
            });
          }
        }
      });
    });
  }
}

/**
 * Check for overlapping custom events
 */
async function checkCustomEventConflicts(
  params: EventConflictParams,
  conflicts: ConflictDetails[],
  warnings: string[]
): Promise<void> {
  const { data: customEvents, error } = await supabase
    .from('custom_events')
    .select('id, title, start_date, end_date')
    .or(`and(start_date.lte.${params.endDate.toISOString()},end_date.gte.${params.startDate.toISOString()})`)
    .neq('id', params.excludeEventId || '');

  if (error) {
    console.error('Error checking custom event conflicts:', error);
    warnings.push('Unable to check custom event conflicts');
    return;
  }

  if (customEvents && customEvents.length > 0) {
    customEvents.forEach(event => {
      conflicts.push({
        type: 'custom_event',
        id: event.id,
        title: event.title,
        startDate: new Date(event.start_date),
        endDate: new Date(event.end_date),
        description: `Overlapping custom event: ${event.title}`,
      });
    });
  }
}

/**
 * Check for booking conflicts
 */
async function checkBookingConflicts(
  params: EventConflictParams,
  conflicts: ConflictDetails[],
  warnings: string[]
): Promise<void> {
  // This is a placeholder for more complex booking conflict logic
  // You might want to check for:
  // - Maximum occupancy limits
  // - Resource availability
  // - Staff scheduling conflicts
  // etc.

  if (params.eventType === 'surfCamp' && params.capacity) {
    // Check if there are existing bookings that would exceed capacity
    const { data: existingBookings, error } = await supabase
      .from('bookings')
      .select('client_ids, items')
      .neq('id', params.excludeEventId || '');

    if (error) {
      warnings.push('Unable to check capacity conflicts');
      return;
    }

    // This is a simplified check - in reality you'd need more complex logic
    // to determine which bookings are for the same surf camp period
    let totalBookedGuests = 0;
    existingBookings?.forEach(booking => {
      booking.items?.forEach((item: any) => {
        if (item.type === 'surfCamp' && item.dates) {
          const itemStart = new Date(item.dates.checkIn);
          const itemEnd = new Date(item.dates.checkOut);
          
          // Check for date overlap
          if (itemStart < params.endDate && itemEnd > params.startDate) {
            totalBookedGuests += booking.client_ids?.length || 0;
          }
        }
      });
    });

    if (totalBookedGuests >= params.capacity) {
      warnings.push(`Surf camp capacity may be exceeded. Current bookings: ${totalBookedGuests}, Capacity: ${params.capacity}`);
    }
  }
}

/**
 * Check room availability for specific dates
 */
export async function checkRoomAvailability(
  roomIds: string[],
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<{ availableRooms: string[]; unavailableRooms: string[] }> {
  const availableRooms: string[] = [];
  const unavailableRooms: string[] = [];

  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, items')
      .neq('id', excludeBookingId || '');

    if (error) {
      console.error('Error checking room availability:', error);
      // If we can't check, assume all rooms are available
      return { availableRooms: roomIds, unavailableRooms: [] };
    }

    roomIds.forEach(roomId => {
      let isAvailable = true;

      bookings?.forEach(booking => {
        booking.items?.forEach((item: any) => {
          if (item.type === 'room' && item.itemId === roomId && item.dates) {
            const itemStart = new Date(item.dates.checkIn);
            const itemEnd = new Date(item.dates.checkOut);

            // Check for date overlap
            if (itemStart < endDate && itemEnd > startDate) {
              isAvailable = false;
            }
          }
        });
      });

      if (isAvailable) {
        availableRooms.push(roomId);
      } else {
        unavailableRooms.push(roomId);
      }
    });

    return { availableRooms, unavailableRooms };
  } catch (error) {
    console.error('Error in checkRoomAvailability:', error);
    return { availableRooms: roomIds, unavailableRooms: [] };
  }
}

/**
 * Validate surf camp capacity limits
 */
export async function validateSurfCampCapacity(
  startDate: Date,
  endDate: Date,
  requestedCapacity: number,
  excludeCampId?: string
): Promise<{ isValid: boolean; currentBookings: number; message?: string }> {
  try {
    const { data: existingCamps, error } = await supabase
      .from('surf_camps')
      .select('id, name, max_participants')
      .or(`and(start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()})`)
      .neq('id', excludeCampId || '');

    if (error) {
      console.error('Error validating surf camp capacity:', error);
      return { isValid: true, currentBookings: 0, message: 'Unable to validate capacity' };
    }

    if (existingCamps && existingCamps.length > 0) {
      const totalExistingCapacity = existingCamps.reduce((sum, camp) => sum + camp.max_participants, 0);
      
      return {
        isValid: false,
        currentBookings: totalExistingCapacity,
        message: `Overlapping surf camps already have ${totalExistingCapacity} capacity allocated`,
      };
    }

    return { isValid: true, currentBookings: 0 };
  } catch (error) {
    console.error('Error in validateSurfCampCapacity:', error);
    return { isValid: true, currentBookings: 0, message: 'Unable to validate capacity' };
  }
}
