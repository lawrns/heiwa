# UI/UX Gap Remediation Requirements

## Introduction

This specification defines the requirements for addressing all identified UI/UX gaps in the Heiwa House booking application. The focus is on fixing room thumbnail display issues in the surf weeks area, standardizing styling across components, improving accessibility, and ensuring consistent design token usage.

## Glossary

- **Booking_Widget**: The multi-step booking flow component for reserving rooms or surf weeks
- **RoomThumbnail**: Component that displays room preview images with fallback handling
- **RoomImageGallery**: Modal component for viewing room images in full size
- **Design_Tokens**: Centralized CSS/Tailwind values for colors, spacing, typography
- **Touch_Target**: Minimum interactive area size (44px) for mobile accessibility
- **Accent_Color**: Primary brand color (#ec681c) defined as Tailwind `accent` class

## Requirements

### Requirement 1: Room Thumbnail Display in Surf Weeks

**User Story:** As a user booking a surf week, I want to see room thumbnails properly, so that I can make informed accommodation choices.

#### Acceptance Criteria

1. WHEN a room card is rendered in SurfWeekRoomSelection, THE component SHALL use the same image pattern as RoomAssignment
2. WHEN room.images array is available, THE component SHALL use room.images[0] directly
3. WHEN no images are available, THE component SHALL display a styled gradient placeholder
4. THE RoomThumbnail component SHALL handle image loading errors gracefully with fallback chain

### Requirement 2: Inline Style Elimination

**User Story:** As a developer, I want consistent styling patterns, so that the codebase is maintainable.

#### Acceptance Criteria

1. ALL buttons in booking widget components SHALL use the Button component or Tailwind classes
2. NO inline style attributes SHALL be used for colors, backgrounds, or hover states
3. ALL color references SHALL use Tailwind design tokens (accent, accent-dark, etc.)

### Requirement 3: Color Token Standardization

**User Story:** As a designer, I want consistent brand colors, so that the UI feels cohesive.

#### Acceptance Criteria

1. ALL instances of hex #ec681c SHALL be replaced with Tailwind `accent` class
2. ALL instances of hex #d65d16 SHALL be replaced with Tailwind `accent-dark` class
3. ALL hover states SHALL use `hover:bg-accent-dark` instead of inline style handlers

### Requirement 4: Touch Target Compliance

**User Story:** As a mobile user, I want interactive elements to be easy to tap, so that I can navigate without frustration.

#### Acceptance Criteria

1. ALL buttons SHALL have minimum height of 44px
2. ALL gallery navigation arrows SHALL have minimum touch target of 44px
3. ALL thumbnail buttons in gallery SHALL have minimum height of 44px
4. ALL form inputs SHALL meet touch target requirements

### Requirement 5: Keyboard Navigation

**User Story:** As a keyboard user, I want to navigate the image gallery, so that I can view all room photos.

#### Acceptance Criteria

1. THE image gallery SHALL support arrow key navigation (left/right)
2. THE image gallery SHALL support Escape key to close
3. ALL interactive elements SHALL have visible focus indicators
4. THE gallery SHALL have proper ARIA labels for screen readers

### Requirement 6: Card Hover Effects

**User Story:** As a user, I want visual feedback when hovering over cards, so that I know they are interactive.

#### Acceptance Criteria

1. ALL room cards SHALL lift slightly on hover (-translate-y-0.5)
2. ALL room cards SHALL show enhanced shadow on hover (shadow-card-hover)
3. ALL hover effects SHALL use consistent transition duration (300ms)

### Requirement 7: Loading State Improvements

**User Story:** As a user, I want to see loading indicators, so that I know content is being fetched.

#### Acceptance Criteria

1. THE SurfWeekRoomSelection loading state SHALL display skeleton loaders
2. THE skeleton loaders SHALL match the layout of actual content
3. THE skeleton loaders SHALL use shimmer animation for premium feel
