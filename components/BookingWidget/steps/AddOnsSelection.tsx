import { useEffect, useRef } from 'react';
import { Plus, Minus, ShoppingBag, Utensils, Car, Wrench, Users } from 'lucide-react';
import { BookingState, AddOnSelection, PricingBreakdown } from '../types';
import { useAddOns } from '../hooks/useAddOns';

interface AddOnsSelectionProps {
  state: BookingState;
  actions: {
    setAddOns: (addOns: AddOnSelection[]) => void;
    updatePricing: (pricing: PricingBreakdown) => void;
  };
}

export function AddOnsSelection({ state, actions }: AddOnsSelectionProps) {
  const { addOns, loading, error, selectedAddOns, setSelectedAddOns, updateAddOnQuantity, getAddOnSubtotal } = useAddOns();
  const basePriceRef = useRef(state.pricing.basePrice);

  // Initialize local add-ons state from global state on mount
  useEffect(() => {
    if (state.selectedAddOns.length > 0) {
      setSelectedAddOns(state.selectedAddOns);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally ignore state.selectedAddOns to prevent re-initialization

  // Update base price ref when it changes
  useEffect(() => {
    basePriceRef.current = state.pricing.basePrice;
  }, [state.pricing.basePrice]);

  // Add-ons are managed locally in this component
  // They will be synced to the parent state when the user proceeds to the next step

  // Update pricing when add-ons change
  // PRICING RULES:
  // 1. Prices are tax-INCLUSIVE (tax is extracted for display, not added)
  // 2. No service fee
  useEffect(() => {
    const TAX_RATE = 0.1; // 10% VAT included in prices
    const addOnsSubtotal = getAddOnSubtotal();
    const basePrice = basePriceRef.current;

    // Sync add-ons to global state
    actions.setAddOns(selectedAddOns);

    // If base price isn't set yet (e.g., no room/dates selected),
    // update only the add-ons subtotal to avoid misleading totals (e.g., €29)
    if (!basePrice || basePrice <= 0) {
      actions.updatePricing({
        ...state.pricing,
        addOnsSubtotal,
      });
      return;
    }

    const subtotal = basePrice + addOnsSubtotal;
    // Tax is INCLUDED in price, extract for display (not added on top)
    const taxes = Math.round(subtotal * TAX_RATE / (1 + TAX_RATE));
    const fees = 0; // No service fee

    actions.updatePricing({
      ...state.pricing,
      addOnsSubtotal,
      taxes,
      fees,
      total: subtotal, // Price already includes tax
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddOns, getAddOnSubtotal]); // Intentionally exclude actions and state.pricing to prevent infinite loops

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment': return <Wrench size={16} className="text-blue-500" />;
      case 'food': return <Utensils size={16} className="text-green-500" />;
      case 'transport': return <Car size={16} className="text-purple-500" />;
      case 'service': return <Users size={16} className="text-accent" />;
      default: return <ShoppingBag size={16} className="text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
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
        <h3 className="text-3xl font-bold text-gray-900">Add-ons & Extras</h3>
        <p className="text-lg text-gray-600">
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
                className={
                  `
                  p-4 rounded-[10px] border motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-300 motion-reduce:transition-none
                  ${isSelected
                    ? 'border-accent bg-accent/5 shadow-md shadow-accent/20'
                    : 'border-gray-200 bg-white hover:border-accent/30 hover:bg-accent/5'
                  }
                  animate-in fade-in-0 slide-in-from-bottom-4
                `
                }
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Mobile-responsive layout */}
                <div className="space-y-3">
                  {/* Add-on Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getCategoryIcon(addOn.category)}
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 min-w-0">
                        {addOn.name}
                      </h4>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full capitalize shrink-0">
                        {addOn.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {addOn.description}
                    </p>
                  </div>

                  {/* Price and Controls Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xl font-bold text-accent">
                        {formatPrice(addOn.price)}
                      </div>
                      {quantity > 0 && (
                        <div className="text-xs text-gray-500">
                          × {quantity} = {formatPrice(addOn.price * quantity)}
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateAddOnQuantity(addOn.id, quantity - 1)}
                        disabled={quantity === 0}
                        className="
                          w-[44px] h-[44px] rounded-full border border-gray-300
                          flex items-center justify-center
                          hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
                          motion-safe:transition-[background-color,border-color] motion-safe:duration-200 motion-reduce:transition-none
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2
                        "
                        aria-label={`Decrease ${addOn.name} quantity`}
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-10 sm:w-12 text-center text-lg sm:text-xl font-semibold text-gray-900 h-[44px] flex items-center justify-center">
                        {quantity}
                      </span>

                      <button
                        onClick={() => updateAddOnQuantity(addOn.id, quantity + 1)}
                        disabled={addOn.maxQuantity ? quantity >= addOn.maxQuantity : false}
                        className="
                          w-[44px] h-[44px] rounded-full border border-gray-300
                          flex items-center justify-center
                          hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
                          motion-safe:transition-[background-color,border-color] motion-safe:duration-200 motion-reduce:transition-none
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2
                        "
                        aria-label={`Increase ${addOn.name} quantity`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
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
        <div className="bg-accent/5 rounded-[10px] p-4 border border-accent/20">
          <h5 className="font-semibold text-gray-900 mb-3">Selected Add-ons</h5>
          <div className="space-y-2">
            {selectedAddOns.map((addOn) => (
              <div key={addOn.id} className="flex justify-between text-base">
                <span className="text-gray-700">
                  {addOn.name} × {addOn.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(addOn.price * addOn.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-accent/20 pt-2 mt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Add-ons Subtotal</span>
                <span className="text-accent">{formatPrice(getAddOnSubtotal())}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-base text-gray-500">
          Add-ons are optional and can enhance your surf experience. You can always modify your selection later.
        </p>
      </div>
    </div>
  );
}
