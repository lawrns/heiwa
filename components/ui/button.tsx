import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Clean, minimal button variants - gray/black/orange palette
const getButtonClasses = (variant: string = 'default', size: string = 'default') => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variantClasses = {
    // Primary - solid orange
    default: "bg-accent text-white shadow-sm hover:bg-accent-dark focus:ring-accent/30",
    // Secondary - solid dark gray
    secondary: "bg-gray-800 text-white shadow-sm hover:bg-gray-900 focus:ring-gray-500/30",
    // Ghost - text only, no background/border
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500/30",
    // Outline - white bg, thin border
    outline: "bg-white border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500/30",
    // Destructive - red for delete actions
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500/30",
    // Link - underlined text
    link: "text-accent underline-offset-4 hover:underline focus:ring-accent/30",
  }

  const sizeClasses = {
    default: "h-10 px-6 py-2 text-sm",
    sm: "h-8 px-4 py-1.5 text-sm",
    lg: "h-11 px-8 py-2.5 text-base",
    icon: "h-10 w-10",
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
