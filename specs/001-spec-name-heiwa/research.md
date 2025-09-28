# Research Findings: HEIWA_HOUSE_REBUILD

**Date**: 2025-09-28
**Researcher**: AI Assistant

## Next.js 15 Best Practices

**Decision**: Use Next.js 15 App Router with TypeScript
**Rationale**: App Router provides better performance, SEO, and developer experience. TypeScript ensures type safety and better maintainability.
**Alternatives considered**: Pages Router (legacy), Vite + React (simpler but less optimized for production)

**Key Findings**:
- Use `next/image` for all images with proper width/height to prevent CLS
- Implement proper metadata API for SEO
- Use server components where possible for better performance
- Configure `next.config.js` for external image domains

## Tailwind CSS + shadcn/ui

**Decision**: Use Tailwind CSS with shadcn/ui component library
**Rationale**: Provides consistent design system, accessibility, and rapid development. Tailwind's utility-first approach works well with component libraries.
**Alternatives considered**: Styled Components, CSS Modules, vanilla CSS

**Key Findings**:
- Configure design tokens as CSS custom properties
- Use shadcn/ui for consistent button, card, and layout components
- Implement responsive design with Tailwind breakpoints
- Create custom component variants for brand consistency

## Framer Motion Animations

**Decision**: Use Framer Motion for subtle animations only
**Rationale**: Lightweight, performant animations that enhance UX without being distracting. Perfect for hover effects and page transitions.
**Alternatives considered**: CSS animations, React Spring, vanilla JavaScript animations

**Key Findings**:
- Use `motion.div` with simple transforms (translate-y, opacity)
- Implement lazy loading for animation components
- Keep animations subtle (200-300ms duration)
- Use `whileHover` and `whileInView` for interactive elements

## React Player for YouTube

**Decision**: Use React Player with lazy loading
**Rationale**: Handles multiple video platforms, provides good performance with lazy loading, and includes poster image support.
**Alternatives considered**: Direct iframe embeds, custom video components

**Key Findings**:
- Implement lazy loading with Intersection Observer
- Show poster images until user interaction
- Handle loading states and error conditions
- Configure for YouTube with custom player settings

## Image Optimization Strategy

**Decision**: Use next/image for all images with external domains configured
**Rationale**: Automatic optimization, lazy loading, and format conversion. Prevents CLS with proper sizing.
**Alternatives considered**: Regular img tags, custom image optimization

**Key Findings**:
- Configure `images.remotePatterns` in next.config.js for heiwahouse.com and i.ytimg.com
- Always provide width/height or use fill with aspect-ratio containers
- Use priority prop for above-the-fold images
- Implement proper alt text for accessibility

## Font Loading Strategy

**Decision**: Use Inter for body text, Montserrat for headings via next/font
**Rationale**: Next.js font optimization provides best performance with automatic self-hosting and preloading.
**Alternatives considered**: Google Fonts, local font files

**Key Findings**:
- Use `next/font/google` for automatic optimization
- Configure font-display: swap for better performance
- Preload critical fonts
- Use CSS font-feature-settings for better typography

## Accessibility Implementation

**Decision**: Implement WCAG 2.1 AA compliance with keyboard navigation and screen reader support
**Rationale**: Ensures website is usable by all visitors, including those with disabilities.
**Alternatives considered**: Basic accessibility, no specific accessibility framework

**Key Findings**:
- Use semantic HTML elements
- Implement proper ARIA labels where needed
- Ensure keyboard navigation for all interactive elements
- Test with screen readers and keyboard-only navigation

## SEO Strategy

**Decision**: Implement comprehensive SEO with Next.js metadata API
**Rationale**: Critical for accommodation business visibility in search results.
**Alternatives considered**: Basic meta tags, manual SEO optimization

**Key Findings**:
- Use Metadata API for title, description, OpenGraph, Twitter cards
- Implement structured data for business information
- Ensure fast loading times for good Core Web Vitals
- Create sitemap.xml and robots.txt

## Performance Optimization

**Decision**: Focus on Core Web Vitals (LCP, FID, CLS)
**Rationale**: Google search ranking and user experience depend on these metrics.
**Alternatives considered**: Feature-first development, optimize later

**Key Findings**:
- Optimize images with next/image
- Use code splitting and lazy loading
- Minimize JavaScript bundle size
- Implement proper caching strategies

## Testing Strategy

**Decision**: Use Jest + React Testing Library for unit tests, Playwright for E2E
**Rationale**: Comprehensive testing coverage with modern, maintainable test frameworks.
**Alternatives considered**: Only unit tests, only E2E tests

**Key Findings**:
- Write tests for components and user interactions
- Use Playwright for critical user journeys
- Implement visual regression testing for design consistency
- Test accessibility with automated tools
