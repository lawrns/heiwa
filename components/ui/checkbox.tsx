"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * TOON-compliant Checkbox Component
 * 
 * Focus state specifications (Requirement 8.4):
 * - Focus ring: 2px with orange-500/20 color
 * - Transition: 150ms ease-out
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base dimensions and shape
      "peer h-4 w-4 shrink-0 rounded-sm",
      // Border styling
      "border border-gray-300",
      // TOON-compliant focus state with subtle ring (Requirement 8.4)
      "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1",
      // Transition for smooth interactions
      "transition-all duration-150 ease-out",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Checked state
      "data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
