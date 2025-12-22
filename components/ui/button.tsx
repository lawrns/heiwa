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

// TOON-compliant button styles - pixel-perfect visual quality
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 7.2, 8.1, 8.2, 8.3
const getButtonClasses = (variant: string = 'default', size: string = 'default', isLoading?: boolean, isSuccess?: boolean) => {
  // Base classes with TOON-compliant values:
  // - font-weight: 500 (medium)
  // - border-radius: 10px (rounded-[10px])
  // - transition: 150ms ease-out
  // - hover: translateY -1px with shadow
  // - active: scale 0.98 for touch feedback
  // - min-height: 44px for touch targets (lg size)
  const baseClasses = [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "rounded-[10px]",
    "transition-all duration-micro ease-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    // Touch feedback - active state
    "active:translate-y-0 active:scale-[0.98]",
    // Loading/success state disables hover effects
    isLoading || isSuccess ? "" : "hover:-translate-y-px hover:shadow-md",
    // Cursor states
    isLoading ? "cursor-wait" : "",
    isSuccess ? "cursor-default" : "",
  ].filter(Boolean).join(" ")

  const variantClasses = {
    // Primary - solid orange (#ec681c), font-size 14px
    default: "bg-[#ec681c] text-white shadow-sm hover:bg-[#d65d16] focus:ring-[#ec681c]/30 text-[14px]",
    // Secondary - solid dark gray, font-size 13px
    secondary: "bg-gray-800 text-white shadow-sm hover:bg-gray-900 focus:ring-gray-500/30 text-[13px]",
    // Ghost - text only, no background/border, font-size 14px
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500/30 text-[14px]",
    // Outline - white bg, thin border, font-size 14px
    outline: "bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500/30 text-[14px]",
    // Destructive - red for delete actions, font-size 13px
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500/30 text-[13px]",
    // Link - underlined text, font-size 14px
    link: "text-[#ec681c] underline-offset-4 hover:underline focus:ring-[#ec681c]/30 text-[14px]",
    // Success - green for completed actions
    success: "bg-success text-white shadow-sm hover:bg-success-dark focus:ring-success/30 text-[14px]",
  }

  // TOON-compliant size classes:
  // - min-height: 44px for touch targets (lg size meets WCAG)
  // - padding: 16px horizontal (px-4), 10px vertical (py-2.5)
  // - lg buttons need more horizontal padding (24px = px-6) for proper visual balance
  const sizeClasses = {
    default: "min-h-[40px] px-5 py-2.5",
    sm: "min-h-[36px] px-4 py-2",
    lg: "min-h-[44px] px-6 py-3", // 44px meets touch target requirements
    icon: "min-h-[40px] w-10",
  }

  return cn(baseClasses, variantClasses[variant as keyof typeof variantClasses] || variantClasses.default, sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default)
}

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
    
    // Determine the effective variant based on state
    const effectiveVariant = isSuccess ? 'success' : variant
    
    // Determine spinner/icon size based on button size
    const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

    return (
      <Comp
        className={cn(getButtonClasses(effectiveVariant, size, isLoading, isSuccess), className)}
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
