import { useEffect, useRef } from 'react';
import { Plus, Minus, ShoppingBag, Utensils, Car, Wrench, Users } from 'lucide-react';
import { BookingState, AddOnSelection } from '../types';
import { useAddOns } from '../hooks/useAddOns';

interface AddOnsSelectionProps {
  state: BookingState;
  actions: {
    setAddOns: (addOns: AddOnSelection[]) => void;
    updatePricing: (pricing: any) => void;
  };
}

export function AddOnsSelection({ state, actions }: AddOnsSelectionProps) {
  const { addOns, loading, error, selectedAddOns, updateAddOnQuantity, getAddOnSubtotal } = useAddOns();
  const basePriceRef = useRef(state.pricing.basePrice);

  // Update base price ref when it changes
  useEffect(() => {
    basePriceRef.current = state.pricing.basePrice;
  }, [state.pricing.basePrice]);

  // Add-ons are managed locally in this component
  // They will be synced to the parent state when the user proceeds to the next step

  // Update pricing when add-ons change
  useEffect(() => {
    const addOnsSubtotal = getAddOnSubtotal();
    const basePrice = basePriceRef.current;
    const taxes = Math.round((basePrice + addOnsSubtotal) * 0.1);
    const fees = Math.round((basePrice + addOnsSubtotal) * 0.05);
    const total = basePrice + addOnsSubtotal + taxes + fees;

    actions.updatePricing({
      ...state.pricing,
      addOnsSubtotal,
      taxes,
      fees,
      total,
    });
  }, [selectedAddOns, getAddOnSubtotal]); // Removed actions from dependencies

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment': return <Wrench size={16} className="text-blue-500" />;
      case 'food': return <Utensils size={16} className="text-green-500" />;
      case 'transport': return <Car size={16} className="text-purple-500" />;
      case 'service': return <Users size={16} className="text-orange-500" />;
      default: return <ShoppingBag size={16} className="text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSelectedQuantity = (addOnId: string) => {
    const selected = selectedAddOns.find(s => s.id === addOnId);
    return selected ? selected.quantity : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Add-ons & Extras</h3>
          <p className="text-gray-600">Loading available add-ons...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-24 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Add-ons & Extras</h3>
          <p className="text-red-600">Error loading add-ons: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Add-ons & Extras</h3>
        <p className="text-gray-600">
          Enhance your experience with optional add-ons
        </p>
      </div>

      {/* Add-ons List */}
      {addOns.length > 0 ? (
        <div className="space-y-4">
          {addOns.map((addOn, index) => {
            const quantity = getSelectedQuantity(addOn.id);
            const isSelected = quantity > 0;

            return (
              <div
                key={addOn.id}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-300
                  ${isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                  }
                  animate-in fade-in-0 slide-in-from-bottom-4
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  {/* Add-on Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(addOn.category)}
                      <h4 className="text-lg font-semibold text-gray-900">
                        {addOn.name}
                      </h4>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full capitalize">
                        {addOn.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {addOn.description}
                    </p>
                    <div className="text-lg font-bold text-orange-600">
                      {formatPrice(addOn.price)}
                      {quantity > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          × {quantity} = {formatPrice(addOn.price * quantity)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => updateAddOnQuantity(addOn.id, quantity - 1)}
                      disabled={quantity === 0}
                      className="
                        w-10 h-10 rounded-full border border-gray-300
                        flex items-center justify-center
                        hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-orange-500/30
                      "
                      aria-label={`Decrease ${addOn.name} quantity`}
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-12 text-center text-lg font-semibold text-gray-900">
                      {quantity}
                    </span>

                    <button
                      onClick={() => updateAddOnQuantity(addOn.id, quantity + 1)}
                      disabled={addOn.maxQuantity ? quantity >= addOn.maxQuantity : false}
                      className="
                        w-10 h-10 rounded-full border border-gray-300
                        flex items-center justify-center
                        hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-orange-500/30
                      "
                      aria-label={`Increase ${addOn.name} quantity`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No add-ons available at this time.</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedAddOns.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <h5 className="font-semibold text-orange-900 mb-3">Selected Add-ons</h5>
          <div className="space-y-2">
            {selectedAddOns.map((addOn) => (
              <div key={addOn.id} className="flex justify-between text-sm">
                <span className="text-orange-700">
                  {addOn.name} × {addOn.quantity}
                </span>
                <span className="font-medium text-orange-900">
                  {formatPrice(addOn.price * addOn.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-orange-300 pt-2 mt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-orange-900">Add-ons Subtotal</span>
                <span className="text-orange-600">{formatPrice(getAddOnSubtotal())}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Add-ons are optional and can enhance your surf experience. You can always modify your selection later.
        </p>
      </div>
    </div>
  );
}
