# Zero Drift & Features Implementation Prompt

## Overview

This comprehensive JSON prompt (`ZERO_DRIFT_AND_FEATURES_PROMPT.json`) is designed to ensure **zero drift** between your site, database, and CMS while implementing critical booking flow improvements and fixing admin panel regressions.

## What This Prompt Addresses

### 🔴 Critical Issues

1. **Zero Drift Verification** - Ensures site, database, and CMS are 100% synchronized
2. **Admin Panel Regression** - Fixes missing Create/Edit functionality for Surf Weeks, Clients, Rooms, Bookings

### 🟡 High Priority Features

3. **Step 2: Dynamic Participant Name Inputs** - Collect names immediately when quantity is selected
4. **Step 3: Room Assignment via Participant Tags** - Assign specific participants to specific rooms
5. **Step 4: Pre-fill Guest Details** - Auto-populate names from Step 2

## Prompt Structure

The JSON prompt is organized into 6 phases:

### Phase 1: Zero Drift Verification (CRITICAL)
- Database schema audit
- CMS content synchronization
- Frontend-database mapping verification
- State management consistency

### Phase 2: Booking Flow Step 2 (HIGH)
- Add dynamic name input fields
- Update state management
- Add validation
- Update data structure

### Phase 3: Booking Flow Step 3 (HIGH)
- Display participant names as tags
- Implement capacity limits
- Implement exclusivity logic
- Update room assignment data structure
- Add visual feedback

### Phase 4: Booking Flow Step 4 (HIGH)
- Pre-fill First Name fields
- Bi-directional sync (optional)
- Validation enhancement

### Phase 5: Admin Panel Regression (CRITICAL)
- Investigation tasks
- Fixes for each affected module
- Common issues checklist

### Phase 6: Data Flow Verification (HIGH)
- End-to-end testing scenarios
- Database verification

## How to Use This Prompt

### Option 1: Use with IDE Assistant

1. Open the JSON file: `ZERO_DRIFT_AND_FEATURES_PROMPT.json`
2. Copy the entire JSON content
3. Paste it into your IDE assistant (Cursor, GitHub Copilot, etc.)
4. Ask: "Please implement all phases in this prompt, starting with Phase 1"

### Option 2: Use Phase by Phase

1. Extract a specific phase from the JSON
2. Provide it to your IDE assistant with context
3. Example: "Implement Phase 2: Dynamic Participant Name Inputs according to this specification: [paste phase 2 JSON]"

### Option 3: Use as Reference

1. Read through the JSON to understand requirements
2. Implement manually following the detailed steps
3. Use the acceptance criteria to verify completion

## Key Files Referenced

### Booking Flow
- `components/BookingWidget/steps/OptionSelection.tsx` - Step 2
- `components/BookingWidget/steps/RoomAssignment.tsx` - Step 3
- `components/BookingWidget/steps/GuestDetails.tsx` - Step 4
- `components/BookingWidget/hooks/useBookingFlow.ts` - State management
- `components/BookingWidget/types.ts` - Type definitions

### Admin Panel
- `app/admin/surf-camps/page.tsx` - Surf Weeks management
- `app/admin/clients/page.tsx` - Clients management
- `app/admin/rooms/page.tsx` - Rooms management
- `app/admin/bookings/page.tsx` - Bookings management

### Database/CMS
- `migrations/` - Database migrations
- `app/api/admin/homepage/route.ts` - CMS API
- `app/page.tsx` - Homepage (CMS-driven)

## Important Notes

### Already Implemented (Verify)
- **GuestDetails.tsx** already has pre-filling logic (lines 38-52) - verify it works correctly
- **Admin pages** appear to have Create/Edit buttons - investigate why user reports they're missing

### Investigation Needed
- Check if buttons are hidden by CSS
- Verify route handlers exist
- Check authentication/permissions
- Test button functionality

## Success Criteria

✅ **Zero Drift**: 100% of site content comes from database/CMS, zero hardcoded data  
✅ **Booking Flow**: All 3 booking flow improvements work correctly  
✅ **Admin Panel**: All Create/Edit buttons visible and functional  
✅ **Data Integrity**: Data flows correctly from Step 2 → Step 3 → Step 4 → Database

## Testing Requirements

- Unit tests for state management
- Integration tests for booking flow
- E2E tests with Playwright
- Database verification tests
- CMS synchronization tests

## Next Steps

1. **Start with Phase 1** - Zero drift verification is critical
2. **Then Phase 5** - Fix admin panel regression immediately
3. **Then Phases 2-4** - Implement booking flow improvements
4. **Finally Phase 6** - Verify end-to-end data flow

## Support

If you encounter issues:
1. Check the "notes" section in each phase
2. Review the "code_reference" sections for existing implementations
3. Verify database schema matches TypeScript interfaces
4. Test API endpoints independently

---

**Created**: 2025-01-XX  
**Purpose**: Comprehensive implementation guide for zero drift and feature implementation  
**Status**: Ready for implementation

