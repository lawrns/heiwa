# Inline CMS Editor Design

## Overview

A WordPress-style inline editing system where admins can browse the public site and edit content directly through a sidebar editor.

## User Experience

1. Admin logs in and browses the public site
2. A floating toolbar appears at the bottom: "Logged in as Admin | [Edit Page] | [Dashboard]"
3. Clicking "Edit Page" opens a right sidebar (~400px)
4. Sidebar shows list of sections on current page
5. Clicking a section scrolls to it, highlights it with orange border, shows form editor
6. Admin edits fields, clicks Save
7. Changes are saved to database and page updates

## Pages Covered

- Homepage (`home`)
- Flow (`flow`)
- Play (`play`)
- Surf (`surf`)
- Contact (`contact`)
- The-Spot (`the-spot`)
- About (`about`)
- Surf-Weeks (`surf-weeks`)

## Database Schema

Single table: `page_sections`

```sql
CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(50) NOT NULL,
  section_key VARCHAR(50) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(page_slug, section_key)
);
```

## API Design

Single endpoint: `/api/cms/sections`

- `GET /api/cms/sections?page={slug}` - Get all sections for a page
- `PUT /api/cms/sections/[id]` - Update a section
- `POST /api/cms/sections` - Create new section
- `DELETE /api/cms/sections/[id]` - Delete section

## Component Structure

```
components/
  admin/
    inline-editor/
      AdminToolbar.tsx      -- Floating bottom bar
      EditSidebar.tsx       -- Right sidebar with section list + form
      SectionHighlight.tsx  -- Orange border wrapper
      editors/
        HeroEditor.tsx
        CardsEditor.tsx
        TextEditor.tsx
        FacilitiesEditor.tsx
```

## Section Content Schemas

### Hero Section
```json
{
  "title": "Welcome to Heiwa House",
  "subtitle": "Your surf and lifestyle destination",
  "description": "",
  "video_url": "https://...",
  "image_url": "",
  "primary_link_url": "/surf-weeks",
  "primary_link_text": "Come for a Surf Camp",
  "secondary_link_url": "/rooms",
  "secondary_link_text": "Rent a Room"
}
```

### Cards Section (About, Rooms)
```json
{
  "title": "What we are about",
  "subtitle": "",
  "cards": [
    { "title": "Play", "description": "...", "image": "/images/...", "link": "/play" }
  ]
}
```

### Text Section
```json
{
  "title": "Section Title",
  "subtitle": "Optional subtitle",
  "description": "Body text..."
}
```

### Facilities Section
```json
{
  "title": "Activities Around",
  "subtitle": "",
  "facilities": [
    { "title": "Surf Lessons", "description": "...", "image": "/images/..." }
  ]
}
```

## Cleanup Required

Delete old CMS code:
- `/api/cms/homepage/route.ts`
- `/api/admin/homepage/route.ts`
- `/api/cms/page-content/route.ts`
- `/api/cms/pages/[slug]/sections/route.ts`
- `/api/cms/sections/[id]/route.ts`
- `/api/cms/sections/reorder/route.ts`
- `/admin/visual-editor/`
- `/admin/homepage/page.tsx`
- Old editor components in `components/admin/visual-editor/`

## Migration Strategy

1. Create new `page_sections` table
2. Seed with hardcoded default content from existing page code
3. Update pages to read from new table
4. Delete old tables after verification: `homepage_content`, `homepage_sections`, `page_content`
