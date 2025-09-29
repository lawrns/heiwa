# Quickstart Guide: HEIWA_HOUSE_REBUILD

**Date**: 2025-09-28
**Purpose**: End-to-end validation scenarios for the Heiwa House website

## Prerequisites

1. Next.js 15 development environment set up
2. All dependencies installed (`npm install`)
3. Development server running (`npm run dev`)
4. Browser with developer tools

## Critical User Journey: Website Exploration

### Scenario 1: First-Time Visitor Homepage Experience
**Goal**: Validate complete homepage functionality and user experience

**Steps**:
1. Navigate to homepage (`/`)
2. Verify hero section displays:
   - Title: "A Wave Away"
   - Subtitle: "Nestled on Portugal's coast..."
   - Background image loads properly
   - "Book Now" CTA button is visible and clickable
3. Scroll to feature cards section
4. Verify three cards display:
   - "Heiwa Play" with image and link to `/the-spot#play`
   - "Heiwa Surf" with image and link to `/surf-weeks`
   - "Heiwa Flow" with image and link to `/the-spot#flow`
5. Scroll to video section
6. Verify YouTube video embed:
   - Poster image displays initially
   - Video loads on user interaction
   - No layout shift during loading

**Success Criteria**:
- All images load without errors
- Navigation links work correctly
- Video placeholder shows before interaction
- No console errors in browser dev tools
- Page loads within 3 seconds

### Scenario 2: Accommodation Research Journey
**Goal**: Validate room browsing and booking flow

**Steps**:
1. Click "Book Now" CTA or navigate to `/rooms`
2. Verify rooms page loads with 3-column grid
3. Check all four room cards display:
   - Room Nr 1, Room Nr 2, Room Nr 3, Dorm room
   - Each card shows proper image from heiwahouse.com
   - Images maintain aspect ratio without distortion
4. Verify "Check Availability" CTA button
5. Test responsive design:
   - Desktop: 3 columns visible
   - Tablet: 2 columns
   - Mobile: 1 column

**Success Criteria**:
- All room images load crisply
- Grid layout adapts to screen size
- CTA button links to correct booking section
- No cumulative layout shift (CLS)

### Scenario 3: Activities and Amenities Discovery
**Goal**: Validate experiences page and navigation

**Steps**:
1. Navigate to `/the-spot` page
2. Verify 8 experience cards display in grid:
   - Hiking, Horseback Riding, Sauna, Surfing
   - Skatepark, Yoga, Bicycle Ride, Day Trips
   - Each card shows proper image
3. Test card interactions:
   - Hover effects (translate-y animation)
   - Shadow transitions
4. Verify navigation between pages works
5. Test mobile menu functionality

**Success Criteria**:
- All experience images load properly
- Hover animations are smooth and subtle
- Navigation works on all device sizes
- Cards are keyboard accessible

### Scenario 4: Surf Program Information Access
**Goal**: Validate video content and surf weeks page

**Steps**:
1. Navigate to `/surf-weeks` page
2. Verify YouTube video embed loads
3. Test video interaction:
   - Poster displays initially
   - Video plays on click/tap
   - Player controls work properly
4. Check responsive video sizing
5. Verify video doesn't autoplay

**Success Criteria**:
- Video loads without errors
- Poster image shows before play
- Video is responsive on all devices
- No unwanted autoplay behavior

## Accessibility Validation

### Scenario 5: Keyboard Navigation Test
**Goal**: Ensure full keyboard accessibility

**Steps**:
1. Use Tab key to navigate through:
   - Navigation menu items
   - CTA buttons
   - Card links
   - Video controls
2. Verify focus indicators are visible
3. Test Enter/Space activation of interactive elements
4. Check heading hierarchy (H1, H2, H3)
5. Verify alt text on images

**Success Criteria**:
- All interactive elements reachable via keyboard
- Focus indicators meet contrast requirements
- Screen reader can navigate content hierarchy
- No keyboard traps or inaccessible content

## Performance Validation

### Scenario 6: Core Web Vitals Check
**Goal**: Validate performance metrics

**Steps**:
1. Open browser developer tools → Performance tab
2. Run Lighthouse audit
3. Check Core Web Vitals:
   - Largest Contentful Paint (LCP) < 2.5s
   - First Input Delay (FID) < 100ms
   - Cumulative Layout Shift (CLS) < 0.1
4. Verify images load with proper optimization
5. Check bundle size is reasonable

**Success Criteria**:
- All Core Web Vitals pass
- Images load without layout shift
- JavaScript bundle < 200KB gzipped
- Time to Interactive < 3 seconds

## SEO Validation

### Scenario 7: Search Engine Optimization Check
**Goal**: Validate SEO implementation

**Steps**:
1. Check page source for meta tags:
   - `<title>` tag present and descriptive
   - `<meta name="description">` present
   - OpenGraph meta tags for social sharing
2. Verify URL structure is clean
3. Check heading hierarchy (H1 once per page)
4. Test page loading speed

**Success Criteria**:
- All pages have proper SEO meta tags
- URLs are human-readable
- Content hierarchy is logical
- Page speed is optimized

## Cross-Browser Testing

### Scenario 8: Browser Compatibility
**Goal**: Ensure consistent experience across browsers

**Steps**:
1. Test in Chrome, Firefox, Safari, Edge
2. Verify:
   - Layout consistency
   - Font loading
   - Video playback
   - Animation performance
3. Check mobile browsers (iOS Safari, Chrome Android)

**Success Criteria**:
- Consistent visual appearance
- All functionality works
- Performance is similar across browsers
- Mobile experience is optimized

## Automated Testing Setup

### Unit Tests
```bash
npm run test:unit
```
- Component rendering tests
- Props validation tests
- Utility function tests

### Integration Tests
```bash
npm run test:integration
```
- Page navigation tests
- Component interaction tests
- Data flow validation

### E2E Tests
```bash
npm run test:e2e
```
- Complete user journey tests
- Cross-browser validation
- Performance regression tests

## Deployment Readiness Checklist

- [ ] All pages load without errors
- [ ] Images optimize properly with next/image
- [ ] Video embeds work with lazy loading
- [ ] Responsive design works on all devices
- [ ] Accessibility standards met
- [ ] SEO meta tags implemented
- [ ] Performance metrics pass thresholds
- [ ] All automated tests pass
- [ ] Bundle size is optimized
- [ ] External image domains configured

