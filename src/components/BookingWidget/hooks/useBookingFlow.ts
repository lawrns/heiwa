import { useReducer, useCallback } from 'react';
import { BookingState, BookingAction, GuestInfo, PricingBreakdown } from '../types';

const initialState: BookingState = {
  currentStep: 1,
  experienceType: null,
  dates: {
    checkIn: null,
    checkOut: null,
  },
  guests: 1,
  selectedOption: null,
  selectedSurfWeek: null,
  guestDetails: [],
  pricing: {
    basePrice: 0,
    taxes: 0,
    fees: 0,
    total: 0,
    currency: 'EUR',
  },
  isLoading: false,
  errors: {},
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_EXPERIENCE_TYPE':
      return { 
        ...state, 
        experienceType: action.payload,
        selectedOption: null, // Reset selection when changing type
      };
    
    case 'SET_DATES':
      return { 
        ...state, 
        dates: action.payload,
        selectedOption: null, // Reset selection when dates change
      };
    
    case 'SET_GUESTS':
      return { 
        ...state, 
        guests: action.payload,
        selectedOption: null, // Reset selection when guest count changes
      };
    
    case 'SET_SELECTED_OPTION':
      return { ...state, selectedOption: action.payload };

    case 'SET_SURF_WEEK':
      return { ...state, selectedSurfWeek: action.payload };

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
      const { [action.payload]: removed, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

export function useBookingFlow() {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const nextStep = useCallback(() => {
    if (state.currentStep < 5) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const setExperienceType = useCallback((type: 'room' | 'surf-week') => {
    dispatch({ type: 'SET_EXPERIENCE_TYPE', payload: type });
  }, []);

  const setDates = useCallback((checkIn: Date, checkOut: Date) => {
    dispatch({ type: 'SET_DATES', payload: { checkIn, checkOut } });
  }, []);

  const setGuests = useCallback((count: number) => {
    dispatch({ type: 'SET_GUESTS', payload: count });
  }, []);

  const selectOption = useCallback((optionId: string) => {
    dispatch({ type: 'SET_SELECTED_OPTION', payload: optionId });
  }, []);

  const setSurfWeek = useCallback((surfWeekId: string) => {
    dispatch({ type: 'SET_SURF_WEEK', payload: surfWeekId });
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

  const canProceedToNextStep = useCallback(() => {
    switch (state.currentStep) {
      case 1:
        return state.experienceType !== null;
      case 2:
        if (state.experienceType === 'surf-week') {
          return state.selectedSurfWeek !== null && state.guests > 0;
        }
        return state.dates.checkIn && state.dates.checkOut && state.guests > 0;
      case 3:
        return state.selectedOption !== null;
      case 4:
        return state.guestDetails.length === state.guests &&
               state.guestDetails.every(g => g.firstName && g.lastName && g.email);
      case 5:
        return true; // Review step, always can proceed to payment
      default:
        return false;
    }
  }, [state]);

  return {
    state,
    actions: {
      nextStep,
      prevStep,
      setExperienceType,
      setDates,
      setGuests,
      selectOption,
      setSurfWeek,
      updateGuestDetails,
      updatePricing,
      setLoading,
      setError,
      clearError,
      reset,
    },
    computed: {
      canProceedToNextStep: canProceedToNextStep(),
      isFirstStep: state.currentStep === 1,
      isLastStep: state.currentStep === 5,
      hasErrors: Object.keys(state.errors).length > 0,
    },
  };
}
