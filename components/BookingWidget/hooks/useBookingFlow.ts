import { useReducer, useCallback, useMemo, useEffect } from 'react';
import { BookingState, BookingAction, GuestInfo, PricingBreakdown, AddOnSelection, BankWireDetails, RoomAssignment, ParticipantName } from '../types';
import { availabilityService } from '@/lib/availability';
import { bookingService } from '@/lib/booking-service';
import { validateBookingSubmission } from '@/lib/booking-utils';
import { saveBookingProgress, loadBookingProgress } from '@/lib/utils/booking-persistence';
import { dateToISOString } from '@/lib/utils/date-helpers';

const initialState: BookingState = {
  currentStep: 1,
  experienceType: null,
  dates: {
    checkIn: null,
    checkOut: null,
  },
  guests: 1,
  participantNames: [],
  selectedOption: null,
  selectedSurfWeek: null,
  selectedSurfWeekRoom: null,
  roomAssignments: [],
  selectedAddOns: [],
  paymentMethod: null,
  bankWireDetails: undefined,
  guestDetails: [],
  pricing: {
    basePrice: 0,
    addOnsSubtotal: 0,
    taxes: 0,
    fees: 0,
    total: 0,
    currency: 'EUR',
  },
  isLoading: false,
  errors: {},
  skippedSteps: [],
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_EXPERIENCE_TYPE':
      return {
        ...state,
        experienceType: action.payload,
        dates: { checkIn: null, checkOut: null }, // Reset dates when changing type
        selectedOption: null, // Reset selection when changing type
        roomAssignments: [], // Reset assignments when changing type
      };
    
    case 'SET_DATES':
      return { 
        ...state, 
        dates: action.payload,
        selectedOption: null, // Reset selection when dates change
        roomAssignments: [], // Dates change invalidates any assignments
      };
    
    case 'SET_GUESTS':
      return {
        ...state,
        guests: action.payload,
        selectedOption: null, // Reset selection when guest count changes
        roomAssignments: [], // Guest count change invalidates any assignments
      };

    case 'SET_PARTICIPANT_NAMES':
      return { ...state, participantNames: action.payload };

    case 'SET_SELECTED_OPTION':
      return { ...state, selectedOption: action.payload };

    case 'SET_SURF_WEEK':
      return { ...state, selectedSurfWeek: action.payload };

    case 'SET_SURF_WEEK_ROOM':
      return { ...state, selectedSurfWeekRoom: action.payload };

    case 'SET_ROOM_ASSIGNMENTS':
      return { ...state, roomAssignments: action.payload };

    case 'ADD_ROOM_ASSIGNMENT':
      return {
        ...state,
        roomAssignments: [...state.roomAssignments, action.payload]
      };

    case 'REMOVE_ROOM_ASSIGNMENT':
      return {
        ...state,
        roomAssignments: state.roomAssignments.filter(a => a.id !== action.payload)
      };

    case 'SET_ADD_ONS':
      return { ...state, selectedAddOns: action.payload };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'SET_BANK_WIRE_DETAILS':
      return { ...state, bankWireDetails: action.payload };

    case 'ADD_GUEST_DETAILS':
      const existingIndex = state.guestDetails.findIndex(g => g.id === action.payload.id);
      const updatedDetails = existingIndex >= 0 
        ? state.guestDetails.map((g, i) => i === existingIndex ? action.payload : g)
        : [...state.guestDetails, action.payload];
      
      return { ...state, guestDetails: updatedDetails };
    
    case 'UPDATE_PRICING':
      return { ...state, pricing: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        errors: { ...state.errors, [action.payload.field]: action.payload.message }
      };
    
    case 'CLEAR_ERROR':
      const { [action.payload]: _, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };
    
    case 'SET_SKIPPED_STEPS':
      return { ...state, skippedSteps: action.payload };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

export function useBookingFlow() {
  // Start with initialState to ensure SSR/client match
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Restore from localStorage AFTER hydration to prevent mismatch
  useEffect(() => {
    const restoredState = loadBookingProgress();
    if (restoredState) {
      // Restore each field individually to avoid overwriting the entire state
      if (restoredState.experienceType) {
        dispatch({ type: 'SET_EXPERIENCE_TYPE', payload: restoredState.experienceType });
      }
      if (restoredState.dates?.checkIn && restoredState.dates?.checkOut) {
        const checkIn = new Date(restoredState.dates.checkIn);
        const checkOut = new Date(restoredState.dates.checkOut);
        if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
          dispatch({ type: 'SET_DATES', payload: { checkIn, checkOut } });
        }
      }
      if (restoredState.guests && restoredState.guests > 1) {
        dispatch({ type: 'SET_GUESTS', payload: restoredState.guests });
      }
      if (restoredState.selectedOption) {
        dispatch({ type: 'SET_SELECTED_OPTION', payload: restoredState.selectedOption });
      }
      if (restoredState.selectedSurfWeek) {
        dispatch({ type: 'SET_SURF_WEEK', payload: restoredState.selectedSurfWeek });
      }
      if (restoredState.currentStep && restoredState.currentStep > 1) {
        dispatch({ type: 'SET_STEP', payload: restoredState.currentStep });
      }
    }
  }, []); // Empty dependency array - run once on mount

  // Save state to localStorage whenever it changes (debounced)
  useEffect(() => {
    // Don't save if we're on step 1 with no selections (initial state)
    if (state.currentStep === 1 && 
        !state.experienceType && 
        !state.selectedOption && 
        !state.selectedSurfWeek &&
        state.guests === 1) {
      return
    }

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(() => {
      saveBookingProgress(state)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [state])

  // Enhanced room assignment: Reordered step flow to collect guest details before room assignment
  const getStepFlow = useCallback(() => {
    // If steps were skipped (e.g., when surf week is pre-selected), include options step for participant selection
    if (state.skippedSteps && state.skippedSteps.length > 0) {
      const steps = ['options', 'surf-week-room-selection', 'guest-details', 'add-ons', 'review-pay'];
      return steps;
    }

    const baseSteps = ['experience'];
    
    // Only add 'options' step if experienceType is set
    // This prevents OptionSelection from rendering before state is ready
    if (state.experienceType) {
      baseSteps.push('options');
    }

    if (state.experienceType === 'surf-week') {
      baseSteps.push('surf-week-room-selection');
    }

    // Enhanced room assignment: Always add guest-details step for room bookings
    if (state.experienceType === 'room') {
      baseSteps.push('guest-details');

      // Only add room-assignment step if multiple guests
      if (state.guests > 1) {
        baseSteps.push('room-assignment');
      }
    } else if (state.experienceType === 'surf-week') {
      // For surf weeks, add guest-details after room selection
      baseSteps.push('guest-details');
    }

    baseSteps.push('add-ons', 'review-pay');
    return baseSteps;
  }, [state.experienceType, state.guests, state.skippedSteps]);

  const stepFlow = getStepFlow();
  const totalSteps = stepFlow.length;
  const maxStep = totalSteps;

  const nextStep = useCallback(() => {
    // Recalculate step flow to ensure we have the latest flow
    const currentStepFlow = getStepFlow();
    const currentMaxStep = currentStepFlow.length;
    
    if (state.currentStep < currentMaxStep) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep, getStepFlow]);

  const prevStep = useCallback(() => {
    // Don't allow going back to skipped steps or from the first effective step
    if (state.currentStep > 1) {
      // Check if we're at the first effective step when steps are skipped
      if (state.skippedSteps && state.skippedSteps.length > 0 && state.currentStep === 1) {
        return; // Already at first effective step
      }
      
      const newStep = state.currentStep - 1;
      const targetStepType = stepFlow[newStep - 1];

      // Clear selectedOption when going back to options step (room selection)
      // This allows users to change their room selection
      if (targetStepType === 'options') {
        dispatch({ type: 'SET_SELECTED_OPTION', payload: '' });
      }

      // If we're trying to go back to a skipped step, skip it
      if (state.skippedSteps && state.skippedSteps.length > 0) {
        // When steps are skipped, step 1 is already the first non-skipped step
        // So we can safely go back as long as we're not going to step 0
        if (newStep >= 1) {
          dispatch({ type: 'SET_STEP', payload: newStep });
        }
      } else {
        dispatch({ type: 'SET_STEP', payload: newStep });
      }
    }
  }, [state.currentStep, state.skippedSteps, stepFlow]);

  const jumpToStep = useCallback((targetStep: number) => {
    // Validate target step
    if (targetStep < 1 || targetStep > maxStep) {
      console.warn('Invalid step number:', targetStep);
      return;
    }
    
    // Only allow jumping to completed steps or current step
    // Users can't jump to future steps they haven't completed yet
    if (targetStep <= state.currentStep) {
      dispatch({ type: 'SET_STEP', payload: targetStep });
    } else {
      console.warn('Cannot jump to future step:', targetStep, 'Current step:', state.currentStep);
    }
  }, [state.currentStep, maxStep]);

  const setExperienceType = useCallback((type: 'room' | 'surf-week') => {
    dispatch({ type: 'SET_EXPERIENCE_TYPE', payload: type });
  }, []);

  const setDates = useCallback((checkIn: Date, checkOut: Date) => {
    dispatch({ type: 'SET_DATES', payload: { checkIn, checkOut } });
  }, []);

  const setGuests = useCallback((count: number) => {
    dispatch({ type: 'SET_GUESTS', payload: count });
  }, []);

  const setParticipantNames = useCallback((names: ParticipantName[]) => {
    dispatch({ type: 'SET_PARTICIPANT_NAMES', payload: names });
  }, []);

  const selectOption = useCallback((optionId: string) => {
    dispatch({ type: 'SET_SELECTED_OPTION', payload: optionId });
  }, []);

  const setSurfWeek = useCallback((surfWeekId: string) => {
    dispatch({ type: 'SET_SURF_WEEK', payload: surfWeekId });
  }, []);

  const setSurfWeekRoom = useCallback((roomId: string) => {
    dispatch({ type: 'SET_SURF_WEEK_ROOM', payload: roomId });
  }, []);

  const setRoomAssignments = useCallback((assignments: RoomAssignment[]) => {
    dispatch({ type: 'SET_ROOM_ASSIGNMENTS', payload: assignments });
  }, []);

  const addRoomAssignment = useCallback((assignment: RoomAssignment) => {
    dispatch({ type: 'ADD_ROOM_ASSIGNMENT', payload: assignment });
  }, []);

  const removeRoomAssignment = useCallback((assignmentId: string) => {
    dispatch({ type: 'REMOVE_ROOM_ASSIGNMENT', payload: assignmentId });
  }, []);

  const setAddOns = useCallback((addOns: AddOnSelection[]) => {
    dispatch({ type: 'SET_ADD_ONS', payload: addOns });
  }, []);

  const setPaymentMethod = useCallback((method: 'card_stripe' | 'bank_wire') => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  }, []);

  const setBankWireDetails = useCallback((details: BankWireDetails) => {
    dispatch({ type: 'SET_BANK_WIRE_DETAILS', payload: details });
  }, []);

  const updateGuestDetails = useCallback((guest: GuestInfo) => {
    dispatch({ type: 'ADD_GUEST_DETAILS', payload: guest });
  }, []);

  const updatePricing = useCallback((pricing: PricingBreakdown) => {
    dispatch({ type: 'UPDATE_PRICING', payload: pricing });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((field: string, message: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, message } });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setSkippedSteps = useCallback((steps: string[]) => {
    dispatch({ type: 'SET_SKIPPED_STEPS', payload: steps });
    // When steps are skipped, set initial step to 1 (first non-skipped step)
    if (steps.length > 0) {
      dispatch({ type: 'SET_STEP', payload: 1 });
    }
  }, []);

  const canProceedToNextStep = useCallback(() => {
    const currentStepType = stepFlow[state.currentStep - 1];

    switch (currentStepType) {
      case 'experience':
        return state.experienceType !== null;

      case 'options':
        // Validate participant names are filled for all guests
        const allParticipantNamesFilled = state.participantNames.length === state.guests &&
          state.participantNames.every(p => p.firstName && p.firstName.trim().length > 0);
        
        if (state.experienceType === 'surf-week') {
          // Check both selectedSurfWeek and selectedOption for compatibility
          // Also require all participant names to be filled
          return ((state.selectedSurfWeek !== null) || (state.selectedOption !== null)) && allParticipantNamesFilled;
        }
        // For rooms:
        // - Always require dates, guest count, and participant names
        // - For single-guest bookings we require a selected room at this step
        // - For multi-guest bookings room selection happens in the RoomAssignment step (supports multiple rooms)
        // Capacity validation is handled in OptionSelection / RoomAssignment via error state
        const hasCapacityError = state.errors.capacity !== undefined;
        return state.dates.checkIn && 
               state.dates.checkOut && 
               state.guests > 0 && 
               (state.guests > 1 ? true : state.selectedOption !== null) &&
               !hasCapacityError &&
               allParticipantNamesFilled;

      case 'surf-week-room-selection':
        // Check if all guests are assigned to rooms
        const surfWeekAssignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
        return surfWeekAssignedGuestIds.length === state.guests;

      case 'room-assignment':
        // Check if all guests are assigned to rooms
        const roomAssignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
        return roomAssignedGuestIds.length === state.guests;

      case 'add-ons':
        return true; // Always optional

      case 'guest-details':
        return state.guestDetails.length === state.guests &&
               state.guestDetails.every(g => g.firstName && g.lastName && g.email);

      case 'review-pay':
        // Use comprehensive validation for review step
        const validation = validateBookingSubmission({
          experienceType: state.experienceType,
          dates: state.dates,
          selectedOption: state.selectedOption,
          selectedSurfWeek: state.selectedSurfWeek,
          roomAssignments: state.roomAssignments,
          guests: state.guests,
          guestDetails: state.guestDetails,
          paymentMethod: state.paymentMethod,
        });
        return validation.isValid;

      default:
        return false;
    }
  }, [state.currentStep, state.experienceType, state.dates, state.selectedOption, state.selectedSurfWeek, state.roomAssignments, state.guests, state.guestDetails, state.paymentMethod, stepFlow]);

  // API integration methods
  const checkAvailability = useCallback(async (roomId: string) => {
    if (!state.dates.checkIn || !state.dates.checkOut) {
      setError('dates', 'Check-in and check-out dates are required');
      return null;
    }

    setLoading(true);
    try {
      const result = await availabilityService.checkAvailability({
        roomId,
        checkIn: dateToISOString(state.dates.checkIn),
        checkOut: dateToISOString(state.dates.checkOut),
      });

      if (!result.available) {
        setError('availability', result.message || 'Room not available for selected dates');
      }

      return result;
    } catch (error) {
      setError('availability', 'Failed to check availability. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.dates.checkIn, state.dates.checkOut, setError, setLoading]);

  const submitBooking = useCallback(async () => {
    // Use comprehensive validation
    const validation = validateBookingSubmission({
      experienceType: state.experienceType,
      dates: state.dates,
      selectedOption: state.selectedOption,
      selectedSurfWeek: state.selectedSurfWeek,
      roomAssignments: state.roomAssignments,
      guests: state.guests,
      guestDetails: state.guestDetails,
      paymentMethod: state.paymentMethod,
    });

    if (!validation.isValid) {
      // Show all validation errors to the user, not just the first one
      const errorMessage = validation.errors.length > 1
        ? `Please complete the following:\n${validation.errors.map(e => `• ${e}`).join('\n')}`
        : validation.errors[0] || 'Missing required booking information';

      setError('submission', errorMessage);

      // Always log validation failures for debugging (both dev and production)
      console.error('Booking validation failed:', {
        errors: validation.errors,
        missingFields: validation.missingFields,
        timestamp: new Date().toISOString(),
      });

      return null;
    }

    setLoading(true);
    try {
      if (!state.dates.checkIn || !state.dates.checkOut) {
        setError('dates', 'Check-in and check-out dates are required');
        return null;
      }

      const primaryGuest = state.guestDetails[0];
      const result = await bookingService.submitBooking({
        clientName: `${primaryGuest.firstName} ${primaryGuest.lastName}`,
        email: primaryGuest.email,
        phone: primaryGuest.phone,
        checkIn: dateToISOString(state.dates.checkIn),
        checkOut: dateToISOString(state.dates.checkOut),
        roomId: state.selectedOption || 'unknown',
        guests: state.guests,
        message: state.guestDetails[0]?.specialRequests,
      });

      if (!result.success) {
        setError('submission', result.message || 'Booking submission failed');
      }

      return result;
    } catch (error) {
      setError('submission', 'Failed to submit booking. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [state.guestDetails, state.dates, state.selectedOption, state.guests, setError, setLoading]);

  // Memoize actions object to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    nextStep,
    prevStep,
    jumpToStep,
    setExperienceType,
    setDates,
    setGuests,
    setParticipantNames,
    selectOption,
    setSurfWeek,
    setSurfWeekRoom,
    setRoomAssignments,
    addRoomAssignment,
    removeRoomAssignment,
    setAddOns,
    setPaymentMethod,
    setBankWireDetails,
    updateGuestDetails,
    updatePricing,
    setLoading,
    setError,
    clearError,
    reset,
    setSkippedSteps,
    // API integration actions
    checkAvailability,
    submitBooking,
  }), [
    nextStep,
    prevStep,
    jumpToStep,
    setExperienceType,
    setDates,
    setGuests,
    setParticipantNames,
    selectOption,
    setSurfWeek,
    setSurfWeekRoom,
    setRoomAssignments,
    addRoomAssignment,
    removeRoomAssignment,
    setAddOns,
    setPaymentMethod,
    setBankWireDetails,
    updateGuestDetails,
    updatePricing,
    setLoading,
    setError,
    clearError,
    reset,
    setSkippedSteps,
    checkAvailability,
    submitBooking,
  ]);

  return {
    state,
    actions,
    computed: {
      currentStep: state.currentStep,
      canProceedToNextStep: canProceedToNextStep(),
      isFirstStep: state.currentStep === 1,
      isLastStep: state.currentStep === maxStep,
      hasErrors: Object.keys(state.errors).length > 0,
      stepFlow,
      totalSteps,
      currentStepType: stepFlow[state.currentStep - 1],
    },
  };
}
