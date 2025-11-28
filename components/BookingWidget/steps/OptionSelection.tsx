import { useEffect, useState, useRef } from 'react';
import { MapPin, Users, Star, Check, Clock, Wifi, Car, Utensils, Calendar, Minus, Plus } from 'lucide-react';
import { BookingState, PricingBreakdown, ParticipantName } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { useDateAvailability } from '../hooks/useDateAvailability';
import { RoomImageGallery, RoomHeroImage } from '../components/RoomImageGallery';

interface OptionSelectionProps {
  state: BookingState;
  actions: {
    selectOption: (optionId: string) => void;
    setSurfWeek: (surfWeekId: string) => void;
    setDates: (checkIn: Date, checkOut: Date) => void;
    setGuests: (count: number) => void;
    setParticipantNames: (names: ParticipantName[]) => void;
    updatePricing: (pricing: PricingBreakdown) => void;
    nextStep: () => void;
    setError: (field: string, message: string) => void;
    clearError: (field: string) => void;
  };
}

export function OptionSelection({ state, actions }: OptionSelectionProps) {
  // Only fetch data for the selected experience type to improve performance
  // Use safe defaults to prevent initialization errors
  const experienceType = state.experienceType || null;
  const { rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms({
    checkIn: experienceType === 'room' ? (state.dates.checkIn || null) : null,
    checkOut: experienceType === 'room' ? (state.dates.checkOut || null) : null,
    guests: experienceType === 'room' ? (state.guests || 1) : 1,
  });
  const { surfCamps, loading: campsLoading, error: campsError, refetch: refetchSurfCamps } = useSurfCamps();
  const {
    fetchDateAvailability,
    isDateSoldOut,
    loading: dateAvailabilityLoading
  } = useDateAvailability({ participants: state.guests || 1 });
  // For room bookings: support multi-select; for surf weeks: single-select
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    state.experienceType === 'room' && typeof state.selectedOption === 'string' && state.selectedOption
      ? [state.selectedOption]
      : []
  );

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

  // Local state for participant names - sync with global state
  const [participantNames, setLocalParticipantNames] = useState<string[]>(
    state.participantNames.map(p => p.firstName) || Array(state.guests).fill('')
  );

  // Sync local date state with global state when it changes
  useEffect(() => {
    if (state.dates.checkIn) {
      const newCheckIn = state.dates.checkIn.toISOString().split('T')[0];
      if (newCheckIn !== checkInDate) {
        setCheckInDate(newCheckIn);
      }
    }
    if (state.dates.checkOut) {
      const newCheckOut = state.dates.checkOut.toISOString().split('T')[0];
      if (newCheckOut !== checkOutDate) {
        setCheckOutDate(newCheckOut);
      }
    }
  }, [state.dates.checkIn, state.dates.checkOut]);

  // Sync participant names array with guest count
  useEffect(() => {
    setLocalParticipantNames(prev => {
      if (prev.length === state.guests) return prev;
      if (prev.length < state.guests) {
        // Add empty slots for new guests
        return [...prev, ...Array(state.guests - prev.length).fill('')];
      }
      // Remove extra slots if guest count decreased
      return prev.slice(0, state.guests);
    });
  }, [state.guests]);

  // Update global state when local participant names change
  const handleParticipantNameChange = (index: number, value: string) => {
    const newNames = [...participantNames];
    newNames[index] = value;
    setLocalParticipantNames(newNames);

    // Sync to global state
    const participantNameObjects: ParticipantName[] = newNames.map((name, i) => ({
      id: `guest-${i + 1}`,
      firstName: name,
    }));
    actions.setParticipantNames(participantNameObjects);
  };

  // Fetch date availability only when both dates are selected
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      // Only check availability for the selected date range
      fetchDateAvailability(checkInDate, checkOutDate);
    }
  }, [checkInDate, checkOutDate, fetchDateAvailability]);

  // For surf weeks, if a surf week was already selected in step 2, auto-select it here
  useEffect(() => {
    if (state.experienceType === 'surf-week' && state.selectedSurfWeek && !state.selectedOption) {
      // Auto-select the surf week option
      actions.selectOption(state.selectedSurfWeek);
    }
  }, [state.experienceType, state.selectedSurfWeek, state.selectedOption, actions]);

  const loading = state.experienceType === 'room' ? roomsLoading : campsLoading;
  const error = state.experienceType === 'room' ? roomsError : campsError;
  const options = state.experienceType === 'room' ? rooms : surfCamps;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectedOptionRef = useRef<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    // Cancel any pending auto-advance
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (state.experienceType === 'room') {
      // For rooms: multi-select - toggle room on/off
      const newSelection = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];

      setSelectedOptions(newSelection);

      // Store the first selected room in selectedOption for backwards compatibility
      actions.selectOption(newSelection[0] || '');
    } else {
      // For surf weeks: single-select
      setSelectedOptions([optionId]);
      actions.selectOption(optionId);
      lastSelectedOptionRef.current = optionId;

      // Auto-advance for surf week selection
      timeoutRef.current = setTimeout(() => {
        // Use ref to check selection since state might not be updated yet
        if (lastSelectedOptionRef.current === optionId) {
          actions.nextStep();
        }
        timeoutRef.current = null;
      }, 300);

      // Also set the surf week state
      if (state.experienceType === 'surf-week') {
        actions.setSurfWeek(optionId);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Removed auto-advance for room bookings - user must manually press Next button

  const handleCheckInChange = (dateStr: string) => {
    setCheckInDate(dateStr);
    if (dateStr && checkOutDate) {
      // Use UTC dates to avoid timezone issues
      const checkIn = new Date(dateStr + 'T00:00:00.000Z');
      const checkOut = new Date(checkOutDate + 'T00:00:00.000Z');
      if (checkIn < checkOut) {
        actions.setDates(checkIn, checkOut);
      }
    }
  };

  const handleCheckOutChange = (dateStr: string) => {
    setCheckOutDate(dateStr);
    if (checkInDate && dateStr) {
      // Use UTC dates to avoid timezone issues
      const checkIn = new Date(checkInDate + 'T00:00:00.000Z');
      const checkOut = new Date(dateStr + 'T00:00:00.000Z');
      if (checkIn < checkOut) {
        actions.setDates(checkIn, checkOut);
      }
    }
  };

  // Removed auto-select logic - users must explicitly select a room

  // Recompute base price and totals when selection/dates/guests change
  useEffect(() => {
    if (state.experienceType === 'room') {
      // For rooms: sum prices of all selected rooms
      if (selectedOptions.length === 0) return;

      let basePrice = 0;
      if (state.dates.checkIn && state.dates.checkOut) {
        // Calculate nights using UTC dates to avoid timezone issues
        const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
        const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
        const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));

        // Sum prices for all selected rooms using seasonal rates
        selectedOptions.forEach((roomId) => {
          const room: any = (options as any[]).find((o) => o.id === roomId);
          if (room && room.pricing) {
            // Determine if dates fall in peak season (May-September)
            const peakSeasonMonths = [5, 6, 7, 8, 9]
            const checkInMonth = checkInUTC.getMonth() + 1
            const checkOutMonth = checkOutUTC.getMonth() + 1
            const isPeakSeason = peakSeasonMonths.some(month => 
              month >= checkInMonth && month <= checkOutMonth
            ) || peakSeasonMonths.includes(checkInMonth) || peakSeasonMonths.includes(checkOutMonth)
            
            // Use seasonal rate based on dates
            const pricePerNight = isPeakSeason
              ? (room.pricing.standard || room.pricing.offSeason || room.price_per_night || 0)
              : (room.pricing.offSeason || room.pricing.standard || room.price_per_night || 0)
            
            basePrice += pricePerNight * nights
          } else if (room) {
            // Fallback to pricePerNight if pricing object not available
            const unit = typeof room.pricePerNight === 'number' ? room.pricePerNight : (room.price ?? 0);
            basePrice += unit * nights;
          }
        });
      }

      if (basePrice > 0) {
        const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
        const taxes = Math.round((basePrice + addOnsSubtotal) * 0.1);
        const fees = Math.round((basePrice + addOnsSubtotal) * 0.05);
        const total = basePrice + addOnsSubtotal + taxes + fees;
        actions.updatePricing({ ...state.pricing, basePrice, taxes, fees, total, currency: 'EUR' });
      }
    } else if (state.experienceType === 'surf-week') {
      // For surf weeks: single selection
      if (!state.selectedOption) return;
      const opt: any = (options as any[]).find((o) => o.id === state.selectedOption);
      if (!opt) return;

      const unit = typeof opt.price === 'number' ? opt.price : (opt.priceFrom ?? 0);
      const basePrice = unit * Math.max(1, state.guests);

      if (basePrice > 0) {
        const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
        const taxes = Math.round((basePrice + addOnsSubtotal) * 0.1);
        const fees = Math.round((basePrice + addOnsSubtotal) * 0.05);
        const total = basePrice + addOnsSubtotal + taxes + fees;
        actions.updatePricing({ ...state.pricing, basePrice, taxes, fees, total, currency: 'EUR' });
      }
    }
  }, [selectedOptions, state.dates.checkIn, state.dates.checkOut, state.guests, state.experienceType, state.selectedOption, options, state.pricing, actions]);

  // Set capacity error if insufficient capacity
  useEffect(() => {
    const tc = selectedOptions.reduce((sum, roomId) => {
      const room: any = (options as any[]).find((o) => o.id === roomId);
      return sum + (room?.capacity || room?.maxOccupancy || 0);
    }, 0);
    const isInsufficient = selectedOptions.length > 0 && tc < state.guests;

    if (state.experienceType === 'room' && selectedOptions.length > 0 && isInsufficient) {
      actions.setError('capacity', 'Selected rooms cannot accommodate all guests. Please select additional rooms or reduce guest count.');
    } else if (state.errors.capacity) {
      actions.clearError('capacity');
    }
  }, [selectedOptions, state.guests, state.experienceType, state.errors.capacity, actions, options]);

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

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi size={16} />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('transport')) return <Car size={16} />;
    if (lowerAmenity.includes('meal') || lowerAmenity.includes('food')) return <Utensils size={16} />;
    return <Check size={16} />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalPrice = (option: any) => {
    if (state.experienceType === 'room') {
      // Use local state dates if available, otherwise fall back to state dates
      const checkIn = checkInDate ? new Date(checkInDate + 'T00:00:00.000Z') : state.dates.checkIn;
      const checkOut = checkOutDate ? new Date(checkOutDate + 'T00:00:00.000Z') : state.dates.checkOut;

      if (checkIn && checkOut) {
        // Calculate nights using UTC dates to avoid timezone issues
        const checkInUTC = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
        const checkOutUTC = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
        const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));

        if (nights > 0) {
          // Calculate price using seasonal rates if pricing object available
          let pricePerNight = 0
          if (option.pricing) {
            // Determine if dates fall in peak season (May-September)
            const peakSeasonMonths = [5, 6, 7, 8, 9]
            const checkInMonth = checkInUTC.getMonth() + 1
            const checkOutMonth = checkOutUTC.getMonth() + 1
            const isPeakSeason = peakSeasonMonths.some(month => 
              month >= checkInMonth && month <= checkOutMonth
            ) || peakSeasonMonths.includes(checkInMonth) || peakSeasonMonths.includes(checkOutMonth)
            
            // Use seasonal rate based on dates
            pricePerNight = isPeakSeason
              ? (option.pricing.standard || option.pricing.offSeason || option.price_per_night || 0)
              : (option.pricing.offSeason || option.pricing.standard || option.price_per_night || 0)
          } else {
            // Fallback to pricePerNight if pricing object not available
            pricePerNight = option.pricePerNight || option.price || 0
          }
          const total = pricePerNight * nights;
          return total;
        }
      }
      return undefined; // Wait for dates to avoid NaN
    }
    return option.price ?? undefined;
  };

  // Calculate total capacity of selected rooms
  const getTotalCapacity = () => {
    return selectedOptions.reduce((total, roomId) => {
      const room = (options as any[]).find(o => o.id === roomId);
      return total + (room?.maxOccupancy || room?.capacity || 0);
    }, 0);
  };

  const totalCapacity = getTotalCapacity();
  const hasInsufficientCapacity = state.experienceType === 'room' && selectedOptions.length > 0 && totalCapacity < state.guests;
  // Fix capacity message format: "X guests / Y capacity" (guests required / capacity available)
  const capacityMessage = state.experienceType === 'room' && selectedOptions.length > 0
    ? `${state.guests} guest${state.guests !== 1 ? 's' : ''} / ${totalCapacity} capacity`
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">
              Loading available {state.experienceType === 'room' ? 'rooms' : 'surf weeks'}...
            </p>
          </div>
          <p className="text-sm text-gray-500">
            This may take up to 15 seconds
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
    const handleRetry = () => {
      if (state.experienceType === 'room') {
        refetchRooms();
      } else {
        refetchSurfCamps();
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
          </h3>
          <div className="space-y-2">
            <p className="text-red-600">
              Error loading {state.experienceType === 'room' ? 'rooms' : 'surf weeks'}: {error}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              Try Again
            </button>
          </div>
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
              <Calendar size={20} className="text-accent" />
              Select Dates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="check-in" className="block text-sm font-medium text-gray-700">
                  Check-in
                </label>
                <div className="relative">
                  <input
                    id="check-in"
                    type="date"
                    value={checkInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors duration-200 min-h-[44px] ${
                      checkInDate && isDateSoldOut(checkInDate)
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {checkInDate && isDateSoldOut(checkInDate) && (
                    <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
                      <span className="text-red-500 text-sm font-medium">Sold Out</span>
                    </div>
                  )}
                </div>
                {checkInDate && isDateSoldOut(checkInDate) && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    This date is fully booked. Please select another date.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="check-out" className="block text-sm font-medium text-gray-700">
                  Check-out
                </label>
                <div className="relative">
                  <input
                    id="check-out"
                    type="date"
                    value={checkOutDate}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors duration-200 min-h-[44px] ${
                      checkOutDate && isDateSoldOut(checkOutDate)
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {checkOutDate && isDateSoldOut(checkOutDate) && (
                    <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none">
                      <span className="text-red-500 text-sm font-medium">Sold Out</span>
                    </div>
                  )}
                </div>
                {checkOutDate && isDateSoldOut(checkOutDate) && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    This date is fully booked. Please select another date.
                  </p>
                )}
              </div>
            </div>

            {/* Date Availability Loading Indicator - Only show when dates are selected */}
            {dateAvailabilityLoading && checkInDate && checkOutDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                Checking availability for selected dates...
              </div>
            )}
          </div>

          {/* Guest Counter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-accent" />
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
                  className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                  aria-label="Decrease guest count"
                >
                  <Minus size={18} />
                </button>

                <span className="w-12 text-center text-lg font-semibold text-gray-900 min-h-[44px] flex items-center justify-center">
                  {state.guests}
                </span>

                <button
                  onClick={() => adjustGuests(1)}
                  disabled={state.guests >= 12}
                  className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                  aria-label="Increase guest count"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Participant Name Inputs */}
            {state.guests > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-sm font-medium text-gray-700">
                  Enter guest names (required for room assignment)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participantNames.map((name, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleParticipantNameChange(index, e.target.value)}
                        placeholder={`Guest ${index + 1} first name`}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors duration-200 min-h-[44px]"
                        aria-label={`Guest ${index + 1} first name`}
                      />
                      {name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Check size={16} className="text-green-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {participantNames.some(n => !n) && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Please enter all guest names to continue
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guest Counter for Surf Weeks */}
      {state.experienceType === 'surf-week' && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-accent" />
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
                className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                aria-label="Decrease participant count"
              >
                <Minus size={18} />
              </button>

              <span className="w-12 text-center text-lg font-semibold text-gray-900 min-h-[44px] flex items-center justify-center">
                {state.guests}
              </span>

              <button
                onClick={() => adjustGuests(1)}
                disabled={state.guests >= 12}
                className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                aria-label="Increase participant count"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Participant Name Inputs */}
          {state.guests > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-sm font-medium text-gray-700">
                Enter participant names (required for room assignment)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participantNames.map((name, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleParticipantNameChange(index, e.target.value)}
                      placeholder={`Participant ${index + 1} first name`}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors duration-200 min-h-[44px]"
                      aria-label={`Participant ${index + 1} first name`}
                    />
                    {name && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check size={16} className="text-green-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {participantNames.some(n => !n) && (
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Please enter all participant names to continue
                </p>
              )}
            </div>
          )}

          {/* Date Summary */}
          {state.dates.checkIn && state.dates.checkOut && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">
                  Duration: {(() => {
                    const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
                    const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
                    return Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));
                  })()} nights
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
            const isSelected = state.selectedSurfWeek === w.id;
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
                        <div className="text-accent font-extrabold uppercase tracking-wide text-sm mt-1" data-testid="surf-week-title">{w.name}</div>
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

                      {/* View Photos Link */}
                      {w.images && w.images.length > 0 && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(w);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 cursor-pointer select-none"
                        >
                          📸 View {w.images.length} Photo{w.images.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="mt-4 flex items-center gap-2 text-orange-600">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Room Booking - Show available rooms for selection */
        <div className="space-y-6">
          {state.dates.checkIn && state.dates.checkOut && state.guests > 0 ? (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Your Selection</h4>
                <p className="text-blue-700 text-sm">
                  {state.guests} guest{state.guests !== 1 ? 's' : ''} • {(() => {
                    const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
                    const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
                    const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));
                    return nights;
                  })()} night{(() => {
                    const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
                    const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
                    const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));
                    return nights !== 1 ? 's' : '';
                  })()} • {state.dates.checkIn.toLocaleDateString()} - {state.dates.checkOut.toLocaleDateString()}
                </p>
              </div>

              {/* Capacity Validation Message */}
              {selectedOptions.length > 0 && capacityMessage && (
                <div className={`p-3 rounded-lg border-l-4 flex items-center justify-between ${hasInsufficientCapacity ? 'bg-red-50 border-l-red-500' : 'bg-green-50 border-l-green-500'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`${hasInsufficientCapacity ? 'text-red-600' : 'text-green-600'}`}>
                        {hasInsufficientCapacity ? '⚠️' : '✓'}
                      </div>
                      <span className={`text-sm font-medium ${hasInsufficientCapacity ? 'text-red-900' : 'text-green-900'}`}>
                        Capacity: {capacityMessage}
                      </span>
                    </div>
                    {hasInsufficientCapacity && (
                      <p className="text-xs text-red-700 mt-1 ml-6">
                        Selected rooms cannot accommodate all guests. Please select additional rooms or reduce guest count.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Room Selection */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading available rooms...</p>
                </div>
              ) : options.length > 0 ? (
                <div className="space-y-4">
                  {(options as any[]).map((option: any, index: number) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const totalPrice = calculateTotalPrice(option);
                    const amenities = option.amenities;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={false}
                        className={`
                          w-full p-6 rounded-lg border text-left
                          transition-all duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500
                          relative
                          ${isSelected
                            ? 'border-orange-500 bg-white shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Checkbox indicator for multi-select */}
                        <div className="absolute top-4 right-4 w-5 h-5 rounded border border-gray-400 bg-white flex items-center justify-center transition-all"
                          style={{
                            borderColor: isSelected ? '#ec681c' : '#9ca3af',
                            backgroundColor: isSelected ? '#ec681c' : 'white'
                          }}
                        >
                          {isSelected && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <div className="flex gap-6">
                          {/* Enhanced Hero Image */}
                          <div className="flex-shrink-0">
                            {option.images && option.images.length > 0 ? (
                              <RoomHeroImage
                                image={option.images[0]}
                                roomName={option.name}
                                onClick={() => openGallery(option)}
                                className="w-32 h-24"
                              />
                            ) : (
                              <div className="w-32 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <div className="text-white text-2xl font-bold">
                                  {state.experienceType === 'room' ? '🏠' : '🏄‍♂️'}
                                </div>
                              </div>
                            )}
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
                                    ? (state.dates.checkIn && state.dates.checkOut ? (() => {
                                        const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
                                        const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
                                        const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));
                                        return `for ${nights} night${nights > 1 ? 's' : ''}`;
                                      })() : 'per night')
                                    : 'per person'
                                  }
                                </div>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <>
                                <div className="flex items-center gap-1">
                                  <Users size={14} />
                                  <span>Up to {option.maxOccupancy} guests</span>
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
                                {/* View Photos Link */}
                                {option.images && option.images.length > 0 && (
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openGallery(option);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-full cursor-pointer transition-colors duration-200 select-none"
                                  >
                                    📸 {option.images.length} Photo{option.images.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="mt-4 flex items-center gap-2 text-orange-600">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Selected</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Rooms Available</h4>
                  <p className="text-gray-600">
                    No rooms are available for your selected dates. Please try different dates.
                  </p>
                </div>
              )}
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
