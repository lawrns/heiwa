import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  asChild?: boolean
  /** Show success state with checkmark */
  isSuccess?: boolean
  /** Show error state with shake animation */
  isError?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Show loading state */
  isLoading?: boolean
}

/**
 * TOON-compliant Input Component with Airbnb-quality enhancements
 * Uses design tokens for consistent sizing and styling
 * 
 * Styling specifications:
 * - Height: 40px (min-h-[40px])
 * - Border-radius: 10px (rounded-[10px])
 * - Padding: 12px horizontal, 8px vertical
 * - Font-size: 14px
 * - Focus: animated border transition with accent color
 * - Success: green border with checkmark indicator
 * - Error: red border with shake animation
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    asChild = false, 
    isSuccess = false,
    isError = false,
    errorMessage,
    isLoading = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "input"
    
    return (
      <div className="relative">
        <Comp
          type={type}
          className={cn(
            // TOON-compliant dimensions: height 40px, border-radius 10px
            "flex min-h-[40px] w-full rounded-[10px]",
            // Border and background
            "border bg-white",
            // TOON-compliant padding: 12px horizontal, 8px vertical
            "px-3 py-2",
            (isSuccess || isError) && "pr-10",
            // TOON-compliant typography: 14px font-size
            "text-[14px] leading-normal",
            // File input styling
            "file:border-0 file:bg-transparent file:text-[14px] file:font-medium",
            // Placeholder styling
            "placeholder:text-gray-400",
            // Default border color
            !isSuccess && !isError && "border-gray-300",
            // Focus state with animated border transition
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            !isSuccess && !isError && "focus-visible:ring-accent/20 focus-visible:border-accent",
            // Success state
            isSuccess && [
              "border-green-600",
              "focus-visible:ring-green-600/20 focus-visible:border-green-600",
              "bg-green-50"
            ],
            // Error state with shake animation
            isError && [
              "border-red-600",
              "focus-visible:ring-red-600/20 focus-visible:border-red-600",
              "bg-red-50",
              "animate-shake"
            ],
            // Transition for smooth interactions
            "motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-300 motion-reduce:transition-none",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            className
          )}
          ref={ref}
          aria-invalid={isError}
          aria-describedby={errorMessage ? `${props.id}-error` : undefined}
          {...props}
        />
        
        {/* Success indicator */}
        {isSuccess && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 animate-scale-in">
            <Check size={18} />
          </div>
        )}
        
        {/* Error indicator */}
        {isError && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 animate-scale-in">
            <AlertCircle size={18} />
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-accent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Error message */}
        {isError && errorMessage && (
          <p 
            id={props.id ? `${props.id}-error` : undefined}
            className="mt-1.5 text-xs text-red-600 animate-slide-in-up"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
