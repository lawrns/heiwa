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

// Wave conditions by month for each skill level
const waveConditionsByLevel: Record<string, ConditionLevel[]> = {
  'Beginner': [
    0, // Jan - Not ideal
    0, // Feb - Not ideal
    0, // Mar - Not ideal
    1, // Apr - Fair
    3, // May - Best
    3, // Jun - Best
    3, // Jul - Best
    3, // Aug - Best
    2, // Sep - Good
    1, // Oct - Fair
    0, // Nov - Not ideal
    0, // Dec - Not ideal
  ],
  'Intermediate': [
    0, // Jan - Not ideal
    1, // Feb - Fair
    1, // Mar - Fair
    2, // Apr - Good
    3, // May - Best
    3, // Jun - Best
    3, // Jul - Best
    3, // Aug - Best
    2, // Sep - Good
    2, // Oct - Good
    1, // Nov - Fair
    0, // Dec - Not ideal
  ],
  'Advanced': [
    3, // Jan - Best
    3, // Feb - Best
    3, // Mar - Best
    1, // Apr - Fair
    0, // May - Not ideal
    0, // Jun - Not ideal
    0, // Jul - Not ideal
    0, // Aug - Not ideal
    1, // Sep - Fair
    2, // Oct - Good
    3, // Nov - Best
    3, // Dec - Best
  ],
}

const GREEN_COLOR = '#1e7963'

const getConditionLabel = (level: ConditionLevel): string => {
  switch (level) {
    case 0: return 'Not ideal'
    case 1: return 'Fair'
    case 2: return 'Good'
    case 3: return 'Best'
    default: return 'Unknown'
  }
}

const getConditionOpacity = (conditionLevel: ConditionLevel): number => {
  switch (conditionLevel) {
    case 0: return 0.2 // Not ideal - gray/transparent
    case 1: return 0.6 // Fair - darker
    case 2: return 0.8 // Good - darker
    case 3: return 1.0 // Best - darkest
    default: return 0.2
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
            {months.map((month, index) => (
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
            {surfLevels.map((level, levelIndex) => {
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
                        title={`${months[monthIndex]}: ${getConditionLabel(conditionLevel)} conditions for ${level.name.toLowerCase()}`}
                      >
                        {isHovered && (
                          <span className="text-xs font-semibold text-white drop-shadow-lg">
                            {getConditionLabel(conditionLevel)}
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
