# Fixes To Implement (Excluding Google Reviews)

## Status: VERIFIED
✅ Bulk endpoints exist: `/api/clients/bulk` and `/api/payments/bulk`  
✅ DELETE endpoints exist: Bookings and Payments both have DELETE  
✅ DELETE endpoints have error handling

## Issues Remaining (18 of 19)

### 1. Test-Rooms Page - REMOVE
**File**: `app/test-rooms/page.tsx`  
**Action**: Delete this development page  
**Reason**: Exposes test functionality to users

### 2. CMS Settings - Simulate → Real API
**File**: `app/admin/cms/settings/page.tsx`  
**Action**: Replace simulated cache clear with real API call  
**Code**: Lines 73-85 need real implementation

### 3. Invoice Modal - Fix Booking ID Passing
**File**: `app/admin/invoices/page.tsx`  
**Action**: Pass booking ID to modal state  
**Code**: Line 112-115 `handleCreateFromBooking` function

### 4-6. Response Format & Error Details  
**Action**: Already mostly good - verify consistency across:
- Clients bulk operations
- Payments bulk operations  
- Invoice operations

### 7-8. Code Quality Issues (Type Safety, UX)
**Action**: Fix across multiple files:
- Replace `any` types with proper error handling
- Replace `alert()` with `toast()`
- Add form validation
- Remove unused hooks

## Implementation Plan

1. Delete `/app/test-rooms/page.tsx`
2. Implement real cache clearing API in CMS settings
3. Fix invoice modal booking ID passing
4. Verify response consistency
5. Fix type safety issues
6. Replace alerts with toasts
7. Test all CRUD operations

## Files to Modify
- app/test-rooms/page.tsx - DELETE
- app/admin/cms/settings/page.tsx - UPDATE
- app/admin/invoices/page.tsx - UPDATE
- app/admin/blog/posts/page.tsx - UPDATE (type safety)
- Multiple pages - UPDATE (UX improvements)

