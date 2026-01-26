# Critical UI Fixes Implementation Plan

## Issue 1: Next.js Image Quality Config
**Status**: ✅ FIXED
- Added quality values [50, 65, 75, 80, 85, 90] to next.config.js
- Fixes "Invalid quality prop (80)" error

## Issue 2: GuestDetails Inline Styles
**Status**: PENDING
**File**: `components/BookingWidget/steps/GuestDetails.tsx`
**Problem**: Edit button uses inline styles instead of Button component
**Solution**: Replace inline styled button with Button component

```jsx
// BEFORE (line 269-283)
<button
  onClick={(e) => { ... }}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #86efac',
    color: '#15803d',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease-out',
  }}
  onMouseEnter={(e) => { ... }}
  onMouseLeave={(e) => { ... }}
>

// AFTER
<Button
  variant="outline"
  size="default"
  onClick={(e) => { ... }}
  className="text-green-700 border-green-300 hover:bg-green-50"
>
```

## Issue 3: Form Label Inconsistencies
**Status**: PENDING
**Files**: Multiple form components
**Problem**: Labels use inline styles and inconsistent Tailwind classes
**Solution**: Standardize all labels to use Tailwind with consistent spacing

## Issue 4: Button Sizing Inconsistencies
**Status**: PENDING
**Problem**: Button padding varies across components
**Solution**: Enforce consistent sizing through Button component

## Issue 5: Input Height Inconsistencies
**Status**: PENDING
**Problem**: Input component uses 40px but some places use 44px
**Solution**: Standardize to 40px with consistent padding

## Implementation Order

1. ✅ Fix Next.js image quality config
2. ⏳ Replace inline styled button in GuestDetails
3. ⏳ Standardize form labels
4. ⏳ Enforce button sizing
5. ⏳ Standardize input heights
6. ⏳ Fix spacing scale
7. ⏳ Fix typography hierarchy
8. ⏳ Fix shadows and elevation
9. ⏳ Fix border radius
10. ⏳ Fix transitions

## Quick Wins (Can be done immediately)

- Replace inline button styles with Button component
- Standardize form label styling
- Enforce consistent button sizing
- Fix input height inconsistencies

