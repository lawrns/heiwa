import { useState } from 'react';
import { Calendar, Users, Minus, Plus } from 'lucide-react';
import { BookingState } from '../types';
import { useSurfCamps } from '../hooks/useSurfCamps';

interface DatesAndGuestsProps {
  state: BookingState;
  actions: {
    setDates: (checkIn: Date, checkOut: Date) => void;
    setGuests: (count: number) => void;
    setSurfWeek?: (surfWeekId: string) => void;
  };
}

export function DatesAndGuests({ state, actions }: DatesAndGuestsProps) {
  const [checkInDate, setCheckInDate] = useState(
    state.dates.checkIn?.toISOString().split('T')[0] || ''
  );
  const [checkOutDate, setCheckOutDate] = useState(
    state.dates.checkOut?.toISOString().split('T')[0] || ''
  );
  const [selectedSurfWeek, setSelectedSurfWeek] = useState<string | null>(null);

  // Load surf camps for surf week selection
  const { surfCamps, loading: surfCampsLoading, error: surfCampsError } = useSurfCamps();

  const handleCheckInChange = (dateStr: string) => {
    setCheckInDate(dateStr);
    if (dateStr && checkOutDate) {
      const checkIn = new Date(dateStr);
      const checkOut = new Date(checkOutDate);
      if (checkIn < checkOut) {
        actions.setDates(checkIn, checkOut);
      }
    }
  };

  const handleCheckOutChange = (dateStr: string) => {
    setCheckOutDate(dateStr);
    if (checkInDate && dateStr) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(dateStr);
      if (checkIn < checkOut) {
        actions.setDates(checkIn, checkOut);
      }
    }
  };

  const handleSurfWeekSelect = (surfWeek: any) => {
    setSelectedSurfWeek(surfWeek.id);
    const startDate = new Date(surfWeek.startDate);
    const endDate = new Date(surfWeek.endDate);
    actions.setDates(startDate, endDate);
    if (actions.setSurfWeek) {
      actions.setSurfWeek(surfWeek.id);
    }
  };

  const adjustGuests = (delta: number) => {
    const newCount = Math.max(1, Math.min(12, state.guests + delta));
    actions.setGuests(newCount);
  };

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkInDate || today;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          When & How Many?
        </h3>
        <p className="text-gray-600">
          {state.experienceType === 'room' 
            ? 'Select your check-in and check-out dates'
            : 'Choose your surf week dates and group size'
          }
        </p>
      </div>

      {/* Date Selection - Different for surf weeks vs rooms */}
      {state.experienceType === 'surf-week' ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" />
            Choose Your Surf Week
          </h4>

          {surfCampsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading available surf weeks...</p>
            </div>
          ) : surfCampsError ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading surf weeks: {surfCampsError}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {surfCamps.map((surfWeek: any) => {
                const isSelected = selectedSurfWeek === surfWeek.id;
                const startDate = new Date(surfWeek.startDate);
                const endDate = new Date(surfWeek.endDate);
                const dateRange = `${startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })} - ${endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}`;
                const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                // Enhanced occupancy display
                const confirmedBooked = surfWeek.confirmedBooked || 0;
                const maxParticipants = surfWeek.maxParticipants || 0;
                const availableSpots = surfWeek.availableSpots || (maxParticipants - confirmedBooked);
                const occupancyText = confirmedBooked > 0
                  ? `${confirmedBooked}/${maxParticipants} booked`
                  : `${availableSpots} spots available`;

                return (
                  <button
                    key={surfWeek.id}
                    onClick={() => handleSurfWeekSelect(surfWeek)}
                    data-testid="surf-week-option"
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all duration-300 text-left
                      ${isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/20'
                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="text-lg font-semibold text-gray-900">{surfWeek.name}</h5>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            {duration} days
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{dateRange}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">{occupancyText}</span>
                          <span className="text-orange-600 font-medium">
                            from €{surfWeek.priceFrom || surfWeek.price}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-orange-500" />
            Select Dates
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <label htmlFor="check-in" className="block text-sm font-medium text-gray-700">
                Check-in
              </label>
              <input
                id="check-in"
                type="date"
                value={checkInDate}
                min={today}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  transition-colors duration-200
                  text-gray-900 bg-white
                "
                required
              />
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <label htmlFor="check-out" className="block text-sm font-medium text-gray-700">
                Check-out
              </label>
              <input
                id="check-out"
                type="date"
                value={checkOutDate}
                min={minCheckOut}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  transition-colors duration-200
                  text-gray-900 bg-white
                "
                required
              />
            </div>
          </div>

          {/* Date Summary */}
          {state.dates.checkIn && state.dates.checkOut && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">
                  Duration: {Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                </span>
                <span className="text-sm text-orange-600">
                  {state.dates.checkIn.toLocaleDateString()} - {state.dates.checkOut.toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guest Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} className="text-orange-500" />
          Number of Guests
        </h4>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <div className="font-medium text-gray-900">Guests</div>
            <div className="text-sm text-gray-600">
              {state.experienceType === 'room' 
                ? 'How many people will be staying?'
                : 'How many people in your group?'
              }
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustGuests(-1)}
              disabled={state.guests <= 1}
              className="
                w-10 h-10 rounded-full border border-gray-300
                flex items-center justify-center
                hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500/30
              "
              aria-label="Decrease guest count"
            >
              <Minus size={16} />
            </button>

            <span className="w-12 text-center text-lg font-semibold text-gray-900">
              {state.guests}
            </span>

            <button
              onClick={() => adjustGuests(1)}
              disabled={state.guests >= 12}
              className="
                w-10 h-10 rounded-full border border-gray-300
                flex items-center justify-center
                hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500/30
              "
              aria-label="Increase guest count"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Guest Count Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {state.guests === 1 
              ? 'Solo adventure! Perfect for meeting new people.'
              : state.guests <= 4 
                ? 'Small group - intimate and personalized experience.'
                : 'Large group - great for team building and celebrations!'
            }
          </p>
        </div>
      </div>

      {/* Summary Card */}
      {state.dates.checkIn && state.dates.checkOut && (
        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <h5 className="font-semibold text-orange-900 mb-3">Your Selection</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-orange-700">Experience:</span>
              <span className="font-medium text-orange-900">
                {state.experienceType === 'room' ? 'Room Booking' : 'Surf Week Package'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Duration:</span>
              <span className="font-medium text-orange-900">
                {Math.ceil((state.dates.checkOut.getTime() - state.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Guests:</span>
              <span className="font-medium text-orange-900">
                {state.guests} {state.guests === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
