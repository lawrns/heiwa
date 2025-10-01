# Booking Widget Flow - Issues to Fix

## Testing Checklist

### Room Booking Flow
1. ✅ **Experience Selection**
   - [x] Can select "Book a Room"
   - [x] Next button appears after selection
   
2. **Date & Room Selection** (OptionSelection step)
   - [x] Date picker appears
   - [x] Guest counter appears
   - [ ] **ISSUE**: Room prices show "Select dates" even after dates are selected
     - **FIX APPLIED**: Updated calculateTotalPrice to use local date state
     - **STATUS**: Deployed, needs testing
   - [ ] Room cards display correctly with images
   - [ ] Can select a room
   - [ ] Price updates when dates change
   - [ ] Price updates when guest count changes
   
3. **Guest Details**
   - [ ] Form appears for each guest
   - [ ] Validation works (required fields)
   - [ ] Email validation works
   - [ ] Can save guest details
   - [ ] Next button enables after all guests filled
   
4. **Add-ons Selection**
   - [ ] Add-ons list appears
   - [ ] Can select/deselect add-ons
   - [ ] Quantity selector works
   - [ ] Price updates in footer
   - [ ] Can skip (optional step)
   
5. **Review & Pay**
   - [ ] Booking summary shows correct info
   - [ ] Dates display correctly
   - [ ] Guest count correct
   - [ ] Room name shown
   - [ ] Add-ons listed
   - [ ] Price breakdown correct
   - [ ] Payment method selector works
   - [ ] Can submit booking
   - [ ] Success message appears

### Surf Week Booking Flow
1. **Experience Selection**
   - [ ] Can select "All-Inclusive Surf Week"
   - [ ] Next button appears
   
2. **Surf Week Selection** (OptionSelection step)
   - [ ] Guest counter appears
   - [ ] Surf weeks list loads
   - [ ] Can see dates for each week
   - [ ] Can see availability
   - [ ] Can select a surf week
   - [ ] Price shows correctly
   
3. **Room Selection** (SurfWeekRoomSelection step)
   - [ ] Room options appear
   - [ ] Can select room type
   - [ ] Price difference shown
   - [ ] Can proceed
   
4. **Guest Details**
   - [ ] Same as room booking
   
5. **Add-ons Selection**
   - [ ] Same as room booking
   
6. **Review & Pay**
   - [ ] Same as room booking

## Known Issues

### CRITICAL
1. ✅ **Room prices show "Select dates"** - FIXED & DEPLOYED
   - Location: `components/BookingWidget/steps/OptionSelection.tsx:664`
   - Issue: calculateTotalPrice returns undefined because it checks state.dates which updates async
   - Fix: Use local checkInDate/checkOutDate state instead
   - Commit: abadae4
   - Status: Live on production

## Validation Logic (from useBookingFlow.ts:241-275)

### Step Validation Requirements:
1. **Experience Selection**: `state.experienceType !== null`
2. **Options Selection**:
   - Surf Week: `state.selectedSurfWeek !== null`
   - Room: `state.dates.checkIn && state.dates.checkOut && state.guests > 0 && state.selectedOption !== null`
3. **Surf Week Room Selection**: `state.selectedSurfWeekRoom !== null`
4. **Room Assignment**: All guests assigned to rooms
5. **Add-ons**: Always optional (returns true)
6. **Guest Details**: All guests have firstName, lastName, email
7. **Review & Pay**: `state.paymentMethod !== null`

### HIGH PRIORITY
2. **Date validation**
   - Check-out must be after check-in
   - No past dates allowed
   - Sold-out dates should be blocked
   
3. **Guest count validation**
   - Should update room requirements
   - Should show capacity warnings if needed
   
4. **Price calculation accuracy**
   - Verify nights calculation
   - Verify taxes (10%)
   - Verify fees (5%)
   - Verify add-ons total

### MEDIUM PRIORITY
5. **Loading states**
   - Room loading should show skeleton
   - Date availability check should show spinner
   - Booking submission should show progress
   
6. **Error handling**
   - API errors should display clearly
   - Validation errors should be specific
   - Network errors should allow retry

### LOW PRIORITY
7. **UX improvements**
   - Auto-advance after selection (optional)
   - Better mobile responsiveness
   - Image gallery improvements
   - Better empty states

## Testing URLs
- Production: https://heiwa-house-portugal.netlify.app/
- Local: http://localhost:3000/

## Test Data
- Test dates: Use future dates (e.g., 2 weeks from now)
- Test guests: Try 1, 2, 4 guests
- Test email: test@example.com
- Test phone: +351 123 456 789

## Next Steps
1. Deploy current fix
2. Test room booking flow end-to-end
3. Test surf week booking flow end-to-end
4. Fix any remaining issues
5. Document final flow

