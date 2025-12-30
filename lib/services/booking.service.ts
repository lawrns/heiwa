/**
 * Booking Service - Handles all booking-related business logic
 *
 * Refactored from app/api/bookings/route.ts (1116 lines)
 * Provides typed, testable, reusable booking operations
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { Booking, Client, Room, SurfCamp, SurfCampEnrollment, RoomAssignment } from '@/lib/database.types';

// ============================================================================
// Types
// ============================================================================

export interface BookingFilters {
  status?: string;
  payment_status?: string;
  type?: string;
  roomId?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface TransformedBooking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  type: 'room' | 'surf_camp';
  item_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string | null;
  special_requests: string;
  dietary_preferences: string;
  client_notes: string;
  notes: string;
  client_ids: string[];
  participants?: ParsedParticipant[];
  room_assignments: RoomAssignmentInfo[];
}

export interface ParsedParticipant {
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dietaryRequirements?: string;
  specialRequests?: string;
  clientId?: string;
}

export interface RoomAssignmentInfo {
  roomId: string;
  roomName: string;
  roomType: string;
  capacity: number;
  bedNumber: number | null;
  checkInDate: string;
  checkOutDate: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  enrollmentId: string | null;
}

export interface SurfWeekBookingInput {
  camp_id: string;
  participants: ParticipantInput[];
  pricing: { total?: number };
  source_url?: string;
  widget_version?: string;
  room_assignments?: RoomAssignmentInput[];
}

export interface ParticipantInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dietaryRequirements?: string;
  specialRequests?: string;
  skillLevel?: string;
  emergencyContact?: Record<string, unknown>;
}

export interface RoomAssignmentInput {
  room_id: string;
  guest_ids: string[];
}

export interface RoomBookingInput {
  room_id: string;
  start_date: string;
  end_date: string;
  participants?: ParticipantInput[];
  guests?: number;
  clientName: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  error?: string;
  errorCode?: string;
  duplicateBookingId?: string;
  details?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize date to YYYY-MM-DD format
 */
export function normalizeDate(date: unknown): string {
  if (!date) throw new Error('Date is null or undefined');
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date).split('T')[0];
}

/**
 * Parse notes field to extract participant data
 */
export function parseBookingNotes(notes: string | null): {
  participants: ParsedParticipant[];
  dietaryPreferences: string;
  specialRequests: string;
} {
  const result = {
    participants: [] as ParsedParticipant[],
    dietaryPreferences: '',
    specialRequests: '',
  };

  if (!notes) return result;

  try {
    const notesData = JSON.parse(notes);
    if (notesData && typeof notesData === 'object') {
      if (notesData.participants && Array.isArray(notesData.participants)) {
        result.participants = notesData.participants;
        result.dietaryPreferences = notesData.participants
          .map((p: ParsedParticipant) => p.dietaryRequirements)
          .filter(Boolean)
          .join('; ');
        result.specialRequests = notesData.participants
          .map((p: ParsedParticipant) => p.specialRequests)
          .filter(Boolean)
          .join('\n\n');
      } else {
        result.dietaryPreferences = notesData.dietaryRequirements || notesData.dietary || notesData.diet || '';
        result.specialRequests = notesData.specialRequests || notesData.requests || notesData.message || '';
      }
    }
  } catch {
    // Parse as formatted text
    if (notes.includes('Guest 1:') || notes.includes('Guest 2:')) {
      const lines = notes.split('\n');
      let currentParticipant: ParsedParticipant | null = null;
      const parsedParticipants: ParsedParticipant[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        const guestMatch = trimmedLine.match(/^Guest (\d+):\s*(.+)/);

        if (guestMatch) {
          if (currentParticipant && (currentParticipant.name || currentParticipant.email)) {
            parsedParticipants.push(currentParticipant);
          }
          const name = guestMatch[2].trim();
          const nameParts = name.split(' ');
          currentParticipant = {
            name,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
          };
        } else if (currentParticipant) {
          if (trimmedLine.toLowerCase().startsWith('email:')) {
            currentParticipant.email = trimmedLine.replace(/^email:\s*/i, '').trim();
          } else if (trimmedLine.toLowerCase().startsWith('phone:')) {
            currentParticipant.phone = trimmedLine.replace(/^phone:\s*/i, '').trim();
          } else if (trimmedLine.toLowerCase().startsWith('dietary requirements:')) {
            currentParticipant.dietaryRequirements = trimmedLine.replace(/^dietary requirements:\s*/i, '').trim();
          } else if (trimmedLine.toLowerCase().startsWith('special requests:')) {
            currentParticipant.specialRequests = trimmedLine.replace(/^special requests:\s*/i, '').trim();
          }
        }
      }

      if (currentParticipant && (currentParticipant.name || currentParticipant.email)) {
        parsedParticipants.push(currentParticipant);
      }

      if (parsedParticipants.length > 0) {
        result.participants = parsedParticipants;
        result.dietaryPreferences = parsedParticipants
          .map((p) => p.dietaryRequirements)
          .filter(Boolean)
          .join('; ');
        result.specialRequests = parsedParticipants
          .map((p) => p.specialRequests)
          .filter(Boolean)
          .join('\n\n');
      }
    }

    // Fallback extraction
    if (result.participants.length === 0) {
      const dietaryMatches = notes.match(/Dietary Requirements:\s*(.+?)(?:\n|$)/gi);
      if (dietaryMatches) {
        result.dietaryPreferences = dietaryMatches.map((m) => m.replace(/Dietary Requirements:\s*/i, '').trim()).join(', ');
      }

      const requestMatches = notes.match(/Special Requests:\s*(.+?)(?:\n|$)/gi);
      if (requestMatches) {
        result.specialRequests = requestMatches.map((m) => m.replace(/Special Requests:\s*/i, '').trim()).join('\n');
      }

      if (!result.specialRequests && notes) {
        result.specialRequests = notes;
      }
    }
  }

  return result;
}

