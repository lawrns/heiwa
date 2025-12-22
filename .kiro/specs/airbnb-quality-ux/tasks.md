# Implementation Plan: Airbnb-Quality UX

## Overview

This implementation plan transforms the Heiwa surf retreat platform to Airbnb-level UI/UX quality. Tasks are organized to build foundational design tokens first, then enhance components systematically, and finally polish the booking widget and homepage sections.

## Tasks

- [x] 1. Extend design token system
  - [x] 1.1 Update tailwind.config.js with enhanced tokens
    - Add shadow tokens: subtle, card, card-hover, elevated, modal
    - Add animation keyframes: shimmer, scaleIn, bounceIn, pulse, shake
    - Add transition utilities: micro (150ms), standard (300ms), slow (500ms)
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Update globals.css with CSS custom properties
    - Add --shadow-card, --shadow-card-hover variables
    - Add --transition-micro, --transition-standard variables
    - Add prefers-reduced-motion media query support
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create Skeleton Loader component
  - [x] 2.1 Create components/ui/skeleton.tsx
    - Implement Skeleton component with variants (text, circular, rectangular, card)
    - Add shimmer animation with gradient
    - Support custom width/height props
    - _Requirements: 7.1, 7.5_

  - [x] 2.2 Write property test for skeleton rendering
    - **Property 4: Loading State Rendering**
    - **Validates: Requirements 7.1, 7.2, 7.4**

- [x] 3. Enhance Card component
  - [x] 3.1 Update components/ui/card.tsx with interactive variant
    - Add variant prop: 'default' | 'interactive' | 'elevated'
    - Add hover lift effect (-translate-y-1, shadow-card-hover)
    - Add focus ring for keyboard navigation
    - Add border styling (border border-gray-200)
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Write property test for card styling
    - **Property 2: Card Styling Consistency**
    - **Validates: Requirements 1.4, 2.1, 2.3, 2.4**

- [x] 4. Enhance Button component
  - [x] 4.1 Update components/ui/button.tsx with loading and touch states
    - Add isLoading prop with spinner
    - Add active:scale-[0.98] for touch feedback
    - Ensure min-h-[44px] for touch targets
    - Add success state variant
    - _Requirements: 7.2, 8.1, 8.2_

  - [x] 4.2 Write property test for touch targets
    - **Property 1: Touch Target Compliance**
    - **Validates: Requirements 1.5, 8.1**

- [x] 5. Checkpoint - Foundation components
  - Ensure all foundation tests pass
  - Verify design tokens are applied correctly
  - Ask user if questions arise

- [x] 6. Create Booking Widget step skeletons
  - [x] 6.1 Create components/BookingWidget/ui/StepSkeleton.tsx
    - Create skeleton layouts for each step type
    - Match actual step content structure
    - Use shimmer animation
    - _Requirements: 3.2, 7.1_

  - [x] 6.2 Integrate skeletons into BookingWidget.tsx
    - Show skeleton during step loading
    - Animate transition from skeleton to content
    - _Requirements: 3.2, 3.3_

- [x] 7. Refactor BookingWidget to use Tailwind classes
  - [x] 7.1 Refactor BookingWidget.tsx inline styles
    - Replace all style={{}} with Tailwind classes
    - Create reusable class compositions
    - Maintain existing functionality
    - _Requirements: 3.1_

  - [x] 7.2 Refactor footer navigation buttons
    - Replace inline styles with Tailwind classes
    - Add proper hover/active states
    - Ensure consistent sizing
    - _Requirements: 3.1, 3.5_

  - [x] 7.3 Enhance header styling
    - Add subtle gradient background
    - Improve visual hierarchy
    - _Requirements: 3.4_

- [x] 8. Enhance Progress Indicator
  - [x] 8.1 Update ProgressIndicator.tsx with always-visible labels
    - Show abbreviated labels on mobile (Exp, Opt, Det, Rev)
    - Show full labels on desktop
    - Remove hidden classes from labels
    - _Requirements: 4.1_

  - [x] 8.2 Add step completion animations
    - Animate checkmark with scale effect
    - Add pulsing ring on current step
    - Animate connector line fill
    - _Requirements: 4.2, 4.3, 4.5_

  - [x] 8.3 Add click feedback animation
    - Scale effect on click
    - Brief highlight before navigation
    - _Requirements: 4.4_

