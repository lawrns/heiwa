// Core data types for Heiwa House website
// Based on data-model.md specifications

export interface NavigationItem {
  path: string;        // URL path (e.g., "/", "/rooms")
  name: string;        // Display name (e.g., "Home", "Room Rentals")
  external?: boolean;  // Whether this is an external link
}

export interface Room {
  id: string;         // Unique identifier
  name: string;       // Display name (e.g., "Room Nr 1")
  image: string;      // Image URL from heiwahouse.com
  description?: string; // Optional description
}

export interface Experience {
  id: string;         // Unique identifier
  title: string;      // Activity name (e.g., "Hiking", "Surfing")
  image: string;      // Image URL from heiwahouse.com
  category?: string;  // Optional category grouping
}

export interface Page {
  path: string;       // URL path
  title: string;      // Page title for SEO
  description: string; // Meta description for SEO
  content: PageContent; // Page-specific content structure
}

// Union type for different page content structures
export type PageContent =
  | HomePageContent
  | RoomsPageContent
  | ExperiencesPageContent
  | SurfWeeksPageContent;

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    video?: string;
    cta: CallToAction[];
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

export interface RoomsPageContent {
  rooms: Room[];
  bookingCta: CallToAction;
}

export interface ExperiencesPageContent {
  experiences: Experience[];
}

export interface SurfWeeksPageContent {
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

export interface CallToAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

// Component prop types
export interface HeroProps {
  title: string;
  subtitle: string;
  image?: string;
  video?: string;
  ctas: CallToAction[];
  className?: string;
}

export interface CardGridProps {
  items: CardItem[];
  columns?: number;
  className?: string;
}

export interface CardItem {
  title: string;
  image: string;
  href?: string;
  description?: string;
}

export interface VideoEmbedProps {
  src: string;
  provider: 'youtube' | 'vimeo';
  poster?: string;
  className?: string;
  title?: string;
}

export interface NavigationProps {
  items?: NavigationItem[];
  currentPath?: string;
  className?: string;
}

// Design token types
export interface ColorTokens {
  primary: string;
  'on-primary': string;
  surface: string;
  'surface-alt': string;
  text: string;
  muted: string;
}

export interface RadiusTokens {
  card: string;
  button: string;
}

export interface ElevationTokens {
  card: string;
}

export interface SpacingTokens {
  'section-y': string;
  'grid-gap': string;
}
