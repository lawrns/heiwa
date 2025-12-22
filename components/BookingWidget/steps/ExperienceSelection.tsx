import { Home, Waves, Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { BookingState } from '../types';
import { cn } from '@/lib/utils';

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
    backgroundImage: '',
    surfPattern: 'gentle-waves',
  },
  {
    id: 'surf-week',
    type: 'surf-week' as const,
    title: 'All-Inclusive Surf Week',
    description: 'Join our structured surf camp programs with coaching and community.',
    icon: Waves,
    gradient: 'from-[#ec681c] to-red-500',
    features: ['Professional coaching', 'All meals included', 'Structured program'],
    priceFrom: 599,
    backgroundImage: '',
    surfPattern: 'dynamic-waves',
  },
];

export function ExperienceSelection({ state, actions }: ExperienceSelectionProps) {
  const pendingTypeRef = useRef<'room' | 'surf-week' | null>(null);

  const handleSelection = (type: 'room' | 'surf-week') => {
    // Debug: selection handler
    try { console.log('[HeiwaWidget] Experience selected:', type); } catch {}
    
    // Set the pending type and update experience type
    pendingTypeRef.current = type;
    actions.setExperienceType(type);
  };

  // Watch for state.experienceType to match pendingType, then advance
  useEffect(() => {
    if (pendingTypeRef.current && state.experienceType === pendingTypeRef.current) {
      // State has been updated, safe to advance
      const type = pendingTypeRef.current;
      pendingTypeRef.current = null;
      
      // Use a small delay to ensure React has finished rendering
      const timeoutId = setTimeout(() => {
        try {
          actions.nextStep();
        } catch (error) {
          console.error('[HeiwaWidget] Error advancing to next step:', error);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.experienceType, actions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">
          Choose Your Adventure
        </h3>
        <p className="text-lg text-gray-600">
          How would you like to experience Heiwa House?
        </p>
      </div>

      {/* Experience Options */}
      <div className="space-y-4">
        {experiences.map((experience, index) => {
          const Icon = experience.icon;
          const isSelected = state.experienceType === experience.type;

          return (
            <button
              key={experience.id}
              onClick={() => handleSelection(experience.type)}
              className={cn(
                // Base styles
                "relative w-full rounded-xl text-left overflow-hidden",
                "transition-all duration-standard ease-out",
                "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2",
                // Animation on mount
                "animate-fade-in-up",
                // Hover effects - lift with glow
                "hover:-translate-y-1",
                experience.type === 'surf-week' 
                  ? "hover:shadow-[0_20px_40px_-10px_rgba(236,104,28,0.4)]"
                  : "hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.4)]",
                // Selected state
                isSelected && [
                  "ring-4 ring-accent shadow-xl",
                  experience.type === 'surf-week'
                    ? "shadow-accent/30"
                    : "shadow-blue-500/30"
                ],
                // Unselected state
                !isSelected && "ring-2 ring-gray-200 hover:ring-accent/50"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Background with gradient */}
              <div 
                className={cn(
                  "absolute inset-0",
                  experience.type === 'surf-week'
                    ? 'bg-gradient-to-br from-[#ec681c] via-[#d65d16] to-red-700'
                    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600'
                )}
              />
              
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />

              {/* Selection Checkmark with bounce animation */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-accent animate-bounce-in">
                  <Check size={20} className="text-accent" />
                </div>
              )}

              {/* Card Content */}
              <div className="relative z-10 p-5 sm:p-6">
                {/* Icon and Title Row */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Icon with glow effect on hover */}
                  <div className={cn(
                    "p-3 rounded-lg bg-white/20 backdrop-blur-md",
                    "border border-white/30 flex-shrink-0",
                    "shadow-lg transition-all duration-micro",
                    "group-hover:bg-white/30 group-hover:scale-105"
                  )}>
                    <Icon size={24} className="text-white" />
                  </div>

                  {/* Title and Price */}
                  <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-lg">
                      {experience.title}
                    </h4>
                    {/* Price badge with prominent styling */}
                    <div className="text-right flex-shrink-0 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30">
                      <div className="text-xs text-white/90 font-medium uppercase tracking-wide">From</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        €{experience.priceFrom}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/95 text-base sm:text-lg leading-relaxed drop-shadow-md">
                  {experience.description}
                </p>

                {/* Features list - subtle on hover */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {experience.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center pt-2">
        <p className="text-base text-gray-500 leading-relaxed">
          Not sure which option? Our room booking offers more flexibility,
          while surf weeks provide a complete guided experience.
        </p>
      </div>
    </div>
  );
}
