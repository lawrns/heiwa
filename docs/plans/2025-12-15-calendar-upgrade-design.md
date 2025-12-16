# Admin Calendar Upgrade Design

## Overview

Redesign the admin calendar to provide a unified operational view of all Heiwa House activity with better visual hierarchy, inline editing, and context-aware empty states.

## Current Problems

1. Broken day header alignment ("Su MoTuWeThFrSa" squished)
2. Duplicate navigation arrows (inside and outside calendar)
3. Duplicate month display
4. Events disconnected from calendar grid
5. Generic empty state

## Design Decisions

### Layout: Two-Column (70/30)

```
┌───────────────────────────────────────┬─────────────────────────┐
│                                       │                         │
│   < ──── December 2025 ──── >         │  📅 Today, Dec 15       │
│                                       │                         │
│   Su  Mo  Tu  We  Th  Fr  Sa          │  Event cards here...    │
│   ┌───┬───┬───┬───┬───┬───┬───┐       │                         │
│   │   │   │   │   │   │   │   │       │                         │
│   │   │ events as pills       │       │                         │
│   └───┴───┴───┴───┴───┴───┴───┘       │                         │
│                                       │                         │
└───────────────────────────────────────┴─────────────────────────┘
```

- Sidebar persists, defaults to today
- Click any day to show that day's events in sidebar
- Responsive: sidebar collapses to drawer on tablet/mobile

### Event Pills on Calendar Days

**Anatomy:** Icon + truncated text on colored background

**Color scheme by event type:**
| Type | Color | Icon |
|------|-------|------|
| Room booking | Blue #3B82F6 | Bed |
| Surf week booking | Teal #14B8A6 | Waves |
| Surf camp (program) | Cyan #06B6D4 | User |
| Maintenance | Orange #F97316 | Wrench |
| General event | Purple #8B5CF6 | Calendar |
| Other | Gray #6B7280 | MapPin |

**Status modifiers:**
- Confirmed: Solid background
- Pending: Dashed border, slightly faded
- Cancelled: Strikethrough text, grayed out

**Overflow:** Show first 3 events, then "+N more" link that selects day in sidebar

**Multi-day events:** First day shows full pill, continuation days show connecting bar

### Sidebar Details Panel

**Header:** Selected date + event count

**Event cards with inline editing:**
- Editable: Title, times (dropdown), status (dropdown)
- Non-editable (require modal): Dates, room assignments, contact details
- Actions: "View Full" opens existing modal, quick status changes

### Context-Aware Empty States

1. **Empty day:** "Nothing scheduled" + quick "Add Event" for that day
2. **No bookings this month:** Acknowledges events exist, suggests viewing booking system
3. **Completely empty month:** "December is wide open" + create/view options
4. **First-time use:** Welcome message explaining what calendar shows

## Technical Implementation

### Component Structure

```
app/admin/calendar/page.tsx
├── CalendarHeader
├── CalendarLayout (two-column wrapper)
│   ├── CalendarGrid
│   │   ├── CalendarNav (single navigation)
│   │   ├── DayHeaders (properly spaced)
│   │   └── DayCell[]
│   │       └── EventPill
│   └── CalendarSidebar
│       ├── SidebarHeader
│       ├── EventCard[] (inline editable)
│       └── EmptyState
```

### Files to Create

- `components/admin/calendar/calendar-constants.ts` - Shared types, colors, icons
- `components/admin/calendar/CalendarGrid.tsx` - Custom month grid with events
- `components/admin/calendar/CalendarSidebar.tsx` - Details panel
- `components/admin/calendar/EventPill.tsx` - Compact event display
- `components/admin/calendar/EventCard.tsx` - Sidebar card with inline edit
- `components/admin/calendar/CalendarEmptyState.tsx` - Context-aware empties

### Files to Modify

- `app/admin/calendar/page.tsx` - Main layout restructure

### Files to Reuse

- `CreateEventModal.tsx` - Keep for full event creation
- `EventDetailsModal.tsx` - Keep for "View Full" action

### Responsive Breakpoints

- Desktop (1024px+): Two-column, sidebar always visible
- Tablet (768-1023px): Sidebar collapses to bottom drawer
- Mobile (<768px): Full-width calendar, sidebar as slide-up sheet
