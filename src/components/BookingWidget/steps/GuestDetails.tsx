import { BookingState } from '../types';

interface GuestDetailsProps {
  state: BookingState;
  actions: {
    updateGuestDetails: (guest: any) => void;
  };
}

export function GuestDetails({ state, actions }: GuestDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Guest Details</h3>
        <p className="text-gray-600">Tell us about your group</p>
      </div>

      <div className="text-center py-12">
        <div className="text-gray-500">Guest details form - coming soon</div>
      </div>
    </div>
  );
}