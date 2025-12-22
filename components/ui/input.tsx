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
 * 
 * Styling specifications:
 * - Height: 40px (min-h-[40px])
 * - Border-radius: 10px (rounded-[10px])
 * - Padding: 12px horizontal, 8px vertical (px-3 py-2)
 * - Font-size: 14px (text-sm)
 * - Focus: animated border transition with accent color
 * - Success: green border with checkmark indicator
 * - Error: red border with shake animation
 * 
 * Requirements: 6.1, 6.2, 6.3, 8.4
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
            // Add extra padding on right for success/error icons
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
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            !isSuccess && !isError && "focus:ring-accent/20 focus:border-accent",
            // Success state
            isSuccess && [
              "border-success",
              "focus:ring-success/20 focus:border-success",
              "bg-success-light/30"
            ],
            // Error state with shake animation
            isError && [
              "border-error",
              "focus:ring-error/20 focus:border-error",
              "bg-error-light/30",
              "animate-shake"
            ],
            // Transition for smooth interactions
            "transition-all duration-micro ease-out",
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success animate-scale-in">
            <Check size={18} />
          </div>
        )}
        
        {/* Error indicator */}
        {isError && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error animate-scale-in">
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
            className="mt-1.5 text-xs text-error animate-slide-in-up"
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
