'use client'

import { useState } from 'react'

interface SurfLevel {
  name: string
  color: string
  description: string
}

const surfLevels: SurfLevel[] = [
  { name: 'Beginner', color: '#10b981', description: 'First time surfing' },
  { name: 'Beginner-Intermediate', color: '#3b82f6', description: 'Catching whitewater waves' },
  { name: 'Intermediate', color: '#8b5cf6', description: 'Riding unbroken waves' },
  { name: 'Intermediate-Advanced', color: '#f59e0b', description: 'Bottom turns and cutbacks' },
  { name: 'Advanced', color: '#ef4444', description: 'Advanced maneuvers' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Simplified surf level data for Santa Cruz (example - should be adjusted based on actual data)
// Format: [monthIndex] = levelIndex (0-4)
const monthlyLevels = [
  1, // Jan - Beginner-Intermediate
  1, // Feb - Beginner-Intermediate
  2, // Mar - Intermediate
  2, // Apr - Intermediate
  2, // May - Intermediate
  2, // Jun - Intermediate
  2, // Jul - Intermediate
  3, // Aug - Intermediate-Advanced
  3, // Sep - Intermediate-Advanced
  2, // Oct - Intermediate
  1, // Nov - Beginner-Intermediate
  1, // Dec - Beginner-Intermediate
]

export function SeasonalSurfLevelChart() {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Time to Visit by Surf Level</h3>
      <p className="text-gray-600 mb-6 text-sm">
        Santa Cruz offers surfable conditions year-round. Here&apos;s when each skill level finds the best conditions.
      </p>
      
      {/* Chart */}
      <div className="space-y-4">
        {/* Month labels */}
        <div className="grid grid-cols-12 gap-1">
          {months.map((month, index) => (
            <div
              key={month}
              className="text-center text-xs font-medium text-gray-700"
              onMouseEnter={() => setHoveredMonth(index)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Level bars */}
        <div className="space-y-2">
          {surfLevels.map((level, levelIndex) => (
            <div key={level.name} className="flex items-center gap-3">
              <div className="w-32 text-sm font-medium text-gray-700">{level.name}</div>
              <div className="flex-1 grid grid-cols-12 gap-1">
                {months.map((_, monthIndex) => {
                  const isActive = monthlyLevels[monthIndex] === levelIndex
                  const isHovered = hoveredMonth === monthIndex
                  return (
                    <div
                      key={monthIndex}
                      className={`h-8 rounded transition-all ${
                        isActive
                          ? `${level.color} opacity-100`
                          : 'bg-gray-200 opacity-30'
                      } ${isHovered ? 'ring-2 ring-gray-400' : ''}`}
                      style={isActive ? { backgroundColor: level.color } : {}}
                      onMouseEnter={() => setHoveredMonth(monthIndex)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      title={`${months[monthIndex]}: ${isActive ? level.description : 'Less ideal'}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          * Conditions vary daily. This chart shows typical monthly patterns. Always check current conditions before your visit.
        </p>
      </div>
    </div>
  )
}

