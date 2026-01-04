import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Bed, Users, Star, ArrowRight, Calendar, CheckCircle, Check, Camera } from 'lucide-react';
import { BookingState, Room, PricingBreakdown, RoomAssignment as RoomAssignmentType, SurfCampPricing } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { RoomImageGallery, RoomThumbnail } from '../components/RoomImageGallery';
import { Button } from '@/components/ui/button';

interface TransformedRoom {
  id: string;
  name: string;
  type: 'private' | 'shared' | 'dorm';
  description: string;
  features: string[];
  maxOccupancy: number;
  pricePerNight: number;
  isIncluded: boolean;
  image: string;
  surfCampPricing?: SurfCampPricing;
}

interface SurfWeekRoomSelectionProps {
  state: BookingState;
  actions: {
    setRoomAssignments: (assignments: RoomAssignmentType[]) => void;
    addRoomAssignment: (assignment: RoomAssignmentType) => void;
    removeRoomAssignment: (assignmentId: string) => void;
    updatePricing: (pricing: PricingBreakdown) => void;
    nextStep: () => void;
  };
}

// Transform real room data for surf week accommodation options
const transformRoomForSurfWeek = (room: Room): TransformedRoom => {
  // Dorm room is included, private rooms are upgrades
  const isIncluded = room.type === 'dorm';
  const upgradePrice = isIncluded ? 0 : room.pricePerNight;

  return {
    id: room.id,
    name: room.name,
    type: room.type,
    description: room.description,
    features: room.amenities.map(amenity => amenity.replace(/-/g, ' ')),
    maxOccupancy: room.maxOccupancy,
    pricePerNight: upgradePrice,
    isIncluded,
    image: room.images[0] || '/images/room-placeholder.jpg',
    surfCampPricing: room.pricing?.surfCamp,
  };
};

// Calculate room upgrade cost as the DIFFERENCE from base surf camp price
// Example: Base surf camp €480/person, Room Two €580/person → Upgrade = €100/person
const calculateSurfCampRoomUpgrade = (room: Room, guestCount: number, basePricePerPerson: number): number => {
  // If dorm room, it's included in package - no upgrade cost
  if (room.type === 'dorm') {
    return 0;
  }

  const surfCampPricing = room.pricing?.surfCamp;
  let upgradedRoomPricePerPerson = 0;

  // Get the per-person price for this upgraded room
  if (surfCampPricing) {
    if (surfCampPricing.strategy === 'perBed' && surfCampPricing.perBed) {
      // Fixed price per person for this room type
      upgradedRoomPricePerPerson = surfCampPricing.perBed;
    } else if (surfCampPricing.strategy === 'perRoomOccupancy' && surfCampPricing.occupancy) {
      // Tiered pricing based on occupancy
      upgradedRoomPricePerPerson = surfCampPricing.occupancy[guestCount] || surfCampPricing.occupancy[1] || 0;
    }
  }

  // Fallback to pricePerNight × 7 days if no surf camp pricing configured
  if (!upgradedRoomPricePerPerson && room.pricePerNight > 0) {
    upgradedRoomPricePerPerson = room.pricePerNight * 7;
  }

  // Calculate the DIFFERENCE (upgrade cost) from base price
  // If upgraded room is €580/person and base is €480/person, difference is €100/person
  const upgradePerPerson = Math.max(0, upgradedRoomPricePerPerson - basePricePerPerson);

  return upgradePerPerson * guestCount;
};

