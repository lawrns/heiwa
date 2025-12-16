'use client'

import { cn } from '@/lib/utils'

export type CalendarView = 'month' | 'quarter' | 'year'

interface CalendarViewTabsProps {
  currentView: CalendarView
  onViewChange: (view: CalendarView) => void
}

const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

export function CalendarViewTabs({ currentView, onViewChange }: CalendarViewTabsProps) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
      {VIEW_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onViewChange(value)}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            currentView === value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
