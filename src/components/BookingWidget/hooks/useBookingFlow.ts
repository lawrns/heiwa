import { useReducer, useCallback } from 'react';
import { BookingState, BookingAction, GuestInfo, PricingBreakdown, AddOnSelection, BankWireDetails, RoomAssignment } from '../types';

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

  // Dynamic step calculation based on booking type and guest count
  const getStepFlow = useCallback(() => {
    const baseSteps = ['experience', 'options'];

    if (state.experienceType === 'surf-week') {
      baseSteps.push('surf-week-room-selection');
    } else if (state.experienceType === 'room' && state.guests > 1) {
      baseSteps.push('room-assignment');
    }

    baseSteps.push('add-ons', 'guest-details', 'review-pay');
    return baseSteps;
  }, [state.experienceType, state.guests]);

  const stepFlow = getStepFlow();
  const totalSteps = stepFlow.length;
  const maxStep = totalSteps;

  const nextStep = useCallback(() => {
    if (state.currentStep < maxStep) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep, maxStep]);

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

  const canProceedToNextStep = useCallback(() => {
    const currentStepType = stepFlow[state.currentStep - 1];

    switch (currentStepType) {
      case 'experience':
        return state.experienceType !== null;

      case 'options':
        if (state.experienceType === 'surf-week') {
          return state.selectedSurfWeek !== null;
        }
        return state.dates.checkIn && state.dates.checkOut && state.guests > 0 && state.selectedOption !== null;

      case 'surf-week-room-selection':
        return state.selectedSurfWeekRoom !== null;

      case 'room-assignment':
        // Check if all guests are assigned to rooms
        const assignedGuestIds = state.roomAssignments.flatMap(a => a.guestIds);
        return assignedGuestIds.length === state.guests;

      case 'add-ons':
        return true; // Always optional

      case 'guest-details':
        return state.guestDetails.length === state.guests &&
               state.guestDetails.every(g => g.firstName && g.lastName && g.email);

      case 'review-pay':
        return state.paymentMethod !== null;

      default:
        return false;
    }
  }, [state, stepFlow]);

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
    },
    computed: {
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
