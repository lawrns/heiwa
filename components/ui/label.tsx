"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * TOON-compliant Label Component
 * 
 * Styling specifications:
 * - Font-size: 12px (text-xs)
 * - Font-weight: 500 (font-medium)
 * - Label-to-input spacing: 6px (mb-1.5)
 * - Line-height: 1.2 for tight spacing
 */
const labelVariants = cva(
  // TOON-compliant: 12px font-size, 500 font-weight, tight line-height
  "text-xs font-medium leading-tight text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
