import { Home, Waves, Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { BookingState } from '../types';

interface ExperienceSelectionProps {
  state: BookingState;
  actions: {
    setExperienceType: (type: 'room' | 'surf-week') => void;
    nextStep: () => void;
  };
}

const experiences = [
  {
    id: 'room',
    type: 'room' as const,
    title: 'Book a Room',
    description: 'Choose your dates and accommodation. Perfect for flexible stays.',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Flexible dates', 'Choose your room', 'Self-guided experience'],
    priceFrom: 45,
    backgroundImage: '', // Remove broken image reference
    surfPattern: 'gentle-waves',
  },
  {
    id: 'surf-week',
    type: 'surf-week' as const,
    title: 'All-Inclusive Surf Week',
    description: 'Join our structured surf camp programs with coaching and community.',
    icon: Waves,
    gradient: 'from-orange-500 to-red-500',
    features: ['Professional coaching', 'All meals included', 'Structured program'],
    priceFrom: 599,
    backgroundImage: '', // Remove broken image reference
    surfPattern: 'dynamic-waves',
  },
];

export function ExperienceSelection({ state, actions }: ExperienceSelectionProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectedTypeRef = useRef<'room' | 'surf-week' | null>(null);

  const handleSelection = (type: 'room' | 'surf-week') => {
    // Cancel any pending auto-advance
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Debug: selection handler
    try { console.log('[HeiwaWidget] Experience selected:', type); } catch {}
    
    actions.setExperienceType(type);
    lastSelectedTypeRef.current = type;
    
    // Auto-advance after brief delay for visual feedback
    timeoutRef.current = setTimeout(() => {
      // Use ref to check selection since state might not be updated yet
      if (lastSelectedTypeRef.current === type) {
        actions.nextStep();
      }
      timeoutRef.current = null;
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel auto-advance if user changes selection before timeout completes
  useEffect(() => {
    if (timeoutRef.current && state.experienceType !== lastSelectedTypeRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.experienceType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Choose Your Adventure
        </h3>
        <p className="text-gray-600">
          How would you like to experience Heiwa House?
        </p>
      </div>

      {/* Experience Options */}
      <div className="space-y-3">
        {experiences.map((experience, index) => {
          const Icon = experience.icon;
          const isSelected = state.experienceType === experience.type;

          return (
            <button
              key={experience.id}
              onClick={() => handleSelection(experience.type)}
              className={`
                relative w-full rounded-xl text-left overflow-hidden
                transition-all duration-300 ease-out
                hover:shadow-xl hover:-translate-y-1
                focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2
                animate-in fade-in-0 slide-in-from-bottom-4 duration-500
                ${isSelected
                  ? 'ring-4 ring-orange-500 shadow-xl shadow-orange-500/30'
                  : 'ring-2 ring-gray-200 hover:ring-orange-300'
                }
              `}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Background with gradient */}
              <div 
                className={`
                  absolute inset-0
                  ${experience.type === 'surf-week'
                    ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700'
                    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600'
                  }
                `}
              />
              
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-orange-500 animate-in zoom-in-95 duration-200">
                  <Check size={20} className="text-orange-600" />
                </div>
              )}

              {/* Card Content */}
              <div className="relative z-10 p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-3">
                  {/* Icon */}
                  <div className={`
                    p-3 rounded-lg bg-white/20 backdrop-blur-md
                    border border-white/30 flex-shrink-0
                    shadow-lg
                  `}>
                    <Icon size={24} className="text-white" />
                  </div>

                  {/* Title and Price */}
                  <div className="flex-1 flex items-start justify-between gap-3 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-lg">
                      {experience.title}
                    </h4>
                    <div className="text-right flex-shrink-0 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30">
                      <div className="text-xs text-white/90 font-medium mb-0.5">From</div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        €{experience.priceFrom}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/95 text-sm sm:text-base leading-relaxed drop-shadow-md">
                  {experience.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-500 leading-relaxed">
          Not sure which option? Our room booking offers more flexibility,
          while surf weeks provide a complete guided experience.
        </p>
      </div>
    </div>
  );
}
