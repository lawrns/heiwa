# Full-Site Inline CMS Expansion Design

## Overview

Extend the existing inline CMS to provide complete editorial control over ALL marketing content across the Heiwa House website. This is a component-bound CMS (not a page builder) where content slots are tied to existing React components.

## Design Principles

1. **Marketing content only** - Database-driven content (surf camps, rooms, bookings) stays as-is
2. **Component-bound** - Content slots tied to existing components, not arbitrary page building
3. **Hybrid editing** - Simple fields inline, complex fields in sidebar panel
4. **Auto-save** - Changes persist automatically with debounce
5. **Non-destructive** - Version history and defaults loading for safety

## Current State Analysis

### Existing Infrastructure
- `page_sections` table with JSONB `content` column
- `usePageSection` hook for fetching/updating sections
- `AdminToolbar` component for toggling edit mode
- `InlineEditor` component for text editing
- Working implementation on homepage hero section

### Gaps Identified
1. **Coverage** - Only hero section implemented, 60+ strings and images hardcoded
2. **Image editing** - No click-to-replace functionality
3. **Complex fields** - No sidebar editor for arrays/nested objects
4. **Version control** - No history or defaults restoration
5. **Schema enforcement** - Zod schemas exist but not consistently applied

## Architecture

### Database Schema

```sql
-- Existing table (no changes needed)
CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_key)
);

-- New: Version history table
CREATE TABLE page_section_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES page_sections(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- New: Default content table (for reset functionality)
CREATE TABLE page_section_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  content JSONB NOT NULL,
  UNIQUE(page_slug, section_key)
);
```

### Component Structure

```
lib/cms/
├── schemas/                    # Zod schemas per section
│   ├── home.ts                # Home page sections
│   ├── surf.ts                # Surf page sections
│   ├── surf-weeks.ts          # Surf weeks sections
│   ├── the-spot.ts            # The Spot sections
│   └── index.ts               # Schema registry
├── hooks/
│   ├── usePageSection.ts      # Existing - fetch/update section
│   ├── useSectionHistory.ts   # New - version history
│   └── useMediaLibrary.ts     # New - image selection
└── defaults/                   # Default content per section
    ├── home.ts
    ├── surf.ts
    └── ...

components/admin/inline-editor/
├── AdminToolbar.tsx           # Existing - enhanced
├── InlineText.tsx             # New - inline text editing
├── InlineImage.tsx            # New - click-to-replace images
├── SidebarEditor.tsx          # New - complex field editing
├── MediaLibrary.tsx           # New - image selection modal
├── VersionHistory.tsx         # New - restore previous versions
└── SaveIndicator.tsx          # New - auto-save status
```

## Editing UX

### Text Editing (Inline)

```tsx
// Usage in component
<InlineText
  sectionKey="hero"
  field="headline"
  defaultValue="Welcome to Heiwa House"
  className="text-4xl font-bold"
  as="h1"
/>
```

Behavior:
- Click text to enter edit mode (contentEditable)
- Auto-save after 500ms debounce
- Escape to cancel, blur to save
- Visual indicator: subtle border on hover when admin

### Image Editing (Click to Replace)

```tsx
// Usage in component
<InlineImage
  sectionKey="hero"
  field="backgroundImage"
  defaultSrc="/images/hero-default.jpg"
  alt="Hero background"
  className="w-full h-[600px] object-cover"
/>
```

Behavior:
- Click image opens media library modal
- Select from existing uploads or upload new
- Preview before confirming
- Auto-save on selection

### Complex Fields (Sidebar)

For arrays (testimonials, features list) and nested objects:

```tsx
// In sidebar editor
<SidebarEditor sectionKey="testimonials">
  <ArrayField
    field="items"
    renderItem={(item, index) => (
      <TestimonialEditor item={item} index={index} />
    )}
    addLabel="Add Testimonial"
  />
</SidebarEditor>
```

### Admin Toolbar (Enhanced)

```
┌─────────────────────────────────────────────────────────┐
│ [Edit Mode: ON] [Sidebar] [History] [Reset] [Saving...] │
└─────────────────────────────────────────────────────────┘
```

- Edit Mode toggle: Enables/disables inline editing
- Sidebar: Opens panel for complex field editing
- History: Shows version history with restore options
- Reset: Loads default content for current section
- Save indicator: Shows auto-save status

