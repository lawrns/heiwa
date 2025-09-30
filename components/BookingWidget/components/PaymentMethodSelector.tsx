import { CreditCard, Building2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: 'card_stripe' | 'bank_wire' | null;
  onMethodChange: (method: 'card_stripe' | 'bank_wire') => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'card_stripe' as const,
      name: 'Credit/Debit Card',
      description: 'Pay securely with Stripe',
      icon: CreditCard,
      badge: 'Instant',
      badgeColor: 'bg-green-100 text-green-800',
    },
    {
      id: 'bank_wire' as const,
      name: 'Bank Wire Transfer',
      description: 'Direct bank transfer',
      icon: Building2,
      badge: 'Manual',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">Payment Method</h4>
      
      <div className="grid grid-cols-1 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`
                w-full p-4 rounded-lg border-2 text-left
                transition-all duration-200
                hover:scale-[1.01] hover:shadow-md
                focus:outline-none focus:ring-2 focus:ring-orange-500/30
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-orange-300'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {method.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${method.badgeColor}
                  `}>
                    {method.badge}
                  </span>
                  
                  {isSelected && (
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
