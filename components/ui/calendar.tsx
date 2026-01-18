"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // Root and months container
        root: cn(defaultClassNames.root, ""),
        months: cn(defaultClassNames.months, "flex flex-col sm:flex-row gap-4"),
        month: cn(defaultClassNames.month, "space-y-4"),

        // Caption / header
        month_caption: cn(defaultClassNames.month_caption, "flex justify-center pt-1 relative items-center h-10"),
        caption_label: cn(defaultClassNames.caption_label, "text-sm font-medium"),

        // Navigation
        nav: cn(defaultClassNames.nav, "flex items-center gap-1"),
        button_previous: cn(
          defaultClassNames.button_previous,
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md",
          "hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
          "inline-flex items-center justify-center rounded-md",
          "hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        ),

        // Chevron icon
        chevron: cn(defaultClassNames.chevron, "h-4 w-4"),

        // Week/day grid
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse"),
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(defaultClassNames.weekday, "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center"),
        week: cn(defaultClassNames.week, "flex w-full mt-2"),

        // Day cells (v9: cell → day, day → day_button)
        day: cn(defaultClassNames.day, "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20"),
        day_button: cn(
          defaultClassNames.day_button,
          "h-9 w-9 p-0 font-normal",
          "inline-flex items-center justify-center rounded-md",
          "transition-colors duration-150",
          "hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
          "aria-selected:opacity-100"
        ),

        // Day states
        selected: cn(defaultClassNames.selected, "bg-accent text-white hover:bg-accent-dark hover:text-white focus:bg-accent focus:text-white rounded-md"),
        today: cn(defaultClassNames.today, "bg-gray-100 text-gray-900 font-semibold"),
        outside: cn(defaultClassNames.outside, "text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-gray-500 aria-selected:opacity-30"),
        disabled: cn(defaultClassNames.disabled, "text-gray-300 opacity-50 cursor-not-allowed"),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        range_start: cn(defaultClassNames.range_start, ""),
        range_end: cn(defaultClassNames.range_end, ""),
        range_middle: cn(defaultClassNames.range_middle, "aria-selected:bg-accent/20 aria-selected:text-accent-foreground"),

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          orientation === "left"
            ? <ChevronLeft className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
