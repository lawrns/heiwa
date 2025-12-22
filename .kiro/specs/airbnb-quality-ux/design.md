# Design Document: Airbnb-Quality UX

## Overview

This design document outlines the technical implementation for elevating the Heiwa surf retreat platform to Airbnb-level UI/UX quality. The approach focuses on systematic improvements to the design system, booking widget, loading states, and micro-interactions while maintaining the existing codebase structure.

## Architecture

### Design Token System

The implementation extends the existing Tailwind configuration with standardized design tokens:

```
┌─────────────────────────────────────────────────────────────┐
│                    Design Token Hierarchy                    │
├─────────────────────────────────────────────────────────────┤
│  Primitives (tailwind.config.js)                            │
│  ├── Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 80, 120        │
│  ├── Shadows: subtle, card, card-hover, elevated, modal     │
│  ├── Transitions: micro (150ms), standard (300ms), slow     │
│  └── Border Radius: sm (8px), md (12px), lg (16px)         │
├─────────────────────────────────────────────────────────────┤
│  Semantic Tokens (CSS Variables)                            │
│  ├── --shadow-card, --shadow-card-hover                     │
│  ├── --transition-micro, --transition-standard              │
│  └── --radius-card, --radius-button                         │
├─────────────────────────────────────────────────────────────┤
│  Component Tokens (Component-level)                         │
│  ├── Card: shadow, hover-shadow, radius, padding            │
│  ├── Button: height, radius, transition                     │
│  └── Input: height, radius, focus-ring                      │
└─────────────────────────────────────────────────────────────┘
```

### Component Enhancement Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                  Component Enhancement Flow                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Base Components (components/ui/)                         │
│     └── Enhanced with design tokens and animations           │
│                                                              │
│  2. Composite Components (components/BookingWidget/)         │
│     └── Refactored to use Tailwind, add skeletons           │
│                                                              │
│  3. Page Sections (components/home/)                         │
│     └── Scroll animations, consistent spacing                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced Card Component

```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'interactive' | 'elevated'
  className?: string
  onClick?: () => void
}

// Styling specifications:
// - Default: shadow-card, rounded-xl (12px), p-6
// - Interactive: hover:-translate-y-1, hover:shadow-card-hover
// - Elevated: shadow-elevated, used for modals/popovers
```

### 2. Skeleton Loader Component

```typescript
// components/ui/skeleton.tsx
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  className?: string
  animate?: boolean // shimmer animation
}

// Animation: shimmer gradient moving left-to-right
// Duration: 1.5s infinite
// Colors: gray-200 to gray-100 to gray-200
```

### 3. Booking Widget Step Skeleton

```typescript
// components/BookingWidget/ui/StepSkeleton.tsx
interface StepSkeletonProps {
  variant: 'experience' | 'options' | 'guest-details' | 'review'
}

// Each variant matches the layout of its corresponding step
// Provides visual continuity during loading
```

### 4. Enhanced Progress Indicator

```typescript
// components/BookingWidget/ui/ProgressIndicator.tsx (enhanced)
// Changes:
// - Always show labels (abbreviated on mobile: "Exp", "Opt", "Det", "Rev")
// - Animated connector fill on step completion
// - Pulsing ring on current step
// - Scale bounce on checkmark appearance
```

### 5. Image with Blur Placeholder

```typescript
// components/ui/image-blur.tsx
interface ImageBlurProps extends ImageProps {
  blurDataURL?: string
  fallbackSrc?: string
  onLoadComplete?: () => void
}

// Features:
// - Blur placeholder during load
// - Smooth fade-in on load complete
// - Fallback image on error
// - Prevents layout shift with aspect ratio
```

### 6. Animated Button Component

```typescript
// components/ui/button.tsx (enhanced)
// Additional features:
// - Loading state with spinner
// - Success state with checkmark
// - Touch feedback (scale 0.98 on active)
// - Disabled state styling
```

## Data Models

