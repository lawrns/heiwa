export interface BookingState {
  currentStep: number;
  experienceType: 'room' | 'surf-week' | null;
  dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  guests: number;
  selectedOption: string | null;
  selectedSurfWeek: string | null;
  selectedSurfWeekRoom: string | null; // For surf week room selection
  roomAssignments: RoomAssignment[]; // For room assignment system
  selectedAddOns: AddOnSelection[];
  paymentMethod: 'card_stripe' | 'bank_wire' | null;
  bankWireDetails?: BankWireDetails;
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
  addOnsSubtotal: number;
  roomUpgrade?: number; // For surf week room upgrades
  roomQuantity?: number; // Number of rooms needed for guests
  taxes: number;
  fees: number;
  total: number;
  currency: string;
}

export interface AddOnSelection {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export interface BankWireDetails {
  accountName?: string;
  iban?: string;
  swift?: string;
  reference?: string;
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
  // Enhanced fields for occupancy and pricing (optional to avoid breaking existing code)
  priceFrom?: number;
  confirmedBooked?: number;
  availableSpots?: number;
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

export interface RoomAssignment {
  id: string;
  roomId: string;
  guestIds: string[];
  bedNumber?: number; // For shared/dorm rooms
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
  | { type: 'SET_SURF_WEEK'; payload: string }
  | { type: 'SET_SURF_WEEK_ROOM'; payload: string }
  | { type: 'SET_ROOM_ASSIGNMENTS'; payload: RoomAssignment[] }
  | { type: 'ADD_ROOM_ASSIGNMENT'; payload: RoomAssignment }
  | { type: 'REMOVE_ROOM_ASSIGNMENT'; payload: string }
  | { type: 'SET_ADD_ONS'; payload: AddOnSelection[] }
  | { type: 'SET_PAYMENT_METHOD'; payload: 'card_stripe' | 'bank_wire' }
  | { type: 'SET_BANK_WIRE_DETAILS'; payload: BankWireDetails }
  | { type: 'ADD_GUEST_DETAILS'; payload: GuestInfo }
  | { type: 'UPDATE_PRICING'; payload: PricingBreakdown }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'RESET' };
