import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  asChild?: boolean
}

/**
 * TOON-compliant Input Component
 * 
 * Styling specifications:
 * - Height: 40px (min-h-[40px])
 * - Border-radius: 10px (rounded-[10px])
 * - Padding: 12px horizontal, 8px vertical (px-3 py-2)
 * - Font-size: 14px (text-sm)
 * - Focus: subtle ring with accent color
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "input"
    return (
      <Comp
        type={type}
        className={cn(
          // TOON-compliant dimensions: height 40px, border-radius 10px
          "flex min-h-[40px] w-full rounded-[10px]",
          // Border and background
          "border border-gray-300 bg-white",
          // TOON-compliant padding: 12px horizontal, 8px vertical
          "px-3 py-2",
          // TOON-compliant typography: 14px font-size
          "text-[14px] leading-normal",
          // File input styling
          "file:border-0 file:bg-transparent file:text-[14px] file:font-medium",
          // Placeholder styling
          "placeholder:text-gray-500",
          // Focus state with subtle ring
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
Input.displayName = "Input"

export { Input }