### Design Token Configuration

```typescript
// lib/design-tokens.ts
export const tokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    section: '80px',
    sectionLg: '120px',
  },
  shadows: {
    subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  transitions: {
    micro: '150ms ease-out',
    standard: '300ms ease-out',
    slow: '500ms ease-out',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
}
```

### Animation Keyframes

```typescript
// Added to tailwind.config.js
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  scaleIn: {
    '0%': { transform: 'scale(0.9)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  bounceIn: {
    '0%': { transform: 'scale(0.3)', opacity: '0' },
    '50%': { transform: 'scale(1.05)' },
    '70%': { transform: 'scale(0.9)' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
  },
  confetti: {
    '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
    '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
  },
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Touch Target Compliance

*For any* interactive element (button, link, input) rendered in the application, the element SHALL have a minimum touch target of 44px in both width and height.

**Validates: Requirements 1.5, 8.1**

### Property 2: Card Styling Consistency

*For any* Card component rendered with the 'interactive' variant, the component SHALL include hover transform classes (-translate-y-1) and shadow transition classes.

**Validates: Requirements 1.4, 2.1, 2.3, 2.4**

### Property 3: Form Validation Feedback

*For any* form input with validation state, when the state is 'valid' the input SHALL display success styling, and when the state is 'invalid' the input SHALL display error styling with appropriate ARIA attributes.

**Validates: Requirements 6.2, 6.3**

### Property 4: Loading State Rendering

*For any* component in a loading state, the component SHALL render either a Skeleton placeholder or a spinner indicator, and interactive elements SHALL be disabled during loading.

**Validates: Requirements 7.1, 7.2, 7.4**

### Property 5: Image Optimization

*For any* image rendered in the application, the image SHALL have explicit width and height attributes (or aspect-ratio) to prevent layout shift, and non-critical images SHALL have loading="lazy" attribute.

**Validates: Requirements 9.3, 9.4**

### Property 6: Typography Consistency

*For any* section heading (h2) on the homepage, the heading SHALL use text-4xl, font-bold, and text-center classes for consistent visual hierarchy.

**Validates: Requirements 11.3**

## Error Handling

### Loading Failures

- When API calls fail during booking widget steps, display contextual error message with retry button
- Skeleton loaders should have a timeout (10s) after which an error state is shown
- Image loading failures should gracefully fall back to placeholder images

### Animation Failures

- All animations should use `prefers-reduced-motion` media query to respect user preferences
- Fallback to instant state changes when animations are disabled
- CSS animations should not block user interaction

### Form Validation

- Client-side validation provides immediate feedback
- Server-side validation errors are displayed inline with the relevant field
- Form submission is prevented until all required fields are valid

## Testing Strategy

### Unit Tests

Unit tests will verify individual component behavior:

- Card component renders with correct classes for each variant
- Skeleton component renders with shimmer animation
- Button component shows loading spinner when isLoading=true
- Input component displays error state when invalid
- Progress indicator renders labels on all screen sizes

### Property-Based Tests

Property tests will use fast-check with minimum 100 iterations:

1. **Touch Target Test**: Generate random interactive components, verify all have min 44px dimensions
2. **Card Styling Test**: Generate Card components with various props, verify hover classes present
3. **Form Validation Test**: Generate inputs with valid/invalid states, verify correct styling applied
4. **Loading State Test**: Generate components with loading=true, verify skeleton/spinner rendered
5. **Image Optimization Test**: Generate image components, verify dimensions and lazy loading
6. **Typography Test**: Generate section headings, verify consistent classes

### Visual Regression Tests

Playwright visual tests will capture:

- Card hover states at different viewports
- Booking widget step transitions
- Loading skeleton appearances
- Form validation states
- Mobile menu animations

### Accessibility Tests

- All interactive elements have proper focus indicators
- Animations respect prefers-reduced-motion
- Color contrast meets WCAG 2.1 AA standards
- Screen reader announcements for loading states

