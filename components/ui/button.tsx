import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Loading spinner component
const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

// Success checkmark component
const SuccessCheck = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-check-mark", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 13l4 4L19 7"
    />
  </svg>
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  loadingText?: string
  successText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    asChild = false, 
    isLoading = false,
    isSuccess = false,
    loadingText,
    successText,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const effectiveVariant = isSuccess ? 'success' : variant
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

    // Base classes - TOON-compliant with design token values
    const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-[10px] motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    // Variant classes
    const variantClasses = {
      default: "bg-accent text-white shadow-sm hover:bg-accent-dark focus:ring-accent/30",
      secondary: "bg-gray-800 text-white shadow-sm hover:bg-gray-900 focus:ring-gray-500/30",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500/30",
      outline: "bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500/30",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500/30",
      link: "text-accent underline-offset-4 hover:underline focus:ring-accent/30",
      success: "bg-green-600 text-white shadow-sm hover:bg-green-700 focus:ring-green-500/30",
    }

    // Size classes - using static Tailwind values matching design tokens
    const sizeClasses = {
      default: "min-h-[40px] px-5 py-2.5",
      sm: "min-h-[36px] px-4 py-2",
      lg: "min-h-[44px] px-6 py-3",
      icon: "min-h-[44px] w-[44px]",
    }

    // Hover/active state classes
    const stateClasses = !isLoading && !isSuccess ? "motion-safe:hover:-translate-y-px motion-safe:hover:shadow-md motion-safe:active:scale-[0.98]" : ""
    const cursorClasses = isLoading ? "cursor-wait" : isSuccess ? "cursor-default" : ""

    return (
      <Comp
        className={cn(
          baseClasses,
          variantClasses[effectiveVariant as keyof typeof variantClasses],
          sizeClasses[size as keyof typeof sizeClasses],
          stateClasses,
          cursorClasses,
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className={iconSize} />
            <span>{loadingText || 'Loading...'}</span>
          </>
        ) : isSuccess ? (
          <>
            <SuccessCheck className={iconSize} />
            <span>{successText || 'Success!'}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, LoadingSpinner, SuccessCheck }
