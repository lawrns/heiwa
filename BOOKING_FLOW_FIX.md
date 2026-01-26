# Booking Flow Fix - Surf Camp Room Selection Issue

## Problem
When selecting a surf camp manually (not pre-selected), the booking flow skips the room selection step and goes directly to "unassigned guests" (guest-details step).

## Root Cause
The `nextStep()` function was using a stale `maxStep` value from the closure, which could cause it to skip steps when the step flow needed to be recalculated after selecting a surf camp.

## Fix Applied

### 1. Fixed `nextStep()` in `useBookingFlow.ts`
- Changed `nextStep()` to recalculate the step flow on each call instead of using a stale closure value
- This ensures the step flow is always up-to-date when advancing steps

### 2. Updated auto-advance delay in `OptionSelection.tsx`
- Increased delay from 300ms to 500ms to ensure state updates are processed before advancing
- This prevents race conditions where the step flow might not be recalculated yet

## Expected Flow After Fix

When selecting a surf camp manually:
1. **Experience Selection** (step 1) - User selects "Surf Week"
2. **Options** (step 2) - User selects a specific surf camp
3. **Surf Week Room Selection** (step 3) - User assigns guests to rooms ← **This was being skipped**
4. **Guest Details** (step 4) - User enters guest information
5. **Add-ons** (step 5) - User selects optional add-ons
6. **Review & Pay** (step 6) - User reviews and completes booking

## Price Display Issue

The user also mentioned a price mismatch (480 vs 199). This is likely due to:
- Booking widget settings showing one price (from `/api/booking-widget-settings`)
- Individual surf camp showing a different price (from surf camp data)

**Solution**: Update the surf camp's `price` field in the database to match the desired price, or update the booking widget settings to match the surf camp prices.

## Testing

To test the fix:
1. Open booking widget
2. Select "Surf Week" 
3. Select a surf camp
4. Verify that the room selection step appears (not skipped)
5. Assign guests to rooms
6. Continue through the flow

