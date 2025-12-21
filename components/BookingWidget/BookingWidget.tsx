'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { X, Calendar, CheckCircle, ArrowLeft, ArrowRight, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useBooking } from '@/lib/booking-context';
import type { BookingSuccessData } from '@/lib/types';
import { ProgressIndicator } from './ui/ProgressIndicator';
import { ExperienceSelection } from './steps/ExperienceSelection';
import { RoomAssignment } from './steps/RoomAssignment';
import { SurfWeekRoomSelection } from './steps/SurfWeekRoomSelection';
import { AddOnsSelection } from './steps/AddOnsSelection';
import { GuestDetails } from './steps/GuestDetails';
import { ReviewAndPay } from './steps/ReviewAndPay';
import './styles/surf-enhancements.css';

// Lazy load OptionSelection to prevent premature initialization
// This prevents the component and its dependencies from loading until actually needed
const OptionSelectionLazy = lazy(() => 
  import('./steps/OptionSelection').then(module => ({ default: module.OptionSelection }))
);

interface BookingWidgetProps {
  className?: string;
  config?: {
    apiEndpoint?: string;
    apiKey?: string;
    position?: 'right' | 'left' | 'center';
    primaryColor?: string;
    triggerText?: string;
    maxGuests?: number;
  };
  // Web Component integration props
  isWebComponent?: boolean;
  externalTrigger?: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

export function BookingWidget({
  config,
  isWebComponent = false,
  onModalStateChange
}: BookingWidgetProps) {
  const { isBookingOpen, closeBooking: closeBookingContext } = useBooking();
  const [isOpen, setIsOpen] = useState(isWebComponent);
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccessData | null>(null);
  const { state, actions, computed } = useBookingFlow();
  const { setBookingSuccess: setBookingSuccessInContext, selectedSurfWeek, setSelectedSurfWeek } = useBooking();
  const contentScrollRef = React.useRef<HTMLDivElement>(null);

  // Sync internal isOpen state with context's isBookingOpen when used in FloatingBookingWidget
  useEffect(() => {
    if (!isWebComponent) {
      // When used in FloatingBookingWidget, sync with context state
      setIsOpen(isBookingOpen);
    }
  }, [isBookingOpen, isWebComponent]);

  useEffect(() => {
    // Handle body overflow and modal classes
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('heiwa-modal-open');

      // For Web Component, modal stays within shadow DOM
      // Removed setTimeout to prevent flickering - modal positioning handled by CSS
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('heiwa-modal-open');
    }

    // Notify Web Component of modal state changes
    onModalStateChange?.(isOpen);

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('heiwa-modal-open');
    };
  }, [isOpen, isWebComponent, onModalStateChange]);

  // Scroll to top of content area when step changes to ensure current step is visible
  useEffect(() => {
    if (contentScrollRef.current && isOpen) {
      // Scroll to top when step changes to ensure the current step content is visible
      // Use a small delay to allow the step content to render
      const timeoutId = setTimeout(() => {
        contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [computed.currentStepType, isOpen]);

  // Handle pre-selected surf week - use a ref to prevent multiple runs
  const prevSurfWeekRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    // Only run when widget opens or surf week changes
    if (!isOpen) {
      prevSurfWeekRef.current = null;
      return;
    }

    const currentSurfWeekId = selectedSurfWeek?.id || null;
    
    // Skip if we've already processed this surf week
    if (prevSurfWeekRef.current === currentSurfWeekId) {
      return;
    }

    // Log state changes for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 BookingWidget state sync:', {
        isOpen,
        selectedSurfWeekId: currentSurfWeekId,
        prevSurfWeekId: prevSurfWeekRef.current,
        isWebComponent,
      });
    }

    // Batch all state updates to prevent flickering
    // Reduced delay for better UX - only keep minimal delay for Safari
    const delay = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 50 : 0;
    
    const timeoutId = setTimeout(() => {
      if (selectedSurfWeek) {
        // Pre-select surf week in the booking flow
        actions.setExperienceType('surf-week');
        actions.setSurfWeek(selectedSurfWeek.id);
        
        // Set dates from surf week's start_date and end_date
        if (selectedSurfWeek.start_date && selectedSurfWeek.end_date) {
          const checkIn = new Date(selectedSurfWeek.start_date);
          const checkOut = new Date(selectedSurfWeek.end_date);
          // Ensure dates are valid before setting
          if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
            actions.setDates(checkIn, checkOut);
          }
        }
        
        // Skip experience and options steps when surf week is pre-selected
        actions.setSkippedSteps(['experience', 'options']);
        
        prevSurfWeekRef.current = currentSurfWeekId;
      } else {
        // Reset skipped steps when no surf week is pre-selected
        actions.setSkippedSteps([]);
        prevSurfWeekRef.current = null;
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isOpen, selectedSurfWeek?.id, actions]);

  const openWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
    setBookingSuccess(null);
    setBookingSuccessInContext(false); // Reset booking success when closing
    setSelectedSurfWeek(null); // Clear selected surf week
    actions.reset();
  };

  const handleBookingComplete = (bookingData?: any) => {
    if (bookingData) {
      // Show success message with booking data
      setBookingSuccess(bookingData);
      // Set booking success in context to hide WhatsApp button
      setBookingSuccessInContext(true);
    } else {
      // No booking data, just close widget
      closeWidget();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeWidget();
    }
  };

  const renderCurrentStep = () => {
    const currentStepType = computed.currentStepType;

    // Show loading overlay during API operations
    if (state.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted text-center">
            {state.errors.availability ? 'Checking availability...' :
             state.errors.submission ? 'Submitting booking...' :
             'Processing...'}
          </p>
        </div>
      );
    }

    // Render step components conditionally to avoid initializing all components at once
    // This prevents initialization errors when components have dependencies that aren't ready
    const renderStepComponent = () => {
      switch (currentStepType) {
        case 'experience':
          return <ExperienceSelection state={state} actions={actions} />;
        case 'options':
          // Guard: Only render OptionSelection when experienceType is set
          // This prevents initialization errors when state isn't ready
          if (!state.experienceType) {
            return (
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted text-center">Loading options...</p>
              </div>
            );
          }
          return (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted text-center">Loading...</p>
              </div>
            }>
              <OptionSelectionLazy state={state} actions={actions} />
            </Suspense>
          );
        case 'room-assignment':
          return <RoomAssignment state={state} actions={actions} />;
        case 'surf-week-room-selection':
          return <SurfWeekRoomSelection state={state} actions={actions} />;
        case 'add-ons':
          return <AddOnsSelection state={state} actions={actions} />;
        case 'guest-details':
          return <GuestDetails state={state} actions={actions} />;
        case 'review-pay':
          return <ReviewAndPay state={state} actions={actions} onComplete={handleBookingComplete} />;
        default:
          return (
            <div className="text-center text-red-600">
              <p>Invalid step: {currentStepType}</p>
            </div>
          );
      }
    };

    return (
      <div
        key={`${state.currentStep}-${currentStepType}`}
        className="animate-in fade-in-0 slide-in-from-right-4 duration-500 ease-out"
      >
        {renderStepComponent()}
      </div>
    );
  };

  return (
    <>
      {/* Trigger Button - Only render for non-Web Component usage */}
      {!isWebComponent && (
        <Button
          size="lg"
          onClick={openWidget}
          className="relative z-50 animate-in fade-in-0 slide-in-from-top-2 duration-700 delay-300"
          aria-label="Open booking widget"
        >
          <Calendar size={18} />
          <span className="relative">
            {config?.triggerText || 'Book Now'}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </span>
        </Button>
      )}

      {/* Widget Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-end bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          {/* Widget Panel */}
          <div
            className="relative w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col sm:max-w-lg md:max-w-2xl lg:max-w-3xl transform-gpu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Book Your Surf Adventure
              </h2>
              <button
                onClick={closeWidget}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close booking widget"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
              <ProgressIndicator
                currentStep={computed.currentStep}
                stepFlow={computed.stepFlow}
                totalSteps={computed.totalSteps}
                skippedSteps={state.skippedSteps}
                onStepClick={actions.jumpToStep}
              />
            </div>

            {/* Content */}
            <div ref={contentScrollRef} className="flex-1 overflow-y-auto relative shadow-inner">
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                {bookingSuccess ? (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                      <p className="text-base text-gray-600 mb-4">
                        Booking #{bookingSuccess.booking?.booking_number || 'N/A'}
                      </p>

                      {/* Booking Details Card */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 text-left max-w-md mx-auto">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h4>

                        <div className="space-y-3">
                          {/* Booking Type */}
                          <div className="flex justify-between items-center">
                            <span className="text-base text-gray-600">Type:</span>
                            <span className="font-medium text-base text-gray-900">
                              {state.experienceType === 'room' ? 'Room Booking' : 'Surf Week Package'}
                            </span>
                          </div>

                          {/* Dates */}
                          {state.dates.checkIn && state.dates.checkOut && (
                            <div className="flex justify-between items-center">
                              <span className="text-base text-gray-600">Dates:</span>
                              <span className="font-medium text-base text-gray-900 text-right">
                                {state.dates.checkIn.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })} - {state.dates.checkOut.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}

                          {/* Guests */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Guests:</span>
                            <span className="font-medium text-gray-900">{state.guests}</span>
                          </div>

                          {/* Total Amount */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-bold text-lg text-green-600">
                              €{state.pricing.total?.toFixed(2) || '0.00'}
                            </span>
                          </div>

                          {/* Payment Method */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Payment:</span>
                            <span className="font-medium text-gray-900">
                              {state.paymentMethod === 'card_stripe' ? 'Credit Card' : 'Bank Transfer'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps */}
                      <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
                        <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {state.paymentMethod === 'card_stripe' ? (
                            <>
                              <li>• Payment processing will complete shortly</li>
                              <li>• Confirmation email sent to your inbox</li>
                              <li>• Check your email for booking details</li>
                            </>
                          ) : (
                            <>
                              <li>• Confirmation email sent to your inbox</li>
                              <li>• Complete bank transfer within 24 hours</li>
                              <li>• Send transfer confirmation to bookings@heiwahouse.com</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={closeWidget}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        maxWidth: '320px',
                        minHeight: '48px',
                        padding: '14px 24px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 150ms ease-out',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#15803d';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#16a34a';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      Close & Return to Site
                    </button>
                  </div>
                ) : (
                  renderCurrentStep()
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            {!bookingSuccess && computed.currentStepType !== 'review-pay' && (
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-t border-gray-200 bg-white">
                <div className="relative group">
                  {/* Back Button - Custom styled for proper padding */}
                  <button
                    onClick={actions.prevStep}
                    disabled={computed.isFirstStep}
                    aria-label="Go back to previous step"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '44px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      color: '#374151',
                      cursor: computed.isFirstStep ? 'not-allowed' : 'pointer',
                      opacity: computed.isFirstStep ? 0.5 : 1,
                      transition: 'all 150ms ease-out',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      if (!computed.isFirstStep) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#9ca3af';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <ArrowLeft size={16} style={{ flexShrink: 0 }} />
                    <span>Back</span>
                  </button>
                  
                  {/* Tooltip */}
                  {!computed.isFirstStep && (
                    <div className="
                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                      px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none whitespace-nowrap z-50
                    ">
                      <div className="flex items-center gap-2">
                        <Info size={12} />
                        <span>Edit previous step</span>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      €{state.pricing.total?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-500 hidden sm:block">Total</div>
                  </div>

                  {/* Next Button - Custom styled for proper padding */}
                  <button
                    onClick={actions.nextStep}
                    disabled={!computed.canProceedToNextStep || state.isLoading}
                    aria-label={computed.isLastStep ? 'Complete booking' : 'Continue to next step'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minHeight: '44px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: (!computed.canProceedToNextStep || state.isLoading) ? '#f5a97a' : '#ec681c',
                      color: 'white',
                      cursor: (!computed.canProceedToNextStep || state.isLoading) ? 'not-allowed' : 'pointer',
                      opacity: (!computed.canProceedToNextStep || state.isLoading) ? 0.6 : 1,
                      transition: 'all 150ms ease-out',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      if (computed.canProceedToNextStep && !state.isLoading) {
                        e.currentTarget.style.backgroundColor = '#d65d16';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (computed.canProceedToNextStep && !state.isLoading) {
                        e.currentTarget.style.backgroundColor = '#ec681c';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : computed.isLastStep ? (
                      'Complete Booking'
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
