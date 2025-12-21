# Implementation Plan: UI Pixel-Perfection Remediation

## Overview

This implementation plan transforms the Heiwa House booking UI to achieve pixel-perfect visual quality following the TOON protocol. The approach is incremental: update design tokens first, then propagate changes through components, and finally fix specific issues identified in user feedback.

## Tasks

- [x] 1. Update Design Tokens with TOON-compliant values
  - [x] 1.1 Update spacing scale in design-tokens.ts
    - Add xs=4px, sm=8px, md=12px, lg=16px, xl=24px, xxl=32px
    - Add button-specific tokens (minHeight, padding, borderRadius)
    - Add input-specific tokens
    - Add form layout tokens
    - Add interaction tokens
    - _Requirements: 2.1_

  - [x] 1.2 Write property test for spacing scale definition
    - **Property 4: Spacing Scale Definition**
    - **Validates: Requirements 2.1**

- [-] 2. Refactor Button Component
  - [x] 2.1 Update button styles in button.tsx
    - Set font-size to 14px for primary, 13px for secondary/destructive
    - Set font-weight to 500
    - Set min-height to 40px
    - Set padding to 16px horizontal, 10px vertical
    - Set border-radius to 10px
    - Add hover translateY -1px with shadow
    - Add active scale 0.98
    - Set transition duration 150ms ease-out
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 8.1, 8.2, 8.3_

  - [x] 2.2 Write property test for button typography
    - **Property 1: Button Typography Consistency**
    - **Validates: Requirements 1.1, 1.2, 3.4**

  - [x] 2.3 Write property test for button dimensions
    - **Property 2: Button Dimensions Compliance**
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [x] 2.4 Write property test for interaction states
    - **Property 10: Interaction State Transitions**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 3. Checkpoint - Verify button changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update Form Input Styles
  - [x] 4.1 Update input styles in globals.css and components
    - Set input height to 40px
    - Set border-radius to 10px
    - Set padding to 12px horizontal, 8px vertical
    - Set font-size to 14px
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.2 Update form label styles
    - Set label font-size to 12px
    - Set label font-weight to 500
    - Set label-to-input spacing to 6px
    - _Requirements: 3.1, 4.5_

  - [x] 4.3 Update helper text styles
    - Set helper text font-size to 12px
    - Apply muted color
    - _Requirements: 3.3_

  - [ ]* 4.4 Write property test for input dimensions
    - **Property 3: Input Field Dimensions**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 4.5 Write property test for typography hierarchy
    - **Property 6: Typography Hierarchy**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 5. Fix GuestDetails Button
  - [x] 5.1 Update Save Guest button in GuestDetails.tsx
    - Ensure button uses refined Button component
    - Add proper margin-top (24px) for CTA isolation
    - Verify font-size is 14px
    - _Requirements: 9.1, 9.2, 9.3, 2.4_

  - [ ]* 5.2 Write property test for form spacing
    - **Property 5: Form Spacing Consistency**
    - **Validates: Requirements 2.2, 2.3, 2.4, 4.4, 4.5**

- [x] 6. Checkpoint - Verify form and button changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Fix Pricing Display Format
  - [x] 7.1 Update pricing format in SurfWeekRoomSelection.tsx
    - Change "+€X" to "from €X" format
    - Update price label display
    - _Requirements: 5.1, 5.2_

  - [ ]* 7.2 Write property test for pricing format
    - **Property 7: Pricing Format Correctness**
    - **Validates: Requirements 5.1**

- [x] 8. Fix Image Thumbnail Display
  - [x] 8.1 Enhance RoomImageGallery fallback handling
    - Improve onError handler to prevent broken images
    - Ensure fallback images load correctly
    - Add loading state for thumbnails
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 8.2 Fix RoomThumbnail component
    - Ensure proper image sizing
    - Add fallback for missing images
    - _Requirements: 6.3_

  - [ ] 8.3 Write property test for image fallback
    - **Property 8: Image Fallback Handling**
    - **Validates: Requirements 6.1, 6.2, 6.4**

- [x] 9. Fix Icon Alignment
  - [x] 9.1 Update icon-text alignment in components
    - Set icon-text gap to 8px
    - Ensure vertical alignment
    - _Requirements: 7.1, 7.3_

  - [ ]* 9.2 Write property test for icon alignment
    - **Property 9: Icon-Text Alignment**
    - **Validates: Requirements 7.1, 7.3**

- [x] 10. Update Focus States
  - [x] 10.1 Add subtle focus feedback to form inputs
    - Add focus ring styling
    - Ensure consistent focus states across inputs
    - _Requirements: 8.4_

- [x] 11. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Visual review of all updated components

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a token-first approach: update tokens, then components
