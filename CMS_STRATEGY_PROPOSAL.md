# Content Management Strategy Proposal

## 🎯 Clear Separation of Concerns

Based on your requirement: **CMS manages on-site content ONLY, not booking/widget content**

## Recommended Solution: Move Content CMS to Wavecampdashboard

### Why This Is Best:

1. **Single Admin URL** - One place for all admin tasks (admin.heiwahouse.com)
2. **Clear Separation** - Different sections for content vs bookings
3. **Better Security** - All admin operations behind one authentication
4. **Easier Maintenance** - One deployment for all admin features
5. **No Confusion** - Staff know exactly where to go

## Proposed Structure

### Wavecampdashboard Admin Sections:

```
admin.heiwahouse.com/admin
├── 📊 Dashboard (Overview)
│
├── 🎯 OPERATIONS (Booking Management)
│   ├── Bookings         → Manage all bookings
│   ├── Clients          → Customer database
│   ├── Room Assignments → Room allocations
│   ├── Surf Camps       → Surf week scheduling
│   └── Add-ons          → Additional services
│
└── 📝 CONTENT (Website Content)
    ├── Navigation       → Menu items (ALREADY EXISTS)
    ├── Rooms            → Room descriptions & images (ALREADY EXISTS)
    ├── Experiences      → Activities content (ALREADY EXISTS)
    ├── Pages            → Static page content (ALREADY EXISTS)
    ├── Homepage Sections → Hero, features, testimonials (TO ADD)
    └── Media Library    → Centralized image management (TO ADD)
```

### Customer Website (heiwahouse.com):
```
heiwahouse.com
├── Homepage
├── /rooms
├── /surf-weeks
├── /the-spot
├── /about
├── /terms
├── /privacy
└── (NO /admin - REMOVED)
```

## Implementation Plan

### Phase 1: Verify Existing Content CMS in Wavecampdashboard ✅

Already exists:
- ✅ Navigation Management (`/admin/dashboard/navigation`)
- ✅ Rooms Management (`/admin/dashboard/rooms`)
- ✅ Experiences Management (`/admin/dashboard/experiences`)
- ✅ Pages Management (`/admin/dashboard/pages`)

### Phase 2: Remove Duplicate CMS from Heiwa-Page

**Action**: Delete the `/admin` directory from heiwa-page

**Files to remove**:
```
app/admin/
├── layout.tsx
├── login/
│   └── page.tsx
└── dashboard/
    ├── page.tsx
    ├── navigation/
    │   └── page.tsx
    ├── rooms/
    │   └── page.tsx
    ├── experiences/
    │   └── page.tsx
    └── pages/
        └── page.tsx
```

**Benefits**:
- No duplicate code to maintain
- No confusion about which admin to use
- Cleaner deployment (smaller build)
- Single source of truth

### Phase 3: Enhance Wavecampdashboard Content Section

**Add missing content management features**:

1. **Homepage Content Editor**
   - Hero section (title, subtitle, CTA)
   - Feature cards
   - Testimonials
   - Gallery images

2. **Media Library**
   - Centralized image upload
   - Image optimization
   - Categorization (rooms, surf, facilities)
   - Bulk upload

3. **Menu Management**
   - Already exists but could enhance
   - Add dropdown support
   - External links
   - Icon selection

### Phase 4: Add Content-Only User Role (Optional)

Create a "Content Editor" role that:
- ✅ Can access: Navigation, Rooms, Experiences, Pages, Media
- ❌ Cannot access: Bookings, Clients, Assignments, Surf Camps

**Implementation**:
```typescript
// In wavecampdashboard/src/lib/auth.ts
export const USER_ROLES = {
  ADMIN: 'admin',           // Full access
  CONTENT_EDITOR: 'editor', // Content only
  OPERATIONS: 'operations'  // Bookings only
};

// Protect routes based on role
const CONTENT_ROUTES = ['/admin/navigation', '/admin/rooms', '/admin/experiences', '/admin/pages', '/admin/media'];
const OPERATIONS_ROUTES = ['/admin/bookings', '/admin/clients', '/admin/surfcamps', '/admin/assignments'];
```

## Content vs Operations Matrix

| Feature | Content Editor | Operations Manager | Admin |
|---------|---------------|-------------------|-------|
| Navigation Menu | ✅ Edit | ❌ View Only | ✅ Full |
| Room Descriptions | ✅ Edit | ❌ View Only | ✅ Full |
| Room Pricing | ❌ No Access | ✅ Edit | ✅ Full |
| Experiences | ✅ Edit | ❌ View Only | ✅ Full |
| Pages Content | ✅ Edit | ❌ View Only | ✅ Full |
| Homepage Sections | ✅ Edit | ❌ No Access | ✅ Full |
| Media Library | ✅ Upload/Edit | ❌ View Only | ✅ Full |
| Bookings | ❌ No Access | ✅ Full | ✅ Full |
| Clients | ❌ No Access | ✅ Full | ✅ Full |
| Surf Camps | ❌ No Access | ✅ Full | ✅ Full |
| Add-ons | ❌ No Access | ✅ Edit | ✅ Full |
| Room Assignments | ❌ No Access | ✅ Full | ✅ Full |
| Analytics | ❌ No Access | ✅ View | ✅ Full |

## Database Tables for Content

### Already in Supabase:
```sql
-- Content tables (already exist)
navigation_items    -- Menu items
rooms              -- Room info (needs separation of pricing)
experiences        -- Activities content
pages              -- Static page content

-- Operations tables (already exist)
bookings           -- Customer bookings
clients            -- Customer database
room_assignments   -- Room allocations
surf_week_assignments -- Surf camp bookings
```

