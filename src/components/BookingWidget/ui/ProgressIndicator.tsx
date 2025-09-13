import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Experience', title: 'Choose Experience' },
  { id: 2, label: 'Dates', title: 'Dates & Guests' },
  { id: 3, label: 'Options', title: 'Select Option' },
  { id: 4, label: 'Details', title: 'Guest Details' },
  { id: 5, label: 'Review', title: 'Review & Pay' },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      <div className="heiwa-booking-stepper flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                  <div className={`
                    h-full transition-all duration-500 ease-out
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-green-500 to-orange-500' 
                      : 'bg-gray-200'
                    }
                  `} />
                </div>
              )}

              {/* Step Circle */}
              <div className={`
                relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-500 ease-out
                ${isCompleted 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 animate-in zoom-in-50 duration-300' 
                  : isCurrent 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-110 animate-pulse' 
                    : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-orange-300 hover:scale-105'
                }
              `}>
                {isCompleted ? (
                  <Check size={16} className="drop-shadow-sm" />
                ) : (
                  <span className="text-sm font-bold">{step.id}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <div className={`
                  text-xs font-medium transition-colors duration-200
                  ${isCurrent 
                    ? 'text-orange-600' 
                    : isCompleted 
                      ? 'text-green-600' 
                      : 'text-gray-500'
                  }
                `}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Title */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900" data-testid="progress-step-title">
          {steps.find(s => s.id === currentStep)?.title}
        </h3>
      </div>
    </div>
  );
}
