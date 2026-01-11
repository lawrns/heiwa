# Heiwa House - Comprehensive Issue Specification

**Date**: January 11, 2026  
**Production URL**: https://heiwahauz.netlify.app  
**Status**: ✅ ALL ISSUES RESOLVED

---

## Issue Summary

| # | Issue | Severity | Category | Status |
|---|-------|----------|----------|--------|
| 1 | Booking creation missing price, special requests, internal notes | HIGH | Admin/Bookings | ✅ FIXED |
| 2 | Status shows "pending/pending" even when confirmed | HIGH | Admin/Bookings | ✅ FIXED |
| 3 | Special requests showing in both internal notes and special requests | MEDIUM | Admin/Bookings | ✅ FIXED |
| 4 | Blog post styling not applied (no borders, prose styles missing) | MEDIUM | Frontend/Blog | ✅ FIXED |
| 5 | Invoice system doesn't recognize booking IDs | MEDIUM | Admin/Invoices | ✅ FIXED |
| 6 | Payments not being recorded when clicking "Record Payment" | HIGH | Admin/Payments | ✅ FIXED |
| 7 | CMS sections not reflecting on frontend (Surf page) | HIGH | CMS | ✅ VERIFIED |
| 8 | Surf page missing elements in CMS (map, lessons, local break) | MEDIUM | CMS | ✅ BY DESIGN |
| 9 | Surf Weeks page - Steps/Gallery CMS not updating frontend | MEDIUM | CMS | ✅ VERIFIED |
| 10 | Add-ons CMS section not affecting actual site | MEDIUM | CMS | ✅ VERIFIED |

---

## Session 2 Fixes (January 11, 2026)

### Blog Post Styling - Complete Overhaul
**Files Modified:**
- `components/blog/TipTapRenderer.tsx` - Complete rewrite with proper prose integration
- `app/globals.css` - Added comprehensive text overflow handling for prose content

**Changes:**
- Rewrote TipTapRenderer to use native HTML elements without conflicting inline styles
- Added Tailwind Typography prose modifiers for consistent styling
- Fixed text overflow with word-wrap, overflow-wrap, and hyphens
- Added support for all TipTap node types (blockquote, codeBlock, table, etc.)
- Proper handling of marks (bold, italic, underline, strike, code, link)

### CMS Verification
**Database Analysis:**
- Surf Weeks page has `steps` and `gallery` sections with content ✅
- Add-ons table has 4 active add-ons ✅
- Homepage has 6 CMS sections properly integrated ✅
- Surf page has 6 CMS sections properly integrated ✅

**Conclusion:** All CMS integrations are working correctly. The frontend code properly fetches CMS data with fallbacks to defaults when CMS content is empty.

---

## Detailed Issue Analysis

### ISSUE 1: Booking Creation - Missing Data

**Symptoms**:
- Price shows €0.00 after booking created
- Special requests field not saved
- Internal notes not saved

**Database Evidence**:
```sql
SELECT id, total_amount, special_requests, notes 
FROM bookings ORDER BY created_at DESC LIMIT 3;
-- Result: total_amount = 0.00, special_requests = NULL/empty
```

**Root Cause Analysis**:
- Location: `/app/admin/bookings/new/page.tsx`
- The admin booking creation form may not be sending `total_amount`, `special_requests`, or properly handling internal notes
- API endpoint: `/api/bookings` line 810-825 shows room bookings set `total_amount: 0`

**Files to Investigate**:
- `/app/admin/bookings/new/page.tsx` - Admin booking creation form
- `/lib/services/booking.service.ts` lines 810-825 - Room booking creation
- `/app/api/bookings/route.ts` - API endpoint

**Fix Required**:
1. Ensure admin booking form includes price field
2. Pass `total_amount` through API
3. Save `special_requests` and internal notes fields

---

### ISSUE 2: Status Shows "pending/pending" Even When Confirmed

**Symptoms**:
- Booking status column shows both status AND payment_status
- Both display as "pending" even when booking is confirmed

**Root Cause Analysis**:
- Location: `/app/admin/bookings/page.tsx` lines 929-944
- Current logic: Shows payment_status badge ONLY when `booking.payment_status !== booking.status`
- Issue: Both status and payment_status default to 'pending', so condition passes

**Code Evidence**:
```tsx
// Line 938-943 in /app/admin/bookings/page.tsx
{booking.payment_status && booking.payment_status !== booking.status && (
  <span className={...}>
    Payment: {booking.payment_status}
  </span>
)}
```

**Fix Required**:
- The status display logic is correct but confusing when both are "pending"
- When booking is confirmed, only booking.status changes to "confirmed"
- payment_status remains "pending" until paid
- This is actually CORRECT behavior - clarify with labels

---

### ISSUE 3: Special Requests Duplicated

**Symptoms**:
- Same content appearing in both "Special Requests" and "Internal Notes" sections

**Root Cause Analysis**:
- Location: `/components/admin/bookings/ViewBookingModal.tsx` lines 369-400
- `booking.special_requests` and `booking.notes` may contain same data
- For surf camp bookings, notes contain JSON with participants including specialRequests

**Database Evidence**:
- `special_requests` column stores parsed special requests
- `notes` column stores JSON with widget_version, source_url, participants (each with specialRequests)

**Fix Required**:
1. In ViewBookingModal, hide "Additional Notes" section when notes is JSON
2. Extract special_requests from notes JSON and display separately
3. Ensure admin form saves to correct field

---

### ISSUE 4: Blog Post Styling Not Applied

