import { useState, useRef, useEffect } from 'react';
import { Bed, Users, Star, ArrowRight, Calendar, CheckCircle, Check } from 'lucide-react';
import { BookingState, Room, PricingBreakdown, RoomAssignment as RoomAssignmentType, SurfCampPricing } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { RoomImageGallery, RoomThumbnail } from '../components/RoomImageGallery';

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

// Calculate surf camp price for a room based on occupancy
const calculateSurfCampRoomPrice = (room: Room, guestCount: number): number => {
  // If dorm room, it's included in package
  if (room.type === 'dorm') {
    return 0;
  }

  const surfCampPricing = room.pricing?.surfCamp;
  
  // Use surf camp pricing if configured
  if (surfCampPricing) {
    if (surfCampPricing.strategy === 'perBed' && surfCampPricing.perBed) {
      // Fixed price per person
      return surfCampPricing.perBed * guestCount;
    } else if (surfCampPricing.strategy === 'perRoomOccupancy' && surfCampPricing.occupancy) {
      // Tiered pricing based on occupancy
      const pricePerPerson = surfCampPricing.occupancy[guestCount] || surfCampPricing.occupancy[1] || 0;
      return pricePerPerson * guestCount;
    }
  }
  
  // Fallback to pricePerNight × 7 days if no surf camp pricing configured
  return room.pricePerNight * 7 * guestCount;
};

