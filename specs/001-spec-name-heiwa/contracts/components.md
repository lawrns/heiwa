# Component Contracts: HEIWA_HOUSE_REBUILD

**Date**: 2025-09-28
**Purpose**: Define TypeScript interfaces for React components

## Hero Component Contract

```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
  ctas: CallToAction[];
}

interface CallToAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

// Component Behavior:
// - Displays title and subtitle with proper heading hierarchy
// - Shows background image using next/image with priority
// - Renders CTA buttons with proper accessibility
// - Responsive design for mobile and desktop
// - Ensures sufficient color contrast for accessibility
```

## CardGrid Component Contract

```typescript
interface CardGridProps {
  items: CardItem[];
  columns?: number;
  className?: string;
}

interface CardItem {
  title: string;
  image: string;
  href?: string;
  description?: string;
}

// Component Behavior:
// - Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
// - Hover effects: translate-y and shadow-xl animations
// - Image optimization using next/image
// - Proper aspect ratios to prevent CLS
// - Optional navigation links with proper accessibility
```

## VideoEmbed Component Contract

```typescript
interface VideoEmbedProps {
  src: string;
  provider: 'youtube' | 'vimeo';
  poster?: string;
  className?: string;
  title?: string;
}

// Component Behavior:
// - Lazy loads ReactPlayer only when in viewport
// - Shows poster image/placeholder initially
// - Handles loading states and error conditions
// - Responsive video container
// - Accessibility compliant with proper ARIA labels
```

## Navigation Component Contract

```typescript
interface NavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  className?: string;
}

interface NavigationItem {
  path: string;
  name: string;
  external?: boolean;
}

// Component Behavior:
// - Responsive navigation with mobile menu
// - Active state indication for current page
// - Keyboard accessible navigation
// - Smooth scrolling for anchor links
// - Sticky positioning option
```

## Layout Component Contract

```typescript
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

// Component Behavior:
// - Provides consistent page structure
// - Includes navigation header
// - Manages SEO metadata
// - Applies global design tokens
// - Ensures proper document structure
```

## Design Token Contracts

```typescript
// Color tokens (from specification)
interface ColorTokens {
  primary: string;      // #E85A2B
  onPrimary: string;    // #FFFFFF
  surface: string;      // #0F1418
  surfaceAlt: string;   // #1B2329
  text: string;         // #FFFFFF
  muted: string;        // #A8B0B7
}

// Radius tokens
interface RadiusTokens {
  card: string;         // 12px
  button: string;       // 8px
}

// Elevation tokens
interface ElevationTokens {
  card: string;         // var(--fr-shadow-lg)
}

// Spacing tokens
interface SpacingTokens {
  sectionY: string;     // 96px
  gridGap: string;      // 24px
}
```

## Content Data Contracts

```typescript
// Page content structures (from data-model.md)
interface HomePageData {
  hero: {
    title: string;
    subtitle: string;
    background: string;
    cta: CallToAction[];
  };
  threeCards: Array<{
    title: string;
    image: string;
    href: string;
  }>;
  videoEmbed: {
    provider: 'youtube' | 'vimeo';
    src: string;
    component: string;
    poster: string;
  };
}

interface RoomsPageData {
  grid: {
    columns: number;
    cards: Array<{
      name: string;
      img: string;
    }>;
  };
  bookingCta: CallToAction;
}

interface ExperiencesPageData {
  cards: Array<{
    title: string;
    img: string;
  }>;
}
```

## Implementation Requirements

### Performance Contracts
- All images use next/image with proper sizing
- Videos lazy load with Intersection Observer
- Bundle size optimization with code splitting
- Core Web Vitals compliance (LCP, FID, CLS)

### Accessibility Contracts
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast ratios
- Semantic HTML structure

### SEO Contracts
- Proper heading hierarchy
- Meta title and description for each page
- OpenGraph and Twitter card support
- Structured data where applicable
- Fast loading times for search ranking
