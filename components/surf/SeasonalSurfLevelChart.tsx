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

// Wave conditions by month for each skill level
// true = good conditions for that level, false = less ideal
const waveConditionsByLevel: Record<string, boolean[]> = {
  'Beginner': [
    false, // Jan
    false, // Feb
    false, // Mar
    false, // Apr
    true,  // May - Good conditions
    true,  // Jun - Good conditions
    true,  // Jul - Good conditions
    true,  // Aug - Good conditions
    true,  // Sep - Good conditions
    false, // Oct
    false, // Nov
    false, // Dec
  ],
  'Beginner-Intermediate': [
    false, // Jan
    true,  // Feb - Good conditions
    true,  // Mar - Good conditions
    false, // Apr
    true,  // May - Good conditions
    true,  // Jun - Good conditions
    true,  // Jul - Good conditions
    true,  // Aug - Good conditions
    true,  // Sep - Good conditions
    false, // Oct
    true,  // Nov - Good conditions
    true,  // Dec - Good conditions
  ],
  'Intermediate': [
    false, // Jan
    false, // Feb
    false, // Mar
    true,  // Apr - Good conditions
    true,  // May - Good conditions
    true,  // Jun - Good conditions
    true,  // Jul - Good conditions
    true,  // Aug - Good conditions
    true,  // Sep - Good conditions
    true,  // Oct - Good conditions
    false, // Nov
    false, // Dec
  ],
  'Intermediate-Advanced': [
    false, // Jan
    false, // Feb
    false, // Mar
    false, // Apr
    false, // May
    false, // Jun
    false, // Jul
    true,  // Aug - Good conditions
    true,  // Sep - Good conditions
    true,  // Oct - Good conditions
    false, // Nov
    false, // Dec
  ],
  'Advanced': [
    true,  // Jan - Good conditions
    true,  // Feb - Good conditions
    true,  // Mar - Good conditions
    false, // Apr
    false, // May
    false, // Jun
    false, // Jul
    false, // Aug
    false, // Sep
    false, // Oct
    true,  // Nov - Good conditions
    true,  // Dec - Good conditions
  ],
}

interface LevelChartProps {
  level: SurfLevel
  conditions: boolean[]
}

function LevelChart({ level, conditions }: LevelChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

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
              const isGood = conditions[monthIndex]
              const isHovered = hoveredMonth === monthIndex
              return (
                <div
                  key={monthIndex}
                  className={`h-12 rounded transition-all ${
                    isGood
                      ? 'opacity-100'
                      : 'bg-gray-200 opacity-30'
                  } ${isHovered ? 'ring-2 ring-gray-400 scale-105' : ''}`}
                  style={isGood ? { backgroundColor: level.color } : {}}
                  onMouseEnter={() => setHoveredMonth(monthIndex)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  title={`${months[monthIndex]}: ${isGood ? 'Good conditions for ' + level.name.toLowerCase() : 'Less ideal conditions'}`}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Condition summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Best months:</span>{' '}
          {months
            .map((month, index) => (conditions[index] ? month : null))
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>
    </div>
  )
}

export function SeasonalSurfLevelChart() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Wave Conditions by Skill Level</h3>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          This is how your wave experience will likely be if you come in each of these months as a surfer of this level.
        </p>
        <p className="text-gray-500 text-sm mt-2 italic">
          Santa Cruz offers surfable conditions year-round. Each chart shows typical monthly patterns for that skill level.
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
          * Conditions vary daily. These charts show typical monthly patterns. Always check current conditions before your visit.
        </p>
      </div>
    </div>
  )
}