export function SurfWeekRoomSelection({ state, actions }: SurfWeekRoomSelectionProps) {
  const [unassignedGuests, setUnassignedGuests] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Image gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryRoomName, setGalleryRoomName] = useState('');
  const [galleryRoom, setGalleryRoom] = useState<Room | null>(null);

  // Fetch surf week details to get dates for availability check
  const { surfCamps, loading: campsLoading } = useSurfCamps();
  const selectedSurfWeekData = surfCamps.find(camp => camp.id === state.selectedSurfWeek);
  
  // Fetch real room data WITH date filtering for surf weeks
  // This ensures we check room_assignments for the surf camp dates
  // Validate dates before creating Date objects to prevent API errors
  const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateStr);
        return null;
      }
      return date;
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error);
      return null;
    }
  };
  
  // CRITICAL FIX: Use state.dates as PRIMARY source (these are set from backend when surf week is selected)
  // The dates displayed come from state.dates, so we MUST use the same dates for fetching rooms
  // Fallback to surf week data only if state.dates are missing
  const primaryStartDate = state.dates.checkIn || parseDate(selectedSurfWeekData?.startDate);
  const primaryEndDate = state.dates.checkOut || parseDate(selectedSurfWeekData?.endDate);
  
  // Also parse from surf week data for display/debugging
  const surfCampStartDate = parseDate(selectedSurfWeekData?.startDate);
  const surfCampEndDate = parseDate(selectedSurfWeekData?.endDate);
  
  // Debug logging to help diagnose issues
  useEffect(() => {
    console.log('🔍 SurfWeekRoomSelection Debug:', {
      selectedSurfWeek: state.selectedSurfWeek,
      surfCampsCount: surfCamps.length,
      selectedSurfWeekData: selectedSurfWeekData ? {
        id: selectedSurfWeekData.id,
        name: selectedSurfWeekData.name,
        startDate: selectedSurfWeekData.startDate,
        endDate: selectedSurfWeekData.endDate,
      } : null,
      stateDates: {
        checkIn: state.dates.checkIn?.toISOString(),
        checkOut: state.dates.checkOut?.toISOString(),
      },
      surfCampDates: {
        startDate: surfCampStartDate?.toISOString(),
        endDate: surfCampEndDate?.toISOString(),
      },
      primaryDates: {
        startDate: primaryStartDate?.toISOString(),
        endDate: primaryEndDate?.toISOString(),
      },
      hasValidDates: !!(primaryStartDate && primaryEndDate && primaryStartDate < primaryEndDate),
      campsLoading,
    });
  }, [state.selectedSurfWeek, state.dates.checkIn, state.dates.checkOut, selectedSurfWeekData, primaryStartDate, primaryEndDate, surfCampStartDate, surfCampEndDate, surfCamps.length, campsLoading]);
  
  // Fetch rooms - use primary dates (from state.dates first, then surf week data)
  // This ensures rooms are fetched with the same dates that are displayed
  // forSurfWeek=true tells the API this is surf week room selection, not a room-only booking
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms({
    checkIn: (primaryStartDate && primaryEndDate && primaryStartDate < primaryEndDate) ? primaryStartDate : null,
    checkOut: (primaryStartDate && primaryEndDate && primaryStartDate < primaryEndDate) ? primaryEndDate : null,
    guests: state.guests || 1,
    forSurfWeek: true,
  });
  
  const loading = roomsLoading || campsLoading;
  const error = roomsError;
  
  // Initialize guest IDs
  useEffect(() => {
    const guestIds = Array.from({ length: state.guests }, (_, i) => `guest-${i + 1}`);
    const assignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
    const unassigned = guestIds.filter(id => !assignedGuestIds.includes(id));
    setUnassignedGuests(unassigned);
  }, [state.guests, state.roomAssignments]);

  // Calculate pricing based on room assignments for surf weeks
  // PRICING RULES:
  // 1. Prices are tax-INCLUSIVE (tax is extracted for display, not added)
  // 2. No service fee
  // 3. Room upgrade = DIFFERENCE from base price (not full room price)
  // Use refs to track previous values and prevent infinite loops
  const prevRoomAssignmentsRef = useRef<string>('');
  const prevRoomsRef = useRef<string>('');
  const prevBasePriceRef = useRef<number>(0);
  const prevAddOnsSubtotalRef = useRef<number>(0);
  const prevGuestsRef = useRef<number>(0);
  const isUpdatingPricingRef = useRef<boolean>(false);

  // Create stable keys for rooms and room assignments to use in dependency array
  const roomsKey = useMemo(() => JSON.stringify(rooms.map(r => r.id).sort()), [rooms]);
  const roomAssignmentsKey = useMemo(() => JSON.stringify(state.roomAssignments.map(a => ({
    roomId: a.roomId,
    guestIds: [...a.guestIds].sort()
  })).sort((a, b) => a.roomId.localeCompare(b.roomId))), [state.roomAssignments]);

  useEffect(() => {
    // Prevent re-entry if we're currently updating pricing ourselves
    if (isUpdatingPricingRef.current) {
      return;
    }

    const TAX_RATE = 0.1; // 10% VAT included in prices
    const basePrice = state.pricing.basePrice || 0;
    const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
    const basePricePerPerson = state.guests > 0 ? basePrice / state.guests : 0;

    // Check if anything actually changed using stable keys
    const assignmentsChanged = prevRoomAssignmentsRef.current !== roomAssignmentsKey;
    const roomsChanged = prevRoomsRef.current !== roomsKey;
    const basePriceChanged = prevBasePriceRef.current !== basePrice;
    const addOnsChanged = prevAddOnsSubtotalRef.current !== addOnsSubtotal;
    const guestsChanged = prevGuestsRef.current !== state.guests;

    // Only proceed if something relevant changed
    if (!assignmentsChanged && !roomsChanged && !basePriceChanged && !addOnsChanged && !guestsChanged) {
      return;
    }

    // Update refs BEFORE updating pricing
    prevRoomAssignmentsRef.current = roomAssignmentsKey;
    prevRoomsRef.current = roomsKey;
    prevBasePriceRef.current = basePrice;
    prevAddOnsSubtotalRef.current = addOnsSubtotal;
    prevGuestsRef.current = state.guests;

    if (state.roomAssignments.length === 0 || rooms.length === 0) {
      // If no assignments, reset room upgrade to 0
      const subtotal = basePrice + addOnsSubtotal;
      // Tax is INCLUDED in price, extract for display (not added on top)
      const taxes = Math.round(subtotal * TAX_RATE / (1 + TAX_RATE));
      const fees = 0; // No service fee

      const newPricing = {
        ...state.pricing,
        roomUpgrade: 0,
        taxes,
        fees,
        total: subtotal, // Price already includes tax
      };

      // Only update if pricing actually changed
      if (state.pricing.roomUpgrade !== 0 || state.pricing.taxes !== taxes || state.pricing.total !== subtotal) {
        isUpdatingPricingRef.current = true;
        actions.updatePricing(newPricing);
      }
      return;
    }

    // Calculate total room upgrade cost as DIFFERENCE from base price
    let totalRoomUpgrade = 0;

    state.roomAssignments.forEach(assignment => {
      const room = rooms.find(r => r.id === assignment.roomId);
      if (room) {
        // Calculate upgrade as difference from base price (not full room price)
        const roomUpgradeCost = calculateSurfCampRoomUpgrade(room, assignment.guestIds.length, basePricePerPerson);
        totalRoomUpgrade += roomUpgradeCost;

        // Log pricing for debugging
        console.log(`🏠 Room "${room.name}" upgrade pricing:`, {
          guestCount: assignment.guestIds.length,
          basePricePerPerson,
          surfCampPricing: room.pricing?.surfCamp,
          upgradeCost: roomUpgradeCost,
        });
      }
    });

    // Update pricing with room upgrade
    const subtotal = basePrice + totalRoomUpgrade + addOnsSubtotal;
    // Tax is INCLUDED in price, extract for display (not added on top)
    const taxes = Math.round(subtotal * TAX_RATE / (1 + TAX_RATE));
    const fees = 0; // No service fee

    const newPricing = {
      ...state.pricing,
      roomUpgrade: totalRoomUpgrade,
      taxes,
      fees,
      total: subtotal, // Price already includes tax
    };

    // Only update if pricing actually changed
    if (
      state.pricing.roomUpgrade !== totalRoomUpgrade ||
      state.pricing.taxes !== taxes ||
      state.pricing.total !== subtotal
    ) {
      isUpdatingPricingRef.current = true;
      actions.updatePricing(newPricing);
    }
    // Note: basePrice and addOnsSubtotal are intentionally NOT in deps - they're set in earlier steps
    // and shouldn't change during room selection. The ref guard prevents infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomAssignmentsKey, roomsKey, state.guests]);

  // Reset the updating flag after pricing state updates (synchronously)
  useLayoutEffect(() => {
    if (isUpdatingPricingRef.current) {
      // Reset flag after React has processed the state update
      isUpdatingPricingRef.current = false;
    }
  }, [state.pricing.roomUpgrade, state.pricing.taxes, state.pricing.total]);

  // Auto-advance when all guests are assigned
  useEffect(() => {
    if (state.guests > 1) {
      const guestIds = Array.from({ length: state.guests }, (_, i) => `guest-${i + 1}`);
      const assignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
      const allAssigned = guestIds.length > 0 &&
                         guestIds.every(id => assignedGuestIds.includes(id));

      if (allAssigned) {
        // Cancel any pending timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Auto-advance after brief delay
        timeoutRef.current = setTimeout(() => {
          // Double-check all guests are still assigned
          const currentAssigned = state.roomAssignments.flatMap(a => a.guestIds);
          const stillAllAssigned = guestIds.every(id => currentAssigned.includes(id));
          if (stillAllAssigned && state.guests > 1) {
            actions.nextStep();
          }
          timeoutRef.current = null;
        }, 500);
      }
    } else if (state.guests === 1 && state.roomAssignments.length > 0) {
      // For single guest, auto-advance immediately after assignment
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        actions.nextStep();
        timeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.roomAssignments, state.guests, actions]);

  // Format dates for display - use Intl API safely
  const formatDateRange = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return null;
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const start = new Intl.DateTimeFormat('en-US', options).format(checkIn);
      const end = new Intl.DateTimeFormat('en-US', options).format(checkOut);
      return `${start} - ${end}`;
    } catch (error) {
      // Fallback if Intl API fails
      console.warn('Date formatting error, using fallback:', error);
      return `${checkIn.toDateString()} - ${checkOut.toDateString()}`;
    }
  };
  
  const dateRange = formatDateRange(state.dates.checkIn, state.dates.checkOut);

  // Transform real rooms for surf week display, with dorm first
  const surfWeekRooms = rooms
    .map(transformRoomForSurfWeek)
    .sort((a, b) => {
      // Dorm rooms first, then private rooms
      if (a.type === 'dorm' && b.type !== 'dorm') return -1;
      if (a.type !== 'dorm' && b.type === 'dorm') return 1;
      return a.name.localeCompare(b.name);
    });

  // Handle guest assignment to room
  const handleAssignGuestToRoom = (roomId: string, guestId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Check if room has capacity
    const currentAssignment = state.roomAssignments.find(a => a.roomId === roomId);
    const currentOccupancy = currentAssignment ? currentAssignment.guestIds.length : 0;
    
    if (currentOccupancy >= room.maxOccupancy) {
      return; // Room is full
    }

    // ENFORCE EXCLUSIVITY: Remove guest from any other room assignments first
    let updatedAssignments = state.roomAssignments.map(assignment => {
      // Remove guest from other rooms
      if (assignment.roomId !== roomId && assignment.guestIds.includes(guestId)) {
        const filteredGuestIds = assignment.guestIds.filter(id => id !== guestId);
        // If no guests left in this assignment, mark it for removal
        if (filteredGuestIds.length === 0) {
          return null; // Mark for removal
        }
        return {
          ...assignment,
          guestIds: filteredGuestIds
        };
      }
      return assignment;
    }).filter((assignment): assignment is RoomAssignmentType => assignment !== null);

    // Now add guest to the target room
    if (currentAssignment) {
      // Add guest to existing assignment (only if not already there)
      if (!currentAssignment.guestIds.includes(guestId)) {
        const updatedAssignment = {
          ...currentAssignment,
          guestIds: [...currentAssignment.guestIds, guestId]
        };
        
        updatedAssignments = updatedAssignments.map(a => 
          a.id === currentAssignment.id ? updatedAssignment : a
        );
      }
    } else {
      // Create new assignment
      const newAssignment: RoomAssignmentType = {
        id: `assignment-${Date.now()}`,
        roomId,
        guestIds: [guestId]
      };
      updatedAssignments.push(newAssignment);
    }

    actions.setRoomAssignments(updatedAssignments);
  };

  // Handle removing guest from room
  const handleRemoveGuestFromRoom = (assignmentId: string, guestId: string) => {
    const assignment = state.roomAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const updatedGuestIds = assignment.guestIds.filter(id => id !== guestId);
    
    if (updatedGuestIds.length === 0) {
      // Remove assignment if no guests left
      actions.removeRoomAssignment(assignmentId);
    } else {
      // Update assignment with remaining guests
      const updatedAssignment = {
        ...assignment,
        guestIds: updatedGuestIds
      };
      
      const updatedAssignments = state.roomAssignments.map(a => 
        a.id === assignmentId ? updatedAssignment : a
      );
      actions.setRoomAssignments(updatedAssignments);
    }
  };

  // Get room occupancy (includes both existing DB assignments AND current session assignments)
  const getRoomOccupancy = (roomId: string) => {
    // Get existing assignments from database (via availableBeds calculation)
    const room = rooms.find(r => r.id === roomId);
    const existingAssignments = room?.assignedCount || 0;
    
    // Get current session assignments
    const sessionAssignment = state.roomAssignments.find(a => a.roomId === roomId);
    const sessionAssignments = sessionAssignment ? sessionAssignment.guestIds.length : 0;
    
    return existingAssignments + sessionAssignments;
  };
  
  // Get available beds (accounting for existing assignments)
  const getAvailableBeds = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    
    // Start with available beds from API (already accounts for DB assignments)
    const availableFromDb = room.availableBeds ?? room.maxOccupancy;
    
    // Subtract current session assignments
    const sessionAssignment = state.roomAssignments.find(a => a.roomId === roomId);
    const sessionAssignments = sessionAssignment ? sessionAssignment.guestIds.length : 0;
    
    return Math.max(0, availableFromDb - sessionAssignments);
  };

  // Get guest display name
  const getGuestName = (guestId: string) => {
    const guestNumber = parseInt(guestId.split('-')[1]) - 1; // Convert to 0-based index

    // First check participantNames (Step 2 data)
    const participant = state.participantNames[guestNumber];
    if (participant?.firstName) {
      return participant.firstName;
    }

    // Fallback to guestDetails (Step 4 data) if available
    const guest = state.guestDetails[guestNumber];
    if (guest?.firstName) {
      return guest.firstName;
    }

    // Final fallback to generic name
    return `Guest ${guestNumber + 1}`;
  };

  // Open image gallery
  const openGallery = (room: Room) => {
    setGalleryImages(room.images || []);
    setGalleryRoomName(room.name);
    setGalleryRoom(room);
    setGalleryOpen(true);
  };

  // Show loading state with skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Choose Your Accommodation</h3>
          <p className="text-gray-600">Loading room options...</p>
        </div>
        {/* Skeleton loaders for room cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-[10px] p-5 md:p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                {/* Thumbnail skeleton */}
                <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded w-20 mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-8 bg-gray-200 rounded-full w-24" />
                <div className="h-8 bg-gray-200 rounded-full w-32" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state with retry button
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Choose Your Accommodation</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Error loading rooms: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              size="default"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header - Optimized for conversion */}
      <div className="text-center space-y-2 pb-2">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Assign Guests to Rooms
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Assign each guest to their preferred room for your surf week experience
        </p>
      </div>

      {/* Selected Surf Week Summary - Optimized for conversion */}
      {(selectedSurfWeekData || state.selectedSurfWeek) && (
        <div className="bg-accent/5 rounded-[10px] p-5 md:p-6 border border-accent/20 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-accent-dark uppercase tracking-wide">Selected Surf Week</span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {selectedSurfWeekData?.name || 'Surf Week'}
              </h4>
              {dateRange && (
                <div className="flex items-center gap-2 text-sm md:text-base text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>{dateRange}</span>
                </div>
              )}
            </div>
            {selectedSurfWeekData?.price && (
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xs text-gray-600 mb-1 font-medium">Starting from</div>
                <div className="text-2xl md:text-3xl font-bold text-accent leading-tight">
                  {formatPrice(selectedSurfWeekData.price)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unassigned Guests */}
      {unassignedGuests.length > 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Users size={18} />
            Unassigned Guests ({unassignedGuests.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map(guestId => (
              <span
                key={guestId}
                className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
              >
                {getGuestName(guestId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Room Assignment Cards */}
      <div className="space-y-4 md:space-y-5">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available rooms...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Error loading rooms</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        ) : surfWeekRooms.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium mb-2">No rooms available</p>
            <p className="text-yellow-600 text-sm mb-4">
              {!selectedSurfWeekData 
                ? 'Surf week data not found. Please try selecting a different surf week.'
                : !surfCampStartDate || !surfCampEndDate
                ? 'Surf week dates are missing. Please contact support.'
                : rooms.length === 0
                ? 'No rooms are currently available for this surf week. Please try a different week or contact us for assistance.'
                : 'No rooms match the current filters. Please try adjusting your selection.'
              }
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-left text-xs font-mono">
                <p className="font-semibold mb-2">Debug Info:</p>
                <p>Selected Surf Week: {state.selectedSurfWeek || 'none'}</p>
                <p>Surf Week Data: {selectedSurfWeekData ? `found (${selectedSurfWeekData.name})` : 'not found'}</p>
                <p>Start Date: {surfCampStartDate?.toISOString() || 'invalid'}</p>
                <p>End Date: {surfCampEndDate?.toISOString() || 'invalid'}</p>
                <p>Rooms Count: {rooms.length}</p>
                <p>Surf Week Rooms Count: {surfWeekRooms.length}</p>
                <p>Loading: {loading ? 'yes' : 'no'}</p>
                <p>Error: {error || 'none'}</p>
              </div>
            )}
          </div>
        ) : (
          surfWeekRooms.map((transformedRoom) => {
            const originalRoom = rooms.find(r => r.id === transformedRoom.id);
            if (!originalRoom) return null;

          const occupancy = getRoomOccupancy(transformedRoom.id);
          const availableBeds = getAvailableBeds(transformedRoom.id);
          const existingAssignments = originalRoom.assignedCount || 0;
          const assignment = state.roomAssignments.find(a => a.roomId === transformedRoom.id);
          const isFull = availableBeds <= 0;
          
          // Calculate surf camp price for display
          const surfCampPricing = transformedRoom.surfCampPricing;
          let displayPrice = 0;
          let priceLabel = '/person';
          let occupancyPrices: Array<{occupancy: number, price: number}> = [];
          const isPrivateRoom = transformedRoom.type === 'private' || originalRoom?.bookingType === 'entire_room';
          
          if (surfCampPricing) {
            if (surfCampPricing.strategy === 'perBed' && surfCampPricing.perBed) {
              displayPrice = surfCampPricing.perBed;
            } else if (surfCampPricing.strategy === 'perRoomOccupancy' && surfCampPricing.occupancy) {
              // For private rooms, collect all occupancy prices for display
              const occupancyEntries = Object.entries(surfCampPricing.occupancy)
                .filter(([_, price]) => price > 0)
                .map(([occ, price]) => ({ occupancy: parseInt(occ), price: price as number }))
                .sort((a, b) => a.occupancy - b.occupancy);
              
              if (occupancyEntries.length > 0) {
                occupancyPrices = occupancyEntries;
                displayPrice = Math.min(...occupancyEntries.map(e => e.price));
                priceLabel = isPrivateRoom && occupancyEntries.length > 1 ? '/person (see rates below)' : '/person';
              }
            }
          }
          
          // Note: For surf camp bookings, we don't fall back to nightly rates
          // Only show pricing when surf camp specific pricing is configured

          return (
            <div
              key={transformedRoom.id}
              className={`border rounded-[10px] p-5 md:p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${
                assignment && assignment.guestIds.length > 0
                  ? 'border-accent bg-accent/5 shadow-card'
                  : 'border-gray-200 bg-white shadow-subtle hover:border-gray-300'
              }`}
            >
              {/* Room Header with Thumbnail */}
              <div className="flex items-start gap-4 mb-4">
                {/* Room Thumbnail - Using same pattern as RoomAssignment for consistency */}
                <div className="flex-shrink-0">
                  {originalRoom.images && originalRoom.images.length > 0 ? (
                    <RoomThumbnail
                      image={originalRoom.images[0]}
                      roomName={originalRoom.name}
                      onClick={() => openGallery(originalRoom)}
                      className="w-20 h-16"
                    />
                  ) : (
                    <div className="w-20 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* TOON-compliant icon-text gap (8px) */}
                  <div className="flex items-start gap-2 mb-2">
                    <Bed size={20} className="text-accent flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
                        {transformedRoom.name}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {transformedRoom.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing - Optimized alignment */}
                <div className="text-right ml-4 flex-shrink-0">
                  {transformedRoom.isIncluded ? (
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-1">
                        Included
                      </span>
                      <div className="text-base font-medium text-green-700">
                        No extra cost
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="text-2xl font-bold text-accent leading-tight mb-1">
                        from {formatPrice(displayPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {priceLabel}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Occupancy Pricing for Private Rooms */}
              {isPrivateRoom && occupancyPrices.length > 1 && !transformedRoom.isIncluded && (
                <div className="mb-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Pricing per person (based on room occupancy):</div>
                  <div className="flex flex-wrap gap-2">
                    {occupancyPrices.map(({ occupancy: occ, price }) => (
                      <div key={occ} className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-accent/20">
                        <span className="text-sm font-bold text-accent">{formatPrice(price)}</span>
                        <span className="text-sm text-gray-600">
                          ({occ} {occ === 1 ? 'person' : 'people'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Features */}
              {transformedRoom.features && transformedRoom.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {transformedRoom.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Capacity and Occupancy */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-base text-gray-600">
                  <Bed size={16} />
                  <span>{availableBeds} of {transformedRoom.maxOccupancy} beds available</span>
                </div>
                {existingAssignments > 0 && (
                  <div className="flex items-center gap-2 text-base text-accent">
                    <Users size={16} />
                    <span className="font-medium">
                      {existingAssignments} already booked
                    </span>
                  </div>
                )}
                {assignment && assignment.guestIds.length > 0 && (
                  <div className="flex items-center gap-2 text-base text-green-600">
                    <CheckCircle size={16} />
                    <span className="font-medium">
                      {assignment.guestIds.length} from your group
                    </span>
                  </div>
                )}
                {transformedRoom.type === 'private' && (
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-base font-medium text-gray-700">Premium</span>
                  </div>
                )}
              </div>

              {/* Assigned Guests */}
              {assignment && assignment.guestIds.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-base font-medium text-gray-700 mb-2">Assigned Guests:</h5>
                  <div className="flex flex-wrap gap-2">
                    {assignment.guestIds.map(guestId => (
                      <div
                        key={guestId}
                        className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-base"
                      >
                        <Check size={14} />
                        <span>{getGuestName(guestId)}</span>
                        <button
                          onClick={() => handleRemoveGuestFromRoom(assignment.id, guestId)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    </div>
                </div>
              )}

              {/* Assignment Actions */}
              {!isFull && unassignedGuests.length > 0 && (
                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Assign Guest to this Room:</h5>
                  <div className="flex flex-wrap gap-2">
                    {unassignedGuests.map(guestId => {
                      // Check if guest is already assigned to another room
                      const isAssignedElsewhere = state.roomAssignments.some(
                        a => a.roomId !== transformedRoom.id && a.guestIds.includes(guestId)
                      );

                      // Don't show guests assigned to other rooms (exclusivity)
                      if (isAssignedElsewhere) {
                        return null;
                      }

                      return (
                        <button
                          key={guestId}
                          onClick={() => handleAssignGuestToRoom(transformedRoom.id, guestId)}
                          className="inline-flex items-center gap-2 pl-4 pr-5 py-2.5 min-h-[44px] bg-orange-100 text-orange-800 rounded-[10px] text-sm font-medium border-2 border-transparent cursor-pointer transition-all duration-150 ease-out hover:bg-orange-200 hover:border-orange-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2"
                        >
                          <ArrowRight size={14} />
                          {getGuestName(guestId)}
                        </button>
                      );
                    })}
                  </div>
                    </div>
                  )}

              {isFull && (
                <div className="border-t pt-4">
                  <p className="text-base text-gray-500 italic">Room is at full capacity</p>
                </div>
              )}

              {/* View Photos Button */}
              {originalRoom.images && originalRoom.images.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    onClick={() => openGallery(originalRoom)}
                    variant="ghost"
                    size="default"
                    aria-label={`View ${originalRoom.images.length} photo${originalRoom.images.length > 1 ? 's' : ''} of ${transformedRoom.name}`}
                    className="bg-orange-50 text-accent hover:bg-orange-100 hover:text-accent-dark"
                  >
                    <Camera size={16} />
                    <span>View {originalRoom.images.length} Photo{originalRoom.images.length > 1 ? 's' : ''}</span>
                  </Button>
                </div>
              )}
            </div>
          );
          })
        )}
      </div>

      {/* Assignment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Assignment Summary</h4>
        <div className="text-base text-gray-600">
          <p>Total Guests: {state.guests}</p>
          <p>Assigned: {state.roomAssignments.flatMap(a => a.guestIds).length}</p>
          <p>Unassigned: {unassignedGuests.length}</p>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-base text-gray-500">
          All rooms include daily housekeeping, WiFi, and access to common areas.
          Dorm rooms are included in your surf week package. Private rooms are available as upgrades.
        </p>
      </div>

      {/* Room Image Gallery Modal */}
      <RoomImageGallery
        images={galleryImages}
        roomName={galleryRoomName}
        roomDescription={galleryRoom?.description}
        roomAmenities={galleryRoom?.amenities}
        roomType={galleryRoom?.type}
        maxOccupancy={galleryRoom?.maxOccupancy}
        pricePerNight={galleryRoom?.pricePerNight}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
