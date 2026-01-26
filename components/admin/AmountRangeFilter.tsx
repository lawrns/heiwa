'use client'

import { Euro } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AmountRangeFilterProps {
  minAmount: string
  maxAmount: string
  onMinAmountChange: (amount: string) => void
  onMaxAmountChange: (amount: string) => void
  label?: string
  currency?: string
  className?: string
}

export function AmountRangeFilter({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  label = 'Amount Range',
  currency = 'EUR',
  className = '',
}: AmountRangeFilterProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
            className="pl-10"
            placeholder="Min amount"
            min="0"
            step="0.01"
          />
        </div>
        <span className="text-gray-500">to</span>
        <div className="relative flex-1">
          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
            className="pl-10"
            placeholder="Max amount"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  )
}

export default AmountRangeFilter

