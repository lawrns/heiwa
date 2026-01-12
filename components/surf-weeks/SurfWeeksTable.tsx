'use client'

import { Button } from '@/components/ui/button'

interface SurfWeek {
  id: string
  name: string
  start_date: string
  end_date: string
  price: number
  max_participants: number
  available_spots: number
  is_full: boolean
}

interface SurfWeeksTableProps {
  surfWeeks: SurfWeek[]
}

export function SurfWeeksTable({ surfWeeks }: SurfWeeksTableProps) {
  // Format dates consistently using UTC to avoid hydration mismatches
  // This ensures server and client render the same date strings
  const formatDateRange = (startDate: string, endDate: string) => {
    // Parse dates as UTC to avoid timezone issues
    const startParts = startDate.split('-').map(Number)
    const endParts = endDate.split('-').map(Number)
    
    const start = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]))
    const end = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]))
    
    // Use UTC timezone explicitly to ensure consistent formatting
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    }
    
    return `${start.toLocaleDateString('en-GB', options)} – ${end.toLocaleDateString('en-GB', options)}`
  }

  const getPriceDisplay = (price: number) => {
    return `From €${price}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700">
          <div>Dates</div>
          <div className="flex items-center gap-2">
            Price
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>Available Spots</div>
          <div></div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {surfWeeks.map((week) => (
          <div key={week.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium text-base mb-1">{formatDateRange(week.start_date, week.end_date)}</div>
                  <div className="text-sm text-gray-600">{week.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {week.available_spots}/{week.max_participants} spots available
                    {week.is_full && (
                      <span className="ml-2 text-xs text-red-600 font-medium">Fully Booked</span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-gray-900 font-semibold text-lg">{getPriceDisplay(week.price)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  disabled={week.is_full}
                  className={`w-full px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    week.is_full 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-accent hover:bg-accent-dark text-white'
                  }`}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: week.id }))
                  }}
                >
                  {week.is_full ? 'Fully Booked' : 'Book Now'}
                </Button>
                {!week.is_full && (
                  <p className="text-xs text-gray-500 text-center">You&apos;ll select your party size next</p>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-4 gap-4 items-center">
              <div>
                <div className="text-gray-900 font-medium">{formatDateRange(week.start_date, week.end_date)}</div>
                <div className="text-sm text-gray-600">{week.name}</div>
              </div>
              <div className="text-gray-900 font-medium">{getPriceDisplay(week.price)}</div>
              <div>
                <div className="text-gray-600">{week.available_spots}/{week.max_participants}</div>
                {week.is_full && (
                  <span className="text-xs text-red-600 font-medium">Fully Booked</span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Button
                  disabled={week.is_full}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    week.is_full 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-accent hover:bg-accent-dark text-white'
                  }`}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: week.id }))
                  }}
                >
                  {week.is_full ? 'Fully Booked' : 'Book Now'}
                </Button>
                {!week.is_full && (
                  <p className="text-xs text-gray-500">Select party size next</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
