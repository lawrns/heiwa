# Plan to Implement Surf Weeks CMS Content Management

## Overview
The user wants to edit content sections on the `/surf-weeks` page via CMS, similar to how other pages (Flow, Play, Surf) work. Currently, `/surf-weeks` content is hardcoded.

## Implementation Strategy

### Phase 1: Database Setup (If needed)
- Check if `pages` table exists with "surf-weeks" entry
- If not, add database migration to create the entry

### Phase 2: Update Admin CMS Pages
**File**: `app/admin/cms/pages/page.tsx`
- Add "Surf Weeks" as a new page entry in the pages array
- Point to: `/admin/cms/pages/surf-weeks`
- Description: "Manage surf weeks listing and content sections"

### Phase 3: Create Surf Weeks Page Editor
**Files to create/modify**:
- `app/admin/cms/pages/[slug]/page.tsx` - Already exists, will handle `[slug]=surf-weeks`
- May need to check if PageEditor component properly handles "surf-weeks" slug

### Phase 4: Update Frontend Component
**File**: `app/(customer)/surf-weeks/page.tsx`
- Fetch CMS content for "surf-weeks" page
- Parse sections and render dynamically
- Fallback to default/hardcoded content if CMS data not available

### Phase 5: Content Structure
Define CMS sections for `/surf-weeks`:

```json
{
  "slug": "surf-weeks",
  "title": "Surf Weeks",
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "order": 0,
      "content": {
        "title": "Surf Weeks",
        "description": "We strive to deliver...",
        "image": "..."
      }
    },
    {
      "id": "available-weeks",
      "type": "table",
      "order": 1,
      "content": {
        "title": "Available Surf Weeks",
        "description": "Choose your perfect week..."
      }
    },
    {
      "id": "how-it-works",
      "type": "steps",
      "order": 2,
      "content": {
        "title": "How a surf week works",
        "steps": [...]
      }
    },
    // ... more sections
  ]
}
```

---

## Implementation Steps

### Step 1: Check Database
```sql
SELECT * FROM pages WHERE slug = 'surf-weeks';
```

### Step 2: Add Page Entry (if missing)
Update `app/admin/cms/pages/page.tsx` to include Surf Weeks:

```typescript
{
  slug: 'surf-weeks',
  title: 'Surf Weeks',
  description: 'Manage surf weeks listing and content sections',
  sectionCount: 0,
  lastModified: 'Never',
  status: 'published'
}
```

### Step 3: Verify PageEditor Component
Check `components/admin/PageEditor.tsx` to ensure it:
- Handles "surf-weeks" slug correctly
- Fetches sections from database
- Allows editing, adding, deleting sections

### Step 4: Update Frontend
Modify `app/(customer)/surf-weeks/page.tsx` to:
- Fetch CMS content via `supabaseAdmin.from('pages')`
- Extract sections with `slug = 'surf-weeks'`
- Render sections dynamically
- Keep current UI as fallback

### Step 5: Test
- Navigate to `/admin/cms/pages/surf-weeks`
- Verify page loads and sections are editable
- Add/edit/delete sections
- Verify changes appear on `/surf-weeks`

---

## Files Affected

### To Create:
- None (existing components should handle it)

### To Modify:
1. `app/admin/cms/pages/page.tsx` - Add Surf Weeks entry
2. `app/(customer)/surf-weeks/page.tsx` - Fetch CMS content

### Already Exists & Should Work:
- `app/admin/cms/pages/[slug]/page.tsx` - Page editor
- `components/admin/PageEditor.tsx` - Section management
- Database schema - Should already support

---

## Timeline
- Phase 1: 5 min
- Phase 2: 5 min
- Phase 3: 10 min (just verify, already exists)
- Phase 4: 30 min (implement fetching logic)
- Phase 5: Testing & refinement: 15 min

**Total: ~1 hour**

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Hardcoded values break | Keep fallback content |
| Database entry doesn't exist | Create it programmatically |
| PageEditor doesn't handle new slug | Check logs and verify component |
| Sections don't sync to frontend | Test fetch logic thoroughly |

---

## Success Criteria

✅ User can navigate to `/admin/cms/pages/surf-weeks`
✅ User can edit/add/delete content sections
✅ Changes appear on `/surf-weeks` without redeploying
✅ Fallback content shows if CMS data unavailable
✅ No console errors


