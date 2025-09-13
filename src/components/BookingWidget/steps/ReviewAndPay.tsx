import { BookingState } from '../types';

interface ReviewAndPayProps {
  state: BookingState;
  actions: any;
  onComplete: () => void;
}

export function ReviewAndPay({ state, actions, onComplete }: ReviewAndPayProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Review & Pay</h3>
        <p className="text-gray-600">Confirm your booking details</p>
      </div>

      <div className="text-center py-12">
        <div className="text-gray-500">Review and payment - coming soon</div>
      </div>
    </div>
  );
}