### Proposed New Tables for Enhanced CMS:

```sql
-- Homepage content
CREATE TABLE homepage_sections (
  id UUID PRIMARY KEY,
  section_key TEXT UNIQUE, -- 'hero', 'features', 'testimonials'
  content JSONB,           -- Flexible content structure
  order_index INTEGER,
  active BOOLEAN,
  updated_at TIMESTAMPTZ
);

-- Media library
CREATE TABLE media_library (
  id UUID PRIMARY KEY,
  filename TEXT,
  url TEXT,
  alt_text TEXT,
  category TEXT,           -- 'rooms', 'surf', 'facilities', 'general'
  size INTEGER,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ
);

-- Separate pricing from rooms
CREATE TABLE room_pricing (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  season TEXT,            -- 'low', 'mid', 'high', 'peak'
  price_per_night DECIMAL,
  valid_from DATE,
  valid_to DATE,
  active BOOLEAN
);
```

## Recommended Immediate Actions

### ✅ Action 1: Remove Heiwa-Page `/admin` (TODAY)

```bash
cd /Users/lukatenbosch/Downloads/heiwahouse/heiwa-page
rm -rf app/admin
git add -A
git commit -m "refactor: remove duplicate /admin CMS

All admin operations consolidated to wavecampdashboard.
Content CMS accessed via admin.heiwahouse.com"
netlify deploy --prod
```

### ✅ Action 2: Update Wavecampdashboard Navigation (TODAY)

Organize the admin sidebar into clear sections:

```typescript
// In wavecampdashboard navigation
const navigation = [
  {
    section: 'Dashboard',
    items: [
      { name: 'Overview', href: '/admin', icon: HomeIcon }
    ]
  },
  {
    section: 'Content Management',  // NEW SECTION
    items: [
      { name: 'Navigation', href: '/admin/navigation', icon: MenuIcon },
      { name: 'Rooms Content', href: '/admin/rooms', icon: BedIcon },
      { name: 'Experiences', href: '/admin/experiences', icon: ActivityIcon },
      { name: 'Pages', href: '/admin/pages', icon: DocumentIcon },
      { name: 'Media Library', href: '/admin/media', icon: PhotoIcon }, // TO ADD
    ]
  },
  {
    section: 'Operations',
    items: [
      { name: 'Bookings', href: '/admin/bookings', icon: CalendarIcon },
      { name: 'Clients', href: '/admin/clients', icon: UsersIcon },
      { name: 'Room Assignments', href: '/admin/assignments', icon: KeyIcon },
      { name: 'Surf Camps', href: '/admin/surfcamps', icon: WavesIcon },
      { name: 'Add-ons', href: '/admin/addons', icon: PlusIcon },
    ]
  },
  {
    section: 'Settings',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: ChartIcon },
      { name: 'System', href: '/admin/system', icon: CogIcon },
    ]
  }
];
```

### ✅ Action 3: Document the New Structure (TODAY)

Create clear documentation for staff:

**For Content Editors**:
"To update website content, visit admin.heiwahouse.com and navigate to the Content Management section"

**For Operations Staff**:
"To manage bookings and customers, visit admin.heiwahouse.com and navigate to the Operations section"

## Migration Checklist

- [ ] Verify all content CMS features exist in wavecampdashboard
- [ ] Test that content changes in wavecampdashboard appear on heiwahouse.com
- [ ] Remove `/admin` from heiwa-page
- [ ] Redeploy heiwa-page without `/admin`
- [ ] Update wavecampdashboard navigation with clear sections
- [ ] Document new admin structure for team
- [ ] (Optional) Add content editor role restrictions
- [ ] (Future) Add Media Library feature
- [ ] (Future) Add Homepage Content Editor

## Benefits Summary

### ✅ For Content Editors:
- Single login (admin.heiwahouse.com)
- Dedicated "Content Management" section
- No confusion with booking operations
- Familiar interface (same as before)

### ✅ For Operations Staff:
- Single login (admin.heiwahouse.com)
- Dedicated "Operations" section
- No distraction from content features
- Complete booking management

### ✅ For Admins:
- Full access to everything
- Single deployment to manage
- Easier to train staff
- Better security controls

### ✅ For Developers:
- Single codebase for admin
- No duplicate features
- Easier maintenance
- Clearer separation of concerns

## Example User Journeys

### Content Editor Updates Room Description:
1. Visit admin.heiwahouse.com
2. Login
3. Navigate to "Content Management" → "Rooms Content"
4. Select room
5. Edit description & upload images
6. Save
7. Changes appear on heiwahouse.com immediately

### Operations Manager Books a Room:
1. Visit admin.heiwahouse.com
2. Login
3. Navigate to "Operations" → "Bookings"
4. Create new booking
5. Assign room
6. Save
7. Customer receives confirmation

### Admin Updates Pricing:
1. Visit admin.heiwahouse.com
2. Login
3. Navigate to "Operations" → "Surf Camps" (or Rooms with pricing)
4. Edit pricing
5. Save
6. New prices appear on booking widget

## My Strong Recommendation

**Do This**:
1. ✅ Remove `/admin` from heiwa-page immediately
2. ✅ Use wavecampdashboard for ALL admin (content + operations)
3. ✅ Organize nav into "Content" and "Operations" sections
4. ✅ (Optional) Add content editor role later if needed

**Why**:
- ✅ Simpler architecture
- ✅ Single source of truth
- ✅ Less code to maintain
- ✅ Better user experience
- ✅ Clearer separation of concerns

The wavecampdashboard already has ALL the content management features you need. No need to build anything new - just remove the duplicate!
