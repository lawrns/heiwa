import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Track clicked step for animation
  const [clickedStep, setClickedStep] = React.useState<number | null>(null);

  const handleStepClick = (stepIndex: number) => {
    // Convert 0-based index to 1-based step number
    // Only allow clicking on completed steps or current step
    const stepNumber = stepIndex + 1;
    if (onStepClick && (stepNumber < currentStep || stepNumber === currentStep)) {
      // Trigger click animation
      setClickedStep(stepIndex);
      setTimeout(() => setClickedStep(null), 200);
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
    <div className="w-full px-2 sm:px-4">
      {/* Mobile-optimized stepper with horizontal scroll */}
      <div className="overflow-x-auto py-3 sm:py-4">
        <div className="flex items-center justify-center relative min-w-max px-2 sm:px-4">
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
            const isClicked = clickedStep === index;

            return (
              <div key={stepType} className="flex flex-col items-center relative">
                {/* Connector Line with animated fill */}
                {index < visibleSteps.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-6 sm:w-10 md:w-14 h-0.5 z-0">
                    {/* Background track */}
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    {/* Animated fill */}
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-in-out",
                        isCompleted 
                          ? "w-full bg-gradient-to-r from-accent to-accent-dark" 
                          : "w-0 bg-accent"
                      )}
                    />
                  </div>
                )}

                {/* Step Container with responsive spacing */}
                <div className="flex flex-col items-center px-1 sm:px-2 md:px-3 min-w-[48px] sm:min-w-[60px] md:min-w-[72px]">

                  {/* Step Circle - Now Clickable with enhanced animations */}
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
                    className={cn(
                      // Base styles
                      "relative z-10 w-10 h-10 rounded-full flex items-center justify-center",
                      "transition-all duration-300 ease-in-out",
                      // Clickable states
                      clickable && [
                        "cursor-pointer",
                        "hover:scale-110",
                        "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2",
                        "active:scale-95"
                      ],
                      !clickable && "cursor-default",
                      // Click animation
                      isClicked && "scale-90",
                      // Completed state
                      isCompleted && [
                        "bg-gradient-to-br from-accent to-accent-dark text-white",
                        "shadow-lg shadow-accent/30",
                        clickable && "hover:from-accent-dark hover:to-accent-dark"
                      ],
                      // Current state with subtle glow
                      isCurrent && [
                        "bg-gradient-to-br from-accent to-accent-dark text-white",
                        "shadow-lg shadow-accent/40",
                        "ring-4 ring-accent/20"
                      ],
                      // Upcoming state
                      isUpcoming && [
                        "bg-white border-2 border-gray-300 text-gray-400"
                      ],
                      // Disabled opacity
                      !clickable && !isCurrent && "opacity-60"
                    )}
                  >
                    {isCompleted ? (
                      <Check 
                        size={18} 
                        className={cn(
                          "drop-shadow-sm",
                          // Checkmark animation on completion
                          "animate-scale-in"
                        )} 
                      />
                    ) : (
                      <span className="text-sm font-bold">{stepNumber}</span>
                    )}
                  </button>

                  {/* Step Label - Always visible with abbreviated labels on mobile */}
                  <div className="mt-1.5 sm:mt-2 text-center">
                    <div className={cn(
                      "text-[10px] sm:text-xs font-medium transition-colors duration-300 ease-in-out whitespace-nowrap",
                      isCurrent && "text-accent font-semibold",
                      isCompleted && "text-accent",
                      isUpcoming && "text-gray-400"
                    )}>
                      {/* Show abbreviated labels on mobile, full labels on larger screens */}
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
    </div>
  );
}
