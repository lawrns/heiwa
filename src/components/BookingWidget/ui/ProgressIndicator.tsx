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
              {/* Connector Line with Wave Pattern */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
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

              {/* Step Circle */}
              <div className={`
                relative z-10 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
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
              </div>
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
