'use client'

import { Info } from 'lucide-react'

interface SurfWeek {
  id: string
  dates: string
  price: string
  availableSpots: string
  totalSpots: number
}

interface BookingTableProps {
  surfWeeks: SurfWeek[]
  onBook: (surfWeek: SurfWeek) => void
  onShowAll: () => void
}

export function BookingTable({ surfWeeks, onBook, onShowAll }: BookingTableProps) {
  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center italic">
        Upcoming Surf Weeks
      </h3>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700">
            <div>Dates</div>
            <div className="flex items-center gap-2">
              Price
              <Info className="w-4 h-4 text-green-600" />
            </div>
            <div>Available Spots</div>
            <div></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {surfWeeks.map((surfWeek) => (
            <div key={surfWeek.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="text-gray-900 font-medium">{surfWeek.dates}</div>
                <div className="text-gray-900 font-medium">{surfWeek.price}</div>
                <div className="text-gray-600">{surfWeek.availableSpots}</div>
                <div className="flex justify-end">
                  <button
                    onClick={() => onBook(surfWeek)}
                    className="px-6 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                    style={{ backgroundColor: '#ec681c' }}
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show All Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onShowAll}
          className="px-8 py-3 border-2 border-gray-300 bg-yellow-50 hover:bg-yellow-100 text-gray-900 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
        >
          Show All Surf Weeks
        </button>
      </div>
    </div>
  )
}
