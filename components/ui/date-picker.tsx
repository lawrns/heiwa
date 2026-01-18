"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
}

export function DatePicker({
  date,
  onDateChange,
  disabledDates = [],
  minDate,
  maxDate,
  placeholder = "Select date",
  className,
  disabled = false,
  id,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Create a matcher for disabled dates
  const disabledMatcher = React.useMemo(() => {
    const matchers: Array<Date | { before: Date } | { after: Date }> = [...disabledDates]

    if (minDate) {
      matchers.push({ before: minDate })
    }
    if (maxDate) {
      matchers.push({ after: maxDate })
    }

    return matchers
  }, [disabledDates, minDate, maxDate])

  // Use a simple click handler approach that definitely works
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setOpen(!open)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={handleTriggerClick}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center justify-start gap-2 w-full px-3 py-2 text-left font-normal",
            "border border-gray-300 rounded-[10px] bg-white",
            "hover:bg-gray-50 hover:border-gray-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent",
            "transition-[border-color,box-shadow,background-color] duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            !date && "text-gray-500",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onDateChange(newDate)
            setOpen(false)
          }}
          disabled={disabledMatcher}
          initialFocus
          defaultMonth={date || minDate || new Date()}
        />
        {disabledDates.length > 0 && (
          <div className="px-3 pb-3 pt-0 border-t">
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 bg-gray-200 rounded"></span>
              <span>Unavailable dates</span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
