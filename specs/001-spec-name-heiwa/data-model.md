# Data Model: HEIWA_HOUSE_REBUILD

**Date**: 2025-09-28
**Purpose**: Define data structures and relationships for the Heiwa House website

## Entities

### NavigationItem
Represents menu items for site navigation
```typescript
interface NavigationItem {
  path: string;        // URL path (e.g., "/", "/rooms")
  name: string;        // Display name (e.g., "Home", "Room Rentals")
}
```

**Validation Rules**:
- path must be valid URL path starting with "/"
- name must be non-empty string

### Room
Represents accommodation units with display information
```typescript
interface Room {
  id: string;         // Unique identifier
  name: string;       // Display name (e.g., "Room Nr 1")
  image: string;      // Image URL from heiwahouse.com
  description?: string; // Optional description
}
```

**Validation Rules**:
- id must be unique across all rooms
- name must be non-empty
- image must be valid URL from heiwahouse.com

### Experience
Represents activities and amenities available at Heiwa House
```typescript
interface Experience {
  id: string;         // Unique identifier
  title: string;      // Activity name (e.g., "Hiking", "Surfing")
  image: string;      // Image URL from heiwahouse.com
  category?: string;  // Optional category grouping
}
```

**Validation Rules**:
- id must be unique across all experiences
- title must be non-empty
- image must be valid URL from heiwahouse.com

### Page
Represents site pages with their content structure
```typescript
interface Page {
  path: string;       // URL path
  title: string;      // Page title for SEO
  description: string; // Meta description for SEO
  content: PageContent; // Page-specific content structure
}
```

**Validation Rules**:
- path must be valid URL path
- title and description must be non-empty for SEO

### PageContent
Union type for different page content structures
```typescript
type PageContent =
  | HomePageContent
  | RoomsPageContent
  | ExperiencesPageContent
  | SurfWeeksPageContent;
```

### HomePageContent
Content structure for the homepage
```typescript
interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    cta: { label: string; href: string };
  };
  featureCards: Array<{
    title: string;
    image: string;
    href: string;
  }>;
  videoEmbed: {
    provider: 'youtube' | 'vimeo';
    src: string;
    poster: string;
  };
}
```

### RoomsPageContent
Content structure for the rooms page
```typescript
interface RoomsPageContent {
  rooms: Room[];
  bookingCta: {
    label: string;
    href: string;
  };
}
```

### ExperiencesPageContent
Content structure for the experiences page
```typescript
interface ExperiencesPageContent {
  experiences: Experience[];
}
```

### SurfWeeksPageContent
Content structure for the surf weeks page
```typescript
interface SurfWeeksPageContent {
  videoEmbed: {
    provider: 'youtube' | 'vimeo';
    src: string;
    poster: string;
  };
  program?: {
    title: string;
    description: string;
    features: string[];
  };
}
```

## Relationships

### Navigation → Pages
- Each NavigationItem links to a Page via path
- All navigation paths must correspond to existing pages

### HomePage → Rooms/Experiences
- HomePage feature cards can link to rooms or experiences pages
- Maintain referential integrity for href values

### Images
- All images are external URLs from heiwahouse.com
- Images must be accessible and properly sized
- Poster images are stored locally in /public/images/posters/

## State Management

### Static Site Approach
Since this is a static website with external content:
- All data is defined as static TypeScript constants
- No database or API required
- Content updates require code changes
- Images are served from external CDN (heiwahouse.com)

### Data Sources
- Room data: Hardcoded from specification
- Experience data: Hardcoded from specification
- Navigation: Derived from page routes
- Images: External URLs from heiwahouse.com
- Video: YouTube embed with local poster

## Validation Rules Summary

1. **URL Validation**: All image URLs must be from heiwahouse.com domain
2. **Required Fields**: All entities must have required fields populated
3. **Unique IDs**: Room and Experience IDs must be unique
4. **SEO Compliance**: Pages must have title and description
5. **Navigation Integrity**: All navigation paths must exist
6. **Image Optimization**: Images should be properly sized to prevent CLS

