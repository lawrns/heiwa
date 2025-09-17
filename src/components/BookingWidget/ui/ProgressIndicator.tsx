import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  stepFlow?: string[];
  totalSteps?: number;
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

export function ProgressIndicator({ currentStep, stepFlow, totalSteps }: ProgressIndicatorProps) {
  // Use provided stepFlow or default to basic 5-step flow
  const currentStepFlow = stepFlow || ['experience', 'options', 'add-ons', 'guest-details', 'review-pay'];
  const maxSteps = totalSteps || currentStepFlow.length;

  return (
    <div className="w-full px-4">
      {/* Mobile-optimized stepper with horizontal scroll */}
      <div className="overflow-x-auto py-4">
        <div className="flex items-center justify-center relative min-w-max px-4">
          {currentStepFlow.map((stepType, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isUpcoming = currentStep < stepNumber;
            const stepInfo = stepLabels[stepType as keyof typeof stepLabels];

            return (
              <div key={stepType} className="flex flex-col items-center relative">
                {/* Connector Line with Wave Pattern */}
                {index < currentStepFlow.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-16 sm:w-20 h-0.5 -translate-y-1/2 z-0">
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

                {/* Step Container with proper spacing */}
                <div className="flex flex-col items-center px-2 sm:px-4 min-w-[60px] sm:min-w-[80px]">

                  {/* Step Circle */}
                  <div className={`
                    relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden
                    transition-all duration-500 ease-out
                    ${isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 animate-in zoom-in-50 duration-300'
                      : isCurrent
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-110'
                        : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-orange-300 hover:scale-105'
                    }
                  `}>
                    {/* Surf pattern for current step */}
                    {isCurrent && (
                      <div
                        className="absolute inset-0 opacity-20"
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
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='5' cy='5' r='0.5' fill='rgba(255,255,255,0.8)'/%3e%3ccircle cx='15' cy='8' r='0.3' fill='rgba(255,255,255,0.6)'/%3e%3ccircle cx='8' cy='15' r='0.4' fill='rgba(255,255,255,0.7)'/%3e%3c/svg%3e")`,
                          backgroundRepeat: 'repeat',
                          animation: 'gentle-wave-flow 6s linear infinite'
                        }}
                      />
                    )}
                    {isCompleted ? (
                      <Check size={14} className="drop-shadow-sm" />
                    ) : (
                      <span className="text-xs sm:text-sm font-bold">{stepNumber}</span>
                    )}
                  </div>

                  {/* Step Label - responsive text */}
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
                      {/* Show short labels on mobile, full labels on larger screens */}
                      <span className="sm:hidden">{stepInfo?.shortLabel}</span>
                      <span className="hidden sm:inline">{stepInfo?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Title */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="progress-step-title">
          {stepLabels[currentStepFlow[currentStep - 1] as keyof typeof stepLabels]?.title}
        </h3>
      </div>
    </div>
  );
}
