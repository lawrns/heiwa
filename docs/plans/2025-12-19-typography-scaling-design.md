# Typography Scaling Design - Site-Wide Text Size Improvements

**Date:** 2025-12-19
**Status:** Approved
**Approach:** Option 1 - Proportional Scale-Up

## Overview

Increase text sizes across the entire site to improve readability, with specific focus on:
1. Navigation logo (40% size increase)
2. Navigation menu items
3. Booking widget (all text elements)

## Design Decisions

### Navigation Changes

**Logo:**
- Current: 96x32px (h-8)
- New: 134x45px (h-11)
- 40% size increase, maintains aspect ratio across all viewports

**Menu Text:**
- All navigation items: text-xs (12px) → text-sm (14px)
- Applies to: HOME, ROOM RENTALS, SURF WEEK, ACTIVITIES dropdown, phone number, BOOK button
- Mobile menu inherits same sizing

**Icons:**
- ChevronDown (Activities): w-3 h-3 → w-4 h-4
- Bed icon (Book button): w-3 h-3 → w-4 h-4
- Mobile menu icons: Keep at w-6 h-6

**Spacing:**
- May increase navigation item spacing from space-x-6 to space-x-7 or space-x-8
- Navigation height stays at h-20 initially, can increase to h-24 if needed

### Booking Widget Typography Scale

**Systematic Size Bumps:**
- text-xl → text-2xl (headers)
- text-lg → text-xl (subheadings)
- text-base → text-lg (emphasis text)
- text-sm → text-base (body text, labels, inputs)
- text-xs → text-sm (helper text, hints, validation)

**Specific Elements:**

*Header Area:*
- Title: text-xl → text-2xl
- Close button: Keep size (already 44px touch target)

*Step Content:*
- Step headers/titles: text-lg/text-xl → text-xl/text-2xl
- Subheadings: text-base → text-lg
- Body text: text-sm → text-base
- Helper text: text-xs → text-sm

*Forms:*
- Input fields: text-sm → text-base
- Labels: text-sm → text-base
- Errors/validation: text-xs → text-sm

*Price Display:*
- Amounts: text-base → text-lg, text-lg → text-xl
- Labels: text-xs → text-sm
- Breakdown: text-sm → text-base

*Progress Indicator:*
- Step text: text-xs → text-sm
- Dots: Keep at w-11 h-11 (accessibility)

*Buttons:*
- Keep current Button component sizes (recently standardized)
- Ensure icons scale with button text

## Files to Modify

1. **components/navigation.tsx**
   - Logo dimensions (width, height, className)
   - All text-xs → text-sm
   - Icon sizes w-3/h-3 → w-4/h-4

2. **components/ui/mobile-nav-overlay.tsx**
   - Menu item text sizes

3. **components/BookingWidget/BookingWidget.tsx**
   - Header title
   - Price display components

4. **components/BookingWidget/steps/** (7 files)
   - ExperienceSelection.tsx
   - OptionSelection.tsx
   - RoomAssignment.tsx
   - SurfWeekRoomSelection.tsx
   - AddOnsSelection.tsx
   - GuestDetails.tsx
   - ReviewAndPay.tsx

5. **components/BookingWidget/ui/ProgressIndicator.tsx**
   - Step labels/numbers

## Responsive Behavior

- All increases apply across all breakpoints
- Mobile uses base sizes (text-sm, text-base, text-lg)
- Tablet/desktop can scale further with sm:/md: prefixes if needed
- Logo maintains aspect ratio with w-auto

## Testing Checklist

- [ ] Desktop navigation: Logo visible, text readable, no overflow
- [ ] Mobile navigation: Menu items properly sized
- [ ] Booking widget mobile: No text wrapping issues, forms usable
- [ ] Booking widget tablet/desktop: Proper scaling with modal width
- [ ] All booking steps: Proportional hierarchy maintained
- [ ] Form inputs: Comfortable padding and readability
- [ ] Price displays: Clear and prominent

## Potential Post-Implementation Adjustments

If needed after visual testing:
- Navigation height: h-20 → h-24
- Nav item spacing: space-x-6 → space-x-7 or space-x-8
- Booking widget modal width: lg:max-w-3xl → lg:max-w-4xl
- Form input padding: px-3 py-2 → px-4 py-3

## Implementation Notes

- Maintain existing responsive breakpoints
- Preserve accessibility (44px touch targets, contrast ratios)
- Keep button standardization from recent commits
- Test on actual devices for mobile verification
