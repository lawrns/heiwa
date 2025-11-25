# Manual Booking Flow Test - DO THIS NOW

## STEP 1: Open Browser
- Go to: https://heiwahauz.netlify.app
- Open DevTools (F12)
- Go to Console tab
- **WATCH FOR ANY RED ERRORS**

## STEP 2: Room Booking Test
1. Click "Book Now" button
2. Select "Book a Room"
3. Pick any future date for check-in
4. Pick a date 2+ days later for check-out
5. Select 2 guests
6. Click on any room (e.g., "Dorm room")
7. Fill in guest details:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +1234567890
8. Click Next
9. Skip add-ons (or select if you want)
10. Review the booking summary
11. Select payment method (Card or Bank Wire)
12. Click "Complete Booking"

**RESULT**: Should complete without errors. Check console for any red messages.

## STEP 3: Surf Week Booking Test
1. Click "Book Now" again
2. Select "All-Inclusive Surf Week"
3. Click on any surf week (e.g., "June Surf Week 2026")
4. Select 2 participants
5. Select a room
6. Fill in participant details
7. Click through to review
8. Select payment method
9. Click "Complete Booking"

**RESULT**: Should complete without errors.

## STEP 4: Check Console
Look for these errors - if you see ANY of these, STOP and report:
- ❌ "Cannot access 'en' before initialization"
- ❌ "TypeError"
- ❌ "ReferenceError"
- ❌ "Multiple GoTrueClient"
- ❌ Any red error messages

If you see NONE of these, then: ✅ PASS

## STEP 5: Report
- Did both flows complete? YES / NO
- Any console errors? YES / NO
- Did pricing calculate correctly? YES / NO
- Did forms validate? YES / NO

If all YES: ✅ PRODUCTION READY