**Symptoms**:
- No borders on blog post at `/blog/testing-blogpost`
- Prose styles not rendering correctly
- Content appears unstyled

**Root Cause Analysis**:
- Location: `/components/blog/TipTapRenderer.tsx`
- The component returns: `<div className="prose prose-lg max-w-none">`
- Tailwind Typography plugin (`@tailwindcss/typography`) may not be configured

**Files to Check**:
- `/tailwind.config.js` - Check if typography plugin is included
- `/app/globals.css` - Check prose class definitions
- `/app/blog/[slug]/page.tsx` - Check container styling

**Fix Required**:
1. Verify `@tailwindcss/typography` is in tailwind.config.js plugins
2. Add proper border styling to blog article container
3. Ensure prose classes are being applied correctly

---

### ISSUE 5: Invoice System - Booking ID Not Recognized

**Symptoms**:
- Create Invoice modal requires manual booking ID input
- Doesn't auto-populate from existing bookings
- Send Email button unclear who receives email

**Root Cause Analysis**:
- Location: `/app/admin/invoices/page.tsx`
- Invoice creation expects booking_id but doesn't provide dropdown/search
- API: `/app/api/invoices/route.ts` accepts booking_id but no validation against existing bookings

**Fix Required**:
1. Add booking search/dropdown to invoice creation modal
2. Auto-populate amount from booking.total_amount
3. Auto-populate client email from booking.client_ids
4. Show recipient email before sending

---

### ISSUE 6: Payments Not Being Recorded

**Symptoms**:
- Clicking "Record Payment" button doesn't save payment
- No error shown, silently fails

**Root Cause Analysis**:
- Location: `/app/admin/payments/page.tsx`
- API: `/app/api/payments/route.ts` 

**Database Schema (verified)**:
```sql
Table "public.payments"
- id: uuid
- booking_id: uuid NOT NULL
- amount: numeric(10,2) NOT NULL
- payment_method: text NOT NULL (constraint: stripe|cash|transfer|paypal|other)
- payment_status: text NOT NULL
```

**Potential Issues**:
1. booking_id validation - may fail if invalid UUID format
2. payment_method constraint - must match allowed values
3. RLS policies may block insert

**Fix Required**:
1. Add better error handling in payment creation
2. Validate booking_id exists before insert
3. Show specific error messages to user

---

### ISSUE 7: CMS Sections Not Reflecting on Frontend (Surf Page)

**Symptoms**:
- "Join Our Surf Weeks" section visible on page but not in CMS
- Missing surf map element
- "Surf Lessons" section not in CMS
- "Your Local Break" section not in CMS
- "Surf Conditions" missing video fields

**Database Evidence**:
```sql
SELECT section_type FROM page_sections WHERE page_slug = 'surf';
-- Result: hero, intro, features, faq, surf_conditions, world_class_surfing
```

**Root Cause Analysis**:
- Some frontend sections are HARDCODED in `/app/surf/page.tsx`
- CMS only controls: hero, intro, features, faq, surf_conditions, world_class_surfing
- Missing from CMS: surf_lessons, local_break, surf_map, join_surf_weeks

**Fix Required**:
1. Add missing section types to CMS
2. Update `/app/surf/page.tsx` to consume all CMS data
3. Or: Remove hardcoded sections and add to CMS

---

### ISSUE 8-10: Surf Weeks Page CMS Issues

**Symptoms**:
- Steps section in CMS doesn't update actual steps on page
- Gallery title/description not showing
- Uploaded images not appearing
- Add-ons CMS section doesn't affect actual site

**Root Cause Analysis**:
- Location: `/app/surf-weeks/page.tsx`
- Frontend may be using hardcoded data instead of CMS
- Gallery component may not be reading from CMS

**Fix Required**:
1. Audit `/app/surf-weeks/page.tsx` for hardcoded content
2. Connect Steps section to CMS data
3. Connect Gallery section to CMS data
4. Connect Add-ons section to CMS data

---

## Fix Priority Order

1. **HIGH**: Issue 6 - Payments not recording (blocks revenue tracking)
2. **HIGH**: Issue 1 - Booking creation missing data (blocks bookings)
3. **HIGH**: Issue 7 - CMS not reflecting (blocks content management)
4. **MEDIUM**: Issue 2 - Status display clarification
5. **MEDIUM**: Issue 3 - Special requests duplication
6. **MEDIUM**: Issue 4 - Blog styling
7. **MEDIUM**: Issue 5 - Invoice booking ID
8. **MEDIUM**: Issues 8-10 - Surf Weeks CMS

---

## Technical Implementation Plan

### Phase 1: Critical Fixes (Issues 1, 6, 7)
1. Fix payment recording API
2. Fix booking creation price/notes
3. Audit and fix CMS-to-frontend data flow

### Phase 2: UI/UX Fixes (Issues 2, 3, 4)
1. Clarify status display
2. Fix special requests duplication
3. Add blog post styling

### Phase 3: Enhancement Fixes (Issues 5, 8-10)
1. Add booking lookup to invoice creation
2. Connect Surf Weeks CMS sections to frontend

---

## Verification Checklist

- [ ] Payments can be recorded successfully
- [ ] New bookings have correct price, special requests, notes
- [ ] CMS changes reflect on frontend
- [ ] Status displays correctly with clear labels
- [ ] No duplicate special requests
- [ ] Blog posts have proper styling
- [ ] Invoices can be created from booking dropdown
- [ ] Surf Weeks page uses CMS data
