# Bug Fixes Implementation Plan

**Date:** 2025-12-29
**Status:** Ready for Implementation

## Summary

This document outlines the comprehensive bug fixes identified through parallel investigation of 8 sub-agents. The issues span across SEO settings, image uploads, CMS data handling, timezone conversions, and UI/cosmetic problems.

---

## High Priority Fixes

### 1. SEO Settings Not Saving
**Root Cause:** RLS policies on `pages_meta` table block service role writes.

**Files:**
- `app/api/cms/pages/[slug]/route.ts` (lines 115-121)
- `migrations/004_cms_content_tables.sql` (lines 122-196)

**Fix:** The `supabaseAdmin` uses service role key, but RLS policies only allow `auth.role() = 'authenticated'`. Need to add service role bypass policy.

**Solution:** Create new migration to fix RLS:
```sql
DROP POLICY IF EXISTS "Allow admin write" ON pages_meta;
DROP POLICY IF EXISTS "Allow admin update" ON pages_meta;
CREATE POLICY "service_role_full_access_pages_meta" ON pages_meta FOR ALL USING (true) WITH CHECK (true);
```

---

### 2. Image Upload Not Working
**Root Cause:** Missing `credentials: 'include'` in fetch request.

**File:** `components/admin/inline-editor/MediaLibraryModal.tsx` (lines 80-83)

**Current Code:**
```tsx
const response = await fetch('/api/cms/media', {
  method: 'POST',
  body: form,
})
```

**Fix:** Add credentials to send admin_auth cookie:
```tsx
const response = await fetch('/api/cms/media', {
  method: 'POST',
  credentials: 'include',
  body: form,
})
```

---

### 3. "edit" Text Bug in Bullet Points
**Root Cause:** Data key mismatch - database uses `features`, component expects `bullets`.

**Files:**
- `components/home/HomeSections.tsx` (lines 176-188) - reads `content.bullets`
- `migrations/20241209_seed_page_sections.sql` (line 28) - stores as `features`
- `components/admin/inline-editor/editors/SurfWeeksEditor.tsx` - saves to `bullets`

**Fix:** Update HomeSections.tsx to accept both keys:
```tsx
const surfWeeksBullets = Array.isArray(content.bullets)
  ? (content.bullets as string[]).filter(b => typeof b === 'string' && b.trim().length > 0)
  : Array.isArray(content.features)
    ? (content.features as string[]).filter(b => typeof b === 'string' && b.trim().length > 0)
    : []
```

---

### 4. Activities Section Empty State
**Root Cause:** FacilitiesEditor checks wrong field order.

**File:** `components/admin/inline-editor/editors/FacilitiesEditor.tsx` (lines 18-19)

**Fix:** Check which field actually has data:
```tsx
const facilities = (Array.isArray(content.items) && content.items.length > 0)
  ? content.items
  : (Array.isArray(content.facilities) && content.facilities.length > 0)
    ? content.facilities
    : []
const fieldName = 'items' // Always use 'items' for consistency
```

---

## Medium Priority Fixes

### 5. Date Timezone Bug
**Root Cause:** `new Date("2026-06-12")` parses as UTC, then `toLocaleDateString()` converts to local timezone causing 1-day offset.

**Files:**
- `app/admin/surf-camps/page.tsx` (lines 147-153)
- `app/admin/surf-camps/[id]/page.tsx` (lines 74-80)

**Fix:** Use UTC timezone for display:
```tsx
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)))
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
}
```

---

### 6. Homepage "0 Sections" Metadata Bug
**Root Cause:** API queries old `page_content` table instead of `page_sections`.

**File:** `app/api/admin/cms/page-stats/route.ts` (lines 17-67)

**Fix:** Update to query correct `page_sections` table and count sections properly.

---

### 7. Duplicate Room Sections
**Root Cause:** Hardcoded "Room Facilities" section duplicates editable "Room Features".

**File:** `app/rooms/[id]/page.tsx` (lines 261-274)

**Fix:** Remove the hardcoded "Room Facilities" section entirely (delete lines 261-274).

---

## Low Priority Fixes (UI/Cosmetic)

### 8. Hero Font Size Too Large
**File:** `components/home/HomeSections.tsx` (lines 92-94)

**Fix:** Change `text-lg sm:text-xl md:text-2xl` to `text-base sm:text-lg`

---

### 9. Bullet Point Alignment
**File:** `components/home/HomeSections.tsx` (lines 213-218)

**Fix:** Change `items-start` to `items-center` and remove `mt-1` from bullet span.

---

### 10. Button Margins
**File:** `components/BookingWidget/BookingWidget.tsx` (lines 458-521)

**Fix:** Change padding from `p-3 sm:p-4` to `px-4 sm:px-5 md:px-6 py-3 sm:py-4`

---

### 11. "Best Price Guarantee" Text
**File:** `app/rooms/[id]/page.tsx` (lines 295-301)

**Fix:** Remove the "Best price guarantee" paragraph or make it conditional.

---

### 12. Price Per Night in Camp Bookings
**File:** `components/BookingWidget/steps/SurfWeekRoomSelection.tsx` (lines 625-654)

**Fix:** Only show nightly rate fallback when `state.experienceType === 'room'`, not for camps.

---

## Implementation Order

1. **SEO Settings** - Critical, blocking admin functionality
2. **Image Upload** - Critical, blocking content updates
3. **"edit" Text Bug** - Visible to end users
4. **Activities Section** - Blocking admin functionality
5. **Date Timezone** - Causes confusion
6. **Duplicate Room Sections** - User-facing cleanup
7. **Page Stats Metadata** - Admin dashboard cosmetic
8-12. **UI/Cosmetic fixes** - Polish items

---

## Testing Checklist

- [ ] SEO settings save successfully on Homepage, Surf Weeks, Heiwa Surf pages
- [ ] Image upload works in admin panel for homepage cards
- [ ] Bullet points display without "edit" text
- [ ] Activities section shows existing activities when editing
- [ ] Surf camp dates display consistently in list and edit views
- [ ] Room pages show only one features/facilities section
- [ ] Homepage metadata shows correct section count
- [ ] Hero subtitle is appropriately sized
- [ ] Bullet dots are vertically centered
- [ ] Booking buttons have proper margins
- [ ] Camp bookings don't show per-night pricing
