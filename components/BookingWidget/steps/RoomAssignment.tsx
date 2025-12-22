import { useState, useEffect, useRef } from 'react';
import { Users, Bed, ArrowRight, Check } from 'lucide-react';
import { BookingState, RoomAssignment as RoomAssignmentType, Room, PricingBreakdown } from '../types';
import { useRooms } from '../hooks/useRooms';
import { RoomImageGallery, RoomThumbnail } from '../components/RoomImageGallery';

interface RoomAssignmentProps {
  state: BookingState;
  actions: {
    setRoomAssignments: (assignments: RoomAssignmentType[]) => void;
    addRoomAssignment: (assignment: RoomAssignmentType) => void;
    removeRoomAssignment: (assignmentId: string) => void;
    updatePricing?: (pricing: PricingBreakdown) => void;
    nextStep: () => void;
  };
}

export function RoomAssignment({ state, actions }: RoomAssignmentProps) {
  const { rooms, loading, error } = useRooms({
    checkIn: state.dates.checkIn,
    checkOut: state.dates.checkOut,
    guests: state.guests,
  });

  const [unassignedGuests, setUnassignedGuests] = useState<string[]>([]);

  // Image gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryRoomName, setGalleryRoomName] = useState('');
  const [galleryRoom, setGalleryRoom] = useState<Room | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize guest IDs
  useEffect(() => {
    const guestIds = Array.from({ length: state.guests }, (_, i) => `guest-${i + 1}`);
    const assignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
    const unassigned = guestIds.filter(id => !assignedGuestIds.includes(id));
    setUnassignedGuests(unassigned);
  }, [state.guests, state.roomAssignments]);

  // Calculate pricing based on room assignments
  useEffect(() => {
    if (state.roomAssignments.length === 0 || rooms.length === 0) return;

    // Calculate total price across all assigned rooms
    let totalBasePrice = 0;

    // Calculate nights
    if (state.dates.checkIn && state.dates.checkOut) {
      const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
      const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
      const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));

      // Sum prices for each room assignment
      state.roomAssignments.forEach(assignment => {
        const room = rooms.find(r => r.id === assignment.roomId);
        if (room) {
          // Pricing logic:
          // - entire_room: charge once per room per night (occupancy doesn't multiply price)
          // - per_bed: charge per guest per night
          const bookingType = room.bookingType || 'entire_room';
          const roomPrice =
            bookingType === 'per_bed'
              ? room.pricePerNight * assignment.guestIds.length * nights
              : room.pricePerNight * nights;
          totalBasePrice += roomPrice;
        }
      });

      // Update pricing with new base price
      if (totalBasePrice > 0 && actions.updatePricing) {
        const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
        const taxes = Math.round((totalBasePrice + addOnsSubtotal) * 0.1);
        const fees = Math.round((totalBasePrice + addOnsSubtotal) * 0.05);
        const total = totalBasePrice + addOnsSubtotal + taxes + fees;

        actions.updatePricing({
          ...state.pricing,
          basePrice: totalBasePrice,
          taxes,
          fees,
          total,
          currency: 'EUR'
        });
      }
    }
  }, [state.roomAssignments, state.dates.checkIn, state.dates.checkOut, rooms, state.pricing, actions]);

  // Auto-advance when all guests are assigned (only for multiple guests)
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
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.roomAssignments, state.guests, actions]);

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

  const getRoomOccupancy = (roomId: string) => {
    const assignment = state.roomAssignments.find(a => a.roomId === roomId);
    return assignment ? assignment.guestIds.length : 0;
  };

  // Enhanced room assignment: Display actual guest names instead of "Guest 1, Guest 2"
  // Priority: participantNames (Step 2) > guestDetails (Step 4) > generic fallback
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec681c] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading room options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-600">
          <p>Error loading rooms: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Assign Guests to Rooms
        </h3>
        <p className="text-lg text-gray-600">
          Assign each guest to their preferred room and bed
        </p>
      </div>

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
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-base font-medium"
              >
                {getGuestName(guestId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Room Assignment Cards */}
      <div className="space-y-4">
        {rooms.map(room => {
          const occupancy = getRoomOccupancy(room.id);
          const assignment = state.roomAssignments.find(a => a.roomId === room.id);
          const isFull = occupancy >= room.maxOccupancy;

          return (
            <div
              key={room.id}
              className={`border rounded-[10px] p-6 transition-all duration-300 ${
                assignment ? 'border-[#ec681c] bg-orange-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Room Thumbnail */}
                <div className="flex-shrink-0">
                  {room.images && room.images.length > 0 ? (
                    <RoomThumbnail
                      image={room.images[0]}
                      roomName={room.name}
                      onClick={() => openGallery(room)}
                      className="w-20 h-16"
                    />
                  ) : (
                    <div className="w-20 h-16 bg-gradient-to-br from-[#ec681c] to-[#d65d16] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏠</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{room.name}</h4>
                      <p className="text-gray-600 text-base">{room.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        €{room.pricePerNight}
                      </div>
                      <div className="text-base text-gray-600">per night</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-base text-gray-600">
                  <Bed size={16} />
                  <span>Up to {room.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center gap-2 text-base">
                  <Users size={16} />
                  <span className={occupancy > 0 ? 'text-[#ec681c] font-medium' : 'text-gray-600'}>
                    {occupancy}/{room.maxOccupancy} assigned
                  </span>
                </div>
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
                  <h5 className="text-base font-medium text-gray-700 mb-2">Assign Guest to this Room:</h5>
                  <div className="flex flex-wrap gap-2">
                    {unassignedGuests.map(guestId => {
                      // Check if guest is already assigned to another room
                      const isAssignedElsewhere = state.roomAssignments.some(
                        a => a.roomId !== room.id && a.guestIds.includes(guestId)
                      );

                      // Don't show guests assigned to other rooms (exclusivity)
                      if (isAssignedElsewhere) {
                        return null;
                      }

                      return (
                        <button
                          key={guestId}
                          onClick={() => handleAssignGuestToRoom(room.id, guestId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: '#fed7aa',
                            color: '#9a3412',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            border: '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 150ms ease-out',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fdba74';
                            e.currentTarget.style.borderColor = '#fb923c';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fed7aa';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
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
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Assignment Summary</h4>
        <div className="text-base text-gray-600">
          <p>Total Guests: {state.guests}</p>
          <p>Assigned: {state.roomAssignments.flatMap(a => a.guestIds).length}</p>
          <p>Unassigned: {unassignedGuests.length}</p>
        </div>
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
