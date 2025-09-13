export interface BookingState {
  currentStep: number;
  experienceType: 'room' | 'surf-week' | null;
  dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  guests: number;
  selectedOption: string | null;
  guestDetails: GuestInfo[];
  pricing: PricingBreakdown;
  isLoading: boolean;
  errors: Record<string, string>;
}

export interface GuestInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dietaryRequirements?: string;
  specialRequests?: string;
}

export interface PricingBreakdown {
  basePrice: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
}

export interface SurfWeek {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  includes: string[];
  images: string[];
  isActive: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  type: 'private' | 'shared' | 'dorm';
  maxOccupancy: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
}

export interface ExperienceOption {
  id: string;
  type: 'room' | 'surf-week';
  title: string;
  description: string;
  price: number;
  image: string;
  features: string[];
}

export type BookingAction = 
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_EXPERIENCE_TYPE'; payload: 'room' | 'surf-week' }
  | { type: 'SET_DATES'; payload: { checkIn: Date; checkOut: Date } }
  | { type: 'SET_GUESTS'; payload: number }
  | { type: 'SET_SELECTED_OPTION'; payload: string }
  | { type: 'ADD_GUEST_DETAILS'; payload: GuestInfo }
  | { type: 'UPDATE_PRICING'; payload: PricingBreakdown }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'RESET' };
