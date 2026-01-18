'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  color?: 'orange' | 'green' | 'blue' | 'purple'
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  onClick?: () => void
  href?: string
}

const colorClasses = {
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'orange',
  trend,
  onClick,
  href,
}: StatCardProps) {
  const colors = colorClasses[color]
  const isClickable = onClick || href

  const content = (
    <div className={`${colors.bg} rounded-lg border ${colors.border} p-6 transition-[box-shadow,transform,background-color] duration-300 ${
      isClickable ? 'hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus-within:ring-2 focus-within:ring-heiwaOrange-500/40 focus-within:ring-offset-2' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center text-xs font-semibold ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'} {trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`${colors.icon} rounded-lg p-3 bg-white`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heiwaOrange-500/40 focus-visible:ring-offset-2 rounded-lg" type="button">
        {content}
      </button>
    )
  }

  return content
}

export default StatCard
