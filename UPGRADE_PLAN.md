# Heiwa House CMS - Remaining Issues Upgrade Plan

**Generated:** January 4, 2026
**Based on:** Production audit by 5 specialized subagents

---

## Executive Summary

| Category | Fixed | Remaining | Critical |
|----------|-------|-----------|----------|
| CMS Content | 10 | 8 | 2 |
| Booking System | 4 | 3 | 1 |
| Admin Backend | 4 | 1 | 1 |
| Frontend UX | 6 | 2 | 0 |
| Database Schema | - | 1 | 1 |
| **TOTAL** | **24** | **15** | **5** |

---

## PHASE 1: Critical Database & Backend Fixes (Day 1)

### 1.1 Add `blocks_bookings` Column to Calendar Events
**Priority:** CRITICAL
**Impact:** Calendar event blocking feature completely broken
**Effort:** 15 minutes

**Problem:** The `blocks_bookings` column doesn't exist in `calendar_events` table, but:
- UI checkbox was added to CreateEventModal
- API expects to save this field
- Availability API tries to filter by this field

**SQL Migration:**
```sql
ALTER TABLE calendar_events
ADD COLUMN blocks_bookings BOOLEAN DEFAULT FALSE;

-- Add index for query performance
CREATE INDEX idx_calendar_events_blocking
ON calendar_events(blocks_bookings)
WHERE blocks_bookings = true;
```

**Files to verify after:**
- `app/api/calendar-events/route.ts` - POST handler includes field
- `app/api/dates/availability/route.ts` - Query works

---

### 1.2 Fix Surf Week Conflict Error Message in UI
**Priority:** HIGH
**Impact:** Users see generic "No rooms available" instead of helpful message
**Effort:** 30 minutes

**Problem:** `useRooms.ts` doesn't check for `surf_week_conflict` in API response

**File:** `components/BookingWidget/hooks/useRooms.ts`

**Current Code (broken):**
```typescript
if (data.success && (data.data?.available_rooms || data.data?.rooms)) {
  // NO CHECK for surf_week_conflict
}
```

**Fix:**
```typescript
if (data.success) {
  if (data.data?.surf_week_conflict) {
    setError(data.data.message || 'Room bookings unavailable during surf weeks');
    setAvailableRooms([]);
    return;
  }
  // ... existing logic
}
```

---

## PHASE 2: CMS Content Gaps (Day 2-3)

### 2.1 Make Privacy & Terms Pages CMS-Editable
**Priority:** HIGH
**Impact:** Legal documents require code deployment to update
**Effort:** 2 hours

**Current State:**
- Pages exist at `/privacy` and `/terms`
- 100% hardcoded JSX content
- Listed in `pages_meta` CHECK constraint but no sections

**Implementation:**
1. Add `rich_text` section type for long-form content
2. Seed initial content to `page_sections`
3. Update page components to fetch from CMS

**SQL:**
```sql
INSERT INTO page_sections (page_slug, section_type, content, order_index, is_active)
VALUES
  ('privacy', 'rich_text', '{"title": "Privacy Policy", "content": "<h2>1. Information We Collect</h2>...", "lastUpdated": "2026-01-01"}', 0, true),
  ('terms', 'rich_text', '{"title": "Terms and Conditions", "content": "<h2>1. Acceptance of Terms</h2>...", "lastUpdated": "2026-01-01"}', 0, true);
```

**Files to update:**
- `lib/cms-schemas.ts` - Add `RichTextContentSchema`
- `app/privacy/page.tsx` - Fetch from CMS
- `app/terms/page.tsx` - Fetch from CMS

---

### 2.2 Make Contact Page Text CMS-Editable
**Priority:** MEDIUM
**Impact:** Marketing copy changes require deployment
**Effort:** 1 hour

**Current State:**
- Uses `site_settings` for contact info (working)
- All page text/copy is hardcoded

**Implementation:**
1. Add hero, intro sections for contact page
2. Keep settings for contact data

**SQL:**
```sql
INSERT INTO page_sections (page_slug, section_type, content, order_index, is_active)
VALUES
  ('contact', 'hero', '{"title": "Get in Touch", "subtitle": "We would love to hear from you"}', 0, true);
```

---

### 2.3 Make The-Spot Page Fully CMS-Editable
**Priority:** MEDIUM
**Impact:** 25+ hardcoded images, all feature text not editable
**Effort:** 3 hours

**Current State:**
- Only 3 of 8 sections are CMS-editable
- Image galleries completely hardcoded
- Feature descriptions hardcoded

**Implementation:**
1. Add `image_gallery` sections for each facility area
2. Move feature text to CMS sections
3. Update page component to use CMS data with fallbacks

**SQL:**
```sql
INSERT INTO page_sections (page_slug, section_type, content, order_index, is_active)
VALUES
  ('the-spot', 'image_gallery', '{"title": "Property Overview", "images": ["/images/the-spot/property-1.jpg", ...]}', 10, true),
  ('the-spot', 'image_gallery', '{"title": "Yoga Dome", "images": [...]}', 11, true),
  ('the-spot', 'image_gallery', '{"title": "Skatepark", "images": [...]}', 12, true),
  ('the-spot', 'image_gallery', '{"title": "Pool Area", "images": [...]}', 13, true);
```

