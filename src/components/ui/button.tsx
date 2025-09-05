import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-oceanBlue-600 text-white hover:bg-oceanBlue-700 focus:ring-oceanBlue-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-oceanBlue-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        link: "text-oceanBlue-600 underline-offset-4 hover:underline focus:ring-oceanBlue-500",
        // Enhanced brand variants
        ocean: "ocean-gradient text-white hover:shadow-lg focus:ring-oceanBlue-500",
        surf: "surf-gradient text-white hover:shadow-lg focus:ring-surfTeal-500",
        sand: "sand-gradient text-white hover:shadow-lg focus:ring-sandBeige-500",
      },
      size: {
        default: "h-10 py-2 px-4 text-base",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
