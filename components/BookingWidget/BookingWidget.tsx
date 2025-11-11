'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { useBookingFlow } from './hooks/useBookingFlow';
import { useBooking } from '@/lib/booking-context';
import { ProgressIndicator } from './ui/ProgressIndicator';
import { ExperienceSelection } from './steps/ExperienceSelection';
import { OptionSelection } from './steps/OptionSelection';
import { RoomAssignment } from './steps/RoomAssignment';
import { SurfWeekRoomSelection } from './steps/SurfWeekRoomSelection';
import { AddOnsSelection } from './steps/AddOnsSelection';
import { GuestDetails } from './steps/GuestDetails';
import { ReviewAndPay } from './steps/ReviewAndPay';
import './styles/surf-enhancements.css';

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
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const { state, actions, computed } = useBookingFlow();
  const { setBookingSuccess: setBookingSuccessInContext, selectedSurfWeek, setSelectedSurfWeek } = useBooking();

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

    // Batch all state updates to prevent flickering
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

    const stepComponents = {
      'experience': <ExperienceSelection state={state} actions={actions} />,
      'options': <OptionSelection state={state} actions={actions} />,
      'room-assignment': <RoomAssignment state={state} actions={actions} />,
      'surf-week-room-selection': <SurfWeekRoomSelection state={state} actions={actions} />,
      'add-ons': <AddOnsSelection state={state} actions={actions} />,
      'guest-details': <GuestDetails state={state} actions={actions} />,
      'review-pay': <ReviewAndPay state={state} actions={actions} onComplete={handleBookingComplete} />,
    };

    return (
      <div
        key={`${state.currentStep}-${currentStepType}`}
        className="animate-in fade-in-0 slide-in-from-right-4 duration-500 ease-out"
      >
        {stepComponents[currentStepType as keyof typeof stepComponents] || (
          <div className="text-center text-red-600">
            <p>Invalid step: {currentStepType}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Trigger Button - Only render for non-Web Component usage */}
      {!isWebComponent && (
        <button
          onClick={openWidget}
          className="relative z-50 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-500/30 animate-in fade-in-0 slide-in-from-top-2 duration-700 delay-300 group"
          aria-label="Open booking widget"
        >
          <Calendar size={18} className="transition-transform duration-300 group-hover:rotate-12" />
          <span className="relative">
            {config?.triggerText || 'Book Now'}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </span>
        </button>
      )}

      {/* Widget Modal */}
      {isOpen && (
        <div
          className="heiwa-modal-overlay"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
        >
          {/* Widget Panel */}
          <div
            className="relative w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col sm:max-w-lg lg:max-w-xl transform-gpu"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '28rem',
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-bold text-gray-900">
                Book Your Surf Adventure
              </h2>
              <button
                onClick={closeWidget}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                aria-label="Close booking widget"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <ProgressIndicator
                currentStep={state.currentStep}
                stepFlow={computed.stepFlow}
                totalSteps={computed.totalSteps}
                skippedSteps={state.skippedSteps || []}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {bookingSuccess ? (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                      <p className="text-gray-600 mb-4">
                        Booking #{bookingSuccess.booking?.booking_number || 'N/A'}
                      </p>

                      {/* Booking Details Card */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 text-left max-w-md mx-auto">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h4>

                        <div className="space-y-3">
                          {/* Booking Type */}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium text-gray-900">
                              {state.experienceType === 'room' ? 'Room Booking' : 'Surf Week Package'}
                            </span>
                          </div>

                          {/* Dates */}
                          {state.dates.checkIn && state.dates.checkOut && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Dates:</span>
                              <span className="font-medium text-gray-900 text-right">
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
                      className="w-full max-w-xs py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
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
            {!bookingSuccess && (
              <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50">
                <button
                  onClick={actions.prevStep}
                  disabled={computed.isFirstStep}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Back
                </button>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      €{state.pricing.total}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>

                  <button
                    onClick={actions.nextStep}
                    disabled={!computed.canProceedToNextStep || state.isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-orange-500/30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {state.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : computed.isLastStep ? (
                      'Complete Booking'
                    ) : (
                      'Next'
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
