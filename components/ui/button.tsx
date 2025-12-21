import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// TOON-compliant button styles - pixel-perfect visual quality
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 8.1, 8.2, 8.3
const getButtonClasses = (variant: string = 'default', size: string = 'default') => {
  // Base classes with TOON-compliant values:
  // - font-weight: 500 (medium)
  // - border-radius: 10px (rounded-[10px])
  // - transition: 150ms ease-out
  // - hover: translateY -1px with shadow
  // - active: scale 0.98
  const baseClasses = [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "rounded-[10px]",
    "transition-all duration-150 ease-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    "hover:-translate-y-px hover:shadow-md",
    "active:translate-y-0 active:scale-[0.98]",
  ].join(" ")

  const variantClasses = {
    // Primary - solid orange (#ec681c), font-size 14px
    // Using explicit hex colors because bg-accent maps to shadcn CSS variable, not our brand orange
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
  }

  // TOON-compliant size classes:
  // - min-height: 40px (min-h-[40px])
  // - padding: 16px horizontal (px-4), 10px vertical (py-2.5)
  // - lg buttons need more horizontal padding (24px = px-6) for proper visual balance
  const sizeClasses = {
    default: "min-h-[40px] px-5 py-2.5",
    sm: "min-h-[36px] px-4 py-2",
    lg: "min-h-[44px] px-6 py-3",
    icon: "min-h-[40px] w-10",
  }

  return cn(baseClasses, variantClasses[variant as keyof typeof variantClasses] || variantClasses.default, sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default)
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(getButtonClasses(variant, size), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
