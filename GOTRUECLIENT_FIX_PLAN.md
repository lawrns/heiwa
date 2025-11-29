# GoTrueClient Multiple Instances Fix Plan

## Problem Analysis

### Issue 1: Multiple GoTrueClient Instances Warning
**Console Warning:**
```
Multiple GoTrueClient instances detected in the same browser context. 
It is not an error, but this should be avoided as it may produce undefined behavior 
when used concurrently under the same storage key.
```

**Root Causes:**
1. **Direct imports bypassing singleton**: Many components import `supabase`/`supabaseAdmin` directly from `@/lib/supabase` instead of using the context
2. **Module-level imports in context**: `lib/supabase-context.tsx` imports clients at module level, which can cause multiple initializations during Next.js hot reload
3. **Server-side and client-side instances**: Both server and client components may be creating instances
4. **Next.js bundling**: Next.js may bundle multiple instances across different chunks

### Issue 2: Surf Weeks vs Surf Camps Terminology
**User Confusion:**
- Database table: `surf_camps`
- Admin page: `/admin/surf-camps` (uses "Surf Camps" terminology)
- Frontend page: `/surf-weeks` (uses "Surf Weeks" terminology)
- **User expected:** "Surf Weeks" terminology in admin to match frontend

---

## Fix Strategy

### Phase 1: Consolidate Supabase Client Usage

#### 1.1 Audit All Direct Imports
**Files to Check:**
- All files importing from `@/lib/supabase` directly
- Components using `supabase` or `supabaseAdmin` directly
- API routes (these are OK - server-side only)

**Action:**
- Create audit script to find all direct imports
- Document which files need to be updated

#### 1.2 Fix Context Provider Pattern
**Current Issue:**
- `lib/supabase-context.tsx` imports clients at module level
- This can cause multiple instances during hot reload

**Fix:**
- Lazy initialize clients only when context is first used
- Ensure context value is truly singleton
- Add instance tracking to detect duplicates

#### 1.3 Update Client Components
**Files to Update:**
- `components/admin/cms/PageEditor.tsx`
- `components/admin/editors/HomepageEditor.tsx`
- `components/admin/cms/VersionHistory.tsx`
- `components/admin/editors/MediaLibrary.tsx`
- `components/admin/enrollments/EnrollmentModal.tsx`
- `app/admin/assignments/page.tsx`

**Action:**
- Ensure all use `useSupabase()` hook from context
- Remove any direct imports of `supabase`/`supabaseAdmin`

#### 1.4 Enhance Singleton Pattern
**Current Implementation:**
- Uses `globalThis` and `window` for singleton
- Has separate storage keys for public/admin clients

**Enhancements:**
- Add instance counter to detect multiple creations
- Add warning/error when multiple instances detected
- Ensure storage keys are truly unique
- Add cleanup on unmount

---

### Phase 2: Fix Terminology (Surf Weeks vs Surf Camps)

#### 2.1 Update Admin UI Terminology
**Files to Update:**
- `app/admin/surf-camps/page.tsx` - Change "Surf Camps" to "Surf Weeks"
- `app/admin/surf-camps/new/page.tsx` - Update labels
- `app/admin/surf-camps/[id]/page.tsx` - Update labels
- `app/admin/surf-camps/[id]/edit/page.tsx` - Update labels
- Navigation menu - Update "Surf Camp" to "Surf Weeks"

**Action:**
- Change all user-facing text from "Surf Camps" to "Surf Weeks"
- Keep database table name as `surf_camps` (no migration needed)
- Keep API routes as `/api/surf-camps` (no breaking changes)
- Update page titles, headings, labels

#### 2.2 Update Type Definitions
**Files to Update:**
- `lib/schemas.ts` - Update type names if needed
- Component interfaces - Update prop names/comments

**Action:**
- Ensure type names match terminology
- Update comments/documentation

---

## Implementation Plan

