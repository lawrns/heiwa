'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useBookingFlow } from './hooks/useBookingFlow';
import { ProgressIndicator } from './ui/ProgressIndicator';
import { ExperienceSelection } from './steps/ExperienceSelection';
import { DatesAndGuests } from './steps/DatesAndGuests';
import { OptionSelection } from './steps/OptionSelection';
import { GuestDetails } from './steps/GuestDetails';
import { ReviewAndPay } from './steps/ReviewAndPay';

interface BookingWidgetProps {
  className?: string;
}

export function BookingWidget({ className = '' }: BookingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { state, actions, computed } = useBookingFlow();

  const openWidget = () => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeWidget = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
    actions.reset();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeWidget();
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <ExperienceSelection state={state} actions={actions} />;
      case 2:
        return <DatesAndGuests state={state} actions={actions} />;
      case 3:
        return <OptionSelection state={state} actions={actions} />;
      case 4:
        return <GuestDetails state={state} actions={actions} />;
      case 5:
        return <ReviewAndPay state={state} actions={actions} onComplete={closeWidget} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openWidget}
        className={`
          fixed top-6 right-6 z-50
          flex items-center gap-3 px-6 py-3
          bg-gradient-to-r from-orange-500 to-orange-600
          hover:from-orange-600 hover:to-orange-700
          text-white font-semibold text-sm
          rounded-lg shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          hover:scale-105 hover:-translate-y-0.5
          focus:outline-none focus:ring-4 focus:ring-orange-500/30
          ${className}
        `}
        aria-label="Open booking widget"
      >
        <Calendar size={18} />
        <span>Book Now</span>
      </button>

      {/* Widget Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-end"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="
            relative w-full max-w-md h-full
            bg-white shadow-2xl
            animate-in slide-in-from-right duration-400 ease-out
            flex flex-col
            sm:max-w-lg lg:max-w-xl
          ">
            {/* Header */}
            <div className="
              flex items-center justify-between p-6
              border-b border-gray-100
              bg-gradient-to-r from-gray-50 to-white
            ">
              <h2 className="text-xl font-bold text-gray-900">
                Book Your Surf Adventure
              </h2>
              <button
                onClick={closeWidget}
                className="
                  p-2 rounded-lg text-gray-500 hover:text-gray-700
                  hover:bg-gray-100 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-orange-500/30
                "
                aria-label="Close booking widget"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <ProgressIndicator currentStep={state.currentStep} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {renderCurrentStep()}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="
              flex items-center justify-between p-6
              border-t border-gray-100
              bg-gradient-to-r from-white to-gray-50
            ">
              <button
                onClick={actions.prevStep}
                disabled={computed.isFirstStep}
                className="
                  px-4 py-2 text-sm font-medium text-gray-600
                  hover:text-gray-800 disabled:text-gray-400
                  disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              >
                {computed.isFirstStep ? '' : 'Back'}
              </button>

              <div className="flex items-center gap-3">
                {/* Pricing Display */}
                {state.pricing.total > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      €{state.pricing.total}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                )}

                {/* Next/Complete Button */}
                <button
                  onClick={computed.isLastStep ? () => console.log('Complete booking') : actions.nextStep}
                  disabled={!computed.canProceedToNextStep || state.isLoading}
                  className="
                    px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600
                    hover:from-orange-600 hover:to-orange-700
                    disabled:from-gray-300 disabled:to-gray-400
                    text-white font-semibold text-sm rounded-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-300 ease-out
                    hover:scale-105 disabled:hover:scale-100
                    focus:outline-none focus:ring-4 focus:ring-orange-500/30
                    disabled:cursor-not-allowed
                    min-w-[100px]
                  "
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
          </div>
        </div>
      )}
    </>
  );
}
