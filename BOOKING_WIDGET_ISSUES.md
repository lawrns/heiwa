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

## Fixes Applied

### CRITICAL FIXES - DEPLOYED ✅

1. ✅ **Room prices show "Select dates" - THE REAL FIX** - FIXED & DEPLOYED
   - Location: `app/api/rooms/availability/route.ts`
   - Issue: Room prices showing "Select dates" even after dates were selected
   - Root Cause: The `/rooms/availability` endpoint was returning raw Supabase data without transforming it. The database has `pricing.standard` and `pricing.offSeason` as a JSONB object, but the API wasn't extracting `price_per_night` field
   - Fix: Added data transformation to `/rooms/availability` endpoint (same as `/rooms` endpoint) to extract `price_per_night` from `pricing.standard` or `pricing.offSeason`
   - Commit: 2fdb9e1
   - Status: ✅ Live on production
   - **This was the actual issue!** The previous fixes were addressing symptoms, not the root cause.

2. ✅ **Local date state sync** - FIXED & DEPLOYED
   - Location: `components/BookingWidget/steps/OptionSelection.tsx:50-62`
   - Issue: Local checkInDate/checkOutDate state wasn't syncing with global state
   - Fix: Added useEffect to sync local date state with global state.dates
   - Commits: abadae4, b149473
   - Status: ✅ Live on production

3. ✅ **Auto-select dummy option removed** - FIXED & DEPLOYED
   - Location: `components/BookingWidget/steps/OptionSelection.tsx:100-108`
   - Issue: Auto-select set dummy ID 'room-dates-selected' which doesn't match any real room
   - Fix: Removed auto-select logic - users must explicitly select a room
   - Commit: f169914
   - Status: ✅ Live on production

4. ✅ **Room pricing calculation fixed** - FIXED & DEPLOYED
   - Location: `components/BookingWidget/steps/OptionSelection.tsx:108-121`
   - Issue: Price was multiplied by roomQuantity based on guest count, causing incorrect totals
   - Fix: Price is now simply pricePerNight × nights for single room booking
   - Commit: f169914
   - Status: ✅ Live on production

### SUPABASE DATABASE CLEANUP ✅

5. ✅ **Deactivated test rooms** - FIXED IN DATABASE
   - Deactivated 3 test/junk rooms that were showing in the booking widget:
     - "LOVEROOM" (capacity 69, price €699)
     - "sdfsdf" (price €0)
     - "Room Nr 1 - UPDATED TEST 5" (test room)
   - Status: ✅ Completed via Supabase API

**Active Legitimate Rooms (4 total):**
- **Dorm room** - €30/night (per bed), capacity 6, booking_type: perBed
- **Room Nr 2** - €80/night, capacity 1, booking_type: whole
- **Room Nr 3** - €80/night, capacity 2, booking_type: whole
- **The Cave** - €90/night (€70 off-season), capacity 3, booking_type: whole

## Supabase Database Status

### Tables Verified:
- ✅ **rooms** - 4 active legitimate rooms, 3 test rooms deactivated
- ✅ **surf_camps** - 3 active camps (all from March 2024 - past dates)
- ✅ **bookings** - Table exists, 0 bookings
- ✅ **room_assignments** - Table exists, 0 assignments

### Database Schema Notes:
1. **rooms.pricing** - JSONB field with structure:
   ```json
   {
     "standard": 80,
     "offSeason": 70,
     "camp": { "1": 80, "2": 80 }
   }
   ```

2. **room_assignments** - Missing `status` column
   - The availability API checks for `status = 'confirmed'` but this column doesn't exist
   - Currently no bookings, so this doesn't cause errors (query returns empty array)
   - **TODO**: Either add `status` column or update API to not filter by status

3. **surf_camps** - All dates are in the past (March 2024)
   - Users won't see any surf weeks in the booking widget
   - **TODO**: Add future surf camp dates or create recurring/template surf camps

### Potential Issues to Address:
1. ⚠️ **room_assignments.status column missing** - API expects it but it doesn't exist
2. ⚠️ **No future surf camps** - Surf week booking flow will show "No surf weeks available"
3. ⚠️ **Image paths** - Some rooms use relative paths (`/images/rooms/room3.webp`), others use full Supabase URLs

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

## Deployment Status

**Latest deployment:** https://heiwa-house-portugal.netlify.app/
**Commits:**
- 2fdb9e1 - API fix (transform room data in availability endpoint)
- d8f5050 - Debug logging
**Status:** ✅ LIVE

## Next Steps
1. ✅ Deploy API fix - DONE
2. ✅ Clean up Supabase test data - DONE
3. 🔄 Test room booking flow end-to-end - IN PROGRESS (waiting for user confirmation)
4. ⏳ Test surf week booking flow end-to-end
5. ⏳ Fix any remaining issues
6. ⏳ Document final flow

