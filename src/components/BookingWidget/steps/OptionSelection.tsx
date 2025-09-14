import { useEffect, useState } from 'react';
import { MapPin, Users, Star, Check, Clock, Wifi, Car, Utensils, Calendar, Minus, Plus } from 'lucide-react';
import { BookingState, PricingBreakdown } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';

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

  // Check if a room can accommodate the current guest count
  const canAccommodateGuests = (room: any) => {
    return room.maxOccupancy >= state.guests;
  };

  // Get rooms that exceed capacity for warning display
  const getRoomsExceedingCapacity = () => {
    if (state.experienceType !== 'room') return [];
    return (options as any[]).filter(room => !canAccommodateGuests(room));
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

      {/* Capacity Warning for Rooms */}
      {state.experienceType === 'room' && getRoomsExceedingCapacity().length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Some rooms cannot accommodate {state.guests} guests
              </h4>
              <p className="text-sm text-amber-700">
                Rooms that exceed capacity are disabled. Consider reducing guest count or selecting a larger room.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Options Grid */}
      {state.experienceType === 'surf-week' ? (
        <div className="space-y-3">
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
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 bg-white text-left transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 relative
                  ${isSelected ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500/30' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'}
                  ${isFullyBooked ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
                disabled={isFullyBooked}
              >
                <div className="min-w-[140px]" data-testid="surf-week-dates">
                  <div className="text-lg font-bold text-gray-900">{dateText}</div>
                </div>
                <div className="flex-1 px-4">
                  <div className="text-orange-500 font-extrabold uppercase tracking-wide text-sm" data-testid="surf-week-title">{w.name}</div>
                  <div className={`text-xs mt-0.5 ${isFullyBooked ? 'text-red-500 font-medium' : 'text-gray-500'}`} data-testid="surf-week-occupancy">
                    {occupancyText}
                  </div>
                </div>
                <div className="shrink-0" data-testid="surf-week-price">
                  <span className={`inline-block rounded-full px-4 py-2 font-semibold shadow-sm ${isFullyBooked ? 'bg-gray-400 text-gray-200' : 'bg-orange-500 text-white'}`}>
                    {`from €${Math.round(from)}`}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {(options as any[]).map((option: any, index: number) => {
            const isSelected = selectedOption === option.id;
            const totalPrice = calculateTotalPrice(option);
            const amenities = option.amenities;
            const canAccommodate = canAccommodateGuests(option);
            const exceedsCapacity = !canAccommodate;

            return (
              <button
                key={option.id}
                onClick={() => {
                  if (canAccommodate) {
                    handleOptionSelect(option.id);
                  }
                }}
                disabled={exceedsCapacity}
                className={`
                  w-full p-6 rounded-xl border-2 text-left
                  transition-all duration-300 ease-out
                  focus:outline-none focus:ring-4 focus:ring-orange-500/30
                  animate-in fade-in-0 slide-in-from-bottom-4
                  ${exceedsCapacity
                    ? 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20 animate-in zoom-in-95 duration-300'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50 hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      {option.images && option.images.length > 0 ? (
                        <img
                          src={option.images[0]}
                          alt={option.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-white text-2xl font-bold">
                          {state.experienceType === 'room' ? '🏠' : '🏄‍♂️'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title and Price */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {option.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {option.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {typeof totalPrice === 'number' && !Number.isNaN(totalPrice)
                            ? formatPrice(totalPrice)
                            : (state.experienceType === 'room' ? 'Select dates' : (option.price ? formatPrice(option.price) : '—'))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {state.experienceType === 'room'
                            ? (state.dates.checkIn && state.dates.checkOut ? `for ${Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} night${Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}` : 'per night')
                            : 'per person'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <>
                        <div className={`flex items-center gap-1 ${exceedsCapacity ? 'text-red-600 font-medium' : ''}`}>
                          <Users size={14} />
                          <span>Up to {option.maxOccupancy} guests</span>
                          {exceedsCapacity && (
                            <span className="text-red-600 text-xs font-medium ml-1">
                              (Exceeds capacity by {state.guests - option.maxOccupancy})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span className="capitalize">{option.type} room</span>
                        </div>
                      </>
                    </div>

                    {/* Amenities/Includes */}
                    {amenities && amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {amenities.slice(0, 4).map((amenity: string, index: number) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                          >
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </span>
                        ))}
                        {amenities.length > 4 && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                            +{amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
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
    </div>
  );
}
