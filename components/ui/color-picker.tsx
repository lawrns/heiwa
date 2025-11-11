'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
  id?: string
}

// Preset colors for quick selection
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#64748B', // Slate
]

export function ColorPicker({ value, onChange, label, className, id }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(value || '#3B82F6')

  const handlePresetClick = (color: string) => {
    setHexValue(color)
    onChange(color)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setHexValue(newValue)
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setHexValue(newValue)
    onChange(newValue)
  }

  // Sync with external value changes
  if (value !== hexValue && value) {
    setHexValue(value)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      
      <div className="flex items-center gap-3">
        {/* Preset Colors */}
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handlePresetClick(color)}
              className={cn(
                'w-8 h-8 rounded-md border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-heiwaOrange-500',
                hexValue.toLowerCase() === color.toLowerCase()
                  ? 'border-gray-900 ring-2 ring-heiwaOrange-500 ring-offset-1'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Hex Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">#</span>
            <Input
              id={id}
              type="text"
              value={hexValue.replace('#', '')}
              onChange={handleHexChange}
              placeholder="FFFFFF"
              className="w-20 pl-8 font-mono text-sm"
              maxLength={6}
              pattern="[0-9A-Fa-f]{6}"
            />
          </div>

          {/* Native Color Picker (hidden but accessible) */}
          <div className="relative">
            <input
              type="color"
              value={hexValue}
              onChange={handleColorInputChange}
              className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
              aria-label="Color picker"
            />
          </div>
        </div>
      </div>

      {/* Current Color Preview */}
      <div className="flex items-center gap-2">
        <div
          className="w-full h-10 rounded-md border border-gray-300"
          style={{ backgroundColor: hexValue }}
        />
        <span className="text-sm text-gray-600 font-mono">{hexValue}</span>
      </div>
    </div>
  )
}

