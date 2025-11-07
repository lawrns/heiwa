# Phase 1 & 2 Visual Upgrade Implementation Guide

## Overview
This guide covers the implementation of Phase 1 (Hero & Visual Enhancement) and Phase 2 (Content Galleries & Storytelling) components for the Heiwa House website.

## Phase 1 Components Created

### 1. VideoHero (`components/ui/video-hero.tsx`)
**Purpose**: Stunning hero section with video background and animated text

**Features**:
- Video background with parallax scrolling
- Animated title and subtitle with staggered animations
- Google rating badge integration
- CTA button with hover effects
- Scroll indicator
- Responsive design

**Usage**:
```tsx
import { VideoHero } from '@/components/ui/video-hero'

<VideoHero
  videoSrc="/optimized/videos/video_001_timeline-1.mp4"
  title="Welcome to Heiwa House"
  subtitle="Your surf and lifestyle destination in Santa Cruz, Portugal"
  ctaText="Explore surf weeks"
  ctaHref="/surf-weeks"
  showRating={true}
  showScrollIndicator={true}
/>
```

### 2. ActivityCardEnhanced (`components/ui/activity-card-enhanced.tsx`)
**Purpose**: Visually stunning activity cards with image backgrounds

**Features**:
- Full-bleed background images
- Gradient overlays for text readability
- Hover scale animations (1.02x)
- Icon animations on hover
- Text reveal animations
- Smooth shadow transitions

**Usage**:
```tsx
import { ActivityCardEnhanced } from '@/components/ui/activity-card-enhanced'
import { Waves } from 'lucide-react'

<ActivityCardEnhanced
  title="Surf Lessons"
  description="Learn to surf with professional instructors"
  image="/optimized/activities_001_surf-lessons.webp"
  icon={Waves}
  href="/activities/surf"
  index={0}
/>
```

### 3. ImageGallery (`components/ui/image-gallery.tsx`)
**Purpose**: Masonry gallery with lightbox and zoom effects

**Features**:
- Responsive masonry grid (2-4 columns)
- Hover zoom effect (1.1x scale)
- Full-screen lightbox modal
- Image navigation (prev/next arrows)
- Smooth fade transitions
- Keyboard navigation support
- Image counter

**Usage**:
```tsx
import { ImageGallery } from '@/components/ui/image-gallery'

<ImageGallery
  images={[
    { src: '/image1.webp', alt: 'Image 1', title: 'Title' },
    { src: '/image2.webp', alt: 'Image 2' },
  ]}
  columns={3}
  title="Gallery"
  description="Explore our collection"
/>
```

### 4. VideoPlayer (`components/ui/video-player.tsx`)
**Purpose**: Premium video player with custom controls

**Features**:
- Custom play button overlay
- Poster image with blur effect
- Lazy loading with intersection observer
- Responsive sizing
- Smooth fade-in animation
- Mobile-optimized controls
- Progress bar with custom styling
- Mute/unmute toggle
- Fullscreen support
- Time display

**Usage**:
```tsx
import { VideoPlayer } from '@/components/ui/video-player'

<VideoPlayer
  src="/optimized/videos/video_002_fin1.mp4"
  poster="/poster.jpg"
  title="Video Title"
  description="Video description"
  autoPlay={false}
  controls={true}
/>
```

### 5. AccommodationCarousel (`components/ui/accommodation-carousel.tsx`)
**Purpose**: Showcase rooms with carousel and thumbnail navigation

**Features**:
- Large featured image carousel
- Thumbnail strip navigation
- Auto-play with pause on hover
- Smooth image transitions
- Dot indicators
- Image counter
- Room info display (capacity, price, amenities)
- Responsive layout

