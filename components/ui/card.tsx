import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Airbnb-quality card variants with premium styling
// Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 2.5
const cardVariants = cva(
  // Base styles
  "rounded-xl bg-white text-gray-950 transition-[box-shadow,transform,border-color,background-color]",
  {
    variants: {
      variant: {
        // Default - subtle shadow, basic hover
        default: [
          "border border-gray-200",
          "shadow-card",
          "hover:shadow-card-hover",
          "duration-standard",
        ].join(" "),
        // Interactive - lift effect, focus ring, enhanced hover
        interactive: [
          "border border-gray-200",
          "shadow-card",
          "cursor-pointer",
          "hover:-translate-y-1",
          "hover:shadow-card-hover",
          "hover:border-gray-300",
          "active:translate-y-0",
          "active:scale-[0.99]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-accent",
          "focus-visible:ring-offset-2",
          "duration-micro",
        ].join(" "),
        // Elevated - higher shadow, premium feel
        elevated: [
          "border border-gray-100",
          "shadow-elevated",
          "hover:shadow-modal",
          "duration-standard",
        ].join(" "),
        // Ghost - no border/shadow, minimal
        ghost: [
          "border border-transparent",
          "shadow-none",
          "hover:bg-gray-50",
          "duration-micro",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-tight tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 leading-normal", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
