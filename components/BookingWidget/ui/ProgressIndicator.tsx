import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  stepFlow?: string[];
  totalSteps?: number;
  skippedSteps?: string[];
  onStepClick?: (stepIndex: number) => void;
  completedSteps?: number[];
}

const stepLabels = {
  'experience': { label: 'Experience', shortLabel: 'Exp', title: 'Choose Experience' },
  'options': { label: 'Options', shortLabel: 'Opt', title: 'Select Dates & Options' },
  'room-assignment': { label: 'Rooms', shortLabel: 'Rm', title: 'Assign Guests to Rooms' },
  'surf-week-room-selection': { label: 'Room', shortLabel: 'Rm', title: 'Choose Accommodation' },
  'add-ons': { label: 'Add-ons', shortLabel: 'Add', title: 'Enhance Your Stay' },
  'guest-details': { label: 'Details', shortLabel: 'Det', title: 'Guest Details' },
  'review-pay': { label: 'Review', shortLabel: 'Rev', title: 'Review & Pay' },
};

export function ProgressIndicator({ 
  currentStep, 
  stepFlow, 
  totalSteps, 
  skippedSteps = [], 
  onStepClick,
  completedSteps = []
}: ProgressIndicatorProps) {
  // Use provided stepFlow or default to basic 5-step flow
  const currentStepFlow = stepFlow || ['experience', 'options', 'add-ons', 'guest-details', 'review-pay'];
  const maxSteps = totalSteps || currentStepFlow.length;
  
  // Filter out skipped steps from display
  const visibleSteps = currentStepFlow.filter(step => !skippedSteps.includes(step));

  const handleStepClick = (stepIndex: number) => {
    // Convert 0-based index to 1-based step number
    // Only allow clicking on completed steps or current step
    const stepNumber = stepIndex + 1;
    if (onStepClick && (stepNumber < currentStep || stepNumber === currentStep)) {
      onStepClick(stepNumber);
    }
  };

  const isStepClickable = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    return stepNumber < currentStep || stepNumber === currentStep;
  };

  const getStepAriaLabel = (stepType: string, stepNumber: number, isCompleted: boolean, isCurrent: boolean, isClickable: boolean) => {
    const stepInfo = stepLabels[stepType as keyof typeof stepLabels];
    if (isCurrent) {
      return `Step ${stepNumber}: ${stepInfo?.title} - Current step`;
    } else if (isCompleted && isClickable) {
      return `Step ${stepNumber}: ${stepInfo?.title} - Click to edit`;
    } else if (isCompleted) {
      return `Step ${stepNumber}: ${stepInfo?.title} - Completed`;
    } else {
      return `Step ${stepNumber}: ${stepInfo?.title} - Not available yet`;
    }
  };

  return (
    <div className="w-full px-4">
      {/* Mobile-optimized stepper with horizontal scroll */}
      <div className="overflow-x-auto py-4">
        <div className="flex items-center justify-center relative min-w-max px-4">
          {visibleSteps.map((stepType, index) => {
            // When steps are skipped, the stepFlow is already filtered, so we use the index directly
            // The currentStep refers to the position in the filtered flow
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isUpcoming = currentStep < stepNumber;
            const stepInfo = stepLabels[stepType as keyof typeof stepLabels];
            const clickable = isStepClickable(index);
            const ariaLabel = getStepAriaLabel(stepType, stepNumber, isCompleted, isCurrent, clickable);

            return (
              <div key={stepType} className="flex flex-col items-center relative">
                {/* Connector Line with Wave Pattern */}
                {index < visibleSteps.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-8 sm:w-12 md:w-16 h-0.5 -translate-y-1/2 z-0">
                    <div className={`
                      h-full transition-all duration-500 ease-out relative overflow-hidden
                      ${isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-orange-500'
                        : 'bg-gray-200'
                      }
                    `}>
                      {/* Wave pattern overlay for completed steps */}
                      {isCompleted && (
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='4' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0,2 C10,0 20,4 30,2 C35,1 40,3 40,2' stroke='rgba(255,255,255,0.5)' stroke-width='0.5' fill='none'/%3e%3c/svg%3e")`,
                            backgroundRepeat: 'repeat-x',
                            animation: 'gentle-wave-flow 4s linear infinite'
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Step Container with responsive spacing */}
                <div className="flex flex-col items-center px-1 sm:px-2 md:px-4 min-w-[50px] sm:min-w-[70px] md:min-w-[80px]">

                  {/* Step Circle - Now Clickable */}
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={!clickable}
                    aria-label={ariaLabel}
                    aria-current={isCurrent ? 'step' : undefined}
                    role="button"
                    tabIndex={clickable ? 0 : -1}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleStepClick(index);
                      }
                    }}
                    className={`
                      relative z-10 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center overflow-hidden
                      transition-all duration-500 ease-out
                      ${clickable
                        ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2'
                        : 'cursor-default'
                      }
                      ${isCompleted
                        ? clickable
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:from-green-600 hover:to-green-700 animate-in zoom-in-50 duration-300'
                          : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 animate-in zoom-in-50 duration-300'
                        : isCurrent
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-110'
                          : 'bg-white border-2 border-gray-300 text-gray-500'
                      }
                      ${!clickable && !isCurrent ? 'opacity-60' : ''}
                    `}>
                    {/* Surf pattern for current step */}
                    {isCurrent && (
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0,10 C5,5 10,15 15,10 C17.5,7.5 20,12.5 20,10' stroke='rgba(255,255,255,0.3)' stroke-width='1' fill='none'/%3e%3c/svg%3e")`,
                          backgroundRepeat: 'repeat',
                          animation: 'surf-texture-rotate 8s linear infinite'
                        }}
                      />
                    )}

                    {/* Completion sparkle effect */}
                    {isCompleted && (
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='5' cy='5' r='0.5' fill='rgba(255,255,255,0.8)'/%3e%3ccircle cx='15' cy='8' r='0.3' fill='rgba(255,255,255,0.6)'/%3e%3ccircle cx='8' cy='15' r='0.4' fill='rgba(255,255,255,0.7)'/%3e%3c/svg%3e")`,
                          backgroundRepeat: 'repeat',
                          animation: 'gentle-wave-flow 6s linear infinite'
                        }}
                      />
                    )}
                    {isCompleted ? (
                      <Check size={12} className="drop-shadow-sm sm:w-[14px] sm:h-[14px]" />
                    ) : (
                      <span className="text-xs sm:text-sm font-bold">{stepNumber}</span>
                    )}
                  </button>

                  {/* Step Label - fully responsive */}
                  <div className="mt-1 sm:mt-2 text-center">
                    <div className={`
                      text-xs font-medium transition-colors duration-200 whitespace-nowrap
                      ${isCurrent
                        ? 'text-orange-600'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }
                    `}>
                      {/* Hide all text on mobile (< 640px), show short labels on small tablets, full labels on larger screens */}
                      <span className="hidden sm:inline md:hidden">{stepInfo?.shortLabel}</span>
                      <span className="hidden md:inline">{stepInfo?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
