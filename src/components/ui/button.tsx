import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Simplified button variants without class-variance-authority to fix webpack issues
const getButtonClasses = (variant: string = 'default', size: string = 'default') => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-md"

  const variantClasses = {
    default: "bg-heiwaOrange-600 text-white hover:bg-heiwaOrange-700 focus:ring-heiwaOrange-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-heiwaOrange-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    link: "text-heiwaOrange-600 underline-offset-4 hover:underline focus:ring-heiwaOrange-500",
    ocean: "bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg focus:ring-blue-500",
    surf: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg focus:ring-teal-500",
    sand: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg focus:ring-yellow-500",
  }

  const sizeClasses = {
    default: "h-10 py-2 px-4 text-base",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10",
  }

  return cn(baseClasses, variantClasses[variant as keyof typeof variantClasses] || variantClasses.default, sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default)
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'ocean' | 'surf' | 'sand'
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
