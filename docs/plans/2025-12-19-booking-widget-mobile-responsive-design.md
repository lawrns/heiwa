# Booking Widget Mobile Responsive Design

**Date:** 2025-12-19
**Target:** 375px minimum width (iPhone 12/13/14 standard)

## Problem

The booking widget surf week and room cards use a horizontal layout that breaks on mobile:
- Text wraps awkwardly ("JULY SURF WEEK 1 2026" splits across lines)
- Prices float right and separate from context
- "View X Photos" gets cut off
- Room names and descriptions truncate badly

## Solution

Stack layout on mobile using Tailwind `sm:` breakpoint (640px). Desktop layout unchanged.

## Surf Week Card

### Mobile (< 640px)
```
┌─────────────────────────┐
│ [    Image full-width   ] │
├─────────────────────────┤
│ 03 Jul > 10 Jul         │
│ JULY SURF WEEK 1 2026   │
│ from €480 per person    │
│ Mid-summer adventure... │
├─────────────────────────┤
│ 👥 Up to 13  ⭐ All Level │
├─────────────────────────┤
│ ✓ Accommodation  +2 more │
├─────────────────────────┤
│ [====] 0% booked • 13 left │
│ 📸 View 1 Photo         │
└─────────────────────────┘
```

### Desktop (≥ 640px)
Current side-by-side layout preserved.

### Changes
- Container: `flex gap-6` → `flex flex-col sm:flex-row gap-3 sm:gap-6`
- Image: `w-32 h-24` → `w-full h-40 sm:w-32 sm:h-24`
- Padding: `p-6` → `p-4 sm:p-6`
- Title/Price: Stack on mobile, side-by-side on desktop

## Room Card

### Mobile (< 640px)
```
┌─────────────────────────┐
│ [☑] [  Image full-width ] │
├─────────────────────────┤
│ Room 1                  │
│ +€550 for 3 nights      │
│ Best room with ocean... │
├─────────────────────────┤
│ 👥 Up to 3  📍 Private   │
├─────────────────────────┤
│ 🛏️ King  🚿 Ensuite  +2  │
└─────────────────────────┘
```

### Desktop (≥ 640px)
Current side-by-side layout preserved.

### Changes
- Container: `flex gap-6` → `flex flex-col sm:flex-row gap-3 sm:gap-6`
- Image: `w-32 h-24` → `w-full h-40 sm:w-32 sm:h-24`
- Padding: `p-6` → `p-4 sm:p-6`
- Checkbox overlay: repositioned for larger mobile image

## Responsive Classes Pattern

```
Container:  flex flex-col sm:flex-row gap-3 sm:gap-6
Image:      w-full h-40 sm:w-32 sm:h-24
Padding:    p-4 sm:p-6
Typography: text-base sm:text-lg (titles), text-xl sm:text-2xl (prices)
```

## Files to Modify

- `components/BookingWidget/steps/OptionSelection.tsx`

## Edge Cases

1. Long titles - Full width on mobile prevents wrapping issues
2. Price alignment - Stacks below title on mobile
3. "View X Photos" button - Full row on mobile
4. Checkbox on room cards - Stays on image corner
5. Occupancy bar - Full width for visibility

## Not Changing

- Desktop layout (preserved exactly)
- No information hidden on mobile
- No new components

## Testing

- Chrome DevTools at 375px width
- Verify both surf week and room cards
- Check selected/disabled states
