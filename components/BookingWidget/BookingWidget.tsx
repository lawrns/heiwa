'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { X, Calendar, CheckCircle, ArrowLeft, ArrowRight, Info, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Confetti } from '@/components/ui/confetti';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useBooking } from '@/lib/booking-context';
import type { BookingSuccessData } from '@/lib/types';
import { ProgressIndicator } from './ui/ProgressIndicator';
import { StepSkeleton } from './ui/StepSkeleton';
import { ExperienceSelection } from './steps/ExperienceSelection';
import { RoomAssignment } from './steps/RoomAssignment';
import { SurfWeekRoomSelection } from './steps/SurfWeekRoomSelection';
import { AddOnsSelection } from './steps/AddOnsSelection';
import { GuestDetails } from './steps/GuestDetails';
import { ReviewAndPay } from './steps/ReviewAndPay';
import './styles/surf-enhancements.css';

// Booking-specific error boundary with friendly messaging
interface BookingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class BookingErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  BookingErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onReset?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BookingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
      console.error('Booking widget error:', { error: error.message, stack: errorInfo.componentStack });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm">
            We hit a small bump while loading the booking form. No worries though - let&apos;s try again!
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left max-w-md">
              <p className="text-xs font-mono text-red-700 break-words">
                {this.state.error.message}
              </p>
            </div>
          )}
          <Button onClick={this.handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
        
        // Skip only experience step - keep options step to allow participant count selection
        actions.setSkippedSteps(['experience']);
        
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

  const handleBookingComplete = (bookingData?: unknown) => {
    if (bookingData) {
      // Show success message with booking data
      setBookingSuccess(bookingData as BookingSuccessData);
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
        <div className="relative">
          {/* Show skeleton for current step type */}
          <StepSkeleton stepType={currentStepType} />
          
          {/* Overlay with loading message */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-3"></div>
            <p className="text-sm text-gray-600 font-medium">
              {state.errors.availability ? 'Checking availability...' :
               state.errors.submission ? 'Submitting booking...' :
               'Processing...'}
            </p>
          </div>
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
            return <StepSkeleton stepType="options" />;
          }
          return (
            <Suspense fallback={<StepSkeleton stepType="options" />}>
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
        className="animate-in fade-in-0 duration-300 ease-out"
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
            {/* Header - Enhanced with subtle gradient */}
            <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">
                Book Your Surf Adventure
              </h2>
              <button
                onClick={closeWidget}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-micro focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
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

            {/* Content - Wrapped in error boundary for graceful error handling */}
            <div ref={contentScrollRef} className="flex-1 overflow-y-auto relative shadow-inner">
              <BookingErrorBoundary onReset={actions.reset}>
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                {bookingSuccess ? (
                  <div className="text-center space-y-6 animate-fade-in-up">
                    {/* Confetti celebration */}
                    <Confetti isActive={!!bookingSuccess} count={60} duration={3000} />
                    
                    {/* Success Icon with animation */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto animate-bounce-in">
                        <CheckCircle size={40} className="text-success animate-check-mark" />
                      </div>
                      {/* Pulsing ring effect */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-4 border-success/20 animate-ping" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          Booking Confirmed! 🎉
                        </h3>
                        <p className="text-base text-gray-600">
                          Booking #{bookingSuccess.booking?.booking_number || 'N/A'}
                        </p>
                      </div>

                      {/* Premium Booking Details Card */}
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-card text-left max-w-md mx-auto animate-slide-in-up">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Calendar size={16} className="text-accent" />
                          </span>
                          Booking Details
                        </h4>

                        <div className="space-y-3">
                          {/* Booking Type */}
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Type</span>
                            <span className="font-medium text-gray-900">
                              {state.experienceType === 'room' ? 'Room Booking' : 'Surf Week Package'}
                            </span>
                          </div>

                          {/* Dates */}
                          {state.dates.checkIn && state.dates.checkOut && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Dates</span>
                              <span className="font-medium text-gray-900 text-right">
                                {state.dates.checkIn.toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })} - {state.dates.checkOut.toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}

                          {/* Guests */}
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Guests</span>
                            <span className="font-medium text-gray-900">{state.guests}</span>
                          </div>

                          {/* Payment Method */}
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Payment</span>
                            <span className="font-medium text-gray-900">
                              {state.paymentMethod === 'card_stripe' ? 'Credit Card' : 'Bank Transfer'}
                            </span>
                          </div>

                          {/* Total Amount - Highlighted */}
                          <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-200">
                            <span className="text-base font-medium text-gray-700">Total Paid</span>
                            <span className="text-2xl font-bold text-success">
                              €{state.pricing.total?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps Card */}
                      <div className="bg-info-light rounded-xl p-5 text-left max-w-md mx-auto border border-info/20 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                        <h4 className="font-semibold text-info-dark mb-3 flex items-center gap-2">
                          <Info size={18} />
                          What's Next?
                        </h4>
                        <ul className="text-sm text-info-dark space-y-2">
                          {state.paymentMethod === 'card_stripe' ? (
                            <>
                              <li className="flex items-start gap-2">
                                <span className="text-info mt-0.5">✓</span>
                                <span>Payment processing will complete shortly</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-info mt-0.5">✓</span>
                                <span>Confirmation email sent to your inbox</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-info mt-0.5">✓</span>
                                <span>Check your email for booking details</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start gap-2">
                                <span className="text-info mt-0.5">✓</span>
                                <span>Confirmation email sent to your inbox</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-info mt-0.5">→</span>
                                <span>Complete bank transfer within 24 hours</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-info mt-0.5">→</span>
                                <span>Send transfer confirmation to bookings@heiwahouse.com</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Close Button - Prominent styling */}
                    <Button
                      variant="success"
                      size="lg"
                      onClick={closeWidget}
                      className="w-full max-w-xs mx-auto shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30"
                    >
                      Close & Return to Site
                    </Button>
                  </div>
                ) : (
                  renderCurrentStep()
                )}
              </div>
              </BookingErrorBoundary>
            </div>

            {/* Footer Navigation */}
            {!bookingSuccess && computed.currentStepType !== 'review-pay' && (
              <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white">
                <div className="relative group">
                  {/* Back Button - Tailwind styled */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={actions.prevStep}
                    disabled={computed.isFirstStep}
                    aria-label="Go back to previous step"
                    className="gap-2"
                  >
                    <ArrowLeft size={16} className="flex-shrink-0" />
                    <span>Back</span>
                  </Button>
                  
                  {/* Tooltip */}
                  {!computed.isFirstStep && (
                    <div className="
                      absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                      px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-micro
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

                  {/* Next Button - Using Button component with loading state */}
                  <Button
                    size="lg"
                    onClick={actions.nextStep}
                    disabled={!computed.canProceedToNextStep || state.isLoading}
                    isLoading={state.isLoading}
                    loadingText="Loading..."
                    aria-label={computed.isLastStep ? 'Complete booking' : 'Continue to next step'}
                    className={computed.isLastStep ? '' : 'pl-8 pr-6'}
                  >
                    {computed.isLastStep ? (
                      'Complete Booking'
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