- [x] 9. Checkpoint - Booking widget foundation
  - Ensure booking widget renders correctly
  - Verify step transitions are smooth
  - Ask user if questions arise

- [x] 10. Enhance Experience Selection step
  - [x] 10.1 Update ExperienceSelection.tsx with premium styling
    - Add hover lift with glow effect
    - Add selection bounce animation
    - Improve gradient backgrounds
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.2 Enhance price display
    - Prominent "From €X" formatting
    - Better visual hierarchy
    - _Requirements: 5.4_

- [x] 11. Enhance form inputs
  - [x] 11.1 Update Input component with enhanced focus states
    - Add animated border transition on focus
    - Add success indicator for valid inputs
    - Add error styling with shake animation
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 11.2 Write property test for form validation feedback
    - **Property 3: Form Validation Feedback**
    - **Validates: Requirements 6.2, 6.3**

  - [x] 11.3 Ensure proper mobile keyboard types
    - Verify email inputs have type="email"
    - Verify phone inputs have type="tel"
    - Verify number inputs have type="number"
    - _Requirements: 8.4_

- [x] 12. Enhance booking confirmation
  - [x] 12.1 Create celebration animation component
    - Create components/ui/confetti.tsx
    - Trigger on booking success
    - Respect prefers-reduced-motion
    - _Requirements: 10.1_

  - [x] 12.2 Enhance confirmation screen layout
    - Premium card layout for booking details
    - Clear next steps section
    - Animated success icon
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 12.3 Enhance close button
    - Prominent styling
    - Satisfying hover state
    - _Requirements: 10.5_

- [x] 13. Checkpoint - Booking widget complete
  - Test full booking flow
  - Verify all animations work
  - Ask user if questions arise

- [x] 14. Create Image blur placeholder component
  - [x] 14.1 Create components/ui/image-blur.tsx
    - Blur placeholder during load
    - Smooth fade-in on load complete
    - Fallback on error
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 14.2 Write property test for image optimization
    - **Property 5: Image Optimization**
    - **Validates: Requirements 9.3, 9.4**

- [x] 15. Enhance homepage sections
  - [x] 15.1 Standardize section spacing
    - Apply py-20 lg:py-[120px] to all sections
    - Ensure consistent max-width containers
    - _Requirements: 11.1_

  - [x] 15.2 Enhance section headings
    - Apply text-4xl font-bold text-center consistently
    - Add subtle animation on scroll into view
    - _Requirements: 11.3_

  - [x] 15.3 Write property test for typography consistency
    - **Property 6: Typography Consistency**
    - **Validates: Requirements 11.3**

  - [x] 15.4 Enhance activity cards
    - Add hover image zoom effect
    - Add overlay transition
    - _Requirements: 11.4_

  - [x] 15.5 Enhance room cards
    - Verify carousel transitions are smooth
    - Add hover effects
    - _Requirements: 11.5_

- [x] 16. Enhance navigation header
  - [x] 16.1 Add sticky header with backdrop blur
    - Transition to compact state on scroll
    - Add backdrop-blur effect
    - _Requirements: 12.1_

  - [x] 16.2 Add navigation link hover effects
    - Underline animation on hover
    - Smooth transitions
    - _Requirements: 12.2_

  - [x] 16.3 Enhance mobile menu
    - Slide and fade animation
    - Lock body scroll when open
    - _Requirements: 12.3, 12.4_

  - [x] 16.4 Enhance Book Now button
    - Prominent styling
    - Subtle pulse animation on idle
    - _Requirements: 12.5_

- [x] 17. Final checkpoint - Complete UI polish
  - Run full test suite
  - Verify all animations respect prefers-reduced-motion
  - Test on mobile devices (375px viewport)
  - Ask user if questions arise

## Notes

- Tasks marked with `*` are property-based tests that validate universal correctness properties
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation before proceeding
- Property tests use fast-check with minimum 100 iterations
- All animations should respect prefers-reduced-motion preference
- Focus on mobile-first approach for touch interactions