export function SurfWeekRoomSelection({ state, actions }: SurfWeekRoomSelectionProps) {
  const [unassignedGuests, setUnassignedGuests] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Image gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryRoomName, setGalleryRoomName] = useState('');
  const [galleryRoom, setGalleryRoom] = useState<Room | null>(null);

  // Fetch real room data (no date filtering needed for surf weeks)
  const { rooms, loading, error } = useRooms({
    checkIn: null,
    checkOut: null,
    guests: 1
  });

  // Fetch surf week details to display selected surf week info
  const { surfCamps } = useSurfCamps();
  const selectedSurfWeekData = surfCamps.find(camp => camp.id === state.selectedSurfWeek);
  
  // Initialize guest IDs
  useEffect(() => {
    const guestIds = Array.from({ length: state.guests }, (_, i) => `guest-${i + 1}`);
    const assignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
    const unassigned = guestIds.filter(id => !assignedGuestIds.includes(id));
    setUnassignedGuests(unassigned);
  }, [state.guests, state.roomAssignments]);

  // Calculate pricing based on room assignments for surf weeks
  useEffect(() => {
    if (state.roomAssignments.length === 0 || rooms.length === 0) {
      // If no assignments, reset room upgrade to 0
      if (actions.updatePricing) {
        const basePrice = state.pricing.basePrice || 0;
        const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
        const subtotal = basePrice + addOnsSubtotal;
        const taxes = Math.round(subtotal * 0.1);
        const fees = Math.round(subtotal * 0.05);
        const total = subtotal + taxes + fees;

        actions.updatePricing({
          ...state.pricing,
          roomUpgrade: 0,
          taxes,
          fees,
          total,
        });
      }
      return;
    }

    // Calculate total room upgrade cost for surf week using surf camp pricing
    let totalRoomUpgrade = 0;

    state.roomAssignments.forEach(assignment => {
      const room = rooms.find(r => r.id === assignment.roomId);
      if (room) {
        // Use surf camp pricing calculation (handles perBed and perRoomOccupancy strategies)
        const roomUpgradeCost = calculateSurfCampRoomPrice(room, assignment.guestIds.length);
        totalRoomUpgrade += roomUpgradeCost;
        
        // Log pricing for debugging
        console.log(`🏠 Room "${room.name}" pricing:`, {
          guestCount: assignment.guestIds.length,
          surfCampPricing: room.pricing?.surfCamp,
          calculatedCost: roomUpgradeCost,
        });
      }
    });

    // Update pricing with room upgrade
    if (actions.updatePricing) {
      const basePrice = state.pricing.basePrice || 0;
      const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
      const subtotal = basePrice + totalRoomUpgrade + addOnsSubtotal;
      const taxes = Math.round(subtotal * 0.1); // 10% tax
      const fees = Math.round(subtotal * 0.05); // 5% service fee
      const total = subtotal + taxes + fees;

      actions.updatePricing({
        ...state.pricing,
        roomUpgrade: totalRoomUpgrade,
        taxes,
        fees,
        total,
      });
    }
  }, [state.roomAssignments, rooms, state.pricing, actions]);

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

  // Get room occupancy
  const getRoomOccupancy = (roomId: string) => {
    const assignment = state.roomAssignments.find(a => a.roomId === roomId);
    return assignment ? assignment.guestIds.length : 0;
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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Choose Your Accommodation</h3>
          <p className="text-gray-600">Loading room options...</p>
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
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Error loading rooms: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Try Again
            </button>
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
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          Assign Guests to Rooms
        </h3>
        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Assign each guest to their preferred room for your surf week experience
        </p>
      </div>

      {/* Selected Surf Week Summary - Optimized for conversion */}
      {(selectedSurfWeekData || state.selectedSurfWeek) && (
        <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 rounded-xl p-5 md:p-6 border-2 border-orange-300 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Selected Surf Week</span>
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {selectedSurfWeekData?.name || 'Surf Week'}
              </h4>
              {dateRange && (
                <div className="flex items-center gap-2 text-sm md:text-base text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>{dateRange}</span>
                </div>
              )}
            </div>
            {selectedSurfWeekData?.price && (
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xs text-gray-600 mb-1 font-medium">Starting from</div>
                <div className="text-2xl md:text-3xl font-bold text-orange-600 leading-tight">
                  {formatPrice(selectedSurfWeekData.price)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unassigned Guests */}
      {unassignedGuests.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
            <Users size={18} />
            Unassigned Guests ({unassignedGuests.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map(guestId => (
              <span
                key={guestId}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
              >
                {getGuestName(guestId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Room Assignment Cards */}
      <div className="space-y-4 md:space-y-5">
        {surfWeekRooms.map((transformedRoom) => {
          const originalRoom = rooms.find(r => r.id === transformedRoom.id);
          if (!originalRoom) return null;

          const occupancy = getRoomOccupancy(transformedRoom.id);
          const assignment = state.roomAssignments.find(a => a.roomId === transformedRoom.id);
          const isFull = occupancy >= transformedRoom.maxOccupancy;
          
          // Calculate surf camp price for display (show per person price for 1 person)
          const surfCampPricing = transformedRoom.surfCampPricing;
          let displayPrice = 0;
          let priceLabel = '/person';
          
          if (surfCampPricing) {
            if (surfCampPricing.strategy === 'perBed' && surfCampPricing.perBed) {
              displayPrice = surfCampPricing.perBed;
            } else if (surfCampPricing.strategy === 'perRoomOccupancy' && surfCampPricing.occupancy) {
              // Show range: highest (1 person) to lowest price
              const prices = Object.values(surfCampPricing.occupancy).filter(p => p > 0);
              if (prices.length > 0) {
                displayPrice = Math.min(...prices); // Show lowest price
                priceLabel = '/person (from)';
              }
            }
          }
          
          // Fallback to pricePerNight × 7 if no surf camp pricing
          if (!displayPrice && transformedRoom.pricePerNight > 0) {
            displayPrice = transformedRoom.pricePerNight * 7;
            priceLabel = '/week';
          }

          return (
            <div
              key={transformedRoom.id}
              className={`border-2 rounded-xl p-5 md:p-6 transition-all duration-300 ${
                assignment && assignment.guestIds.length > 0
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Room Header with Thumbnail */}
              <div className="flex items-start gap-4 mb-4">
                {/* Room Thumbnail */}
                <div className="flex-shrink-0">
                  {(originalRoom?.images && originalRoom.images.length > 0) || transformedRoom.image ? (
                    <RoomThumbnail
                      image={originalRoom?.images?.[0] || transformedRoom.image || '/images/room-placeholder.jpg'}
                      roomName={transformedRoom.name}
                      onClick={() => openGallery(originalRoom)}
                      className="w-20 h-15"
                    />
                  ) : (
                    <div className="w-20 h-15 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
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
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-1">
                        Included
                      </span>
                      <div className="text-sm font-medium text-green-700">
                        No extra cost
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="text-xl font-bold text-orange-600 leading-tight mb-1">
                        +{formatPrice(displayPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {priceLabel}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Features */}
              {transformedRoom.features && transformedRoom.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {transformedRoom.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Capacity and Occupancy */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bed size={16} />
                  <span>Up to {transformedRoom.maxOccupancy} {transformedRoom.maxOccupancy === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} />
                  <span className={occupancy > 0 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                    {occupancy}/{transformedRoom.maxOccupancy} assigned
                  </span>
                </div>
                {transformedRoom.type === 'private' && (
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">Premium</span>
                  </div>
                )}
              </div>

              {/* Assigned Guests */}
              {assignment && assignment.guestIds.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Guests:</h5>
                  <div className="flex flex-wrap gap-2">
                    {assignment.guestIds.map(guestId => (
                      <div
                        key={guestId}
                        className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
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
                          className="flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors border-2 border-transparent hover:border-orange-300"
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
                  <p className="text-sm text-gray-500 italic">Room is at full capacity</p>
                </div>
              )}

              {/* View Photos Button */}
              {originalRoom.images && originalRoom.images.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => openGallery(originalRoom)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200 hover:shadow-sm"
                    aria-label={`View ${originalRoom.images.length} photo${originalRoom.images.length > 1 ? 's' : ''} of ${transformedRoom.name}`}
                  >
                    <span>📸</span>
                    <span>View {originalRoom.images.length} Photo{originalRoom.images.length > 1 ? 's' : ''}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Assignment Summary</h4>
        <div className="text-sm text-gray-600">
          <p>Total Guests: {state.guests}</p>
          <p>Assigned: {state.roomAssignments.flatMap(a => a.guestIds).length}</p>
          <p>Unassigned: {unassignedGuests.length}</p>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
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
