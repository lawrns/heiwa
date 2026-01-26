# Design System Refinement Plan

## Overview

Refine `/design-system` to be a complete, visually polished reference for developers, stakeholders, and internal use. Premium documentation feel (Stripe/Vercel style).

## Goals

1. **Completeness** — Add all missing sections
2. **Perfect spacing/padding** — Full Tailwind scale + semantic tokens
3. **Visual polish** — Premium documentation aesthetic

## Target Audience

- Internal reference for consistency
- Developer handoff documentation
- Client/stakeholder showcase

---

## Page Structure

### Header
- Sticky with blur backdrop (`backdrop-blur-md`)
- Left: Palette icon + "Heiwa Design System"
- Center: Section nav links (hidden mobile)
- Right: Dark mode toggle + "View Site" link

### Sidebar Navigation
- Three groups:
  - **Foundation**: Colors, Typography, Icons, Spacing, Shadows, Radius, Motion, Breakpoints
  - **Components**: Buttons, Forms, Cards, Alerts, Progress, Badges
  - **Patterns**: Accessibility, App-Specific
- Active state: left border accent color
- Smooth scroll with active section highlighting via Intersection Observer

### Main Content
- Max-width: 900px (readable line length)
- Section spacing: 80px between major sections
- Background: `#FAFAFA` with white cards

---

## Foundation Sections

### Colors (Enhanced)
Current structure kept, additions:
- Contrast ratio badges (AA/AAA) on each swatch
- Click to copy hex/CSS variable (toast feedback)
- Larger swatches: h-32 instead of h-24
- Show dark mode variants

### Typography (Enhanced)
Current scale kept, additions:
- Line-height values shown
- Letter-spacing values shown
- Font-weight visual scale (400, 500, 600, 700)
- "Do/Don't" usage examples

### Icons (Enhanced)
Current groupings kept, additions:
- Size scale comparison (16, 20, 24, 32px)
- Stroke width guidance
- Optional: search/filter functionality

### Spacing & Layout (NEW)
Full Tailwind scale visualization:
```
0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

Each shown as:
- Colored bar proportional to size
- Pixel value
- Tailwind class (p-4, m-8, etc.)
- Rem equivalent

Semantic tokens highlighted:
- `section-y`: 80px — Vertical section padding
- `section-y-lg`: 120px — Large section padding
- `grid-gap`: 24px — Standard grid spacing
- `card-padding`: 40px — Card internal padding

Container widths:
- `max-w-content`: 1200px
- `max-w-container`: 1400px

Grid examples:
- 2, 3, 4 column responsive layouts
- Gap variations

### Shadows & Elevation (NEW)
Three levels documented:
| Level | Token | Value | Usage |
|-------|-------|-------|-------|
| Subtle | `shadow-subtle` | `0 1px 3px rgba(0,0,0,0.06)` | Inputs, minor separation |
| Card | `shadow-card` | `0 2px 12px rgba(0,0,0,0.08)` | Cards, modals |
| Card Hover | `shadow-card-hover` | `0 4px 20px rgba(0,0,0,0.12)` | Hover states, emphasis |

Visual: Three identical white cards on gray, each showing a shadow level.

### Border Radius (NEW)
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-image` | 4px | Images, thumbnails |
| `rounded-button` | 6px | Buttons, inputs |
| `rounded-card` | 8px | Cards, modals, containers |
| `rounded-full` | 9999px | Avatars, pills |

Visual: Side-by-side comparison of same element with each radius.

### Animation & Motion (NEW)
**Entrance Animations**
- `animate-fade-in`: 600ms ease-out, translateY 20px → 0
- `animate-slide-up`: 600ms ease-out, translateY 30px → 0

Each shown with:
- Live demo
- Replay button
- Code snippet

**Timing Guidelines**
| Duration | Usage |
|----------|-------|
| 150-200ms | Micro-interactions (button hover, focus) |
| 300-400ms | Transitions (accordion, drawer) |
| 500-600ms | Entrance animations |

**Easing**
- `ease-out`: Entrances (elements arriving)
- `ease-in-out`: State changes (hover, toggle)
- `ease-in`: Exits (elements leaving)

### Responsive Breakpoints (NEW)
| Breakpoint | Min Width | Typical Use |
|------------|-----------|-------------|
| `sm` | 640px | Large phones landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large displays |

