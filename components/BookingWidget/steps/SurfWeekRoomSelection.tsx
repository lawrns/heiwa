import { useState, useRef, useEffect } from 'react';
import { Bed, Users, Star, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { BookingState, Room, PricingBreakdown } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { RoomImageGallery, RoomHeroImage } from '../components/RoomImageGallery';

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
}

interface SurfWeekRoomSelectionProps {
  state: BookingState;
  actions: {
    setSurfWeekRoom: (roomId: string) => void;
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
    image: room.images[0] || '/images/room-placeholder.jpg'
  };
};

export function SurfWeekRoomSelection({ state, actions }: SurfWeekRoomSelectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(state.selectedSurfWeekRoom);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectedRoomRef = useRef<string | null>(null);

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
  
  // Cleanup on unmount - MUST be called before any conditional returns
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  // Open image gallery
  const openGallery = (room: TransformedRoom) => {
    const originalRoom = rooms.find(r => r.id === room.id);
    setGalleryImages(originalRoom?.images || []);
    setGalleryRoomName(room.name);
    setGalleryRoom(originalRoom || null);
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

  const handleRoomSelection = (roomId: string) => {
    // Cancel any pending auto-advance
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Validate room capacity before allowing selection
    const room = surfWeekRooms.find(r => r.id === roomId);
    if (room && state.guests > room.maxOccupancy) {
      // Show error - room cannot accommodate all guests
      alert(`This room can only accommodate ${room.maxOccupancy} guest${room.maxOccupancy === 1 ? '' : 's'}, but you have ${state.guests} guest${state.guests === 1 ? '' : 's'}. Please select a room with sufficient capacity or reduce the number of guests.`);
      return;
    }

    setSelectedRoom(roomId);
    actions.setSurfWeekRoom(roomId);
    lastSelectedRoomRef.current = roomId;

    // Calculate pricing based on room selection
    const room = surfWeekRooms.find(r => r.id === roomId);
    if (room && state.selectedSurfWeek) {
      // Get surf week duration (assuming 7 days for now)
      const surfWeekDuration = 7;
      const roomUpgradeTotal = room.pricePerNight * surfWeekDuration;

      // Recalculate pricing with room upgrade included in base calculation
      const basePrice = state.pricing.basePrice;
      const addOnsSubtotal = state.pricing.addOnsSubtotal;
      const subtotal = basePrice + roomUpgradeTotal + addOnsSubtotal;
      const taxes = Math.round(subtotal * 0.1); // 10% tax
      const fees = Math.round(subtotal * 0.05); // 5% service fee
      const total = subtotal + taxes + fees;

      actions.updatePricing({
        ...state.pricing,
        roomUpgrade: roomUpgradeTotal,
        taxes,
        fees,
        total,
      });
    }

    // Auto-advance after brief delay
    timeoutRef.current = setTimeout(() => {
      // Use ref to check selection since state might not be updated yet
      if (lastSelectedRoomRef.current === roomId) {
        actions.nextStep();
      }
      timeoutRef.current = null;
    }, 300);
  };

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
          Choose Your Accommodation
        </h3>
        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Select your preferred room type for your surf week experience
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

      {/* Room Options - Optimized spacing and layout */}
      <div className="space-y-4 md:space-y-5">
        {surfWeekRooms.map((room) => {
          const isSelected = selectedRoom === room.id;
          const weeklyUpgrade = room.pricePerNight * 7; // 7 days

          return (
            <div
              key={room.id}
              onClick={() => handleRoomSelection(room.id)}
              className={`
                relative p-5 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20 scale-[1.01]'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-md'
                }
              `}
              role="button"
              tabIndex={0}
              aria-label={`Select ${room.name} room${room.isIncluded ? ' (included)' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRoomSelection(room.id);
                }
              }}
            >
              {/* Room Header with Thumbnail */}
              <div className="flex items-start gap-4 mb-4">
                {/* Room Thumbnail */}
                <div className="flex-shrink-0">
                  <RoomHeroImage
                    image={room.image}
                    roomName={room.name}
                    onClick={() => openGallery(room)}
                    className="w-20 h-20"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Bed size={20} className="text-accent flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
                        {room.name}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing - Optimized alignment */}
                <div className="text-right ml-4 flex-shrink-0">
                  {room.isIncluded ? (
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
                        +{formatPrice(weeklyUpgrade)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPrice(room.pricePerNight)}/night
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Features - Optimized spacing */}
              {room.features && room.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {room.features.map((feature, index) => (
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

              {/* Room Details and View Photos - Optimized for conversion */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-gray-400" />
                    <span className="font-medium">Up to {room.maxOccupancy} {room.maxOccupancy === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  {room.type === 'private' && (
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-700">Premium</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* View Photos Button - Optimized */}
                  {(() => {
                    const roomImages = rooms.find(r => r.id === room.id)?.images;
                    if (roomImages && roomImages.length > 0) {
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(room);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200 hover:shadow-sm flex-shrink-0"
                          aria-label={`View ${roomImages.length} photo${roomImages.length > 1 ? 's' : ''} of ${room.name}`}
                        >
                          <span>📸</span>
                          <span>View {roomImages.length} Photo{roomImages.length > 1 ? 's' : ''}</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

                  {/* Selection Indicator - Optimized */}
                  {isSelected && (
                    <div className="flex items-center gap-2 text-orange-600 font-semibold ml-auto sm:ml-0">
                      <CheckCircle size={18} className="fill-current" />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Border Effect */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-orange-500 pointer-events-none">
                  <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary - Optimized for conversion */}
      {selectedRoom && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-300 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h5 className="font-bold text-orange-900 text-lg mb-1">Selected Room</h5>
              <p className="text-base font-medium text-orange-800">
                {surfWeekRooms.find(r => r.id === selectedRoom)?.name}
              </p>
            </div>
            <div className="text-right sm:text-left sm:ml-4">
              {(() => {
                const room = surfWeekRooms.find(r => r.id === selectedRoom)
                if (!room) return null
                return room.isIncluded ? (
                  <div className="flex flex-col items-end sm:items-start">
                    <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full mb-1">
                      Included
                    </span>
                    <div className="text-green-700 font-semibold text-sm">No extra cost</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end sm:items-start">
                    <div className="text-orange-600 font-bold text-lg">
                      +{formatPrice(room.pricePerNight * 7)}
                    </div>
                    <div className="text-xs text-gray-600">weekly upgrade</div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          All rooms include daily housekeeping, WiFi, and access to common areas.
          Private rooms can be upgraded at any time during your stay.
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
