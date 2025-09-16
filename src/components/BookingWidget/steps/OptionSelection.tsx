import { useEffect, useState } from 'react';
import { MapPin, Users, Star, Check, Clock, Wifi, Car, Utensils, Calendar, Minus, Plus } from 'lucide-react';
import { BookingState, PricingBreakdown } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { RoomImageGallery, RoomHeroImage } from '../components/RoomImageGallery';

interface OptionSelectionProps {
  state: BookingState;
  actions: {
    selectOption: (optionId: string) => void;
    setSurfWeek: (surfWeekId: string) => void;
    setDates: (checkIn: Date, checkOut: Date) => void;
    setGuests: (count: number) => void;
    updatePricing: (pricing: PricingBreakdown) => void;
  };
}

export function OptionSelection({ state, actions }: OptionSelectionProps) {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms({
    checkIn: state.dates.checkIn,
    checkOut: state.dates.checkOut,
    guests: state.guests,
  });
  const { surfCamps, loading: campsLoading, error: campsError } = useSurfCamps();
  const [selectedOption, setSelectedOption] = useState<string | null>(state.selectedOption);

  // Image gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryRoomName, setGalleryRoomName] = useState('');
  const [galleryRoom, setGalleryRoom] = useState<any>(null);

  // Local state for room booking dates
  const [checkInDate, setCheckInDate] = useState(
    state.dates.checkIn?.toISOString().split('T')[0] || ''
  );
  const [checkOutDate, setCheckOutDate] = useState(
    state.dates.checkOut?.toISOString().split('T')[0] || ''
  );

  // For surf weeks, if a surf week was already selected in step 2, auto-select it here
  if (state.experienceType === 'surf-week' && state.selectedSurfWeek && !state.selectedOption) {
    actions.selectOption(state.selectedSurfWeek);
  }

  const loading = state.experienceType === 'room' ? roomsLoading : campsLoading;
  const error = state.experienceType === 'room' ? roomsError : campsError;
  const options = state.experienceType === 'room' ? rooms : surfCamps;

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    actions.selectOption(optionId);

    // For surf weeks, also set the surf week state
    if (state.experienceType === 'surf-week') {
      actions.setSurfWeek(optionId);
    }
  };

  const handleCheckInChange = (dateStr: string) => {
    setCheckInDate(dateStr);
    if (dateStr && checkOutDate) {
      const checkIn = new Date(dateStr);
      const checkOut = new Date(checkOutDate);
      if (checkIn < checkOut) {
        actions.setDates(checkIn, checkOut);
      }
    }
  };

  const handleCheckOutChange = (dateStr: string) => {
    setCheckOutDate(dateStr);
    if (checkInDate && dateStr) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(dateStr);
      if (checkIn < checkOut) {
        actions.setDates(checkIn, checkOut);
      }
    }
  };

  // Auto-select for room bookings when dates and guests are set
  useEffect(() => {
    if (state.experienceType === 'room' && state.dates.checkIn && state.dates.checkOut && state.guests > 0 && !selectedOption) {
      // Auto-select a dummy option for room bookings to allow progression
      const dummyOptionId = 'room-dates-selected';
      setSelectedOption(dummyOptionId);
      actions.selectOption(dummyOptionId);
    }
  }, [state.experienceType, state.dates.checkIn, state.dates.checkOut, state.guests, selectedOption, actions]);

  // Recompute base price and totals when selection/dates/guests change
  useEffect(() => {
    if (!selectedOption) return;
    const opt: any = (options as any[]).find((o) => o.id === selectedOption);
    if (!opt) return;

    let basePrice = 0;
    if (state.experienceType === 'room') {
      if (state.dates.checkIn && state.dates.checkOut) {
        const nights = Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const unit = typeof opt.pricePerNight === 'number' ? opt.pricePerNight : (opt.price ?? 0);
        basePrice = unit * nights;
      }
    } else if (state.experienceType === 'surf-week') {
      const unit = typeof opt.price === 'number' ? opt.price : (opt.priceFrom ?? 0);
      basePrice = unit * Math.max(1, state.guests);
    }

    if (basePrice > 0) {
      const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
      const taxes = Math.round((basePrice + addOnsSubtotal) * 0.1);
      const fees = Math.round((basePrice + addOnsSubtotal) * 0.05);
      const total = basePrice + addOnsSubtotal + taxes + fees;
      actions.updatePricing({ ...state.pricing, basePrice, taxes, fees, total, currency: 'EUR' });
    }
  }, [selectedOption, state.dates.checkIn, state.dates.checkOut, state.guests, state.experienceType, options]);

  const adjustGuests = (delta: number) => {
    const newCount = Math.max(1, Math.min(12, state.guests + delta));
    actions.setGuests(newCount);
  };

  // Open image gallery
  const openGallery = (room: any) => {
    setGalleryImages(room.images || []);
    setGalleryRoomName(room.name);
    setGalleryRoom(room);
    setGalleryOpen(true);
  };

  // Enhanced room assignment: Remove capacity restrictions - all rooms show normally
  const canAccommodateGuests = (room: any) => {
    return true; // Always return true to show all rooms normally
  };

  // Enhanced room assignment: No capacity warnings needed
  const getRoomsExceedingCapacity = () => {
    return []; // Always return empty array to remove capacity warnings
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi size={16} />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('transport')) return <Car size={16} />;
    if (lowerAmenity.includes('meal') || lowerAmenity.includes('food')) return <Utensils size={16} />;
    return <Check size={16} />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalPrice = (option: any) => {
    if (state.experienceType === 'room') {
      if (state.dates.checkIn && state.dates.checkOut) {
        const nights = Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return option.pricePerNight * nights;
      }
      return undefined; // Wait for dates to avoid NaN
    }
    return option.price ?? undefined;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
          </h3>
          <p className="text-gray-600">
            Loading available options...
          </p>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-48 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
          </h3>
          <p className="text-red-600">
            Error loading options: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
        </h3>
        <p className="text-gray-600">
          {state.experienceType === 'room'
            ? 'Select your dates and find the perfect room'
            : 'Select your perfect surf adventure'
          }
        </p>
      </div>

      {/* Inline Date Picker and Guest Counter for Rooms */}
      {state.experienceType === 'room' && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
          {/* Date Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
              Select Dates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="check-in" className="block text-sm font-medium text-gray-700">
                  Check-in
                </label>
                <input
                  id="check-in"
                  type="date"
                  value={checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="check-out" className="block text-sm font-medium text-gray-700">
                  Check-out
                </label>
                <input
                  id="check-out"
                  type="date"
                  value={checkOutDate}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleCheckOutChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Guest Counter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              Number of Guests
            </h4>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Guests</div>
                <div className="text-sm text-gray-600">How many people will be staying?</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustGuests(-1)}
                  disabled={state.guests <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  aria-label="Decrease guest count"
                >
                  <Minus size={16} />
                </button>

                <span className="w-12 text-center text-lg font-semibold text-gray-900">
                  {state.guests}
                </span>

                <button
                  onClick={() => adjustGuests(1)}
                  disabled={state.guests >= 12}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  aria-label="Increase guest count"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Counter for Surf Weeks */}
      {state.experienceType === 'surf-week' && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-orange-500" />
            Number of Participants
          </h4>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Participants</div>
              <div className="text-sm text-gray-600">How many people will join the surf camp?</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => adjustGuests(-1)}
                disabled={state.guests <= 1}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                aria-label="Decrease participant count"
              >
                <Minus size={16} />
              </button>

              <span className="w-12 text-center text-lg font-semibold text-gray-900">
                {state.guests}
              </span>

              <button
                onClick={() => adjustGuests(1)}
                disabled={state.guests >= 12}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                aria-label="Increase participant count"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Date Summary */}
          {state.dates.checkIn && state.dates.checkOut && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">
                  Duration: {Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                </span>
                <span className="text-sm text-orange-600">
                  {state.dates.checkIn.toLocaleDateString()} - {state.dates.checkOut.toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced room assignment: Removed capacity warnings - all rooms show normally */}

      {/* Options Grid */}
      {state.experienceType === 'surf-week' ? (
        <div className="space-y-4">
          {options.map((w: any, index: number) => {
            const isSelected = selectedOption === w.id;
            const from = typeof w.priceFrom === 'number' ? w.priceFrom : w.price;
            const start = new Date(w.startDate);
            const end = new Date(w.endDate);
            const dateText = `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} > ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;

            // Enhanced occupancy display logic
            let occupancyText = '';
            if (typeof w.confirmedBooked === 'number' && typeof w.maxParticipants === 'number') {
              occupancyText = `${w.confirmedBooked}/${w.maxParticipants} booked`;
            } else if (typeof w.availableSpots === 'number') {
              occupancyText = w.availableSpots > 0 ? `${w.availableSpots} spots left` : 'Fully booked';
            }

            const isFullyBooked = w.availableSpots === 0;

            return (
              <button
                key={w.id}
                data-testid="surf-week-row"
                onClick={() => handleOptionSelect(w.id)}
                className={`w-full p-6 rounded-xl border-2 bg-white text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 relative
                  ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500/30' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'}
                  ${isFullyBooked ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
                disabled={isFullyBooked}
              >
                <div className="flex gap-6">
                  {/* Surf Week Hero Image */}
                  <div className="flex-shrink-0">
                    {w.images && w.images.length > 0 ? (
                      <RoomHeroImage
                        image={w.images[0]}
                        roomName={w.name}
                        onClick={() => openGallery(w)}
                        className="w-32 h-24"
                      />
                    ) : (
                      <div className="w-32 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <div className="text-white text-2xl font-bold">🏄‍♂️</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title and Price */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{dateText}</div>
                        <div className="text-orange-500 font-extrabold uppercase tracking-wide text-sm mt-1" data-testid="surf-week-title">{w.name}</div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {w.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {`from €${Math.round(from)}`}
                        </div>
                        <div className="text-xs text-gray-500">per person</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>Up to {w.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span className="capitalize">{w.level} level</span>
                      </div>
                    </div>

                    {/* Includes */}
                    {w.includes && w.includes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {w.includes.slice(0, 3).map((include: string, index: number) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                          >
                            <Check size={10} />
                            {include}
                          </span>
                        ))}
                        {w.includes.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            +{w.includes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Occupancy and View Photos */}
                    <div className="flex items-center justify-between">
                      <div className={`text-xs ${isFullyBooked ? 'text-red-500 font-medium' : 'text-gray-500'}`} data-testid="surf-week-occupancy">
                        {occupancyText}
                      </div>

                      {/* View Photos Button */}
                      {w.images && w.images.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(w);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                        >
                          📸 View {w.images.length} Photo{w.images.length > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="mt-4 flex items-center gap-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Room Booking - Only show availability message, not room options */
        <div className="space-y-6">
          {state.dates.checkIn && state.dates.checkOut && state.guests > 0 ? (
            <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-green-900 mb-2">Dates & Guests Selected</h4>
              <p className="text-green-700 mb-4">
                {state.guests} guest{state.guests !== 1 ? 's' : ''} • {Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} night{Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-green-600">
                {state.dates.checkIn.toLocaleDateString()} - {state.dates.checkOut.toLocaleDateString()}
              </p>
              <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">
                  <strong>Next:</strong> You'll be able to choose from available rooms that match your dates and guest count.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Selection</h4>
              <p className="text-gray-600">
                Please select your check-in/check-out dates and number of guests above to continue.
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Options Message */}
      {options.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No {state.experienceType === 'room' ? 'rooms' : 'surf weeks'} available for your selected dates.
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {state.experienceType === 'room'
            ? 'All rooms include WiFi, linens, and access to common areas.'
            : 'All surf weeks include accommodation, meals, equipment, and professional coaching.'
          }
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
