import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  asChild?: boolean
}

/**
 * TOON-compliant Textarea Component
 * 
 * Focus state specifications (Requirement 8.4):
 * - Focus ring: 2px with orange-500/20 color
 * - Border color: orange-500 on focus
 * - Transition: 150ms ease-out
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "textarea"
    return (
      <Comp
        className={cn(
          // TOON-compliant dimensions: min-height 80px, border-radius 10px
          "flex min-h-[80px] w-full rounded-[10px]",
          // Border and background
          "border border-gray-300 bg-white",
          // TOON-compliant padding: 12px horizontal, 8px vertical
          "px-3 py-2",
          // TOON-compliant typography: 14px font-size
          "text-[14px] leading-normal",
          // Placeholder styling
          "placeholder:text-gray-500",
          // TOON-compliant focus state with subtle ring (Requirement 8.4)
          "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
          // Transition for smooth interactions
          "transition-all duration-150 ease-out",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
