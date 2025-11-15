'use client'

import { useState } from 'react'

interface SurfLevel {
  name: string
  color: string
  description: string
}

const surfLevels: SurfLevel[] = [
  { name: 'Beginner', color: '#1e7963', description: 'First time surfing' },
  { name: 'Beginner-Intermediate', color: '#1e7963', description: 'Catching whitewater waves' },
  { name: 'Intermediate', color: '#1e7963', description: 'Riding unbroken waves' },
  { name: 'Intermediate-Advanced', color: '#1e7963', description: 'Bottom turns and cutbacks' },
  { name: 'Advanced', color: '#1e7963', description: 'Advanced maneuvers' },
]

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Condition levels: 0 = not ideal, 1 = fair, 2 = good, 3 = best
type ConditionLevel = 0 | 1 | 2 | 3

// Wave conditions by month for each skill level
// Shows what conditions are like in each month for that skill level
// 0 = Not ideal, 1 = Fair, 2 = Good, 3 = Best
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
  'Beginner-Intermediate': [
    0, // Jan - Not ideal
    2, // Feb - Good
    2, // Mar - Good
    1, // Apr - Fair
    3, // May - Best
    3, // Jun - Best
    3, // Jul - Best
    3, // Aug - Best
    2, // Sep - Good
    1, // Oct - Fair
    2, // Nov - Good
    2, // Dec - Good
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
  'Intermediate-Advanced': [
    0, // Jan - Not ideal
    0, // Feb - Not ideal
    0, // Mar - Not ideal
    1, // Apr - Fair
    1, // May - Fair
    1, // Jun - Fair
    1, // Jul - Fair
    2, // Aug - Good
    3, // Sep - Best
    3, // Oct - Best
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

interface LevelChartProps {
  level: SurfLevel
  conditions: ConditionLevel[]
}

function LevelChart({ level, conditions }: LevelChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

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
      case 0: return 0.2 // Not ideal - very light
      case 1: return 0.4 // Fair - light
      case 2: return 0.7 // Good - medium
      case 3: return 1.0 // Best - full
      default: return 0.2
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-6">
        <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{level.name}</h4>
        <p className="text-sm text-gray-600">{level.description}</p>
      </div>
      
      {/* Chart */}
      <div className="space-y-4">
        {/* Month labels */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
          {months.map((month, index) => (
            <div
              key={month}
              className="text-center text-xs sm:text-sm font-semibold text-gray-700 py-1"
              onMouseEnter={() => setHoveredMonth(index)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Wave condition bars */}
        <div className="flex items-center gap-4">
          <div className="w-28 sm:w-32 text-xs sm:text-sm font-medium text-gray-700">Wave Conditions</div>
          <div className="flex-1 grid grid-cols-12 gap-1.5 sm:gap-2">
            {months.map((_, monthIndex) => {
              const conditionLevel = conditions[monthIndex]
              const isHovered = hoveredMonth === monthIndex
              const opacity = getConditionOpacity(conditionLevel)
              
              return (
                <div
                  key={monthIndex}
                  className={`h-14 sm:h-16 rounded-md transition-all duration-200 cursor-pointer ${
                    isHovered ? 'ring-2 ring-[#1e7963] ring-opacity-50 scale-110 shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: conditionLevel === 0 ? '#f3f4f6' : level.color,
                    opacity: conditionLevel === 0 ? 1 : opacity,
                  }}
                  onMouseEnter={() => setHoveredMonth(monthIndex)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  title={`${months[monthIndex]}: ${getConditionLabel(conditionLevel)} conditions for ${level.name.toLowerCase()}`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SeasonalSurfLevelChart() {
  return (
    <div className="space-y-10 py-12">
      <div className="text-center mb-10">
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Best Time to Visit by Surf Level</h3>
        <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Santa Cruz offers surfable conditions year-round. Here&apos;s when each skill level finds the best conditions.
        </p>
      </div>
      
      {/* Individual charts for each level */}
      <div className="space-y-6 sm:space-y-8">
        {surfLevels.map((level) => (
          <LevelChart
            key={level.name}
            level={level}
            conditions={waveConditionsByLevel[level.name]}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#1e7963] opacity-20"></div>
            <span className="text-sm text-gray-600">Not ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#1e7963] opacity-40"></div>
            <span className="text-sm text-gray-600">Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#1e7963] opacity-70"></div>
            <span className="text-sm text-gray-600">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#1e7963]"></div>
            <span className="text-sm text-gray-600">Best</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 italic text-center">
          * Conditions vary daily. This chart shows typical monthly patterns. Always check current conditions before your visit.
        </p>
      </div>
    </div>
  )
}
