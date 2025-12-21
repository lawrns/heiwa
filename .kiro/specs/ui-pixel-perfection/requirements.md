# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive UI pixel-perfection remediation across the Heiwa House booking application. The goal is to achieve Intercom/Stripe/Airbnb-level visual precision by addressing button sizing, spacing, typography, form density, and visual consistency issues identified through user feedback and the TOON protocol audit.

## Glossary

- **Booking_Widget**: The multi-step booking flow component used for room and surf week reservations
- **Button_System**: The standardized button component and its variants used throughout the application
- **Design_Tokens**: Centralized CSS/JS variables defining spacing, typography, and color values
- **TOON_Protocol**: The pixel-perfection remediation protocol defining visual quality standards
- **Optical_Centering**: Visual centering that accounts for human perception rather than mathematical centering
- **Spacing_Scale**: The predefined set of spacing values (4px, 8px, 12px, 16px, 24px, 32px)

## Requirements

### Requirement 1: Button System Refinement

**User Story:** As a user, I want buttons to feel calm and professional, so that the interface inspires confidence without visual overwhelm.

#### Acceptance Criteria

1. WHEN a primary button is rendered, THE Button_System SHALL use font-size 14px with font-weight 500
2. WHEN a secondary or destructive button is rendered, THE Button_System SHALL use font-size 13px with font-weight 500
3. WHEN any button is rendered, THE Button_System SHALL apply minimum padding of 16px horizontal and 10px vertical
4. WHEN any button is rendered, THE Button_System SHALL apply border-radius of 10px
5. WHEN any button is rendered, THE Button_System SHALL ensure minimum height of 40px
6. WHEN button text is displayed, THE Button_System SHALL ensure text never appears larger than surrounding form labels
7. WHEN a button contains text, THE Button_System SHALL apply optical vertical centering with -0.5px offset

### Requirement 2: Spacing System Enforcement

**User Story:** As a user, I want consistent visual rhythm throughout the interface, so that the design feels intentional and polished.

#### Acceptance Criteria

1. THE Design_Tokens SHALL define spacing scale values: xs=4px, sm=8px, md=12px, lg=16px, xl=24px, xxl=32px
2. WHEN a container is rendered, THE Booking_Widget SHALL apply minimum padding of 16px
3. WHEN form elements are stacked vertically, THE Booking_Widget SHALL apply gap of 12-16px between elements
4. WHEN a CTA button is positioned, THE Booking_Widget SHALL apply minimum top margin of 24px for isolation
5. WHEN components are positioned, THE Booking_Widget SHALL only use values from the Spacing_Scale

### Requirement 3: Typography Hierarchy

**User Story:** As a user, I want clear visual hierarchy in text, so that I can quickly scan and understand the interface.

#### Acceptance Criteria

1. WHEN a form label is rendered, THE Booking_Widget SHALL use font-size 12px with font-weight 500
2. WHEN input text is displayed, THE Booking_Widget SHALL use font-size 14px with font-weight 400
3. WHEN helper text is displayed, THE Booking_Widget SHALL use font-size 12px with muted color
4. WHEN button text is displayed, THE Button_System SHALL use font-size 14px with font-weight 500
5. WHEN text hierarchy is applied, THE Booking_Widget SHALL ensure no element visually "screams" over others

### Requirement 4: Form Density Optimization

**User Story:** As a user, I want forms to feel compact and efficient, so that I can complete booking flows without visual fatigue.

#### Acceptance Criteria

1. WHEN an input field is rendered, THE Booking_Widget SHALL apply height of 40px
2. WHEN an input field is rendered, THE Booking_Widget SHALL apply border-radius of 10px
3. WHEN an input field is rendered, THE Booking_Widget SHALL apply horizontal padding of 12px and vertical padding of 8px
4. WHEN form groups are rendered, THE Booking_Widget SHALL apply spacing of 24px between groups
5. WHEN a label precedes an input, THE Booking_Widget SHALL apply spacing of 6px between them

### Requirement 5: Pricing Display Clarity

**User Story:** As a user, I want pricing information to be clear and unambiguous, so that I understand costs before committing.

#### Acceptance Criteria

1. WHEN displaying room upgrade pricing, THE Booking_Widget SHALL use "from €X" instead of "+€X" format
2. WHEN displaying per-person pricing, THE Booking_Widget SHALL clearly indicate the pricing basis
3. WHEN displaying pricing tiers, THE Booking_Widget SHALL show all occupancy options clearly

### Requirement 6: Image Display Reliability

**User Story:** As a user, I want to see room images reliably, so that I can make informed accommodation choices.

#### Acceptance Criteria

1. WHEN a room thumbnail is rendered, THE RoomImageGallery SHALL display the image or a styled fallback
2. WHEN an image fails to load, THE RoomImageGallery SHALL display a property-specific fallback image
3. WHEN thumbnails are displayed in the gallery modal, THE RoomImageGallery SHALL ensure all thumbnails are visible and clickable
4. IF an image URL is invalid, THEN THE RoomImageGallery SHALL gracefully handle the error without showing broken image icons

### Requirement 7: Icon Consistency

**User Story:** As a user, I want icons to display consistently, so that the interface feels complete and professional.

#### Acceptance Criteria

1. WHEN icons are used alongside text, THE Booking_Widget SHALL apply 8px gap between icon and text
2. WHEN icons are sized, THE Booking_Widget SHALL size icons at 0.9x relative to adjacent text
3. WHEN icons are positioned, THE Booking_Widget SHALL ensure vertical alignment with text baseline
4. IF an icon fails to load, THEN THE Booking_Widget SHALL display a fallback or hide gracefully

### Requirement 8: Micro-Interaction Polish

**User Story:** As a user, I want subtle feedback on interactions, so that the interface feels responsive and alive.

#### Acceptance Criteria

1. WHEN a button is hovered, THE Button_System SHALL apply translateY of -1px with subtle shadow
2. WHEN a button is pressed, THE Button_System SHALL apply translateY of 0px with scale of 0.98
3. WHEN any interactive element transitions, THE Booking_Widget SHALL apply duration of 150ms with ease-out easing
4. WHEN form inputs receive focus, THE Booking_Widget SHALL provide subtle visual feedback

### Requirement 9: Guest Details Button Fix

**User Story:** As a user completing guest details, I want the save button to be appropriately sized, so that it doesn't dominate the form visually.

#### Acceptance Criteria

1. WHEN the "Save Guest & Continue" button is rendered, THE GuestDetails component SHALL use the refined Button_System styles
2. WHEN the button is rendered, THE GuestDetails component SHALL ensure adequate margin from form fields
3. WHEN the button text is displayed, THE GuestDetails component SHALL use font-size no larger than 14px
