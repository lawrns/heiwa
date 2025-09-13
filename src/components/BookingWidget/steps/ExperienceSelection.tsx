import { Home, Waves } from 'lucide-react';
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
  },
];

export function ExperienceSelection({ state, actions }: ExperienceSelectionProps) {
  const handleSelection = (type: 'room' | 'surf-week') => {
    actions.setExperienceType(type);
    // Auto-advance to next step after selection
    setTimeout(() => {
      actions.nextStep();
    }, 300);
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
                w-full p-6 rounded-xl border-2 text-left
                transition-all duration-500 ease-out
                hover:scale-[1.02] hover:shadow-xl hover:-translate-y-1
                focus:outline-none focus:ring-4 focus:ring-orange-500/30
                animate-in fade-in-0 slide-in-from-bottom-4 duration-700
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20 animate-in zoom-in-95 duration-300'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                }
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card Header */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  p-3 rounded-lg bg-gradient-to-br ${experience.gradient}
                  text-white shadow-lg
                `}>
                  <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {experience.title}
                    </h4>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">From</div>
                      <div className="text-lg font-bold text-orange-600">
                        €{experience.priceFrom}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {experience.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {experience.features.map((feature, index) => (
                      <span
                        key={index}
                        className="
                          px-2 py-1 text-xs font-medium
                          bg-gray-100 text-gray-700 rounded-full
                        "
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="mt-4 flex items-center gap-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Not sure which option? Our room booking offers more flexibility,
          while surf weeks provide a complete guided experience.
        </p>
      </div>
    </div>
  );
}
