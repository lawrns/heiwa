# 🐛 Critical Bugs Found During Browser Testing

## Test Date: 2025-09-30
## Browser: Playwright automated testing

---

## 1. ⚠️ CRITICAL: Date Parsing Bug (Off-by-one Error)

**Location:** Booking Widget - Date Selection  
**Severity:** HIGH - Affects all bookings

**Issue:**
- User selects: `2025-10-01` to `2025-10-03`
- Widget displays: `9/30/2025 - 10/2/2025`  
- Result: **All dates are off by one day!**

**Root Cause:**
JavaScript Date constructor with string format creates dates in local timezone, causing timezone offset issues.

**Impact:**
- Users booking wrong dates
- Database will have incorrect date records
- Could lead to double bookings or missed reservations

**Fix Required:**
```typescript
// WRONG (current):
const checkIn = new Date(dateString)

// CORRECT:
const checkIn = new Date(dateString + 'T00:00:00')
// OR better yet, use date-fns parseISO:
const checkIn = parseISO(dateString)
```

---

## 2. ❌ Image 404 Errors

**Location:** Room listings `/rooms`  
**Severity:** MEDIUM - Breaks user experience

**Issue:**
```
GET /dorm.webp 404
GET /room1.jpg 404
GET /room2.webp 404
GET /room3.webp 404
```

**Root Cause:**
Database stores relative paths `/dorm.webp` instead of full Supabase Storage URLs.

**Impact:**
- Broken images on room cards
- Professional appearance compromised
- Users can't see room photos

**Fix Required:**
1. Update database images to full Supabase Storage URLs
2. Add image validation in admin dashboard
3. Implement fallback images when uploads fail

---

## 3. 🔧 Database Schema Mismatch

**Location:** Availability API `/api/rooms/availability`  
**Severity:** MEDIUM - Breaks availability checking

**Errors:**
```
column room_assignments.status does not exist
column surf_week_assignments.camp_id does not exist
```

**Impact:**
- Availability checking fails silently
- All rooms show as available even when booked
- Could lead to overbooking

**Fix Required:**
- Update database schema to match code expectations
- OR update code to match current schema
- Add proper error handling

---

## 4. 📅 Date Display Formatting

**Location:** Booking Widget - "Your Selection" summary  
**Severity:** LOW - Confusing UX

**Issue:**
Displays: `1 guest • 2 nights • 9/30/2025 - 10/2/2025`  
Should be: `1 guest • 2 nights • Oct 1, 2025 - Oct 3, 2025`

**Fix Required:**
Use better date formatting:
```typescript
// Use date-fns format:
format(checkIn, 'MMM d, yyyy') // "Oct 1, 2025"
```

---

## 5. ⚡ Console Warnings

**Location:** Various  
**Severity:** LOW - Performance/Best Practices

**Issues:**
1. `Image with src has "fill" but is missing "sizes" prop`
2. Multiple `GoTrueClient instances detected`
3. `scroll-behavior: smooth` warning

**Fix Required:**
1. Add `sizes` prop to all Next.js Image components with `fill`
2. Ensure Supabase client is singleton
3. Remove or configure scroll-behavior properly

---

## ✅ What's Working Well

1. ✅ Room images loading from Supabase Storage (for properly configured rooms)
2. ✅ Booking widget UI/UX flow
3. ✅ Room filtering by category
4. ✅ Navigation and page routing
5. ✅ API transformation (images array → featured_image)
6. ✅ Fallback image mechanism

---

## 🔧 Priority Fixes (in order)

### P0 - MUST FIX BEFORE LAUNCH:
1. Date parsing bug (off-by-one)
2. Database schema errors (availability)

### P1 - FIX SOON:
3. Image 404 errors
4. Date display formatting

### P2 - NICE TO HAVE:
5. Console warnings
6. Image optimization

---

## 📝 Testing Notes

- All 7 rooms loaded successfully
- Room images working when using full Supabase URLs
- Booking widget opens and flows correctly
- Date selection UI works
- Rooms filtered correctly by dates/guests

---

## 🚀 Next Steps

1. Fix date parsing bug IMMEDIATELY
2. Update room images in database to full URLs
3. Fix database schema mismatches
4. Improve date formatting display
5. Add proper error logging for debugging