**Usage**:
```tsx
import { AccommodationCarousel } from '@/components/ui/accommodation-carousel'

<AccommodationCarousel
  images={[
    { src: '/room1.webp', alt: 'Room 1' },
    { src: '/room2.webp', alt: 'Room 2' },
  ]}
  title="Deluxe Room"
  description="Spacious and comfortable"
  capacity="2-3 guests"
  price="€85/night"
  amenities={['WiFi', 'AC', 'Private Bathroom']}
/>
```

## Phase 2 Components Created

### 1. ActivityDetail (`components/ui/activity-detail.tsx`)
**Purpose**: Full activity page with hero, gallery, and highlights

**Features**:
- Hero image with gradient overlay
- Long description section
- Highlights/features list
- Integrated image gallery
- CTA section with booking button
- Staggered animations

**Usage**:
```tsx
import { ActivityDetail } from '@/components/ui/activity-detail'

<ActivityDetail
  title="Surf Lessons"
  description="Learn to surf with professionals"
  longDescription="Full description..."
  heroImage="/hero.webp"
  galleryImages={[...]}
  highlights={['Professional instructors', 'Small groups']}
  ctaText="Book Now"
  ctaHref="/booking"
/>
```

### 2. PhotographyGallery (`components/ui/photography-gallery.tsx`)
**Purpose**: Professional photography showcase with filtering

**Features**:
- Masonry grid layout (responsive)
- Category filtering (Landscape, Lifestyle, Events, Drone)
- Lightbox viewer integration
- Image metadata display
- Smooth animations on load
- Social share buttons in lightbox
- Category badges

**Usage**:
```tsx
import { PhotographyGallery } from '@/components/ui/photography-gallery'

<PhotographyGallery
  images={[
    { src: '/photo1.webp', alt: 'Photo 1', category: 'landscape' },
    { src: '/photo2.webp', alt: 'Photo 2', category: 'lifestyle' },
  ]}
  title="Photography Gallery"
  description="Professional collection"
/>
```

### 3. MasonryGrid (`components/ui/masonry-grid.tsx`)
**Purpose**: Reusable masonry layout component

**Features**:
- Responsive columns (2-4)
- Customizable gap
- Staggered animations
- Break-inside-avoid for proper layout

**Usage**:
```tsx
import { MasonryGrid } from '@/components/ui/masonry-grid'

<MasonryGrid columns={3} gap={6}>
  {children.map((child) => child)}
</MasonryGrid>
```

### 4. Lightbox (`components/ui/lightbox.tsx`)
**Purpose**: Full-screen image viewer modal

**Features**:
- Full-screen image display
- Navigation arrows
- Keyboard support (arrows, escape)
- Image counter
- Image metadata display
- Smooth animations
- Click outside to close

**Usage**:
```tsx
import { Lightbox } from '@/components/ui/lightbox'

<Lightbox
  images={images}
  initialIndex={0}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### 5. RoomShowcase (`components/ui/room-showcase.tsx`)
**Purpose**: Detailed room showcase with carousel

**Features**:
- Image carousel with auto-play
- Thumbnail navigation
- Room details (capacity, price)
- Amenities list with icons
- Booking CTA
- Responsive layout

**Usage**:
```tsx
import { RoomShowcase } from '@/components/ui/room-showcase'

<RoomShowcase
  title="Deluxe Room"
  description="Spacious room with ocean view"
  images={[...]}
  capacity="2-3 guests"
  price="€85/night"
  amenities={['WiFi', 'AC', 'Bathroom']}
  bookingHref="/booking"
/>
```

### 6. SocialFeed (`components/ui/social-feed.tsx`)
**Purpose**: Instagram-style social media feed

**Features**:
- Grid layout (3-4 columns)
- Instagram-style cards
- Hover overlay with engagement metrics
- Lightbox viewer integration
- Like/comment/share buttons
- Instagram follow link
- Lazy loading

**Usage**:
```tsx
import { SocialFeed } from '@/components/ui/social-feed'

<SocialFeed
  posts={[
    { src: '/post1.webp', alt: 'Post 1', likes: 234, comments: 12 },
    { src: '/post2.webp', alt: 'Post 2', likes: 567, comments: 34 },
  ]}
  title="Follow Us"
  description="Join our community"
  instagramHandle="@heiwahouse"
