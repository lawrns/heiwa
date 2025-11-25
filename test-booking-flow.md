# Live Booking Flow Test - November 25, 2025

## Test Environment
- **URL**: https://heiwahauz.netlify.app
- **Browser**: Chrome/Firefox/Safari
- **Test Type**: End-to-End Manual Testing

## Pre-Test Checklist
- [ ] Open https://heiwahauz.netlify.app in incognito window
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Clear console
- [ ] Check for any errors on page load

## Test 1: Homepage Load
**Expected**: Page loads without errors
- [ ] No ReferenceError about 'en'
- [ ] No TypeError
- [ ] No Supabase warnings
- [ ] Hero section visible
- [ ] "Book Now" button visible

## Test 2: Room Booking Flow
**Steps**:
1. [ ] Click "Book Now" button
2. [ ] Select "Book a Room"
3. [ ] Select check-in date (any future date)
4. [ ] Select check-out date (2+ days later)
5. [ ] Select number of guests (1-4)
6. [ ] Click on a room to select it
7. [ ] Enter guest details (name, email, phone)
8. [ ] Select add-ons (if any)
9. [ ] Review booking summary
10. [ ] Select payment method (Card or Bank Wire)
11. [ ] Click "Complete Booking"

**Expected Results**:
- [ ] No console errors during flow
- [ ] All steps render correctly
- [ ] Pricing updates dynamically
- [ ] Form validation works
- [ ] Booking submission succeeds

## Test 3: Surf Week Booking Flow
**Steps**:
1. [ ] Click "Book Now" button
2. [ ] Select "All-Inclusive Surf Week"
3. [ ] Select a surf week from the list
4. [ ] Select number of participants
5. [ ] Select a room for the week
6. [ ] Enter participant details
7. [ ] Select add-ons
8. [ ] Review booking
9. [ ] Select payment method
10. [ ] Click "Complete Booking"

**Expected Results**:
- [ ] No console errors
- [ ] Surf weeks display correctly
- [ ] Pricing calculated per person
- [ ] All steps complete successfully

## Console Error Checklist
**Critical Errors to Watch For**:
- [ ] "Cannot access 'en' before initialization" - SHOULD NOT APPEAR
- [ ] "Multiple GoTrueClient instances" - SHOULD NOT APPEAR
- [ ] "TypeError" - SHOULD NOT APPEAR
- [ ] "ReferenceError" - SHOULD NOT APPEAR
- [ ] "Failed to fetch" - SHOULD NOT APPEAR
- [ ] Any 404 errors on assets - SHOULD NOT APPEAR

## Network Tab Checklist
- [ ] All API calls return 200/201 status
- [ ] No failed requests
- [ ] No 404s on images or scripts
- [ ] API response times < 1 second

## Final Verification
- [ ] Homepage loads cleanly
- [ ] Both booking flows work end-to-end
- [ ] No console errors
- [ ] No network errors
- [ ] Pricing calculations correct
- [ ] Form validation works
- [ ] Payment method selection works

## Sign-Off
- **Tester**: 
- **Date**: 
- **Status**: ✅ PASS / ❌ FAIL
- **Notes**: 

