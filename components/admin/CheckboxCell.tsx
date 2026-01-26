'use client'

import { Checkbox } from '@/components/ui/checkbox'

interface CheckboxCellProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  'data-testid'?: string
}

export function CheckboxCell({ checked, onCheckedChange, disabled, 'data-testid': testId }: CheckboxCellProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-testid={testId}
      />
    </div>
  )
}

export default CheckboxCell

