import { useState } from 'react';
import { Bed, Users, Star, ArrowRight } from 'lucide-react';
import { BookingState } from '../types';

interface SurfWeekRoomSelectionProps {
  state: BookingState;
  actions: {
    setSurfWeekRoom: (roomId: string) => void;
    updatePricing: (pricing: any) => void;
  };
}

// Mock room data for surf week accommodation options
const surfWeekRooms = [
  {
    id: 'dorm-shared',
    name: 'Shared Dorm Room',
    type: 'dorm',
    description: 'Comfortable shared accommodation with fellow surfers',
    features: ['Shared bathroom', 'Air conditioning', 'Lockers', 'Common area access'],
    maxOccupancy: 6,
    pricePerNight: 0, // Included in surf week price
    isIncluded: true,
    image: '/images/dorm-room.jpg'
  },
  {
    id: 'private-single',
    name: 'Private Single Room',
    type: 'private',
    description: 'Your own private space with all amenities',
    features: ['Private bathroom', 'Air conditioning', 'Mini fridge', 'Ocean view'],
    maxOccupancy: 1,
    pricePerNight: 45, // Upgrade price per night
    isIncluded: false,
    image: '/images/private-room.jpg'
  },
  {
    id: 'private-double',
    name: 'Private Double Room',
    type: 'private',
    description: 'Spacious private room perfect for couples or friends',
    features: ['Private bathroom', 'Air conditioning', 'Mini fridge', 'Ocean view', 'Double bed'],
    maxOccupancy: 2,
    pricePerNight: 65, // Upgrade price per night
    isIncluded: false,
    image: '/images/private-double.jpg'
  }
];

export function SurfWeekRoomSelection({ state, actions }: SurfWeekRoomSelectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(state.selectedSurfWeekRoom);

  const handleRoomSelection = (roomId: string) => {
    setSelectedRoom(roomId);
    actions.setSurfWeekRoom(roomId);

    // Calculate pricing based on room selection
    const room = surfWeekRooms.find(r => r.id === roomId);
    if (room && state.selectedSurfWeek) {
      // Get surf week duration (assuming 7 days for now)
      const surfWeekDuration = 7;
      const roomUpgradeTotal = room.pricePerNight * surfWeekDuration;
      
      // Update pricing with room upgrade
      const basePrice = state.pricing.basePrice;
      const newTotal = basePrice + roomUpgradeTotal + state.pricing.addOnsSubtotal + state.pricing.taxes + state.pricing.fees;
      
      actions.updatePricing({
        ...state.pricing,
        roomUpgrade: roomUpgradeTotal,
        total: newTotal,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Choose Your Accommodation
        </h3>
        <p className="text-gray-600">
          Select your preferred room type for your surf week experience
        </p>
      </div>

      {/* Room Options */}
      <div className="space-y-4">
        {surfWeekRooms.map((room) => {
          const isSelected = selectedRoom === room.id;
          const weeklyUpgrade = room.pricePerNight * 7; // 7 days

          return (
            <div
              key={room.id}
              onClick={() => handleRoomSelection(room.id)}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                }
              `}
            >
              {/* Room Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bed size={20} className="text-orange-500" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      {room.name}
                    </h4>
                    {room.isIncluded && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Included
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {room.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="text-right ml-4">
                  {room.isIncluded ? (
                    <div className="text-lg font-bold text-green-600">
                      Included
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-bold text-orange-600">
                        +{formatPrice(weeklyUpgrade)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ({formatPrice(room.pricePerNight)}/night)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {room.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Room Details */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>Up to {room.maxOccupancy} {room.maxOccupancy === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  {room.type === 'private' && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="flex items-center gap-2 text-orange-600 font-medium">
                    <span>Selected</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>

              {/* Selection Border Effect */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-orange-500 pointer-events-none">
                  <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedRoom && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-orange-900">Room Selection</h5>
              <p className="text-sm text-orange-700">
                {surfWeekRooms.find(r => r.id === selectedRoom)?.name}
              </p>
            </div>
            <div className="text-right">
              {surfWeekRooms.find(r => r.id === selectedRoom)?.isIncluded ? (
                <div className="text-green-600 font-medium">Included in package</div>
              ) : (
                <div className="text-orange-600 font-medium">
                  +{formatPrice(surfWeekRooms.find(r => r.id === selectedRoom)?.pricePerNight! * 7)} upgrade
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          All rooms include daily housekeeping, WiFi, and access to common areas.
          Private rooms can be upgraded at any time during your stay.
        </p>
      </div>
    </div>
  );
}
