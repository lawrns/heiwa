'use client'

import { useState } from 'react'
import { Check, X, MoreVertical, Trash2, Edit, Send, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BulkActionsProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  actions: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
  }>
  className?: string
}

export function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions,
  className = '',
}: BulkActionsProps) {
  const [showActions, setShowActions] = useState(false)

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} of {totalCount} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Select all
            </button>
            <span className="text-blue-300">|</span>
            <button
              onClick={onDeselectAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear selection
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BulkActions

