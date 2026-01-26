import { useEffect, useState, useRef, useCallback } from 'react';
import { MapPin, Users, Star, Check, Wifi, Car, Utensils, Calendar, Minus, Plus } from 'lucide-react';
import { BookingState, PricingBreakdown, ParticipantName, Room, SurfWeek } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { useDateAvailability } from '../hooks/useDateAvailability';
import { RoomImageGallery, RoomHeroImage } from '../components/RoomImageGallery';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { formatDateUTC } from '@/lib/utils';

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

  // State for unavailable dates to show in calendar
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  // Room bookings: single-select (multi-room is handled via the dedicated RoomAssignment step)
  // Surf weeks: single-select
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    state.experienceType === 'room' && typeof state.selectedOption === 'string' && state.selectedOption
      ? [state.selectedOption]
      : []
  );

  // Image gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryRoomName, setGalleryRoomName] = useState('');
  const [galleryRoom, setGalleryRoom] = useState<Room | SurfWeek | null>(null);

  // Local state for room booking dates
  // Helper to safely convert date to string
  const dateToString = (date: Date | string | null | undefined): string => {
    if (!date) return ''
    const dateObj = date instanceof Date ? date : new Date(date)
    return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0]
  }

  const [checkInDate, setCheckInDate] = useState(
    dateToString(state.dates.checkIn)
  );
  const [checkOutDate, setCheckOutDate] = useState(
    dateToString(state.dates.checkOut)
  );

  // Local state for participant names - sync with global state
  const [participantNames, setLocalParticipantNames] = useState<string[]>(
    state.participantNames.map(p => p.firstName) || Array(state.guests).fill('')
  );

  // Keep local selection UI in sync with global state.
  // This prevents stale "Selected" UI when reducers reset `selectedOption` (e.g., after changing dates/guest count).
  useEffect(() => {
    if (state.experienceType === 'room') {
      setSelectedOptions(state.selectedOption ? [state.selectedOption] : []);
      return;
    }
    if (state.experienceType === 'surf-week') {
      setSelectedOptions(state.selectedOption ? [state.selectedOption] : []);
      return;
    }
    setSelectedOptions([]);
  }, [state.experienceType, state.selectedOption]);

  // Sync local date state with global state when it changes
  useEffect(() => {
    const newCheckIn = dateToString(state.dates.checkIn)
    if (newCheckIn && newCheckIn !== checkInDate) {
      setCheckInDate(newCheckIn)
    }
    const newCheckOut = dateToString(state.dates.checkOut)
    if (newCheckOut && newCheckOut !== checkOutDate) {
      setCheckOutDate(newCheckOut)
    }
  }, [state.dates.checkIn, state.dates.checkOut, checkInDate, checkOutDate]);

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

  // Fetch date availability with debouncing to prevent excessive API calls
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      // Validate that check-in is before check-out
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Only fetch if dates are valid and in correct order
      if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime()) && checkIn < checkOut) {
        // Debounce API calls by 300ms to prevent hitting API on every keystroke
        const debounceTimer = setTimeout(() => {
          fetchDateAvailability(checkInDate, checkOutDate);
        }, 300);

        // Cleanup: cancel pending API call if dates change again
        return () => clearTimeout(debounceTimer);
      }
    }
  }, [checkInDate, checkOutDate, fetchDateAvailability, state.pricing]);

  // Fetch unavailable dates for calendar view (3 months ahead) - only on mount or guest count change
  const hasFetchedRef = useRef(false);
  const lastGuestCountRef = useRef(state.guests);

  useEffect(() => {
    // Reset fetch flag when guest count changes
    if (lastGuestCountRef.current !== state.guests) {
      hasFetchedRef.current = false;
      lastGuestCountRef.current = state.guests;
    }

    if (state.experienceType === 'room' && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      const fetchUnavailable = async () => {
        const today = new Date();
        const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
        const startDate = today.toISOString().split('T')[0];
        const endDate = threeMonthsLater.toISOString().split('T')[0];

        const availability = await fetchDateAvailability(startDate, endDate);
        // Update unavailable dates directly from the result
        if (availability && availability.length > 0) {
          const soldOut = availability.filter(d => !d.available).map(d => d.date);
          setUnavailableDates(soldOut.map(d => new Date(d + 'T00:00:00.000Z')));
        }
      };
      fetchUnavailable();
    }
  }, [state.experienceType, state.guests, fetchDateAvailability]);

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
      // For rooms: single-select. Clicking a different room replaces the selection.
      // This avoids the illogical UX of "select multiple rooms" while only sending one room_id at checkout.
      const isAlreadySelected = selectedOptions[0] === optionId;
      const newSelection = isAlreadySelected ? [] : [optionId];
      setSelectedOptions(newSelection);
      actions.selectOption(newSelection[0] || '');
    } else {
      // For surf weeks: single-select
      setSelectedOptions([optionId]);
      actions.selectOption(optionId);
      lastSelectedOptionRef.current = optionId;

      // Also set the surf week state BEFORE auto-advancing
      if (state.experienceType === 'surf-week') {
        actions.setSurfWeek(optionId);
      }

      // Auto-advance for surf week selection
      // Note: The step flow should include 'surf-week-room-selection' after 'options'
      // We add a small delay to ensure state updates are processed before advancing
      timeoutRef.current = setTimeout(() => {
        // Use ref to check selection since state might not be updated yet
        if (lastSelectedOptionRef.current === optionId) {
          // Advance to next step - should be 'surf-week-room-selection' for surf weeks
          actions.nextStep();
        }
        timeoutRef.current = null;
      }, 500); // Increased delay to ensure state updates are processed
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
  // Use ref to track last computed pricing to prevent infinite loops
  const lastComputedPricingRef = useRef<string>('')
  
  useEffect(() => {
    if (state.experienceType === 'room') {
      // For rooms: single room selection (multi-room pricing happens in RoomAssignment step)
      if (selectedOptions.length === 0) return;

      let basePrice = 0;
      if (state.dates.checkIn && state.dates.checkOut) {
        // Calculate nights using UTC dates to avoid timezone issues
        // Handle both Date objects and string dates (from localStorage)
        const checkInDate = state.dates.checkIn instanceof Date 
          ? state.dates.checkIn 
          : new Date(state.dates.checkIn)
        const checkOutDate = state.dates.checkOut instanceof Date 
          ? state.dates.checkOut 
          : new Date(state.dates.checkOut)
        
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
          return // Invalid dates, skip pricing calculation
        }
        
        const checkInUTC = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
        const checkOutUTC = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());
        const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));

        const roomId = selectedOptions[0];
        const room = (options as (Room | SurfWeek)[]).find((o) => o.id === roomId) as Room | undefined;

        if (room) {
          // Determine if dates fall in peak season (May-September)
          const peakSeasonMonths = [5, 6, 7, 8, 9];
          const checkInMonth = checkInUTC.getMonth() + 1;
          const checkOutMonth = checkOutUTC.getMonth() + 1;
          const isPeakSeason =
            peakSeasonMonths.some((month) => month >= checkInMonth && month <= checkOutMonth) ||
            peakSeasonMonths.includes(checkInMonth) ||
            peakSeasonMonths.includes(checkOutMonth);

          // Use seasonal rate based on dates (prefer normalized pricing fields when present)
          const seasonalUnit =
            room.pricing
              ? (isPeakSeason
                  ? (room.pricing.standard || room.pricing.offSeason || room.pricePerNight || 0)
                  : (room.pricing.offSeason || room.pricing.standard || room.pricePerNight || 0))
              : (room.pricePerNight || 0);

          const bookingType = room.bookingType || 'entire_room';
          basePrice =
            bookingType === 'per_bed'
              ? seasonalUnit * nights * Math.max(1, state.guests)
              : seasonalUnit * nights;
        }
      }

      // PRICING RULES:
      // 1. Prices are tax-INCLUSIVE (tax is extracted for display, not added)
      // 2. No service fee
      if (basePrice > 0) {
        const TAX_RATE = 0.1; // 10% VAT included in prices
        const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
        const subtotal = basePrice + addOnsSubtotal;
        // Tax is INCLUDED in price, extract for display (not added on top)
        const taxes = Math.round(subtotal * TAX_RATE / (1 + TAX_RATE));
        const fees = 0; // No service fee
        // Create pricing key to compare (prevents infinite loop)
        const pricingKey = `${basePrice}-${taxes}-${fees}-${subtotal}-${state.pricing.addOnsSubtotal || 0}`
        if (lastComputedPricingRef.current !== pricingKey) {
          lastComputedPricingRef.current = pricingKey
          actions.updatePricing({ ...state.pricing, basePrice, taxes, fees, total: subtotal, currency: 'EUR' });
        }
      }
    } else if (state.experienceType === 'surf-week') {
      // For surf weeks: single selection
      if (!state.selectedOption) return;
      const opt = (options as (Room | SurfWeek)[]).find((o) => o.id === state.selectedOption) as SurfWeek | undefined;
      if (!opt) return;

      const unit = typeof opt.price === 'number' ? opt.price : (opt.priceFrom ?? 0);
      const basePrice = unit * Math.max(1, state.guests);

      // PRICING RULES:
      // 1. Prices are tax-INCLUSIVE (tax is extracted for display, not added)
      // 2. No service fee
      if (basePrice > 0) {
        const TAX_RATE = 0.1; // 10% VAT included in prices
        const addOnsSubtotal = state.pricing.addOnsSubtotal || 0;
        const subtotal = basePrice + addOnsSubtotal;
        // Tax is INCLUDED in price, extract for display (not added on top)
        const taxes = Math.round(subtotal * TAX_RATE / (1 + TAX_RATE));
        const fees = 0; // No service fee
        // Create pricing key to compare (prevents infinite loop)
        const pricingKey = `${basePrice}-${taxes}-${fees}-${subtotal}-${state.pricing.addOnsSubtotal || 0}`
        if (lastComputedPricingRef.current !== pricingKey) {
          lastComputedPricingRef.current = pricingKey
          actions.updatePricing({ ...state.pricing, basePrice, taxes, fees, total: subtotal, currency: 'EUR' });
        }
      }
    }
  }, [selectedOptions, state.dates.checkIn, state.dates.checkOut, state.guests, state.experienceType, state.selectedOption, options, state.pricing.addOnsSubtotal, actions]);

  // Set capacity error if insufficient capacity
  useEffect(() => {
    const selectedRoomId = selectedOptions[0];
    const room = selectedRoomId ? (options as (Room | SurfWeek)[]).find((o) => o.id === selectedRoomId) as Room | undefined : null;
    const capacity = room?.maxOccupancy || 0;
    const isInsufficient = !!selectedRoomId && capacity > 0 && capacity < state.guests;

    if (state.experienceType === 'room' && selectedRoomId && isInsufficient) {
      actions.setError('capacity', 'Selected room cannot accommodate all guests. Please reduce guest count or choose a different room.');
    } else if (state.errors.capacity) {
      actions.clearError('capacity');
    }
  }, [selectedOptions, state.guests, state.experienceType, state.errors.capacity, actions, options]);

  const adjustGuests = (delta: number) => {
    const newCount = Math.max(1, Math.min(12, state.guests + delta));
    actions.setGuests(newCount);
  };

  // Open image gallery
  const openGallery = (room: Room | SurfWeek) => {
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

  const calculateTotalPrice = (option: Room) => {
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
              ? (option.pricing.standard || option.pricing.offSeason || option.pricePerNight || 0)
              : (option.pricing.offSeason || option.pricing.standard || option.pricePerNight || 0)
          } else {
            // Fallback to pricePerNight if pricing object not available
            pricePerNight = option.pricePerNight || 0
          }
          const total = pricePerNight * nights;
          return total;
        }
      }
      return undefined; // Wait for dates to avoid NaN
    }
    return option.pricePerNight ?? undefined;
  };

  // Calculate total capacity of selected rooms
  const getTotalCapacity = () => {
    const selectedRoomId = selectedOptions[0];
    const room = selectedRoomId ? (options as (Room | SurfWeek)[]).find((o) => o.id === selectedRoomId) as Room | undefined : null;
    return room?.maxOccupancy || 0;
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
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">
              Loading available {state.experienceType === 'room' ? 'rooms' : 'surf weeks'}...
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Please wait while we fetch availability...
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

    // Check if this is a surf camp conflict error
    const isSurfCampConflict = error?.includes('surf camp') || error?.includes('surf week');

    // For surf camp conflicts, show error message but also allow users to change dates
    if (isSurfCampConflict) {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
            </h3>
          </div>

          {/* Error Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-black text-lg leading-relaxed">
              We have surf camps running during those dates, so room-only bookings aren't available. We'd love for you to join one of our surf camp packages instead, or feel free to check for other dates.
            </p>
          </div>

          {/* Date Picker for Rooms - Allow users to change dates to resolve conflict */}
          {state.experienceType === 'room' && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
              <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={20} className="text-accent" />
                Select Different Dates
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="check-in-error" className="block text-xs font-medium text-gray-700">
                    Check-in
                  </label>
                  <input
                    id="check-in-error"
                    type="date"
                    value={checkInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent transition-[border-color,box-shadow,background-color] duration-200 motion-reduce:transition-none text-[14px] ${
                      checkInDate && isDateSoldOut(checkInDate)
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {checkInDate && isDateSoldOut(checkInDate) && (
                    <p className="text-base text-red-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      This date is fully booked. Please select another date.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="check-out-error" className="block text-xs font-medium text-gray-700">
                    Check-out
                  </label>
                  <input
                    id="check-out-error"
                    type="date"
                    value={checkOutDate}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleCheckOutChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent transition-[border-color,box-shadow,background-color] duration-200 motion-reduce:transition-none text-[14px] ${
                      checkOutDate && isDateSoldOut(checkOutDate)
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  {checkOutDate && isDateSoldOut(checkOutDate) && (
                    <p className="text-base text-red-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      This date is fully booked. Please select another date.
                    </p>
                  )}
                </div>
              </div>

              {/* Date Availability Loading Indicator */}
              {dateAvailabilityLoading && checkInDate && checkOutDate && (
                <div className="flex items-center gap-2 text-base text-gray-600">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  Checking availability for selected dates...
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              variant="outline"
            >
              Try Again
            </Button>
            {state.experienceType === 'room' && (
              <Button
                onClick={() => {
                  // Clear error and retry with new dates
                  actions.clearError('availability');
                  handleRetry();
                }}
                disabled={!checkInDate || !checkOutDate}
              >
                Search New Dates
              </Button>
            )}
          </div>
        </div>
      );
    }

    // For non-conflict errors, show generic error message
    return (
      <div className="space-y-6">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="space-y-4">
            {/* Friendly icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900">
              Let's find you a perfect spot
            </h3>

            {/* Friendly message based on error type */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
              <p className="text-gray-700 leading-relaxed">
                {error.includes('scheduled event') || error.includes('maintenance') ? (
                  <>
                    We have something special planned during those dates. How about choosing different dates?
                    We'd love to host you another time! 🌊
                  </>
                ) : error.includes('surf camp') ? (
                  <>
                    Those dates are reserved for our surf camp experience. Want to join the surf camp,
                    or would you prefer to book a room for different dates? 🏄‍♂️
                  </>
                ) : (
                  <>
                    We're having a small hiccup loading our availability. No worries though –
                    let's try again and get you sorted! 😊
                  </>
                )}
              </p>
            </div>
          </div>

          <Button
            onClick={handleRetry}
            className="w-full"
          >
            Choose Different Dates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">
          {state.experienceType === 'room' 
            ? 'Choose Your Room' 
            : state.selectedSurfWeek 
              ? 'How Many Participants?' 
              : 'Choose Your Surf Week'
          }
        </h3>
        <p className="text-lg text-gray-600">
          {state.experienceType === 'room'
            ? 'Select your dates and find the perfect room'
            : state.selectedSurfWeek
              ? 'Let us know how many people are joining the surf camp'
              : 'Select your perfect surf adventure'
          }
        </p>
      </div>

      {/* Inline Date Picker and Guest Counter for Rooms */}
      {state.experienceType === 'room' && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
          {/* Date Selection */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-accent" />
              Select Dates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="check-in" className="block text-xs font-medium text-gray-700">
                  Check-in
                </label>
                <DatePicker
                  id="check-in"
                  date={checkInDate ? new Date(checkInDate + 'T12:00:00') : undefined}
                  onDateChange={(date) => {
                    if (date) {
                      // Use local date parts to avoid timezone shifts
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
                      handleCheckInChange(dateStr);
                    }
                  }}
                  disabledDates={unavailableDates}
                  minDate={new Date()}
                  placeholder="Select check-in"
                  aria-label="Select check-in date"
                  className={checkInDate && isDateSoldOut(checkInDate) ? 'border-red-300 bg-red-50 text-red-700' : ''}
                />
                {checkInDate && isDateSoldOut(checkInDate) && (
                  <p className="text-base text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    This date is fully booked. Please select another date.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="check-out" className="block text-xs font-medium text-gray-700">
                  Check-out
                </label>
                <DatePicker
                  id="check-out"
                  date={checkOutDate ? new Date(checkOutDate + 'T12:00:00') : undefined}
                  onDateChange={(date) => {
                    if (date) {
                      // Use local date parts to avoid timezone shifts
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
                      handleCheckOutChange(dateStr);
                    }
                  }}
                  disabledDates={unavailableDates}
                  minDate={checkInDate ? new Date(checkInDate + 'T12:00:00') : new Date()}
                  placeholder="Select check-out"
                  aria-label="Select check-out date"
                  className={checkOutDate && isDateSoldOut(checkOutDate) ? 'border-red-300 bg-red-50 text-red-700' : ''}
                />
                {checkOutDate && isDateSoldOut(checkOutDate) && (
                  <p className="text-base text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    This date is fully booked. Please select another date.
                  </p>
                )}
              </div>
            </div>

            {/* Date Availability Loading Indicator - Only show when dates are selected */}
            {dateAvailabilityLoading && checkInDate && checkOutDate && (
              <div className="flex items-center gap-2 text-base text-gray-600">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                Checking availability for selected dates...
              </div>
            )}
          </div>

          {/* Guest Counter */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-accent" />
              Number of Guests
            </h4>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">Guests</div>
                <div className="text-base text-gray-600">How many people will be staying?</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustGuests(-1)}
                  disabled={state.guests <= 1}
                  className="w-[44px] h-[44px] rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
                  aria-label="Decrease guest count"
                >
                  <Minus size={18} />
                </button>

                <span className="w-12 text-center text-xl font-semibold text-gray-900 h-[44px] flex items-center justify-center">
                  {state.guests}
                </span>

                <button
                  type="button"
                  onClick={() => adjustGuests(1)}
                  disabled={state.guests >= 12}
                  className="w-[44px] h-[44px] rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
                  aria-label="Increase guest count"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Participant Name Inputs */}
            {state.guests > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-medium text-gray-700">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent transition-[border-color,box-shadow,background-color] duration-200 motion-reduce:transition-none text-[14px]"
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
                  <p className="text-base text-amber-600 flex items-center gap-1">
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
          <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-accent" />
            Number of Participants
          </h4>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Participants</div>
              <div className="text-base text-gray-600">How many people will join the surf camp?</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustGuests(-1)}
                disabled={state.guests <= 1}
                className="w-[44px] h-[44px] rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
                aria-label="Decrease participant count"
              >
                <Minus size={18} />
              </button>

              <span className="w-12 text-center text-xl font-semibold text-gray-900 h-[44px] flex items-center justify-center">
                {state.guests}
              </span>

              <button
                type="button"
                onClick={() => adjustGuests(1)}
                disabled={state.guests >= 12}
                className="w-[44px] h-[44px] rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
                aria-label="Increase participant count"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Participant Name Inputs */}
          {state.guests > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-gray-700">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:border-accent transition-[border-color,box-shadow,background-color] duration-200 motion-reduce:transition-none text-[14px]"
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
                <p className="text-base text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Please enter all participant names to continue
                </p>
              )}
            </div>
          )}

          {/* Date Summary */}
          {state.dates.checkIn && state.dates.checkOut && (
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Duration: {(() => {
                    const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
                    const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
                    return Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));
                  })()} nights
                </span>
                <span className="text-base text-gray-700">
                  {formatDateUTC(state.dates.checkIn)} - {formatDateUTC(state.dates.checkOut)}
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
          {(options as SurfWeek[]).map((w: SurfWeek, index: number) => {
            const isSelected = state.selectedSurfWeek === w.id;
            const from = typeof w.priceFrom === 'number' ? w.priceFrom : w.price;
            const start = new Date(w.startDate);
            const end = new Date(w.endDate);
            const dateText = `${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} > ${end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;

            // Enhanced occupancy display logic with percentage
            const maxParticipants = w.maxParticipants || 0;
            const confirmedBooked = w.confirmedBooked || 0;
            const availableSpots = w.availableSpots ?? (maxParticipants - confirmedBooked);
            const occupancyPercent = maxParticipants > 0 ? Math.round((confirmedBooked / maxParticipants) * 100) : 0;
            
            // Check if this week has enough spots for the selected number of participants
            const hasEnoughSpots = availableSpots >= state.guests;
            const isFullyBooked = availableSpots === 0;
            const isUnavailableForGroup = !hasEnoughSpots && !isFullyBooked;
            const isDisabled = isFullyBooked || isUnavailableForGroup;
            
            // Build occupancy text with percentage
            let occupancyText = '';
            if (maxParticipants > 0) {
              occupancyText = `${occupancyPercent}% booked`;
              if (availableSpots > 0) {
                occupancyText += ` • ${availableSpots} spots left`;
              }
            }

            return (
              <div
                key={w.id}
                data-testid="surf-week-row"
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    handleOptionSelect(w.id)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.currentTarget !== event.target) return
                  if (isDisabled) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleOptionSelect(w.id)
                  }
                }}
                className={`w-full p-4 sm:p-6 rounded-[10px] border bg-white text-left cursor-pointer motion-safe:transition-[box-shadow,border-color,background-color] motion-safe:duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 relative
                  ${isSelected ? 'border-accent bg-accent/5 shadow-md ring-2 ring-accent/30' : 'border-gray-200'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-lg hover:border-accent/30 hover:bg-accent/5'}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  {/* Surf Week Hero Image */}
                  <div className="flex-shrink-0">
                    {w.images && w.images.length > 0 ? (
                      <RoomHeroImage
                        image={w.images[0]}
                        roomName={w.name}
                        className="w-full h-40 sm:w-32 sm:h-24"
                      />
                    ) : (
                      <div className="w-full h-40 sm:w-32 sm:h-24 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                        <div className="text-white text-2xl font-bold">🏄‍♂️</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Title and Price */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                      <div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900">{dateText}</div>
                        <div className="text-accent font-extrabold uppercase tracking-wide text-base mt-1" data-testid="surf-week-title">{w.name}</div>
                        <p className="text-base text-gray-600 line-clamp-2 mt-1">
                          {w.description}
                        </p>
                      </div>
                      <div className="sm:text-right flex-shrink-0">
                        <span className="text-2xl sm:text-3xl font-bold text-accent">
                          {`from €${Math.round(from)}`}
                        </span>
                        <span className="text-sm text-gray-500 ml-1 sm:ml-0 sm:block">per person</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-base text-gray-600">
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
                            className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                          >
                            <Check size={10} />
                            {include}
                          </span>
                        ))}
                        {w.includes.length > 3 && (
                          <span className="px-2 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                            +{w.includes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Occupancy and View Photos */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        {/* Occupancy percentage with progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-300 motion-reduce:transition-none ${
                                occupancyPercent >= 80 ? 'bg-red-500' :
                                occupancyPercent >= 50 ? 'bg-accent' : 'bg-green-500'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                          <span className={`text-sm ${isDisabled ? 'text-red-500 font-medium' : 'text-gray-500'}`} data-testid="surf-week-occupancy">
                            {occupancyText}
                          </span>
                        </div>
                        {/* Unavailability message */}
                        {isFullyBooked && (
                          <span className="text-sm text-red-600 font-medium">Fully booked</span>
                        )}
                        {isUnavailableForGroup && (
                          <span className="text-sm text-accent font-medium">
                            Not enough spots for {state.guests} {state.guests === 1 ? 'person' : 'people'}
                          </span>
                        )}
                      </div>

                      {/* View Photos Link */}
                      {w.images && w.images.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(w);
                          }}
                          aria-label={`View photos for ${w.name}`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-orange-50 text-accent rounded-[10px] text-sm font-medium cursor-pointer select-none transition-[background-color,color] duration-150 ease-out hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm"
                        >
                          📸 View {w.images.length} Photo{w.images.length > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="mt-4 flex items-center gap-2 text-accent">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-base font-medium">Selected</span>
                  </div>
                )}
              </div>
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
                <p className="text-blue-700 text-base">
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
                  })()} • {formatDateUTC(state.dates.checkIn)} - {formatDateUTC(state.dates.checkOut)}
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
                      <span className={`text-base font-medium ${hasInsufficientCapacity ? 'text-red-900' : 'text-green-900'}`}>
                        Capacity: {capacityMessage}
                      </span>
                    </div>
                    {hasInsufficientCapacity && (
                      <p className="text-sm text-red-700 mt-1 ml-6">
                        Selected room cannot accommodate all guests. Please reduce guest count or choose a different room.
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
                  {(options as Room[]).map((option: Room, index: number) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const totalPrice = calculateTotalPrice(option);
                    const amenities = option.amenities;

                    return (
                      <div
                        key={option.id}
                        data-testid={`room-card-${option.id}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onClick={() => handleOptionSelect(option.id)}
                        onKeyDown={(event) => {
                          if (event.currentTarget !== event.target) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleOptionSelect(option.id)
                          }
                        }}
                        className={
                          `
                          w-full p-4 sm:p-6 rounded-lg border text-left cursor-pointer
                          motion-safe:transition-[box-shadow,border-color,background-color] motion-safe:duration-200 motion-reduce:transition-none
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500
                          relative
                          ${isSelected
                            ? 'border-orange-500 bg-white shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }
                        `
                        }
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                          {/* Enhanced Hero Image */}
                          <div className="flex-shrink-0 relative">
                            {option.images && option.images.length > 0 ? (
                              <>
                                <RoomHeroImage
                                  image={option.images[0]}
                                  roomName={option.name}
                                  className="w-full h-40 sm:w-32 sm:h-24"
                                />
                                {/* Checkbox indicator - positioned on image */}
                                <div
                                  className={`absolute top-2 left-2 w-6 h-6 rounded-md border flex items-center justify-center motion-safe:transition-[background-color,border-color] motion-safe:duration-200 motion-reduce:transition-none shadow-md ${
                                    isSelected
                                      ? 'bg-accent border-accent'
                                      : 'bg-white/90 backdrop-blur-sm border-gray-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <Check size={14} className="text-white stroke-[3]" />
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-40 sm:w-32 sm:h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative">
                                <div className="text-white text-2xl font-bold">
                                  {state.experienceType === 'room' ? '🏠' : '🏄‍♂️'}
                                </div>
                                {/* Checkbox indicator - positioned on placeholder */}
                                <div
                                  className={`absolute top-2 left-2 w-6 h-6 rounded-md border flex items-center justify-center motion-safe:transition-[background-color,border-color] motion-safe:duration-200 motion-reduce:transition-none shadow-md ${
                                    isSelected
                                      ? 'bg-accent border-accent'
                                      : 'bg-white/90 backdrop-blur-sm border-gray-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <Check size={14} className="text-white stroke-[3]" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-3">
                            {/* Title and Price */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                              <div className="flex-1 sm:pr-4">
                                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                                  {option.name}
                                </h4>
                                <p className="text-base text-gray-600 line-clamp-2">
                                  {option.description}
                                </p>
                              </div>
                              <div className="sm:text-right flex-shrink-0">
                                <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                                  {typeof totalPrice === 'number' && !Number.isNaN(totalPrice)
                                    ? formatPrice(totalPrice)
                                    : (state.experienceType === 'room' ? 'Select dates' : (option as unknown as SurfWeek).price ? formatPrice((option as unknown as SurfWeek).price) : '—')}
                                </span>
                                <span className="text-sm text-gray-500 ml-1 sm:ml-0 sm:block">
                                  {state.experienceType === 'room'
                                    ? (state.dates.checkIn && state.dates.checkOut ? (() => {
                                        const checkInUTC = new Date(state.dates.checkIn.getFullYear(), state.dates.checkIn.getMonth(), state.dates.checkIn.getDate());
                                        const checkOutUTC = new Date(state.dates.checkOut.getFullYear(), state.dates.checkOut.getMonth(), state.dates.checkOut.getDate());
                                        const nights = Math.ceil((checkOutUTC.getTime() - checkInUTC.getTime()) / (1000 * 60 * 60 * 24));
                                        return `for ${nights} night${nights > 1 ? 's' : ''}`;
                                      })() : 'per night')
                                    : 'per person'
                                  }
                                </span>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-4 text-base text-gray-600">
                              <>
                                <div className="flex items-center gap-1">
                                  <Users size={14} />
                                  <span>Up to {option.maxOccupancy || String((option as unknown as Record<string, unknown>).capacity ?? '')} guests</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  <span className="capitalize">{option.type || String((option as unknown as Record<string, unknown>).booking_type ?? '')} room</span>
                                </div>
                              </>
                            </div>

                            {/* Occupancy display for per-bed rooms (dorms) */}
                            {((option as unknown as Record<string, unknown>).booking_type === 'perBed' || option.bookingType === 'per_bed') && ((option as unknown as Record<string, unknown>).capacity as number) > 0 && (
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const capacity = (option as unknown as Record<string, unknown>).capacity as number || option.maxOccupancy || 0;
                                  const availableBeds = ((option as unknown as Record<string, unknown>).available_beds as number) ?? option.availableBeds ?? capacity;
                                  const occupiedBeds = capacity - availableBeds;
                                  const occupancyPercent = capacity > 0 ? Math.round((occupiedBeds / capacity) * 100) : 0;

                                  return (
                                    <>
                                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-300 motion-reduce:transition-none ${
                                            occupancyPercent >= 80 ? 'bg-red-500' :
                                            occupancyPercent >= 50 ? 'bg-accent' : 'bg-green-500'
                                          }`}
                                          style={{ width: `${occupancyPercent}%` }}
                                        />
                                      </div>
                                      <span className="text-sm text-gray-600">
                                        {occupancyPercent}% booked {availableBeds > 0 && `• ${availableBeds} bed${availableBeds !== 1 ? 's' : ''} left`}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Amenities/Includes */}
                            {amenities && amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2" data-testid={`room-amenities-${option.id}`}>
                                {amenities.slice(0, 4).map((amenity: string, index: number) => (
                                  <span
                                    key={index}
                                    className="flex items-center gap-1 px-2 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                                  >
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </span>
                                ))}
                                {amenities.length > 4 && (
                                  <span className="px-2 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                                    +{amenities.length - 4} more
                                  </span>
                                )}
                                {/* View Photos Link */}
                                {option.images && option.images.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openGallery(option);
                                    }}
                                    aria-label={`View photos for ${option.name}`}
                                    className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-full cursor-pointer transition-[background-color,color] duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm"
                                  >
                                    📸 {option.images.length} Photo{option.images.length > 1 ? 's' : ''}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="mt-4 flex items-center gap-2 text-orange-600">
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            <span className="text-base font-medium">Selected</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No Rooms Available</h4>
                  <p className="text-lg text-gray-600">
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
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Selection</h4>
              <p className="text-lg text-gray-600">
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
        <p className="text-base text-gray-500">
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
        roomAmenities={'amenities' in (galleryRoom || {}) ? (galleryRoom as Room)?.amenities : undefined}
        roomType={'type' in (galleryRoom || {}) ? (galleryRoom as Room)?.type : undefined}
        maxOccupancy={'maxOccupancy' in (galleryRoom || {}) ? (galleryRoom as Room)?.maxOccupancy : undefined}
        pricePerNight={'pricePerNight' in (galleryRoom || {}) ? (galleryRoom as Room)?.pricePerNight : undefined}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