Visual: Diagram showing breakpoint ranges
Common patterns documented:
- Mobile-first stacking → side-by-side
- Navigation collapse points
- Grid column changes

---

## Component Enhancements

### All Components
- Tabbed interface: **Preview** | **Code**
- Preview shows live component
- Code shows copy-paste ready snippet with copy button
- States shown inline: default → hover → focus → active → disabled

### Buttons
Current variants kept, additions:
- Verify gradient variants exist (ocean, surf, sand) or remove from docs
- Loading state with spinner
- Button groups example

### Form Inputs
Current examples kept, additions:
- Textarea
- File upload styling
- Form layout patterns (vertical, horizontal, inline)

### Cards
Current examples kept, additions:
- Image card variant
- Horizontal card layout
- Card with actions footer

### Alerts
Current examples kept, additions:
- Dismissible alert with close button
- Inline alert (smaller, in-context)
- Toast notification style

---

## Dark Mode Implementation

### Toggle Behavior
- Persists preference to localStorage
- Respects system preference on first visit
- Applies `dark` class to `<html>` element

### Color Adjustments
Document dark mode values for:
- Backgrounds: surface → gray-900, surface-alt → gray-800
- Text: gray-900 → gray-100
- Borders: gray-200 → gray-700
- Cards: white → gray-800

### Display
- Toggle works throughout entire page
- Color swatches show light/dark side by side
- Components preview in current mode

---

## Visual Polish Details

### Micro-interactions
- Cards: `hover:translate-y-[-2px] hover:shadow-card-hover transition-all duration-200`
- Code copy button: Shows "Copied!" for 2 seconds
- Section links: Subtle underline animation on hover
- Smooth scroll: `scroll-behavior: smooth` + `scroll-mt-20` offset

### Typography Refinements
- Section titles: `text-3xl font-bold tracking-tight`
- Descriptions: `text-lg text-gray-600 max-w-2xl`
- Code: `font-mono text-sm` with syntax highlighting

### Spacing Rhythm
- Between major sections: 80px (`py-20`)
- Between subsections: 48px (`mt-12`)
- Between component examples: 24px (`gap-6`)
- Card internal padding: 24px (`p-6`)
- Label to input: 8px (`space-y-2`)

### Background & Cards
- Page background: `bg-gray-50` (#FAFAFA)
- Cards: `bg-white rounded-lg border border-gray-200`
- Showcase containers: `bg-white rounded-xl border border-gray-100 shadow-sm`

---

## New Components to Create

### `components/design-system/SpacingScale.tsx`
Visual scale of all spacing values with proportional bars.

### `components/design-system/ShadowShowcase.tsx`
Side-by-side shadow comparison cards.

### `components/design-system/RadiusShowcase.tsx`
Border radius comparison.

### `components/design-system/AnimationDemo.tsx`
Live animation previews with replay.

### `components/design-system/BreakpointDiagram.tsx`
Visual breakpoint range diagram.

### `components/design-system/CodeBlock.tsx` (Enhanced)
Add copy button with feedback.

### `components/design-system/ComponentTabs.tsx`
Preview/Code tabbed interface.

### `components/design-system/CopyableValue.tsx`
Click-to-copy with toast feedback.

---

## Implementation Order

1. **Update page structure** — New layout, sidebar groups, background
2. **Create new components** — SpacingScale, ShadowShowcase, etc.
3. **Enhance existing sections** — Colors (copy), Typography (values)
4. **Add new sections** — Spacing, Shadows, Radius, Motion, Breakpoints
5. **Implement dark mode** — Working toggle with persistence
6. **Add code tabs** — Preview/Code interface for all components
7. **Polish** — Micro-interactions, typography, spacing rhythm
8. **Verify** — Check all documented values match tailwind.config.js

---

## Files to Modify

- `app/design-system/page.tsx` — Complete rewrite
- `components/design-system/*` — Enhance existing, add new
- `tailwind.config.js` — Verify all tokens documented exist
- `app/globals.css` — Add any missing CSS custom properties

## Files to Create

- `components/design-system/SpacingScale.tsx`
- `components/design-system/ShadowShowcase.tsx`
- `components/design-system/RadiusShowcase.tsx`
- `components/design-system/AnimationDemo.tsx`
- `components/design-system/BreakpointDiagram.tsx`
- `components/design-system/ComponentTabs.tsx`
- `components/design-system/CopyableValue.tsx`