## Migration Plan

### Phase 1: Infrastructure (Week 1)
1. Create version history and defaults tables
2. Build `InlineText` component with auto-save
3. Build `InlineImage` component with media library
4. Enhance `AdminToolbar` with new controls
5. Create `SaveIndicator` component

### Phase 2: Home Page (Week 2)
Migrate all hardcoded content:
- Hero section (headline, subheadline, CTA, background)
- Features section (title, feature cards)
- Testimonials section (quotes, authors)
- CTA section (headline, button text)

### Phase 3: Surf Pages (Week 3)
- /surf page sections
- /surf-weeks page sections
- Surf camp descriptions (static marketing text only)

### Phase 4: Other Pages (Week 4)
- /the-spot page
- /about page
- Footer content
- Navigation labels (if desired)

## Content Audit Results

### Home Page (/)
| Section | Hardcoded Text | Hardcoded Images |
|---------|---------------|------------------|
| Hero | 3 | 1 |
| Features | 8 | 4 |
| Testimonials | 6 | 0 |
| CTA | 2 | 0 |
| **Total** | **~15** | **~5** |

### Surf Page (/surf)
| Section | Hardcoded Text | Hardcoded Images |
|---------|---------------|------------------|
| Hero | 3 | 1 |
| Intro | 4 | 2 |
| Levels | 12 | 3 |
| Equipment | 6 | 4 |
| **Total** | **~20** | **~10** |

### Surf Weeks Page (/surf-weeks)
| Section | Hardcoded Text | Hardcoded Images |
|---------|---------------|------------------|
| Hero | 2 | 1 |
| Intro | 3 | 0 |
| Schedule | 4 | 0 |
| Pricing | 3 | 0 |
| **Total** | **~12** | **~1** |

### The Spot Page (/the-spot)
| Section | Hardcoded Text | Hardcoded Images |
|---------|---------------|------------------|
| Hero | 2 | 1 |
| Location | 4 | 3 |
| Amenities | 8 | 4 |
| Gallery | 2 | 8 |
| **Total** | **~16** | **~16** |

## Technical Implementation Details

### Auto-Save Flow

```typescript
// useAutoSave hook
function useAutoSave(sectionKey: string, field: string) {
  const [value, setValue] = useState<string>()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const debouncedSave = useDebouncedCallback(async (newValue: string) => {
    setStatus('saving')
    try {
      await updateSection(sectionKey, { [field]: newValue })
      // Save to version history
      await saveVersion(sectionKey)
      setStatus('saved')
    } catch (error) {
      setStatus('error')
    }
  }, 500)

  const handleChange = (newValue: string) => {
    setValue(newValue)
    debouncedSave(newValue)
  }

  return { value, status, handleChange }
}
```

### Media Library Integration

```typescript
// MediaLibrary component
interface MediaLibraryProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentImage?: string
}

// Integrates with existing Supabase storage
// Shows uploaded images with search/filter
// Supports new uploads with drag-and-drop
```

### Version History

```typescript
// useSectionHistory hook
function useSectionHistory(sectionKey: string) {
  const [versions, setVersions] = useState<Version[]>([])

  const loadVersions = async () => {
    const data = await fetchVersions(sectionKey)
    setVersions(data)
  }

  const restoreVersion = async (versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    if (version) {
      await updateSection(sectionKey, version.content)
    }
  }

  return { versions, loadVersions, restoreVersion }
}
```

## Security Considerations

1. **Admin-only editing** - All edit operations require authenticated admin session
2. **Validation** - Zod schemas validate all content before save
3. **Sanitization** - HTML content sanitized to prevent XSS
4. **Rate limiting** - Auto-save debounced to prevent excessive API calls
5. **Audit trail** - Version history tracks all changes with timestamps

## Success Metrics

1. **Coverage** - 100% of marketing content editable via CMS
2. **Performance** - No increase in page load time (content cached)
3. **Usability** - Non-technical users can edit without training
4. **Reliability** - Zero data loss via version history

## Out of Scope

- Page builder functionality (adding/removing sections)
- Database-driven content editing (surf camps, rooms, bookings)
- Multi-language support (future enhancement)
- A/B testing integration (future enhancement)
