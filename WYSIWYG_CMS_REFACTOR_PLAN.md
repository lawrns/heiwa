# WYSIWYG CMS Refactor Plan (Refined)

## Problem Summary

The current CMS is broken in several ways:
- **Data mismatch**: CMS sections use different column names (`section_type` vs `section`) and store data in inconsistent places (`content`, `json_content`, direct fields)
- **Unusable editor**: Generic section forms don't match what each page actually needs
- **Disconnected from frontend**: No visual feedback - admins can't see what their edits will look like
- **Too abstract**: Section types like "hero", "intro", "features" are meaningless without context
- **CRITICAL: Hardcoded content**: ActivityHighlight sections are hardcoded in pages, not CMS-driven

## Current State (Verified)

### Database Schema (`page_content` table)
```
- id, page_slug, section, section_name, section_type
- title, content, json_content (JSONB)
- video_url, image_url
- is_active, order_index
- CHECK constraint: section IN ('hero', 'intro', 'faq', 'features', 'seo')
- CHECK constraint: page_slug IN ('flow', 'play', 'surf', 'the-spot', 'privacy', 'terms', 'surf-weeks', 'about', 'contact')
```

### Existing Content (23 sections across 7 pages)
- about: hero, intro, features, seo
- contact: intro, faq
- flow: hero, intro, faq, features
- play: hero, intro, faq, features, seo
- surf: hero, intro, faq, features
- surf-weeks: hero, intro
- the-spot: features, seo

### Pages Using CMS + Hardcoded Content
| Page | CMS Sections | Hardcoded Sections |
|------|--------------|-------------------|
| /flow | hero, intro | 4x ActivityHighlight (Yoga Dome, Sauna, Yoga Lessons, Massages), 2x ActivityGrid |
| /play | hero, intro, faq | 2x ActivityHighlight (Skateboarding, Music), 2x ActivityGrid |
| /surf | hero, intro, faq | Multiple custom sections (local break, surf lessons, world-class surfing) |
| /the-spot | features | Mostly hardcoded |
| /about | hero, intro, features | Mostly hardcoded |
| /contact | intro, faq | Contact form + map |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Visual Editor                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Page Preview                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ [Click any section to edit]                         │ │   │
│  │  │                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────┐   │ │   │
│  │  │  │ Hero Section              [Edit] [↑] [↓] [×]│   │ │   │
│  │  │  └─────────────────────────────────────────────┘   │ │   │
│  │  │                                                     │ │   │
│  │  │  ┌─────────────────────────────────────────────┐   │ │   │
│  │  │  │ Activity Highlight         [Edit] [↑] [↓] [×]│  │ │   │
│  │  │  └─────────────────────────────────────────────┘   │ │   │
│  │  │                                                     │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [+ Add Section]                                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Side Panel Editor (appears when section selected)        │   │
│  │ ┌────────────────────────────────────────────────────┐  │   │
│  │ │ Hero Editor                                        │  │   │
│  │ │ ─────────────────────────────────────────────────  │  │   │
│  │ │ Title: [________________________]                  │  │   │
│  │ │ Description: [____________________]                │  │   │
│  │ │ Video: [Choose File] or [Enter URL]               │  │   │
│  │ │ Background: [Choose Image]                        │  │   │
│  │ │                                                    │  │   │
│  │ │ [Save] [Cancel]                                   │  │   │
│  │ └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Revised Implementation Plan

### Phase 0: Database Schema Migration (Do First!)
**Goal**: Clean foundation before building any UI

1. Create new `page_sections` table (cleaner schema)
2. Migrate existing data from `page_content`
3. Update API endpoints to use new table
4. Keep old table for rollback

```sql
-- New table with expanded section types
CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(50) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_page_slug CHECK (page_slug IN (
    'flow', 'play', 'surf', 'the-spot', 'about', 'contact', 'surf-weeks', 'privacy', 'terms', 'homepage'
  )),
  CONSTRAINT valid_section_type CHECK (section_type IN (
    'hero', 'intro', 'faq', 'features', 'seo', 'cta',
    'activity_highlight', 'activity_grid',
    'text_block', 'image_gallery', 'video_embed',
    'testimonials', 'custom'
  ))
);

CREATE INDEX idx_page_sections_slug ON page_sections(page_slug);
CREATE INDEX idx_page_sections_active ON page_sections(page_slug, is_active);
CREATE INDEX idx_page_sections_order ON page_sections(page_slug, order_index);

-- Enable RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read active sections" ON page_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access" ON page_sections
  FOR ALL USING (true);
```

**Content JSON Schemas** (defined in TypeScript):
```typescript
// Hero Section
interface HeroContent {
  title: string;
  description: string;
  videoUrl?: string;
  imageUrl?: string;
  overlayOpacity?: number; // 0-100
}

// Activity Highlight
interface ActivityHighlightContent {
  title: string;
  description: string;
  videoUrl: string;
  videoPoster: string;
  carouselImages: string[]; // 3 images
  reversed?: boolean;
}

// FAQ Section
interface FAQContent {
  title?: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

// Activity Grid
interface ActivityGridContent {
  title: string;
  description?: string;
  category: 'flow' | 'play' | 'surf';
  tier: 'always' | 'on-request';
  showTierBadge?: boolean;
}

// Intro Section
interface IntroContent {
  title?: string;
  content: string; // Rich text HTML
}

// CTA Section
interface CTAContent {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
}
```