/>
```

### 7. VideoSection (`components/ui/video-section.tsx`)
**Purpose**: Flexible video showcase section

**Features**:
- Multiple layout options (single, double, triple)
- Video player integration
- Responsive grid
- Staggered animations
- Section title and description

**Usage**:
```tsx
import { VideoSection } from '@/components/ui/video-section'

<VideoSection
  title="Our Story"
  description="Watch our journey"
  videos={[
    { src: '/video1.mp4', poster: '/poster1.jpg', title: 'Video 1' },
  ]}
  layout="single"
/>
```

## Integration Steps

### Step 1: Update Homepage
Replace the current hero section in `app/page.tsx`:
```tsx
import { VideoHero } from '@/components/ui/video-hero'
import { ActivityCardEnhanced } from '@/components/ui/activity-card-enhanced'

// In your component:
<VideoHero
  videoSrc="/optimized/videos/video_001_timeline-1.mp4"
  title="Welcome to Heiwa House"
  subtitle="Your surf and lifestyle destination in Santa Cruz, Portugal"
/>

// Replace activity cards with enhanced version
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {activities.map((activity, index) => (
    <ActivityCardEnhanced
      key={activity.id}
      title={activity.title}
      description={activity.description}
      image={activity.image}
      icon={activity.icon}
      href={activity.href}
      index={index}
    />
  ))}
</div>
```

### Step 2: Create Activity Pages
Create `app/activities/[slug]/page.tsx`:
```tsx
import { ActivityDetail } from '@/components/ui/activity-detail'

export default function ActivityPage({ params }: { params: { slug: string } }) {
  // Fetch activity data based on slug
  const activity = getActivityData(params.slug)
  
  return (
    <ActivityDetail
      title={activity.title}
      description={activity.description}
      longDescription={activity.longDescription}
      heroImage={activity.heroImage}
      galleryImages={activity.galleryImages}
      highlights={activity.highlights}
    />
  )
}
```

### Step 3: Create Gallery Page
Create `app/gallery/page.tsx`:
```tsx
import { PhotographyGallery } from '@/components/ui/photography-gallery'

export default function GalleryPage() {
  const images = [
    // Import all photography images
  ]
  
  return (
    <PhotographyGallery
      images={images}
      title="Photography Gallery"
      description="Explore our professional collection"
    />
  )
}
```

### Step 4: Create Community Page
Create `app/community/page.tsx`:
```tsx
import { SocialFeed } from '@/components/ui/social-feed'

export default function CommunityPage() {
  const posts = [
    // Import social media posts
  ]
  
  return (
    <SocialFeed
      posts={posts}
      title="Follow Us"
      description="Join our community"
    />
  )
}
```

## Asset Organization

### Image Paths
- Accommodations: `/public/optimized/accommodations_*.webp`
- Activities: `/public/optimized/activities_*.webp`
- Photography: `/public/optimized/photography_*.webp`
- Social: `/public/optimized/other_*.webp`

### Video Paths
- Hero: `/public/optimized/videos/video_001_timeline-1.mp4`
- Other videos: `/public/optimized/videos/video_*.mp4`

## Performance Considerations

1. **Lazy Loading**: All components use `whileInView` for animations
2. **Image Optimization**: Use Next.js Image component with proper sizing
3. **Video Optimization**: Implement poster images and lazy loading
4. **Bundle Size**: Components are modular and tree-shakeable

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation support in lightbox and video player
- Proper semantic HTML structure
- Focus visible states on all buttons

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- Touch support for carousels and galleries

## Next Steps

1. Update homepage with new components
2. Create activity pages with ActivityDetail
3. Create gallery page with PhotographyGallery
4. Create community page with SocialFeed
5. Test all components across devices
6. Optimize images and videos
7. Deploy to production