### Step 1: Create Supabase Client Audit Script
**File:** `scripts/audit-supabase-imports.js`
- Scan all files for direct imports
- List files that should use context instead
- Generate report

### Step 2: Fix Singleton Pattern
**File:** `lib/supabase.ts`
- Enhance singleton detection
- Add instance tracking
- Improve error messages

### Step 3: Fix Context Provider
**File:** `lib/supabase-context.tsx`
- Lazy initialize clients
- Ensure true singleton
- Add instance tracking

### Step 4: Update Client Components
**Files:** All admin components
- Replace direct imports with `useSupabase()` hook
- Ensure proper context usage

### Step 5: Update Terminology
**Files:** Admin surf camps pages
- Change "Surf Camps" → "Surf Weeks" in UI
- Update navigation labels
- Update page titles

### Step 6: Add Runtime Detection
**File:** `lib/supabase.ts` or new `lib/supabase-monitor.ts`
- Add runtime check for multiple instances
- Log warning with stack trace
- Provide actionable error message

---

## Files to Modify

### Core Files:
1. `lib/supabase.ts` - Enhance singleton pattern
2. `lib/supabase-context.tsx` - Fix context provider
3. `app/layout.tsx` - Ensure SupabaseProvider wraps app

### Admin Components:
4. `components/admin/cms/PageEditor.tsx`
5. `components/admin/editors/HomepageEditor.tsx`
6. `components/admin/cms/VersionHistory.tsx`
7. `components/admin/editors/MediaLibrary.tsx`
8. `components/admin/enrollments/EnrollmentModal.tsx`
9. `app/admin/assignments/page.tsx`

### Terminology Updates:
10. `app/admin/surf-camps/page.tsx`
11. `app/admin/surf-camps/new/page.tsx`
12. `app/admin/surf-camps/[id]/page.tsx`
13. `app/admin/surf-camps/[id]/edit/page.tsx`
14. Navigation component (wherever it's defined)

### New Files:
15. `scripts/audit-supabase-imports.js` - Audit script
16. `lib/supabase-monitor.ts` - Runtime monitoring (optional)

---

## Success Criteria

### GoTrueClient Fix:
- ✅ No console warnings about multiple GoTrueClient instances
- ✅ Only one instance created per client type (public/admin)
- ✅ All client components use context hook
- ✅ Singleton pattern works across hot reloads
- ✅ Instance tracking confirms single instance

### Terminology Fix:
- ✅ Admin UI shows "Surf Weeks" instead of "Surf Camps"
- ✅ Navigation menu updated
- ✅ Page titles updated
- ✅ All labels updated
- ✅ Database table name unchanged (no migration needed)
- ✅ API routes unchanged (no breaking changes)

---

## Testing Plan

### GoTrueClient Fix:
1. **Clear browser cache** - Ensure fresh start
2. **Open browser console** - Check for warnings
3. **Navigate admin pages** - Verify no warnings
4. **Hot reload test** - Verify singleton persists
5. **Multiple tab test** - Verify separate instances per tab (expected)

### Terminology Fix:
1. **Visual inspection** - Check admin pages show "Surf Weeks"
2. **Navigation check** - Verify menu updated
3. **Page titles** - Verify browser titles updated
4. **Functionality test** - Verify CRUD operations still work

---

## Notes

- **API Routes:** Server-side imports are OK - they don't cause GoTrueClient warnings
- **Database:** Keep `surf_camps` table name - no migration needed
- **API Routes:** Keep `/api/surf-camps` - no breaking changes
- **Backward Compatibility:** Only UI changes, no data/API changes

---

## Priority

1. **High:** GoTrueClient fix (affects console warnings)
2. **Medium:** Terminology fix (user experience improvement)

---

## Estimated Time

- **GoTrueClient Fix:** 2-3 hours
- **Terminology Fix:** 1 hour
- **Testing:** 1 hour
- **Total:** 4-5 hours







