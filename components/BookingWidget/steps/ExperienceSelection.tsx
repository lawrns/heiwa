import { Home, Waves, Check } from 'lucide-react';
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
  const handleSelection = (type: 'room' | 'surf-week') => {
    // Debug: selection handler
    try { console.log('[HeiwaWidget] Experience selected:', type); } catch {}
    actions.setExperienceType(type);
    
    // Allow the user to manually click Next instead of auto-advancing
    // This gives them time to review their selection and see the pricing update
  };

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
      <div className="space-y-4">
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
              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  {/* Icon */}
                  <div className={`
                    p-4 rounded-xl bg-white/20 backdrop-blur-md
                    border border-white/30 flex-shrink-0
                    shadow-lg
                  `}>
                    <Icon size={28} className="text-white" />
                  </div>

                  {/* Title and Price */}
                  <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
                    <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-lg">
                      {experience.title}
                    </h4>
                    <div className="text-right flex-shrink-0 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30">
                      <div className="text-xs text-white/90 font-medium mb-1">From</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        €{experience.priceFrom}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/95 text-base sm:text-lg leading-relaxed mb-4 drop-shadow-md">
                  {experience.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {experience.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="
                        px-4 py-2 text-sm font-medium
                        bg-white/30 text-white rounded-lg
                        backdrop-blur-sm border border-white/40
                        shadow-md
                      "
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
        <p className="text-sm text-gray-500 leading-relaxed">
          Not sure which option? Our room booking offers more flexibility,
          while surf weeks provide a complete guided experience.
        </p>
      </div>
    </div>
  );
}
