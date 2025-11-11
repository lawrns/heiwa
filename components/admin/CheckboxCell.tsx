'use client'

import { Checkbox } from '@/components/ui/checkbox'

interface CheckboxCellProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function CheckboxCell({ checked, onCheckedChange, disabled }: CheckboxCellProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}

export default CheckboxCell