---

## PHASE 3: Booking Widget Enhancements (Day 4)

### 3.1 Replace Native Date Picker with Custom Calendar
**Priority:** MEDIUM
**Impact:** Users can't see blocked dates visually
**Effort:** 4 hours

**Problem:** Native HTML `<input type="date">` cannot disable specific dates

**Solution:** Use `react-day-picker` or similar library

**Implementation:**
1. Install: `npm install react-day-picker`
2. Create `BookingCalendar` component
3. Integrate with `useDateAvailability` hook
4. Style blocked dates as disabled/grayed

**Files to update:**
- `components/BookingWidget/steps/OptionSelection.tsx`
- Create: `components/BookingWidget/BookingCalendar.tsx`

---

### 3.2 Add Room Occupancy Percentage Display
**Priority:** LOW
**Impact:** Rooms don't show availability % like surf weeks do
**Effort:** 1 hour

**Current State:**
- Surf weeks show "X% booked • Y spots left" ✅
- Rooms only show "Up to X guests" ❌

**Implementation:**
Add occupancy display to room cards matching surf week style

---

## PHASE 4: Frontend Polish (Day 5)

### 4.1 Add Loading States for CMS Settings
**Priority:** LOW
**Impact:** Brief flash of default values before settings load
**Effort:** 30 minutes

**Files:**
- `components/navigation.tsx`
- `components/footer.tsx`

**Fix:** Add skeleton/spinner during initial fetch

---

### 4.2 Show Phone Number on Mobile
**Priority:** LOW
**Impact:** Phone only visible on desktop
**Effort:** 15 minutes

**File:** `components/navigation.tsx`

**Fix:** Add abbreviated phone to mobile menu

---

## Implementation Priority Matrix

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| 1.1 blocks_bookings column | CRITICAL | 15 min | None |
| 1.2 Surf week error message | HIGH | 30 min | None |
| 2.1 Privacy/Terms CMS | HIGH | 2 hrs | None |
| 2.2 Contact page CMS | MEDIUM | 1 hr | None |
| 2.3 The-Spot galleries | MEDIUM | 3 hrs | None |
| 3.1 Custom date picker | MEDIUM | 4 hrs | None |
| 3.2 Room occupancy % | LOW | 1 hr | None |
| 4.1 Loading states | LOW | 30 min | None |
| 4.2 Mobile phone | LOW | 15 min | None |

---

## Database Health Summary

### Tables with Good Coverage
- ✅ `page_sections` - 8 pages covered
- ✅ `pages_meta` - All slugs in CHECK constraint
- ✅ `site_settings` - 10+ settings configured
- ✅ `rooms`, `bookings`, `surf_camps` - Working

### Schema Issues Found
- ❌ `calendar_events` missing `blocks_bookings` column

### RLS Policies
- ✅ All tables have appropriate policies
- ✅ Service role access configured

---

## Estimated Total Effort

| Phase | Time |
|-------|------|
| Phase 1: Critical Fixes | 1 hour |
| Phase 2: CMS Gaps | 6 hours |
| Phase 3: Booking Widget | 5 hours |
| Phase 4: Polish | 1 hour |
| **TOTAL** | **13 hours** |

---

## Recommended Execution Order

```
Day 1 (2 hours):
├── 1.1 Add blocks_bookings column (15 min)
├── 1.2 Fix surf week error message (30 min)
├── Test & deploy critical fixes (1 hour)

Day 2 (4 hours):
├── 2.1 Privacy/Terms CMS (2 hours)
├── 2.2 Contact page CMS (1 hour)
├── Test & deploy (1 hour)

Day 3 (4 hours):
├── 2.3 The-Spot galleries (3 hours)
├── Test & deploy (1 hour)

Day 4 (5 hours):
├── 3.1 Custom date picker (4 hours)
├── 3.2 Room occupancy % (1 hour)

Day 5 (2 hours):
├── 4.1 Loading states (30 min)
├── 4.2 Mobile phone (15 min)
├── Final testing & deployment (1 hour)
```

---

## Post-Implementation Verification

After completing all phases, verify:

1. **CMS Editing:**
   - [ ] Privacy page editable in admin
   - [ ] Terms page editable in admin
   - [ ] Contact page hero editable
   - [ ] The-Spot galleries editable

2. **Booking System:**
   - [ ] Calendar events with blocking work
   - [ ] Blocked dates visible in calendar
   - [ ] Surf week conflict shows proper message
   - [ ] Room occupancy % displays correctly

3. **Admin Backend:**
   - [ ] Block Bookings checkbox saves to DB
   - [ ] Media upload works end-to-end
   - [ ] All admin pages accessible

4. **Frontend:**
   - [ ] Loading states smooth
   - [ ] Phone visible on mobile
   - [ ] All CMS content renders

---

*Plan generated by Claude Code production audit*
