import { BookingState } from '../types';

interface OptionSelectionProps {
  state: BookingState;
  actions: {
    selectOption: (optionId: string) => void;
  };
}

export function OptionSelection({ state, actions }: OptionSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
        </h3>
        <p className="text-gray-600">
          Select from available options for your dates
        </p>
      </div>

      {/* Placeholder - will implement with real API data */}
      <div className="text-center py-12">
        <div className="text-gray-500">
          Loading available {state.experienceType === 'room' ? 'rooms' : 'surf weeks'}...
        </div>
      </div>
    </div>
  );
}
