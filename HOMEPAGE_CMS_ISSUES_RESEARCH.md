# Homepage CMS Integration Issues - Research & Analysis

## Executive Summary

The homepage CMS editor appears to work, but changes don't reflect on the frontend. This is because:
1. The admin editor uses mock data and doesn't save to the database
2. The frontend homepage uses hardcoded static data instead of fetching from CMS
3. There's a disconnect between the admin interface and the actual content delivery

## Issues Identified

### Issue #1: Frontend Not Updating from CMS Changes ⚠️ CRITICAL

**Symptom**: Editing content in the admin panel has no effect on the homepage

**Root Cause**: 
- File: `/app/page.tsx` (lines 23-35)
- The homepage uses hardcoded static arrays for `surfWeeks` and `reviews`
- No API calls to fetch CMS data
- Frontend is completely disconnected from the admin CMS

**Evidence**:
```typescript
// app/page.tsx - Lines 23-35
const surfWeeks = [
  { id: '1', dates: '01 Feb. - 12 Feb.', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
  { id: '2', dates: '01 May - 12 May', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
  { id: '3', dates: '01 May - 12 May', price: 'From €485', availableSpots: '5/18', totalSpots: 18 },
]

const reviews = [
  { id: '1', name: 'Jesús MR', rating: 5, text: 'Amazing experience...', timeAgo: '6 days ago', verified: true },
  // ... more hardcoded reviews
]
```

**Impact**: HIGH - Users cannot manage homepage content through CMS

---

### Issue #2: Admin Homepage Editor Not Saving ⚠️ CRITICAL

**Symptom**: Clicking "Save Changes" shows success but doesn't persist data

**Root Cause**:
- File: `/app/admin/homepage/page.tsx`
- Line 30: `// TODO: Fetch homepage content from API`
- Line 99: `// TODO: Implement actual API call to save homepage content`
- Using mock data with 1-second timeout simulation
- Save handler is a no-op that only logs to console

**Evidence**:
```typescript
// app/admin/homepage/page.tsx - Lines 96-109
const handleSave = async () => {
  setSaving(true)
  try {
    // TODO: Implement actual API call to save homepage content
    console.log('Saving homepage content:', content)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    alert('Homepage content saved successfully!')
  } catch (error) {
    console.error('Error saving content:', error)
    alert('Error saving content. Please try again.')
  } finally {
    setSaving(false)
  }
}
```

**Impact**: HIGH - Admin changes are never persisted

---

### Issue #3: Multiple GoTrueClient Instances ⚠️ WARNING

**Symptom**: Console warning: "Multiple GoTrueClient instances detected in the same browser context"

**Root Cause**:
- Supabase client being instantiated multiple times across different files
- Each component/page may be creating its own Supabase instance
- No singleton pattern or context provider for shared client

**Impact**: MEDIUM - May cause undefined behavior in authentication

**Solution**: Implement Supabase client as singleton or use React Context

---

### Issue #4: Missing Images (404 Errors) ⚠️ WARNING

**Symptom**: Console errors for missing images:
- `photography_007_dsc03081-enhanced-nr-scaled.webp` - 404
- `photography_009_dsc03491.webp` - 404

**Root Cause**:
- Images referenced in homepage but not present in `/public/optimized/` folder
- Image paths may be incorrect or images not uploaded

**Impact**: LOW - Visual degradation, but site still functional

---

### Issue #5: YouTube Blocking (Not an Issue)

**Symptom**: Multiple console errors about YouTube requests being blocked
- `www.youtube.com/youtubei/v1/log_event?alt=json` - ERR_BLOCKED_BY_CLIENT
- `play.google.com/log?hasfast=true` - ERR_BLOCKED_BY_CLIENT

**Root Cause**: 
- Ad blocker or privacy extension blocking YouTube tracking
- This is normal and expected behavior

**Impact**: NONE - No action needed

---

## Architecture Issues

### Current Architecture (Broken)

```
Admin Panel (Edit Content)
    ↓
Mock Data (Not Saved)
    ↓
No Database Persistence
    ↓
Frontend (Hardcoded Data)
    ↓
User Sees Old Content
```

### Required Architecture (Fixed)

```
Admin Panel (Edit Content)
    ↓
API Endpoint (/api/admin/homepage)
    ↓
Database (Supabase)
    ↓
Frontend API Call
    ↓
Dynamic Content Display
```

---

## Required Fixes

### Fix #1: Create Homepage Content API Endpoint

**File**: `/app/api/admin/homepage/route.ts` (NEW)

```typescript
// GET - Fetch homepage content
// POST - Create new section
// PUT - Update section
// DELETE - Delete section
```

### Fix #2: Update Admin Homepage Editor

**File**: `/app/admin/homepage/page.tsx`

- Replace mock data loading with API call
- Implement actual save functionality
- Add proper error handling
- Add success/error notifications

### Fix #3: Update Frontend Homepage

**File**: `/app/page.tsx`

- Replace hardcoded arrays with API calls
- Fetch `surfWeeks` from CMS
- Fetch `reviews` from CMS
- Add loading states and error handling
- Implement caching strategy

### Fix #4: Fix Supabase Client Instantiation

**File**: `/lib/supabase.ts`

- Implement singleton pattern
- Or create React Context provider
- Ensure single instance across app

### Fix #5: Add Missing Images

**Action**: 
- Verify image paths in `/public/optimized/`
- Add missing photography images
- Update image references if paths are wrong

---

## Implementation Priority

1. **CRITICAL** - Create homepage API endpoint
2. **CRITICAL** - Update admin editor to use API
3. **CRITICAL** - Update frontend to fetch from CMS
4. **HIGH** - Fix Supabase client instantiation
5. **MEDIUM** - Add missing images

---

## Testing Strategy

After fixes:

1. **Admin Panel Test**:
   - Edit homepage content
   - Click Save
   - Verify data persists (check database)
   - Refresh admin page
   - Verify data still there

2. **Frontend Test**:
   - Navigate to homepage
   - Verify content matches admin panel
   - Edit admin content
   - Refresh frontend
   - Verify changes appear

3. **Performance Test**:
   - Check API response times
   - Verify caching works
   - Monitor bundle size

---

## Database Schema Required

```sql
CREATE TABLE homepage_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section)
);
```

---

## Estimated Effort

- API Endpoint: 1-2 hours
- Admin Editor Update: 1-2 hours
- Frontend Update: 1-2 hours
- Supabase Client Fix: 30 minutes
- Image Management: 30 minutes
- Testing: 1 hour

**Total**: 5-8 hours

---

## Conclusion

The homepage CMS appears functional but is completely disconnected from the actual content delivery. The admin interface is a UI-only mock that doesn't persist data, and the frontend ignores the CMS entirely. These are fundamental architectural issues that must be fixed for the CMS to work properly.

The fixes are straightforward but require careful implementation to ensure data consistency and performance.
