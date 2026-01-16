"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