**Key files:**
- `migrations/001_create_page_sections.sql`
- `scripts/migrate-page-content.ts`
- `lib/cms-schemas.ts` (Zod validation schemas)

### Phase 1: Visual Editor Framework
**Goal**: Admin can see live preview and click sections to edit

1. Create `/admin/visual-editor/[slug]` route
2. Build page preview component (renders actual page, not iframe)
3. Add edit overlay system (click detection + highlight)
4. Implement side panel with section-specific editors
5. Add section reordering (drag-and-drop or up/down buttons)

**Key files:**
- `app/admin/visual-editor/[slug]/page.tsx`
- `components/admin/visual-editor/VisualEditor.tsx`
- `components/admin/visual-editor/EditableSection.tsx`
- `components/admin/visual-editor/SectionOverlay.tsx`
- `components/admin/visual-editor/SidePanel.tsx`

**API Endpoints:**
```
GET  /api/cms/pages/[slug]/sections - Get all sections for page
POST /api/cms/pages/[slug]/sections - Create new section
PUT  /api/cms/sections/[id] - Update section content
DELETE /api/cms/sections/[id] - Soft delete section
PUT  /api/cms/sections/reorder - Reorder sections
```

### Phase 2: Section-Specific Editors
**Goal**: Smart forms that match actual frontend components

| Editor | Fields | Used By |
|--------|--------|---------|
| HeroEditor | title, description, videoUrl, imageUrl, overlayOpacity | All pages |
| IntroEditor | title, rich text content | All pages |
| ActivityHighlightEditor | title, description, video, poster, 3 carousel images, reversed | flow, play |
| ActivityGridEditor | title, description, category, tier | flow, play, surf |
| FAQEditor | title, Q&A pairs (add/remove) | All pages |
| CTAEditor | title, description, button text, button URL | All pages |
| FeaturesEditor | feature cards (icon, title, description) | about, the-spot |

**Key files:**
- `components/admin/visual-editor/editors/HeroEditor.tsx`
- `components/admin/visual-editor/editors/IntroEditor.tsx`
- `components/admin/visual-editor/editors/ActivityHighlightEditor.tsx`
- `components/admin/visual-editor/editors/ActivityGridEditor.tsx`
- `components/admin/visual-editor/editors/FAQEditor.tsx`
- `components/admin/visual-editor/editors/CTAEditor.tsx`
- `components/admin/visual-editor/editors/FeaturesEditor.tsx`
- `components/admin/visual-editor/EditorRegistry.tsx` (maps section_type to editor)

### Phase 3: Frontend Integration
**Goal**: Pages consume CMS data instead of hardcoded content

1. Update page components to fetch from new API
2. Replace hardcoded ActivityHighlight with CMS-driven rendering
3. Add `data-editable` attributes for edit mode
4. Create reusable section renderer component

**Migration per page:**

**Flow Page:**
```tsx
// Before (hardcoded)
<ActivityHighlight
  title="Yoga Dome"
  description="Practice in our beautiful..."
  videoUrl="/optimized/videos/video_004.mp4"
  ...
/>

// After (CMS-driven)
{sections
  .filter(s => s.section_type === 'activity_highlight')
  .map(section => (
    <ActivityHighlight
      key={section.id}
      data-editable="activity_highlight"
      data-section-id={section.id}
      {...section.content}
    />
  ))}
```

**Key files to modify:**
- `app/flow/page.tsx` - Add CMS sections, remove hardcoded content
- `app/play/page.tsx` - Add CMS sections, remove hardcoded content
- `app/surf/page.tsx` - Add CMS sections
- `app/the-spot/page.tsx` - Add CMS sections
- `app/about/page.tsx` - Add CMS sections
- `app/contact/page.tsx` - Add CMS sections
- `components/cms/SectionRenderer.tsx` - New component to render any section type

### Phase 4: Media Management
**Goal**: Easy image/video selection in editors

1. Build media picker modal
2. Integrate Supabase storage upload
3. Add image preview and cropping
4. Video URL validation and preview

**Key files:**
- `components/admin/visual-editor/MediaPicker.tsx`
- `components/admin/visual-editor/ImageUploader.tsx`
- `components/admin/visual-editor/VideoUrlInput.tsx`

## Data Migration Plan

### Step 1: Create new table (Phase 0)
```sql
-- Run migration: migrations/001_create_page_sections.sql
```

