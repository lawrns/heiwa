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
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }
    
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`
  }

  const getPriceDisplay = (price: number) => {
    return `From €${price}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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
          <div key={week.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-4 gap-4 items-center">
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
              <div className="flex justify-end">
                <Button
                  disabled={week.is_full}
                  className="px-6 py-2 text-sm font-semibold rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: week.is_full ? '#e5e7eb' : '#ec681c',
                    color: week.is_full ? '#9ca3af' : 'white'
                  }}
                  onClick={() => {
                    // This will be handled by client-side component
                    window.dispatchEvent(new CustomEvent('openBookingForWeek', { detail: week.id }))
                  }}
                >
                  {week.is_full ? 'Fully Booked' : 'Book Now'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
