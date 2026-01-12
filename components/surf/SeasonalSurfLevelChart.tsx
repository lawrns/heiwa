'use client'

import { useState } from 'react'

const surfLevels = [
  { name: 'Beginner', description: 'First time surfing' },
  { name: 'Intermediate', description: 'Riding unbroken waves' },
  { name: 'Advanced', description: 'Advanced maneuvers' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Condition levels: 0 = not ideal, 1 = fair, 2 = good, 3 = best
type ConditionLevel = 0 | 1 | 2 | 3

// Wave conditions by month for each skill level - matching reference image EXACTLY
// Using exactly 3 shades: 1 = Light, 2 = Medium, 3 = Dark
// Beginner: Light (Jan-Mar), Medium (Apr, Oct), Dark (May-Sep), Light (Nov-Dec)
// Intermediate: Medium (Jan-Apr), Dark (May-Oct), Medium (Nov-Dec)
// Advanced: Dark (Jan-May, Sep-Dec), Medium (Jun-Aug)
const waveConditionsByLevel: Record<string, ConditionLevel[]> = {
  'Beginner': [
    1, // Jan - Light
    1, // Feb - Light
    1, // Mar - Light
    2, // Apr - Medium
    3, // May - Dark
    3, // Jun - Dark
    3, // Jul - Dark
    3, // Aug - Dark
    3, // Sep - Dark
    2, // Oct - Medium
    1, // Nov - Light
    1, // Dec - Light
  ],
  'Intermediate': [
    2, // Jan - Medium
    2, // Feb - Medium
    2, // Mar - Medium
    2, // Apr - Medium
    3, // May - Dark
    3, // Jun - Dark
    3, // Jul - Dark
    3, // Aug - Dark
    3, // Sep - Dark
    3, // Oct - Dark
    2, // Nov - Medium
    2, // Dec - Medium
  ],
  'Advanced': [
    3, // Jan - Dark
    3, // Feb - Dark
    3, // Mar - Dark
    3, // Apr - Dark
    3, // May - Dark
    2, // Jun - Medium
    2, // Jul - Medium
    2, // Aug - Medium
    3, // Sep - Dark
    3, // Oct - Dark
    3, // Nov - Dark
    3, // Dec - Dark
  ],
}

const GREEN_COLOR = '#1e7963'

// Get label based on condition level
const getConditionLabel = (conditionLevel: ConditionLevel): string => {
  switch (conditionLevel) {
    case 1: return 'Fair'
    case 2: return 'Good'
    case 3: return 'Best'
    default: return 'Not ideal'
  }
}

// Map to exactly 3 green shades matching the reference image
// 1 = Lightest green (0.35), 2 = Medium green (0.65), 3 = Darkest green (1.0)
const getConditionOpacity = (conditionLevel: ConditionLevel): number => {
  switch (conditionLevel) {
    case 1: return 0.35 // Lightest green
    case 2: return 0.65 // Medium green
    case 3: return 1.0  // Darkest green
    default: return 0.35
  }
}

export function SeasonalSurfLevelChart() {
  const [hoveredCell, setHoveredCell] = useState<{ level: string; month: number } | null>(null)

  return (
    <div className="w-full py-12">
      <div className="text-center mb-10">
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Best Time to Visit by Surf Level</h3>
        <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Santa Cruz offers surfable conditions year-round. Here&apos;s when each skill level finds the best conditions.
        </p>
      </div>
      
      {/* Single unified chart */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row with months */}
          <div className="grid grid-cols-[140px_repeat(12,1fr)] gap-2 mb-4">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider"></div>
            {months.map((month) => (
              <div
                key={month}
                className="text-center text-sm sm:text-base font-bold text-gray-700 py-2"
              >
                {month}
              </div>
            ))}
          </div>

          {/* Level rows */}
          <div className="space-y-3">
            {surfLevels.map((level) => {
              const conditions = waveConditionsByLevel[level.name]
              
              return (
                <div
                  key={level.name}
                  className="grid grid-cols-[140px_repeat(12,1fr)] gap-2 items-center group"
                >
                  {/* Level label */}
                  <div className="flex flex-col">
                    <div className="text-base sm:text-lg font-bold text-gray-900">
                      {level.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {level.description}
                    </div>
                  </div>

                  {/* Condition cells */}
                  {months.map((_, monthIndex) => {
                    const conditionLevel = conditions[monthIndex]
                    const isHovered = hoveredCell?.level === level.name && hoveredCell?.month === monthIndex
                    const opacity = getConditionOpacity(conditionLevel)
                    const label = getConditionLabel(conditionLevel)
                    
                    return (
                      <div
                        key={monthIndex}
                        className={`h-16 sm:h-20 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          isHovered 
                            ? 'ring-3 ring-[#1e7963] ring-opacity-60 scale-110 shadow-xl z-10' 
                            : 'hover:ring-2 hover:ring-[#1e7963] hover:ring-opacity-40 hover:scale-105 hover:shadow-lg'
                        }`}
                        style={{
                          backgroundColor: GREEN_COLOR,
                          opacity: opacity,
                        }}
                        onMouseEnter={() => setHoveredCell({ level: level.name, month: monthIndex })}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${months[monthIndex]}: ${label} conditions for ${level.name.toLowerCase()}`}
                      >
                        {isHovered && (
                          <span className="text-xs font-semibold text-white drop-shadow-lg">
                            {label}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
