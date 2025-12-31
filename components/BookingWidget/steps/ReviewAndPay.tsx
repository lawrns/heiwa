import { useState, useEffect, useRef } from 'react';
import { Calendar, Users, MapPin, CreditCard, CheckCircle, AlertCircle, Loader2, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { BookingState, PricingBreakdown } from '../types';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { BankWireInstructions } from '../components/BankWireInstructions';
import { ScrollIndicator } from '../components/ScrollIndicator';
import { apiFetch } from '../lib/api';
import { scrollToFirstError } from '@/lib/utils/scroll-to-error';
import { clearBookingProgress } from '@/lib/utils/booking-persistence';
import { ensureDate } from '@/lib/utils/date-helpers';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';
import { Button } from '@/components/ui/button';

interface BookingData {
  booking?: {
    id: string;
  };
  payment?: {
    payment_link?: string;
  };
}

interface RoomBookingPayload {
  room_id: string;
  start_date: string;
  end_date: string;
  participants: unknown[];
  add_ons: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
  pricing: PricingBreakdown;
  guests: number;
  source_url?: string;
  widget_version: string;
}

interface SurfWeekBookingPayload {
  surf_week_id: string;
  camp_id: string;
  participants: unknown[];
  add_ons: Array<{
    id: string;
    quantity: number;
    price: number;
  }>;
  pricing: PricingBreakdown;
  guests: number;
  source_url?: string;
  widget_version: string;
  room_assignments?: Array<{
    room_id: string;
    guest_ids: string[];
  }>;
}

type BookingPayload = RoomBookingPayload | SurfWeekBookingPayload;

interface ReviewAndPayProps {
  state: BookingState;
  actions: {
    updatePricing: (pricing: PricingBreakdown) => void;
    setPaymentMethod: (method: 'card_stripe' | 'bank_wire') => void;
  };
  onComplete: (bookingData?: BookingData) => void;
}

interface TaxBreakdownSectionProps {
  taxes: number;
  basePrice: number;
  roomUpgrade: number;
  addOnsSubtotal: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

function TaxBreakdownSection({ taxes, basePrice, roomUpgrade, addOnsSubtotal }: TaxBreakdownSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const TAX_RATE = 0.1; // 10% VAT - TODO: Fetch from tax_categories table based on room/surf camp
  
  // For now, show single tax line. Later can be enhanced to show breakdown by tax category
  // when we fetch tax_category_id from selected room/surf camp
  // Calculate VAT by rounding to nearest cent (2 decimal places)
  const accommodationTax = Math.round(basePrice * TAX_RATE / (1 + TAX_RATE) * 100) / 100;
  const roomUpgradeTax = roomUpgrade > 0 ? Math.round(roomUpgrade * TAX_RATE / (1 + TAX_RATE) * 100) / 100 : 0;
  // For add-ons, round to nearest cent - very small amounts like €1 will show €0.09 VAT
  // When displayed with 0 decimals, this may show as €0, which is mathematically correct for very small amounts
  const addOnsTax = addOnsSubtotal > 0 ? Math.round(addOnsSubtotal * TAX_RATE / (1 + TAX_RATE) * 100) / 100 : 0;
  
  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-gray-700 hover:text-gray-900 motion-safe:transition-colors motion-reduce:transition-none"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse tax details' : 'Expand tax details'}
      >
        <span>Taxes (VAT included)</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatPrice(taxes)}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-2 pl-4 border-l-2 border-accent/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="text-xs text-gray-600 mb-2">
            All prices include VAT. Tax breakdown shown below:
          </div>
          {basePrice > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Accommodation VAT (10%)</span>
              <span className="font-medium text-gray-700">{formatPrice(accommodationTax)}</span>
            </div>
          )}
          {roomUpgrade > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Room Upgrade VAT (10%)</span>
              <span className="font-medium text-gray-700">{formatPrice(roomUpgradeTax)}</span>
            </div>
          )}
          {addOnsSubtotal > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Add-ons VAT (10%)</span>
              <span className="font-medium text-gray-700">{formatPrice(addOnsTax)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-accent/20 mt-2">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-900">
              <span>Total VAT</span>
              <span>{formatPrice(taxes)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewAndPay({ state, actions, onComplete }: ReviewAndPayProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingBreakdown>(state.pricing);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const bankInstructionsRef = useRef<HTMLDivElement>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  // Fetch rooms and surf camps to get names for display
  const { rooms } = useRooms({
    checkIn: state.experienceType === 'room' ? state.dates.checkIn : null,
    checkOut: state.experienceType === 'room' ? state.dates.checkOut : null,
    guests: state.guests || 1
  });
  const { surfCamps } = useSurfCamps();

  // Get room name for display
  const getRoomName = () => {
    if (state.experienceType !== 'room' || !state.selectedOption) return 'Room Booking';
    const selectedRoom = rooms.find(r => r.id === state.selectedOption);
    return selectedRoom?.name || 'Room Booking';
  };

  // Get surf week name for display
  const getSurfWeekName = () => {
    if (state.experienceType !== 'surf-week' || !state.selectedSurfWeek) return 'Surf Week Package';
    const selectedCamp = surfCamps.find(c => c.id === state.selectedSurfWeek);
    return selectedCamp?.name || 'Surf Week Package';
  };

  // Calculate pricing from established base price and current add-ons
  // PRICING RULES:
  // 1. Prices are tax-INCLUSIVE (tax is extracted for display, not added)
  // 2. No service fee
  // 3. Room upgrade = DIFFERENCE from base price (calculated in SurfWeekRoomSelection)
  useEffect(() => {
    const TAX_RATE = 0.1; // 10% VAT included in prices
    const basePrice = state.pricing.basePrice || 0;
    const addOnsSubtotal = state.selectedAddOns.reduce((total, addOn) => total + addOn.price * addOn.quantity, 0);
    const roomUpgrade = state.pricing.roomUpgrade || 0;
    const subtotal = basePrice + addOnsSubtotal + roomUpgrade;
    // Tax is INCLUDED in price, extract for display (not added on top)
    const taxes = Math.round(subtotal * TAX_RATE / (1 + TAX_RATE));
    const fees = 0; // No service fee

    const newPricing: PricingBreakdown = {
      basePrice,
      addOnsSubtotal,
      roomUpgrade,
      taxes,
      fees,
      total: subtotal, // Price already includes tax
      currency: 'EUR',
    };

    setPricing(newPricing);
    actions.updatePricing(newPricing);
  }, [state.pricing.basePrice, state.pricing.roomUpgrade, state.selectedAddOns]);

  // Check if bank instructions are below viewport and show jump button
  useEffect(() => {
    if (state.paymentMethod === 'bank_wire' && bankInstructionsRef.current && paymentSectionRef.current) {
      const checkVisibility = () => {
        const paymentRect = paymentSectionRef.current?.getBoundingClientRect();
        const instructionsRect = bankInstructionsRef.current?.getBoundingClientRect();
        
        if (paymentRect && instructionsRect) {
          const instructionsBelow = instructionsRect.top > window.innerHeight;
          setShowJumpButton(instructionsBelow);
        }
      };

      checkVisibility();
      window.addEventListener('resize', checkVisibility);
      return () => window.removeEventListener('resize', checkVisibility);
    } else {
      setShowJumpButton(false);
    }
  }, [state.paymentMethod]);

  const scrollToInstructions = () => {
    if (bankInstructionsRef.current) {
      bankInstructionsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Helper to ensure date is a Date object (handles localStorage string dates)
  const ensureDate = (date: Date | string | null | undefined): Date | null => {
    if (!date) return null
    if (date instanceof Date) return date
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const formatDate = (date: Date | string | null | undefined) => {
    const dateObj = ensureDate(date)
    if (!dateObj) return 'N/A'
    
    // Use UTC dates to avoid timezone issues
    // Convert to UTC date string and parse to ensure consistent display
    const utcDate = new Date(Date.UTC(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate()
    ));
    
    // European format DD/MM/YYYY
    return utcDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Import validation functions
      const { validateBookingSubmission, getValidationErrorMessage } = await import('@/lib/booking-utils');
      
      // Comprehensive pre-submission validation
      const validation = validateBookingSubmission({
        experienceType: state.experienceType,
        dates: state.dates,
        selectedOption: state.selectedOption,
        selectedSurfWeek: state.selectedSurfWeek,
        guests: state.guests,
        guestDetails: state.guestDetails,
        paymentMethod: state.paymentMethod,
      });

      if (!validation.isValid) {
        const errorMessage = getValidationErrorMessage(validation);
        console.error('❌ Booking validation failed:', {
          errors: validation.errors,
          missingFields: validation.missingFields,
          state: {
            experienceType: state.experienceType,
            hasCheckIn: !!state.dates.checkIn,
            hasCheckOut: !!state.dates.checkOut,
            selectedOption: state.selectedOption,
            selectedSurfWeek: state.selectedSurfWeek,
            guests: state.guests,
            guestDetailsCount: state.guestDetails.length,
            paymentMethod: state.paymentMethod,
          }
        });
        setPaymentError(errorMessage);
        setIsProcessing(false);
        
        // Scroll to first error field or relevant section
        setTimeout(() => {
          // Try to scroll to error based on validation errors
          if (validation.errors.some(e => e.includes('guest') || e.includes('Guest'))) {
            // Scroll to guest details step
            const guestDetailsSection = document.querySelector('[data-step="guest-details"]') || 
                                       document.getElementById('guest-details-section')
            if (guestDetailsSection) {
              guestDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
              scrollToFirstError()
            }
          } else if (validation.errors.some(e => e.includes('date') || e.includes('Date'))) {
            // Scroll to date selection
            const dateSection = document.querySelector('[data-step="dates"]') ||
                               document.querySelector('[aria-label*="date" i]')
            if (dateSection) {
              dateSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
              scrollToFirstError()
            }
          } else {
            // Generic scroll to first error
            scrollToFirstError()
          }
        }, 100)
        
        return;
      }

      // Map guest details to participants - include ALL fields
      const participants = state.guestDetails.map(g => ({
        firstName: g.firstName,
        lastName: g.lastName,
        name: `${g.firstName} ${g.lastName}`.trim(),
        email: g.email,
        phone: g.phone,
        dietaryRequirements: g.dietaryRequirements || '',
        specialRequests: g.specialRequests || '',
      }));

      // Validate participants array
      if (!participants || participants.length === 0) {
        const errorMessage = 'At least one guest is required';
        console.error('❌ No participants found');
        setPaymentError(errorMessage);
        setIsProcessing(false);
        return;
      }

      let endpoint = '';
      let payload: BookingPayload = {} as BookingPayload;

      // Determine endpoint and payload based on experience type
      if (state.experienceType === 'room') {
        // Room booking validation - check all required fields
        const hasAssignments = state.roomAssignments && state.roomAssignments.length > 0;
        if (!state.dates.checkIn || !state.dates.checkOut || (!state.selectedOption && !hasAssignments)) {
          const missing = [];
          if (!state.dates.checkIn) missing.push('check-in date');
          if (!state.dates.checkOut) missing.push('check-out date');
          if (!state.selectedOption && !hasAssignments) missing.push('room selection');
          setPaymentError(`Missing required information: ${missing.join(', ')}`);
          setIsProcessing(false);
          return;
        }

        endpoint = '/widget/room-bookings';
        payload = {
          ...(hasAssignments
            ? {
                room_assignments: state.roomAssignments.map((a) => ({
                  room_id: a.roomId,
                  guest_ids: a.guestIds,
                })),
              }
            : {
                room_id: state.selectedOption,
              }),
          start_date: ensureDate(state.dates.checkIn)?.toISOString().split('T')[0] || '',
          end_date: ensureDate(state.dates.checkOut)?.toISOString().split('T')[0] || '',
          participants,
          add_ons: state.selectedAddOns.map(a => ({ id: a.id, quantity: a.quantity, price: a.price })),
          pricing: pricing,
          guests: state.guests,
          source_url: typeof window !== 'undefined' ? window.location.href : undefined,
          widget_version: 'v1'
        };
      } else if (state.experienceType === 'surf-week') {
        // Surf week booking - check both selectedSurfWeek and selectedOption for compatibility
        const surfWeekId = state.selectedSurfWeek || state.selectedOption;
        if (!surfWeekId) {
          setPaymentError('Please select a surf week');
          setIsProcessing(false);
          return;
        }

        endpoint = '/bookings';
        payload = {
          camp_id: surfWeekId,
          participants,
          pricing: pricing,
          source_url: typeof window !== 'undefined' ? window.location.href : undefined,
          widget_version: 'wp-widget-test',
          room_assignments: state.roomAssignments.length > 0 ? state.roomAssignments.map(assignment => ({
            room_id: assignment.roomId,
            guest_ids: assignment.guestIds
          })) : undefined
        };
      } else {
        setPaymentError('Please select an experience type (Room or Surf Week)');
        setIsProcessing(false);
        return;
      }

      // Log booking submission with full state for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Booking submission:', {
          endpoint,
          payload: { ...payload, participants: payload.participants?.length || 0 },
          state: {
            experienceType: state.experienceType,
            selectedOption: state.selectedOption,
            selectedSurfWeek: state.selectedSurfWeek,
            checkIn: ensureDate(state.dates.checkIn)?.toISOString(),
            checkOut: ensureDate(state.dates.checkOut)?.toISOString(),
            guests: state.guests,
            guestDetailsCount: state.guestDetails.length,
            paymentMethod: state.paymentMethod,
          }
        });
      }

      // Retry logic for API calls with exponential backoff
      const { retryRequest } = await import('@/lib/error-handler');
      
      const res = await retryRequest(
        async () => {
          const response = await apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error || `HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        },
        {
          maxRetries: 3,
          delay: 1000,
          backoff: true,
        }
      );

      const data = await res.json();
      if (!data?.success) {
        const errorDetails = data?.details ? ` [${data.details}]` : '';
        const errorMessage = (data?.error || `Request failed`) + errorDetails;
        console.error('❌ Booking API error:', {
          status: res.status,
          error: data?.error,
          errorCode: data?.errorCode,
          debug: data?.debug,
          details: data?.details
        });
        throw new Error(errorMessage);
      }

      console.log('✅ Booking created successfully:', {
        bookingId: data.data?.booking?.id,
        paymentLink: data.data?.payment?.payment_link,
        paymentMethod: state.paymentMethod
      });

      // Handle payment flow based on method
      if (state.paymentMethod === 'card_stripe') {
        // Get customer details from first guest
        const primaryGuest = state.guestDetails[0];
        const customerEmail = primaryGuest?.email;
        const customerName = `${primaryGuest?.firstName} ${primaryGuest?.lastName}`.trim();

        if (!customerEmail) {
          throw new Error('Guest email is required for payment processing');
        }

        // Create payment intent with customer creation
        const paymentIntentRes = await apiFetch('/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({
            amount: pricing.total,
            currency: 'eur',
            customerEmail,
            customerName,
            metadata: {
              bookingId: data.data?.booking?.id,
              bookingNumber: data.data?.booking?.booking_number,
              experienceType: state.experienceType,
              source: 'heiwa_house_widget'
            },
          }),
        });

        const paymentIntentData = await paymentIntentRes.json();

        if (!paymentIntentRes.ok || !paymentIntentData?.success) {
          throw new Error(paymentIntentData?.error || 'Failed to initialize payment');
        }

        console.log('✅ Stripe Payment Intent created:', {
          id: paymentIntentData.id,
          customerId: paymentIntentData.customerId
        });
        
        // For now, mark as completed for testing user flow
        // In production, you would render Stripe Elements here with the clientSecret
        setBookingCompleted(true);
        clearBookingProgress(); // Clear saved progress on successful booking
        onComplete(data.data);

      } else {
        // For bank wire - mark as completed and scroll to instructions
        setBookingCompleted(true);
        
        // Scroll to bank instructions after a short delay to ensure DOM is updated
        setTimeout(() => {
          if (bankInstructionsRef.current) {
            bankInstructionsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
        
        // Still call onComplete for booking context
        clearBookingProgress(); // Clear saved progress on successful booking
        onComplete(data.data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-bold text-gray-900" data-testid="review-pay-title">Review & Pay</h3>
        <p className="text-lg text-gray-600">Confirm your booking details and complete payment</p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h4 className="text-xl font-semibold text-gray-900 mb-4" data-testid="booking-summary-title">Booking Summary</h4>
        
        <div className="space-y-4">
          {/* Experience Type */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-dark rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {state.experienceType === 'room' ? '🏠' : '🏄‍♂️'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {state.experienceType === 'room' ? 'Room Booking' : 'Surf Week Package'}
              </div>
              <div className="text-base text-gray-600">
                {state.experienceType === 'room' ? getRoomName() : getSurfWeekName()}
              </div>
            </div>
          </div>

          {/* Dates - TOON-compliant icon-text gap (8px) */}
          {state.dates.checkIn && state.dates.checkOut && (
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Dates</div>
                <div className="text-base text-gray-600">
                  {formatDate(state.dates.checkIn)} - {formatDate(state.dates.checkOut)}
                  {state.experienceType === 'room' && (
                    <span className="ml-2">
                      ({(() => {
                        const checkIn = ensureDate(state.dates.checkIn)
                        const checkOut = ensureDate(state.dates.checkOut)
                        if (!checkIn || !checkOut) return '0'
                        return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                      })()} nights)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guests - TOON-compliant icon-text gap (8px) */}
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Guests</div>
              <div className="text-base text-gray-600">
                {state.guests} {state.guests === 1 ? 'guest' : 'guests'}
              </div>
            </div>
          </div>

          {/* Location - TOON-compliant icon-text gap (8px) */}
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-gray-400 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Location</div>
              <div className="text-base text-gray-600">
                {state.experienceType === 'room' ? 'Heiwa House, Santa Cruz, Portugal' : 'Santa Cruz, Portugal'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Details Summary */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200" data-testid="guest-completion-status">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h4>

        <div className="space-y-3">
          {state.guestDetails.map((guest) => (
            <div key={guest.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <div className="font-medium text-gray-900">
                  {guest.firstName} {guest.lastName}
                </div>
                <div className="text-base text-gray-600">
                  {guest.email} • {guest.phone}
                </div>
                {guest.dietaryRequirements && (
                  <div className="text-sm text-accent mt-1">
                    Dietary: {guest.dietaryRequirements}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-base font-medium">Complete</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Assignments Summary */}
      {state.roomAssignments.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            Room Assignments
          </h4>

          <div className="space-y-3">
            {state.roomAssignments.map((assignment) => {
              return (
                <div key={assignment.id} className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {assignment.roomId}
                    </div>
                    <div className="text-base text-blue-600 font-medium">
                      {assignment.guestIds.length} {assignment.guestIds.length === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                  <div className="text-base text-gray-600">
                    {assignment.guestIds.map((guestId) => {
                      const guestNumber = parseInt(guestId.split('-')[1]) - 1;
                      const guest = state.guestDetails[guestNumber];
                      return guest ? `${guest.firstName} ${guest.lastName}` : `Guest ${guestNumber + 1}`;
                    }).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add-ons Summary */}
      {state.selectedAddOns.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-gray-600" />
            Selected Add-ons
          </h4>

          <div className="space-y-3">
            {state.selectedAddOns.map((addOn) => (
              <div key={addOn.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{addOn.name}</div>
                  <div className="text-base text-gray-600">
                    {formatPrice(addOn.price)} × {addOn.quantity}
                  </div>
                </div>
                <div className="font-medium text-gray-900">
                  {formatPrice(addOn.price * addOn.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="bg-accent/5 rounded-[10px] p-6 border border-accent/20">
        <h4 className="text-xl font-semibold text-gray-900 mb-4" data-testid="pricing-breakdown-title">Pricing Breakdown</h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Base Price</span>
            <span className="font-medium">{formatPrice(pricing.basePrice)}</span>
          </div>
          {pricing.roomUpgrade && pricing.roomUpgrade > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Room Upgrade</span>
              <span className="font-medium">{formatPrice(pricing.roomUpgrade)}</span>
            </div>
          )}
          {pricing.addOnsSubtotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Add-ons</span>
              <span className="font-medium">{formatPrice(pricing.addOnsSubtotal)}</span>
            </div>
          )}
          
          {/* Expandable Tax Details */}
          <TaxBreakdownSection 
            taxes={pricing.taxes}
            basePrice={pricing.basePrice}
            roomUpgrade={pricing.roomUpgrade || 0}
            addOnsSubtotal={pricing.addOnsSubtotal}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Service Fee (5%)</span>
            <span className="font-medium">{formatPrice(pricing.fees)}</span>
          </div>
          <div className="border-t border-accent/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-900">Total</span>
              <span className="text-3xl font-bold text-accent">{formatPrice(pricing.total)}</span>
            </div>
          </div>
        </div>
      </div>

        {/* Payment Error */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="payment-error">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-base font-medium mb-1">Booking Failed</p>
                <p className="text-base">{paymentError}</p>
                <p className="text-sm mt-2 text-red-600">
                  Please check your information and try again. If the problem persists, contact support.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
            required
          />
          <label htmlFor="terms" className="text-base text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-accent hover:text-accent-dark underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-accent hover:text-accent-dark underline">
              Privacy Policy
            </a>
            . I understand that this booking is subject to our cancellation policy.
          </label>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div ref={paymentSectionRef}>
        <PaymentMethodSelector
          selectedMethod={state.paymentMethod}
          onMethodChange={actions.setPaymentMethod}
        />
      </div>

      {/* Jump to Instructions Button for Bank Transfer */}
      {showJumpButton && state.paymentMethod === 'bank_wire' && (
        <div className="flex justify-center">
          <button
            onClick={scrollToInstructions}
            className="inline-flex items-center justify-center gap-2 pl-5 pr-6 py-2.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-[10px] text-sm font-medium cursor-pointer transition-all duration-150 ease-out hover:bg-orange-200 hover:border-orange-300 hover:text-orange-800"
          >
            <ChevronDown size={16} className="animate-bounce" />
            View Bank Transfer Instructions
          </button>
        </div>
      )}

      {/* Booking Success Message for Bank Transfer */}
      {bookingCompleted && state.paymentMethod === 'bank_wire' && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-[10px]">
          <div className="flex items-start gap-3">
            <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-green-900 mb-2">
                Booking Confirmed! 🎉
              </h4>
              <p className="text-lg text-green-800 mb-3">
                Your booking has been confirmed. Please complete the bank transfer below to secure your reservation.
              </p>
              <p className="text-base text-green-700">
                <strong>Next step:</strong> Check your email for booking confirmation and complete the bank transfer using the instructions below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Wire Instructions */}
      {state.paymentMethod === 'bank_wire' && (
        <div ref={bankInstructionsRef} className="relative">
          <BankWireInstructions
            totalAmount={pricing.total}
            currency={pricing.currency}
            bookingReference={`HW-${Date.now().toString().slice(-6)}`}
          />
          
          {/* Scroll indicator for bank instructions - reference parent container */}
          <ScrollIndicator 
            text="Bank transfer details below"
            className="mt-4"
          />
        </div>
      )}

      {/* Payment Button */}
      {state.paymentMethod && (
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !termsAccepted}
            variant="default"
            size="lg"
            isLoading={isProcessing}
            loadingText="Processing..."
            className="w-full min-h-[48px] text-base"
          >
            {!isProcessing && (
              state.paymentMethod === 'card_stripe' ? (
                <>
                  <CreditCard size={20} />
                  Pay {formatPrice(pricing.total)} Now
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Complete Booking
                </>
              )
            )}
          </Button>

          {!bookingCompleted && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {state.paymentMethod === 'card_stripe'
                  ? 'Secure payment powered by Stripe • Your payment information is encrypted and secure'
                  : 'Your booking will be confirmed. Complete the bank transfer below to secure your reservation.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}