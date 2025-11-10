'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface ActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  buttonText?: string
  stat?: {
    label: string
    value: string | number
  }
  color?: 'orange' | 'green' | 'blue' | 'purple'
}

const colorClasses = {
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700',
    border: 'border-green-200',
    dot: 'bg-green-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
  },
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText = 'Manage',
  stat,
  color = 'orange',
}: ActionCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`${colors.bg} rounded-lg border ${colors.border} p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.icon} rounded-lg p-3 bg-white`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4 flex-1">{description}</p>

      {stat && (
        <div className="mb-4 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
          <span className="text-sm text-gray-700">
            {stat.label}: <span className="font-semibold">{stat.value}</span>
          </span>
        </div>
      )}

      <Link href={href} className="mt-auto">
        <button className={`w-full ${colors.button} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200`}>
          {buttonText}
        </button>
      </Link>
    </div>
  )
}

export default ActionCard