### Step 2: Migrate existing data
```typescript
// scripts/migrate-page-content.ts

// Transform page_content rows to new format
const migrationMap = {
  hero: (row) => ({
    title: row.json_content?.title || row.title,
    description: row.json_content?.description || row.content,
    videoUrl: row.video_url || row.json_content?.video_url,
    imageUrl: row.image_url || row.json_content?.image_url,
  }),
  intro: (row) => ({
    title: row.title,
    content: row.content || row.json_content?.text || row.json_content?.html,
  }),
  faq: (row) => ({
    title: row.title,
    items: row.json_content?.items || [],
  }),
  // ... etc
};
```

### Step 3: Add hardcoded content to database
```typescript
// scripts/seed-activity-highlights.ts

// Insert ActivityHighlight sections for Flow page
const flowHighlights = [
  {
    page_slug: 'flow',
    section_type: 'activity_highlight',
    order_index: 10, // After intro
    content: {
      title: 'Yoga Dome',
      description: 'Practice in our beautiful geodesic dome...',
      videoUrl: '/optimized/videos/video_004_location2.mp4',
      videoPoster: '/images/yoga_dome1.jpg',
      carouselImages: ['/images/yoga_dome1.jpg', '/images/yoga_dome2.jpg', '/images/yoga_dome3.jpg'],
      reversed: false,
    },
  },
  // ... more highlights
];
```

## API Design

### GET /api/cms/pages/[slug]/sections
```typescript
// Response
{
  success: true,
  data: [
    {
      id: "uuid",
      page_slug: "flow",
      section_type: "hero",
      content: { title: "...", description: "...", videoUrl: "..." },
      order_index: 0,
      is_active: true,
    },
    // ... more sections
  ]
}
```

### POST /api/cms/pages/[slug]/sections
```typescript
// Request
{
  section_type: "activity_highlight",
  content: { title: "...", description: "...", ... },
  order_index: 5
}

// Response
{
  success: true,
  data: { id: "new-uuid", ... }
}
```

### PUT /api/cms/sections/[id]
```typescript
// Request
{
  content: { title: "Updated Title", ... }
}

// Response
{
  success: true,
  data: { id: "uuid", ... }
}
```

### PUT /api/cms/sections/reorder
```typescript
// Request
{
  sections: [
    { id: "uuid-1", order_index: 0 },
    { id: "uuid-2", order_index: 1 },
    // ...
  ]
}

// Response
{
  success: true
}
```

## Component Architecture

```
components/admin/visual-editor/
├── VisualEditor.tsx           # Main editor container
├── PagePreview.tsx            # Renders page with edit overlays
├── SectionOverlay.tsx         # Click detection + highlight border
├── SidePanel.tsx              # Editor panel container
├── SectionToolbar.tsx         # Add/reorder/delete controls
├── EditorRegistry.tsx         # Maps section_type to editor component
├── editors/
│   ├── BaseEditor.tsx         # Shared editor wrapper
│   ├── HeroEditor.tsx
│   ├── IntroEditor.tsx
│   ├── ActivityHighlightEditor.tsx
│   ├── ActivityGridEditor.tsx
│   ├── FAQEditor.tsx
│   ├── CTAEditor.tsx
│   └── FeaturesEditor.tsx
├── MediaPicker.tsx
├── ImageUploader.tsx
└── hooks/
    ├── useSections.ts         # Fetch/update sections
    ├── useAutoSave.ts         # Debounced save
    └── useUndoRedo.ts         # Undo/redo stack
```

## Success Criteria

- [ ] Phase 0: New `page_sections` table created and populated
- [ ] Phase 0: All existing content migrated successfully
- [ ] Phase 0: Hardcoded ActivityHighlight content in database
- [ ] Phase 1: Admin can view live preview of any page
- [ ] Phase 1: Admin can click sections to select them
- [ ] Phase 1: Side panel opens with correct editor
- [ ] Phase 1: Admin can reorder sections
- [ ] Phase 2: All 7 section editors working
- [ ] Phase 2: Changes save to database
- [ ] Phase 2: Live preview updates on change
- [ ] Phase 3: Flow page renders from CMS (no hardcoded ActivityHighlights)
- [ ] Phase 3: Play page renders from CMS
- [ ] Phase 3: All pages have `data-editable` attributes
- [ ] Phase 4: Media picker integrated in editors
- [ ] Phase 4: Upload to Supabase storage working

## Technical Considerations

### State Management
- React Query for server state (sections, media)
- Local state for editor form values
- Optimistic updates with rollback on error

### Performance
- Debounce auto-save (2 seconds)
- Lazy load editors
- Cache page preview
- Virtualize long section lists

### Security
- All endpoints require admin authentication
- Validate JSON schemas on save
- Sanitize HTML in rich text
- Rate limit mutations

### Rollback Plan
1. Keep `page_content` table during migration
2. API supports reading from both tables
3. Flag to switch between old/new
4. Rollback script to copy data back

## Execution Order

1. **Phase 0** - Database migration (foundation)
2. **Phase 1** - Visual editor framework (admin UX)
3. **Phase 2** - Section editors (edit functionality)
4. **Phase 3** - Frontend integration (consume CMS data)
5. **Phase 4** - Media management (polish)

Each phase is independently deployable and valuable.

