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
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{level.name}</h4>
        <p className="text-sm text-gray-600">{level.description}</p>
      </div>
      
      {/* Chart */}
      <div className="space-y-3">
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

        {/* Wave condition bars */}
        <div className="flex items-center gap-3">
          <div className="w-24 text-xs font-medium text-gray-600">Wave Conditions</div>
          <div className="flex-1 grid grid-cols-12 gap-1">
            {months.map((_, monthIndex) => {
              const conditionLevel = conditions[monthIndex]
              const isHovered = hoveredMonth === monthIndex
              const opacity = getConditionOpacity(conditionLevel)
              
              return (
                <div
                  key={monthIndex}
                  className={`h-12 rounded transition-all ${
                    isHovered ? 'ring-2 ring-gray-400 scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: conditionLevel === 0 ? '#e5e7eb' : level.color,
                    opacity: opacity,
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Best Time to Visit by Surf Level</h3>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Santa Cruz offers surfable conditions year-round. Here&apos;s when each skill level finds the best conditions.
        </p>
      </div>
      
      {/* Individual charts for each level */}
      <div className="space-y-6">
        {surfLevels.map((level) => (
          <LevelChart
            key={level.name}
            level={level}
            conditions={waveConditionsByLevel[level.name]}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic text-center">
          * Conditions vary daily. This chart shows typical monthly patterns. Always check current conditions before your visit.
        </p>
      </div>
    </div>
  )
}
