import { Room, SurfCamp, AddOn } from '@/lib/schemas';

export interface BookingItem {
  id: string;
  type: 'room' | 'surfCamp' | 'addOn';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate?: string;
  endDate?: string;
  nights?: number;
  participants?: number;
}

export interface PriceBreakdown {
  subtotal: number;
  taxes: number;
  fees: number;
  discounts: number;
  total: number;
  items: BookingItem[];
}

/**
 * Calculate room price based on dates, quantity, and pricing model
 */
export function calculateRoomPrice(
  room: Room & { id: string },
  startDate?: string,
  endDate?: string,
  quantity: number = 1
): { unitPrice: number; totalPrice: number; nights?: number } {
  const basePrice = room.pricing.standard || room.pricing.offSeason || 0;
  
  // Calculate nights if dates are provided
  let nights = 1;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Handle different pricing models based on bookingType and camp pricing
  let unitPrice = basePrice;

  if (room.bookingType === 'perBed') {
    // Use camp pricing for per-bed bookings
    if (typeof room.pricing.camp === 'object' && 'perBed' in room.pricing.camp) {
      unitPrice = room.pricing.camp.perBed * nights;
    } else {
      unitPrice = basePrice * nights;
    }
  } else {
    // Whole room pricing - use camp pricing if available
    if (typeof room.pricing.camp === 'object' && typeof room.pricing.camp === 'object' && !('perBed' in room.pricing.camp)) {
      // Use camp pricing for occupancy-based rates
      const campPricing = room.pricing.camp as Record<number, number>;
      const occupancyRate = campPricing[1] || basePrice; // Default to 1 person rate
      unitPrice = occupancyRate * nights;
    } else {
      unitPrice = basePrice * nights;
    }
  }

  return {
    unitPrice,
    totalPrice: unitPrice * quantity,
    nights
  };
}

/**
 * Calculate surf camp price based on participants and duration
 * Note: SurfCamp schema doesn't include pricing - this would need CampWeek data
 */
export function calculateSurfCampPrice(
  camp: SurfCamp & { id: string },
  participants: number = 1,
  duration?: number,
  basePrice: number = 0 // Base price should be provided from CampWeek or other source
): { unitPrice: number; totalPrice: number } {
  let unitPrice = basePrice;

  // Apply duration multiplier if specified
  if (duration && duration > 1) {
    unitPrice = basePrice * duration;
  }

  // Apply basic group discount based on participants (simplified)
  if (participants > 1) {
    const discountRate = Math.min(0.1 * (participants - 1), 0.3); // Max 30% discount
    unitPrice = unitPrice * (1 - discountRate);
  }

  return {
    unitPrice,
    totalPrice: unitPrice * participants
  };
}

/**
 * Calculate add-on service price
 */
export function calculateAddOnPrice(
  addOn: AddOn & { id: string },
  quantity: number = 1
): { unitPrice: number; totalPrice: number } {
  const unitPrice = addOn.price || 0;
  
  return {
    unitPrice,
    totalPrice: unitPrice * quantity
  };
}

/**
 * Calculate total amount for all booking items
 */
export function calculateTotalAmount(items: BookingItem[]): number {
  return items.reduce((total, item) => total + item.totalPrice, 0);
}

/**
 * Calculate comprehensive price breakdown with taxes and fees
 */
export function calculatePriceBreakdown(
  items: BookingItem[],
  taxRate: number = 0.1, // 10% default tax
  serviceFeeRate: number = 0.05, // 5% service fee
  discountAmount: number = 0
): PriceBreakdown {
  const subtotal = calculateTotalAmount(items);
  const taxes = subtotal * taxRate;
  const fees = subtotal * serviceFeeRate;
  const total = subtotal + taxes + fees - discountAmount;

  return {
    subtotal,
    taxes,
    fees,
    discounts: discountAmount,
    total: Math.max(0, total), // Ensure total is never negative
    items
  };
}

interface SeasonalRate {
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  price: number
}

/**
 * Get seasonal rate for a specific date
 */
function getSeasonalRate(seasonalRates: SeasonalRate[], date: string): number | null {
  if (!seasonalRates || seasonalRates.length === 0) return null;

  const targetDate = new Date(date);
  const month = targetDate.getMonth() + 1; // 1-based month
  const day = targetDate.getDate();

  for (const rate of seasonalRates) {
    if (isDateInRange(month, day, rate.startMonth, rate.startDay, rate.endMonth, rate.endDay)) {
      return rate.price;
    }
  }

  return null;
}

/**
 * Check if a date falls within a seasonal range
 */
function isDateInRange(
  month: number,
  day: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const targetDate = month * 100 + day; // MMDD format
  const startDate = startMonth * 100 + startDay;
  const endDate = endMonth * 100 + endDay;

  if (startDate <= endDate) {
    // Same year range
    return targetDate >= startDate && targetDate <= endDate;
  } else {
    // Cross-year range (e.g., Dec to Feb)
    return targetDate >= startDate || targetDate <= endDate;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate booking duration in nights
 */
export function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Validate booking dates
 */
export function validateBookingDates(startDate: string, endDate: string): {
  isValid: boolean;
  error?: string;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return { isValid: false, error: 'Start date cannot be in the past' };
  }

  if (end <= start) {
    return { isValid: false, error: 'End date must be after start date' };
  }

  const maxAdvanceBooking = new Date();
  maxAdvanceBooking.setFullYear(maxAdvanceBooking.getFullYear() + 2);

  if (start > maxAdvanceBooking) {
    return { isValid: false, error: 'Booking cannot be more than 2 years in advance' };
  }

  return { isValid: true };
}

/**
 * Apply discount to booking total
 */
export function applyDiscount(
  total: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): { discountAmount: number; newTotal: number } {
  let discountAmount = 0;

  if (discountType === 'percentage') {
    discountAmount = total * (discountValue / 100);
  } else {
    discountAmount = Math.min(discountValue, total); // Don't exceed total
  }

  return {
    discountAmount,
    newTotal: Math.max(0, total - discountAmount)
  };
}
