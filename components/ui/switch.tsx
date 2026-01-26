import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

/**
 * TOON-compliant Switch Component
 * 
 * Focus state specifications (Requirement 8.4):
 * - Focus ring: 2px with orange-500/20 color
 * - Transition: 150ms ease-out
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base dimensions and shape
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      // Border styling
      "border-2 border-transparent",
      // TOON-compliant focus state with subtle ring (Requirement 8.4)
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:ring-offset-2",
      // Transition for smooth interactions
      "transition-[background-color,box-shadow,border-color] duration-150 ease-out",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Checked/unchecked states
      "data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