// ============================================================================
// Booking Service
// ============================================================================

export const bookingService = {
  /**
   * Fetch bookings with optional filters
   */
  async getBookings(filters: BookingFilters = {}): Promise<{
    bookings: TransformedBooking[];
    total: number;
  }> {
    const { 
      status, 
      payment_status,
      type,
      roomId, 
      search,
      start_date,
      end_date,
      limit, 
      offset = 0 
    } = filters;

    // Build query
    let query = supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (payment_status) {
      query = query.eq('payment_status', payment_status);
    }

    if (type === 'room') {
      query = query.not('room_type', 'is', null);
    } else if (type === 'surf_camp') {
      query = query.is('room_type', null);
    }

    if (roomId) {
      query = query.eq('room_type', roomId);
    }

    if (start_date) {
      query = query.gte('check_in', start_date);
    }

    if (end_date) {
      query = query.lte('check_in', end_date);
    }

    // Apply pagination
    if (limit !== undefined) {
      query = query.range(offset, offset + limit - 1);
    } else if (offset > 0) {
      query = query.range(offset, offset + 999999);
    }

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }

    // Collect client IDs
    const allClientIds = new Set<string>();
    (bookings || []).forEach((booking: Booking) => {
      if (booking.client_ids && Array.isArray(booking.client_ids)) {
        booking.client_ids.forEach((id) => allClientIds.add(id));
      }
    });

    // Fetch clients
    const clientMap = new Map<string, Client>();
    if (allClientIds.size > 0) {
      const { data: clients } = await supabaseAdmin
        .from('clients')
        .select('id, name, email, phone, notes')
        .in('id', Array.from(allClientIds));

      if (clients) {
        clients.forEach((client: Client) => {
          clientMap.set(client.id, client);
        });
      }
    }

    // Fetch room assignments
    const bookingIds = (bookings || []).map((b: Booking) => b.id).filter(Boolean);
    const roomAssignmentsMap = new Map<string, RoomAssignmentInfo[]>();

    if (bookingIds.length > 0) {
      const { data: roomAssignments } = await supabaseAdmin
        .from('room_assignments')
        .select(`
          id,
          booking_id,
          room_id,
          enrollment_id,
          client_id,
          bed_number,
          check_in_date,
          check_out_date,
          rooms:room_id (id, name, booking_type, capacity),
          clients:client_id (id, name, email)
        `)
        .in('booking_id', bookingIds);

      if (roomAssignments) {
        roomAssignments.forEach((ra: RoomAssignment & { rooms?: Room; clients?: Client }) => {
          if (!roomAssignmentsMap.has(ra.booking_id || '')) {
            roomAssignmentsMap.set(ra.booking_id || '', []);
          }
          roomAssignmentsMap.get(ra.booking_id || '')!.push({
            roomId: ra.room_id,
            roomName: (ra.rooms as Room | undefined)?.name || 'Unknown Room',
            roomType: (ra.rooms as Room | undefined)?.booking_type === 'perBed' ? 'dorm' : 'private',
            capacity: (ra.rooms as Room | undefined)?.capacity || 0,
            bedNumber: ra.bed_number,
            checkInDate: ra.check_in_date,
            checkOutDate: ra.check_out_date,
            clientId: ra.client_id,
            clientName: (ra.clients as Client | undefined)?.name || 'Unknown',
            clientEmail: (ra.clients as Client | undefined)?.email || '',
            enrollmentId: ra.enrollment_id,
          });
        });
      }
    }

    // Apply search filter client-side (since Supabase text search requires full-text search setup)
    let filteredBookings = bookings || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBookings = filteredBookings.filter((booking: Booking) => {
        const bookingId = booking.id?.toLowerCase() || '';
        const notes = booking.notes?.toLowerCase() || '';
        return bookingId.includes(searchLower) || notes.includes(searchLower);
      });
    }

    // Transform bookings
    const transformedData: TransformedBooking[] = filteredBookings.map((booking: Booking) => {
      let guestName = 'Unknown';
      let guestEmail = '';
      let guestPhone = '';
      let clientNotes = '';

      if (booking.client_ids && booking.client_ids.length > 0) {
        const client = clientMap.get(booking.client_ids[0]);
        if (client) {
          guestName = client.name || 'Unknown';
          guestEmail = client.email || '';
          guestPhone = client.phone || '';
          clientNotes = client.notes || '';
        }
      }

      const { participants, dietaryPreferences, specialRequests } = parseBookingNotes(booking.notes);

      return {
        id: booking.id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        type: booking.room_type ? 'room' : 'surf_camp',
        item_name: booking.room_type || 'Surf Camp',
        check_in: booking.check_in || '',
        check_out: booking.check_out || '',
        guests: booking.guests || 1,
        total_price: booking.total_amount || 0,
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'pending',
        created_at: booking.created_at,
        special_requests: booking.special_requests || specialRequests,
        dietary_preferences: booking.dietary_requirements || dietaryPreferences,
        client_notes: clientNotes,
        notes: booking.notes || '',
        client_ids: booking.client_ids || [],
        participants: participants.length > 0 ? participants : undefined,
        room_assignments: roomAssignmentsMap.get(booking.id) || [],
      };
    });

    // If search filter was applied, we need to recalculate total
    // Otherwise use the count from the query
    const total = search 
      ? transformedData.length 
      : (count || transformedData.length);

    return {
      bookings: transformedData,
      total,
    };
  },

  /**
   * Create a surf week booking
   */
  async createSurfWeekBooking(input: SurfWeekBookingInput): Promise<BookingResult> {
    const { camp_id, participants, pricing, source_url, widget_version, room_assignments } = input;

    // Validate required fields
    if (!camp_id || !participants.length) {
      return { success: false, error: 'Missing required fields: camp_id, participants' };
    }

    for (let i = 0; i < participants.length; i++) {
      if (!participants[i].email) {
        return { success: false, error: `Participant ${i + 1} email is required` };
      }
    }

    const primaryParticipant = participants[0];
    const clientName = primaryParticipant.name || `${primaryParticipant.firstName} ${primaryParticipant.lastName}`.trim();
    const email = primaryParticipant.email;

    // Create or find clients for all participants
    const allClientIds: string[] = [];
    const participantDetails: ParsedParticipant[] = [];

    for (const participant of participants) {
      const pName = participant.name || `${participant.firstName} ${participant.lastName}`.trim();
      const pEmail = participant.email;

      // Check if client exists by email (email is UNIQUE in database)
      const { data: existingClient, error: findError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', pEmail)
        .single();

      let pClientId: string;

      if (findError && findError.code === 'PGRST116') {
        // No client found with this email - create new client
        const { data: newClient, error: createError } = await supabaseAdmin
          .from('clients')
          .insert({
            name: pName,
            email: pEmail,
            phone: participant.phone || '',
            brand: 'Heiwa House',
            status: 'active',
            notes: `Created via surf week booking widget ${widget_version || 'unknown'}`,
          })
          .select('id')
          .single();

        if (createError) {
          const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
          console.error('Failed to create client:', {
            error: createError,
            hasServiceKey,
            email: pEmail,
            name: pName
          });
          return {
            success: false,
            error: `Failed to create client record for ${pName}`,
            errorCode: createError.code,
            details: `${createError.message} (service_key: ${hasServiceKey ? 'yes' : 'NO'})`
          };
        }
        pClientId = newClient.id;
      } else if (findError) {
        return { success: false, error: `Failed to verify client for ${pName}` };
      } else {
        // Use existing client (email is unique, so this is the same person)
        pClientId = existingClient.id;
      }

      allClientIds.push(pClientId);
      participantDetails.push({
        name: pName,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: pEmail,
        phone: participant.phone || '',
        dietaryRequirements: participant.dietaryRequirements || '',
        specialRequests: participant.specialRequests || '',
        clientId: pClientId,
      });
    }

    // Fetch surf camp details
    const { data: surfCamp, error: surfCampError } = await supabaseAdmin
      .from('surf_camps')
      .select('id, name, start_date, end_date, is_active')
      .eq('id', camp_id)
      .single();

    if (surfCampError || !surfCamp) {
      return { success: false, error: `Surf camp not found: ${camp_id}`, errorCode: surfCampError?.code };
    }

    if (!surfCamp.start_date || !surfCamp.end_date) {
      return { success: false, error: `Surf camp ${surfCamp.name || camp_id} is missing start_date or end_date` };
    }

    let checkInDate: string;
    let checkOutDate: string;

    try {
      checkInDate = normalizeDate(surfCamp.start_date);
      checkOutDate = normalizeDate(surfCamp.end_date);
    } catch {
      return { success: false, error: `Invalid date format for surf camp ${surfCamp.name || camp_id}` };
    }

    // Check for duplicates
    const { data: existingBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, status, created_at, notes')
      .contains('client_ids', [allClientIds[0]])
      .eq('check_in', checkInDate)
      .eq('check_out', checkOutDate)
      .is('room_type', null)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(10);

    if (existingBookings && existingBookings.length > 0) {
      const matchingBookings = existingBookings.filter((booking: Booking) => {
        const bookingAge = new Date().getTime() - new Date(booking.created_at || '').getTime();
        return bookingAge < 5 * 60 * 1000; // Within 5 minutes
      });

      if (matchingBookings.length > 0) {
        return {
          success: false,
          error: 'A booking with these details already exists',
          duplicateBookingId: matchingBookings[0].id,
          errorCode: 'DUPLICATE_BOOKING',
        };
      }
    }

    // Create booking
    const bookingNotes = JSON.stringify({
      widget_version: widget_version || 'unknown',
      source_url: source_url || undefined,
      participants: participantDetails,
      room_assignments: room_assignments || undefined,
    });

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        client_ids: allClientIds,
        total_amount: pricing.total || 0,
        status: 'pending',
        payment_status: 'pending',
        guests: participants.length,
        check_in: checkInDate,
        check_out: checkOutDate,
        room_type: null,
        notes: bookingNotes,
        source: 'widget',
      })
      .select('id')
      .single();

    if (bookingError) {
      return { success: false, error: 'Failed to create surf week booking record', errorCode: bookingError.code };
    }

    const bookingId = booking.id;

    // Create enrollments
    const allEnrollments: SurfCampEnrollment[] = [];
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const pClientId = allClientIds[i];
      const pName = participant.name || `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Guest';

      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from('surf_camp_enrollments')
        .insert({
          surf_camp_id: camp_id,
          client_id: pClientId,
          booking_id: bookingId,
          participant_name: pName,
          participant_email: participant.email,
          participant_phone: participant.phone || '',
          status: 'pending',
          skill_level: participant.skillLevel || 'beginner',
          dietary_restrictions: participant.dietaryRequirements || null,
          emergency_contact: participant.emergencyContact || null,
          notes: participant.specialRequests || null,
        })
        .select()
        .single();

      if (!enrollmentError && enrollment) {
        allEnrollments.push(enrollment);
      }
    }

    // Create room assignments if provided
    if (room_assignments && room_assignments.length > 0) {
      const roomAssignmentsToInsert: Partial<RoomAssignment>[] = [];

      for (const assignment of room_assignments) {
        for (const guestId of assignment.guest_ids) {
          const guestIndex = parseInt(guestId.replace('guest-', '')) - 1;

          if (guestIndex >= 0 && guestIndex < allEnrollments.length) {
            const enrollment = allEnrollments[guestIndex];

            roomAssignmentsToInsert.push({
              room_id: assignment.room_id,
              client_id: enrollment.client_id,
              booking_id: bookingId,
              surf_camp_id: camp_id,
              enrollment_id: enrollment.id,
              check_in_date: checkInDate,
              check_out_date: checkOutDate,
              status: 'confirmed',
            });
          }
        }
      }

      if (roomAssignmentsToInsert.length > 0) {
        await supabaseAdmin.from('room_assignments').insert(roomAssignmentsToInsert);
      }
    }

    return {
      success: true,
      bookingId,
      clientId: allClientIds[0],
      clientName,
      clientEmail: email,
    };
  },

  /**
   * Create a room booking
   */
  async createRoomBooking(input: RoomBookingInput): Promise<BookingResult> {
    const { room_id, start_date, end_date, participants = [], guests, clientName, email, phone, message } = input;

    // Validate required fields
    if (!room_id || !start_date || !end_date || !clientName || !email) {
      return { success: false, error: 'Missing required fields: room_id, start_date, end_date, clientName, email' };
    }

    const participant = participants[0] || { firstName: clientName, email, phone };
    const participantName = participant.firstName || participant.name || clientName;
    const participantEmail = participant.email || email;
    const participantPhone = participant.phone || phone || '';

    // Create or find client
    const { data: existingClient, error: findError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('email', participantEmail)
      .single();

    let clientData: Client;

    if (findError && findError.code !== 'PGRST116') {
      return { success: false, error: `Database error finding client: ${findError.message}` };
    }

    if (existingClient) {
      clientData = existingClient;
    } else {
      const { data: newClient, error: createError } = await supabaseAdmin
        .from('clients')
        .insert({
          name: participantName,
          email: participantEmail,
          phone: participantPhone,
          notes: message || '',
          brand: 'Heiwa House',
        })
        .select()
        .single();

      if (createError) {
        return { success: false, error: `Database error creating client: ${createError.message}` };
      }
      clientData = newClient;
    }

    // Fetch room details
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('name, id, booking_type, capacity')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return { success: false, error: 'Room not found' };
    }

    // Check for conflicts
    const { data: existingBookings } = await supabaseAdmin
      .from('bookings')
      .select('guests')
      .eq('room_type', room.name)
      .neq('status', 'cancelled')
      .lt('check_in', end_date)
      .gt('check_out', start_date);

    const { data: existingAssignments } = await supabaseAdmin
      .from('room_assignments')
      .select('id')
      .eq('room_id', room_id)
      .lt('check_in_date', end_date)
      .gt('check_out_date', start_date);

    let currentOccupancy = 0;
    if (existingBookings) {
      currentOccupancy += existingBookings.reduce((sum, b) => sum + ((b as Booking).guests || 1), 0);
    }
    if (existingAssignments) {
      currentOccupancy += existingAssignments.length;
    }

    const requestedGuests = guests || participants.length || 1;

    if (room.booking_type === 'whole') {
      if (currentOccupancy > 0) {
        return { success: false, error: 'Room is already booked for these dates' };
      }
    } else {
      if (currentOccupancy + requestedGuests > room.capacity) {
        return { success: false, error: 'Not enough capacity for these dates' };
      }
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        client_ids: [clientData.id],
        total_amount: 0,
        status: 'pending',
        payment_status: 'pending',
        guests: requestedGuests,
        check_in: start_date,
        check_out: end_date,
        room_type: room.name,
        notes: message || '',
        source: 'api',
        dietary_requirements: participant.dietaryRequirements || null,
        special_requests: participant.specialRequests || null,
      })
      .select()
      .single();

    if (bookingError) {
      return { success: false, error: `Database error creating booking: ${bookingError.message}` };
    }

    return {
      success: true,
      bookingId: booking.id,
      clientId: clientData.id,
      clientName: clientData.name,
      clientEmail: clientData.email,
    };
  },
};
