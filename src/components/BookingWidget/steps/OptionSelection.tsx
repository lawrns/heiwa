import { useState } from 'react';
import { MapPin, Users, Star, Check, Clock, Wifi, Car, Utensils } from 'lucide-react';
import { BookingState } from '../types';
import { useRooms } from '../hooks/useRooms';
import { useSurfCamps } from '../hooks/useSurfCamps';

interface OptionSelectionProps {
  state: BookingState;
  actions: {
    selectOption: (optionId: string) => void;
  };
}

export function OptionSelection({ state, actions }: OptionSelectionProps) {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms({
    checkIn: state.dates.checkIn,
    checkOut: state.dates.checkOut,
    guests: state.guests,
  });
  const { surfCamps, loading: campsLoading, error: campsError } = useSurfCamps();
  const [selectedOption, setSelectedOption] = useState<string | null>(state.selectedOption);

  const loading = state.experienceType === 'room' ? roomsLoading : campsLoading;
  const error = state.experienceType === 'room' ? roomsError : campsError;
  const options = state.experienceType === 'room' ? rooms : surfCamps;

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    actions.selectOption(optionId);
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi size={16} />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('transport')) return <Car size={16} />;
    if (lowerAmenity.includes('meal') || lowerAmenity.includes('food')) return <Utensils size={16} />;
    return <Check size={16} />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalPrice = (option: any) => {
    if (state.experienceType === 'room' && state.dates.checkIn && state.dates.checkOut) {
      const nights = Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return option.pricePerNight * nights;
    }
    return option.price;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
          </h3>
          <p className="text-gray-600">
            Loading available options...
          </p>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-48 w-full"></div>
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
          <h3 className="text-2xl font-bold text-gray-900">
            Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
          </h3>
          <p className="text-red-600">
            Error loading options: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Choose Your {state.experienceType === 'room' ? 'Room' : 'Surf Week'}
        </h3>
        <p className="text-gray-600">
          {state.experienceType === 'room' 
            ? `Available rooms for ${state.guests} ${state.guests === 1 ? 'guest' : 'guests'}`
            : 'Select your perfect surf adventure'
          }
        </p>
      </div>

      {/* Options Grid */}
      <div className="space-y-4">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const totalPrice = calculateTotalPrice(option);
          const amenities = state.experienceType === 'room' ? option.amenities : option.includes;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
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
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-6">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    {option.images && option.images.length > 0 ? (
                      <img 
                        src={option.images[0]} 
                        alt={option.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-white text-2xl font-bold">
                        {state.experienceType === 'room' ? '🏠' : '🏄‍♂️'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Title and Price */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {option.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPrice(totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {state.experienceType === 'room' 
                          ? `per ${state.dates.checkIn && state.dates.checkOut 
                              ? Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))
                              : 1} night${state.dates.checkIn && state.dates.checkOut 
                                ? Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''
                                : ''}`
                          : 'per person'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {state.experienceType === 'room' ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>Up to {option.maxOccupancy} guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span className="capitalize">{option.type} room</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>Max {option.maxParticipants} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={14} />
                          <span className="capitalize">{option.level} level</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {new Date(option.startDate).toLocaleDateString()} - {new Date(option.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Amenities/Includes */}
                  {amenities && amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                        >
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}
                      {amenities.length > 4 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          +{amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
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

      {/* No Options Message */}
      {options.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No {state.experienceType === 'room' ? 'rooms' : 'surf weeks'} available for your selected dates.
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {state.experienceType === 'room' 
            ? 'All rooms include WiFi, linens, and access to common areas.'
            : 'All surf weeks include accommodation, meals, equipment, and professional coaching.'
          }
        </p>
      </div>
    </div>
  );
}
