# Button Standardization Design

**Date:** 2025-12-19
**Palette:** Gray / Black / Orange (minimal/clean)

## Problem

- Booking widget Back/Next buttons have inconsistent styling
- Heavy borders, gradients, excessive padding
- 432 button usages across 144 files using inline Tailwind
- No consistent button design system

## Solution

Upgrade shared Button component with clean variants, fix booking widget, document pattern.

## Button Variants

### Primary (`default`)
- Solid orange `#ec681c` background
- White text
- No gradient
- `shadow-sm` only
- Hover: `#d65d16`

### Secondary
- Solid gray-800 background
- White text
- For alternative primary actions

### Ghost
- No background, no border
- Gray-600 text
- Hover: gray-100 background
- **Use for Back buttons**

### Outline
- White background
- Gray-300 border (1px)
- Gray-700 text
- Hover: gray-50 background

### Destructive
- Red-600 background
- White text

## Styling Rules

### Remove
- All gradients (`bg-gradient-to-r`)
- Heavy shadows (`shadow-lg`, `shadow-xl`)
- Hover scale effects (`hover:scale-[1.02]`)
- Excessive padding (`px-6 py-3`)

### Use
- Flat solid colors
- Subtle shadow (`shadow-sm`)
- Consistent padding (`px-4 py-2` or `px-5 py-2.5`)
- `rounded-md` (6px) not `rounded-lg`
- `font-medium` not `font-semibold`

## Booking Widget Footer

### Before
```
┌──────────────┐                    ┌─────────┐
│ ← Back       │      €480.00       │  Next   │
│ (bordered)   │                    │ (blob)  │
└──────────────┘                    └─────────┘
```

### After
```
← Back                   €480.00    ┌─────────┐
(ghost text)                        │  Next   │
                                    │(orange) │
                                    └─────────┘
```

## Implementation Scope

1. **Upgrade `components/ui/button.tsx`**
   - Add/refine variants: default, secondary, ghost, outline, destructive
   - Clean up base styles

2. **Fix booking widget footer**
   - Back: `<Button variant="ghost">`
   - Next: `<Button variant="default">`
   - Remove inline classes

3. **Document pattern**
   - Add usage examples to Button component

## Files to Modify

- `components/ui/button.tsx`
- `components/BookingWidget/BookingWidget.tsx`

## Future Work (not this task)

- Audit remaining 140+ files
- Migrate inline buttons to Button component
- Admin panel standardization
