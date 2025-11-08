'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, CheckCircle } from 'lucide-react'

interface AvailabilityBadgeProps {
  tier?: 'always' | 'on-request'
  className?: string
}

export function AvailabilityBadge({ tier = 'always', className = '' }: AvailabilityBadgeProps) {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'always':
        return {
          label: 'Always Available',
          variant: 'default' as const,
          icon: CheckCircle,
          description: 'This activity is available year-round'
        }
      case 'on-request':
        return {
          label: 'On Request',
          variant: 'secondary' as const,
          icon: Calendar,
          description: 'This activity requires advance booking'
        }
      default:
        return {
          label: 'Available',
          variant: 'outline' as const,
          icon: Clock,
          description: 'Availability varies'
        }
    }
  }

  const config = getTierConfig(tier)
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
      <span className="text-xs text-gray-500 hidden sm:inline">
        {config.description}
      </span>
    </div>
  )
}
