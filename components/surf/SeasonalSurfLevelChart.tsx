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

// Wave conditions by month for each skill level - matching reference image exactly
// Pattern: Each skill level has lighter shade for Jan-Apr/Oct-Dec, darker shade for May-Sep
// Beginner: Light (Jan-Apr, Oct-Dec), Medium (May-Sep)
// Intermediate: Medium (Jan-Apr, Oct-Dec), Dark (May-Sep)
// Advanced: Dark (Jan-Apr, Oct-Dec), Very Dark (May-Sep)
const waveConditionsByLevel: Record<string, ConditionLevel[]> = {
  'Beginner': [
    1, // Jan - Light teal
    1, // Feb - Light teal
    1, // Mar - Light teal
    1, // Apr - Light teal
    2, // May - Medium teal
    2, // Jun - Medium teal
    2, // Jul - Medium teal
    2, // Aug - Medium teal
    2, // Sep - Medium teal
    1, // Oct - Light teal
    1, // Nov - Light teal
    1, // Dec - Light teal
  ],
  'Intermediate': [
    2, // Jan - Medium teal
    2, // Feb - Medium teal
    2, // Mar - Medium teal
    2, // Apr - Medium teal
    3, // May - Dark teal
    3, // Jun - Dark teal
    3, // Jul - Dark teal
    3, // Aug - Dark teal
    3, // Sep - Dark teal
    2, // Oct - Medium teal
    2, // Nov - Medium teal
    2, // Dec - Medium teal
  ],
  'Advanced': [
    3, // Jan - Dark teal
    3, // Feb - Dark teal
    3, // Mar - Dark teal
    3, // Apr - Dark teal
    3, // May - Very dark teal/deep green (will use highest opacity)
    3, // Jun - Very dark teal/deep green
    3, // Jul - Very dark teal/deep green
    3, // Aug - Very dark teal/deep green
    3, // Sep - Very dark teal/deep green
    3, // Oct - Dark teal
    3, // Nov - Dark teal
    3, // Dec - Dark teal
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

// Map to green shades matching the reference image
// Need to differentiate Advanced May-Sep (very dark) from Advanced Jan-Apr/Oct-Dec (dark)
// We'll use condition level + month index to determine final opacity
const getConditionOpacity = (conditionLevel: ConditionLevel, monthIndex: number, levelName: string): number => {
  // Advanced level May-Sep (months 4-8) should be darkest
  if (levelName === 'Advanced' && monthIndex >= 4 && monthIndex <= 8) {
    return 1.0 // Very dark teal/deep green
  }
  
  // Standard opacity mapping
  switch (conditionLevel) {
    case 0: return 0.35 // Not ideal - lightest green
    case 1: return 0.35 // Light teal (Beginner Jan-Apr, Oct-Dec)
    case 2: return 0.65 // Medium teal (Beginner May-Sep, Intermediate Jan-Apr/Oct-Dec)
    case 3: return 0.85 // Dark teal (Intermediate May-Sep, Advanced Jan-Apr/Oct-Dec)
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
                    const opacity = getConditionOpacity(conditionLevel, monthIndex, level.name)
                    
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
