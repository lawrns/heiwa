# Wavecampdashboard Integration Plan
## Missing Features Analysis & Integration Strategy

**Date**: January 2025  
**Source**: Comparison between `/wavecampdashboard` and `/heiwa-page` admin dashboards  
**Goal**: Identify and integrate missing critical features

---

## Executive Summary

After comparing the two admin dashboards, **wavecampdashboard** has several advanced features that are **missing or broken** in **heiwa-page**:

### Critical Missing Features:
1. ✅ **Room Assignments System** - Fully functional drag-and-drop in wavecampdashboard
2. ✅ **Surf Camp Enrollment Workflow** - Complete enrollment system
3. ✅ **Advanced Booking Management** - More comprehensive booking features
4. ✅ **Invoicing System** - Complete invoice management
5. ✅ **Payments Tracking** - Full payment history and management
6. ✅ **Analytics with Real Data** - Actual database queries vs mock data

---

## Feature Comparison Matrix

| Feature | wavecampdashboard | heiwa-page | Status |
|---------|------------------|------------|--------|
| **Room Assignments** | ✅ Full drag-and-drop | ❌ Broken (no enrollment data) | **CRITICAL** |
| **Surf Camp Enrollment** | ✅ Complete workflow | ❌ Missing | **CRITICAL** |
| **Booking Edit** | ✅ Full edit modal | ❌ Button exists but broken | **HIGH** |
| **Invoicing** | ✅ Full system | ❌ Table exists, no UI | **CRITICAL** |
| **Payments** | ✅ Full tracking | ❌ Table exists, no UI | **CRITICAL** |
| **Analytics** | ✅ Real data queries | ❌ Mock data only | **HIGH** |
| **Calendar Events** | ✅ Edit/Delete | ❌ Can't delete | **HIGH** |
| **Image Upload** | ⚠️ Partial | ❌ Manual URLs only | **HIGH** |
| **Email Notifications** | ⚠️ Partial | ❌ Missing | **HIGH** |
| **Bulk Operations** | ✅ Multiple pages | ❌ Limited | **MEDIUM** |
| **Search/Filter** | ✅ Most pages | ⚠️ Some pages | **MEDIUM** |

---

## Detailed Feature Analysis

### 1. 🚨 CRITICAL: Room Assignments System

#### Current State in heiwa-page:
- ❌ **Broken**: Assignment page exists but shows "0 participants"
- ❌ **Root Cause**: No `surf_camp_enrollments` table
- ❌ **Data Flow**: Tries to extract from `bookings.items` JSONB (wrong structure)

#### What wavecampdashboard Has:
```typescript
// Full drag-and-drop assignment board
- AssignmentBoard component with react-dnd
- Participant cards (draggable)
- Room zones (droppable)
- Visual occupancy indicators
- Save assignments to database
- Real-time updates
```

#### Integration Plan:

**Step 1: Create Enrollment System** (8 hours)
```sql
-- Create surf_camp_enrollments table
CREATE TABLE surf_camp_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surf_camp_id UUID NOT NULL REFERENCES surf_camps(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  skill_level TEXT,
  dietary_restrictions TEXT,
  emergency_contact JSONB,
  notes TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(surf_camp_id, client_id)
);

-- Create indexes
CREATE INDEX idx_enrollments_surf_camp ON surf_camp_enrollments(surf_camp_id);
CREATE INDEX idx_enrollments_client ON surf_camp_enrollments(client_id);
CREATE INDEX idx_enrollments_status ON surf_camp_enrollments(status);
```

**Step 2: Copy Assignment Components** (4 hours)
```bash
# Copy from wavecampdashboard
cp -r wavecampdashboard/src/components/admin/assignments \
     heiwa-page/components/admin/assignments

# Copy assignment page
cp wavecampdashboard/src/app/admin/assignments/page.tsx \
   heiwa-page/app/admin/assignments/page.tsx
```

**Step 3: Create Enrollment API** (4 hours)
```typescript
// app/api/enrollments/route.ts
- POST /api/enrollments - Create enrollment
- GET /api/enrollments?surf_camp_id={id} - Get participants
- DELETE /api/enrollments/{id} - Cancel enrollment
- PUT /api/enrollments/{id} - Update enrollment
```

**Step 4: Update Assignment API** (2 hours)
```typescript
// app/api/assignments/route.ts
- Fix to use surf_camp_enrollments table
- Update participants endpoint
- Fix save assignments endpoint
```

**Total Time**: ~18 hours

---

### 2. 🚨 CRITICAL: Surf Camp Enrollment Workflow

#### Current State:
- ❌ No way to enroll clients in surf camps
- ❌ No enrollment UI
- ❌ No enrollment management

#### What wavecampdashboard Has:
- Enrollment form in surf camps page
- Enrollment list view
- Enrollment status management

#### Integration Plan:

**Step 1: Add Enrollment UI to Surf Camps Page** (6 hours)
```typescript
// app/admin/surf-camps/page.tsx
- Add "Enroll Client" button to each surf camp
- Create EnrollmentModal component
- Show enrolled participants list
- Add unenroll functionality
```

**Step 2: Create Enrollment Components** (4 hours)
```typescript
// components/admin/enrollments/EnrollmentModal.tsx
- Client selector
- Skill level input
- Dietary restrictions
- Emergency contact form
- Notes field
```

**Step 3: Add Enrollment API Endpoints** (3 hours)
```typescript
// app/api/surf-camps/[id]/enroll/route.ts
- POST - Enroll client
- GET - Get enrollments for camp
- DELETE - Unenroll client
```

**Total Time**: ~13 hours

---

### 3. 🚨 CRITICAL: Invoicing System

#### Current State:
- ✅ `invoices` table exists in database
- ❌ No admin UI to manage invoices
- ❌ No invoice generation

#### Integration Plan:

**Step 1: Create Invoices Page** (8 hours)
```typescript
// app/admin/invoices/page.tsx
- List all invoices
- Filter by status (draft, sent, paid, overdue, cancelled)
- Search by invoice number or booking ID
- Create manual invoice button
- View invoice modal
- Edit invoice modal
```

**Step 2: Invoice Generation** (8 hours)
```typescript
// lib/invoices/generator.ts
- Auto-generate from confirmed booking
- Invoice number generation (HW-INV-YYYY-XXXX)
- PDF generation (using react-pdf or similar)
- Email invoice functionality
```

**Step 3: Invoice Components** (4 hours)
```typescript
// components/admin/invoices/
- InvoiceList.tsx
- InvoiceModal.tsx
- InvoicePDF.tsx
- InvoiceActions.tsx
```

**Total Time**: ~20 hours

---

### 4. 🚨 CRITICAL: Payments Tracking

#### Current State:
- ✅ `payments` table exists
- ❌ No admin UI
- ❌ No payment history view

#### Integration Plan:

**Step 1: Create Payments Page** (6 hours)
```typescript
// app/admin/payments/page.tsx
- List all payments
- Filter by status (pending, completed, failed, refunded)
- Filter by payment method
- Search by transaction ID
- View payment details
- Process refunds (full/partial)
- Record manual payments
```

**Step 2: Payment Components** (4 hours)
```typescript
// components/admin/payments/
- PaymentList.tsx
- PaymentModal.tsx
- RefundModal.tsx
- PaymentMethodBadge.tsx
```

**Step 3: Payment API Endpoints** (3 hours)
```typescript
// app/api/payments/route.ts
- GET - List payments with filters
- POST - Record manual payment
- PUT /api/payments/[id]/refund - Process refund
```

**Total Time**: ~13 hours

---

### 5. ⚠️ HIGH: Booking Edit Functionality

#### Current State:
- ❌ Edit button exists but does nothing
- ❌ No EditBookingModal component

#### Integration Plan:

**Step 1: Create Edit Modal** (4 hours)
```typescript
// components/admin/bookings/EditBookingModal.tsx
- Edit booking status
- Edit payment status
- Edit dates (with availability check)
- Edit guest count
- Edit special requests
- Edit add-ons
- Save changes
```

**Step 2: Update Bookings Page** (2 hours)
```typescript
// app/admin/bookings/page.tsx
- Add handleEditBooking function
- Wire up edit button
- Add state for edit modal
```

**Step 3: Booking Update API** (2 hours)
```typescript
// app/api/bookings/[id]/route.ts
- PUT method to update booking
- Validate changes
- Update room assignments if dates change
```

**Total Time**: ~8 hours

---

### 6. ⚠️ HIGH: Real Analytics Data

#### Current State:
- ❌ All charts show mock data
- ❌ Hardcoded values
- ❌ No real database queries

#### Integration Plan:

**Step 1: Create Analytics API** (6 hours)
```typescript
// app/api/analytics/revenue/route.ts
- Query bookings table
- Calculate monthly revenue
- Group by month
- Return real data

// app/api/analytics/occupancy/route.ts
- Query room_assignments
- Calculate occupancy rates
- Return real percentages

// app/api/analytics/clients/route.ts
- Query clients table
- Calculate growth metrics
- Return real counts
```

**Step 2: Update Analytics Components** (4 hours)
```typescript
// components/analytics/RevenueChart.tsx
- Replace mockData with API call
- Use useQuery for data fetching
- Handle loading/error states

// components/analytics/OccupancyChart.tsx
- Same updates

// components/analytics/BookingTrendsChart.tsx
- Same updates
```

**Step 3: Update Analytics Page** (2 hours)
```typescript
// app/admin/analytics/page.tsx
- Replace hardcoded values
- Fetch from API endpoints
- Add date range filtering
- Add brand filtering
```

**Total Time**: ~12 hours

---

### 7. ⚠️ HIGH: Calendar Event Management

#### Current State:
- ✅ Can create events
- ❌ Cannot delete events
- ❌ Cannot edit events

#### Integration Plan:

**Step 1: Add Event Actions** (3 hours)
```typescript
// app/admin/calendar/page.tsx
- Add EventDetailsModal component
- Add delete button to modal
- Add edit button to modal
- Wire up handlers
```

**Step 2: Event Modal Component** (3 hours)
```typescript
// components/admin/calendar/EventDetailsModal.tsx
- Show event details
- Edit form
- Delete confirmation
- Save/Cancel buttons
```

**Step 3: Update Calendar API** (1 hour)
```typescript
// app/api/calendar-events/route.ts
- DELETE method already exists, just need to connect UI
- PUT method already exists, just need to connect UI
```

**Total Time**: ~7 hours

---

### 8. ⚠️ HIGH: Image Upload System

#### Current State:
- ❌ Manual URL entry only
- ❌ No file upload
- ❌ No Supabase Storage integration

#### Integration Plan:

**Step 1: Create Image Upload Component** (6 hours)
```typescript
// components/admin/ImageUpload.tsx
- Drag-and-drop zone
- File picker
- Progress indicator
- Image preview
- Multiple upload support
- Delete uploaded images
```

**Step 2: Supabase Storage Setup** (2 hours)
```sql
-- Create storage buckets
- room-images
- surf-camp-images
- add-on-images
- page-images
```

**Step 3: Upload API** (3 hours)
```typescript
// app/api/upload/route.ts
- Handle file upload
- Upload to Supabase Storage
- Return public URL
- Handle errors
```

**Step 4: Integrate into Forms** (3 hours)
```typescript
// Update all forms:
- Rooms form
- Surf camps form
- Add-ons form
- Pages form
```

**Total Time**: ~14 hours

---

## Integration Priority & Timeline

### Phase 1: Critical Fixes (Week 1-2)
**Total: ~60 hours**

1. ✅ Room Assignments System (18h) - **CRITICAL**
2. ✅ Surf Camp Enrollment (13h) - **CRITICAL**
3. ✅ Invoicing System (20h) - **CRITICAL**
4. ✅ Payments Tracking (13h) - **CRITICAL**

### Phase 2: High Priority Features (Week 3-4)
**Total: ~41 hours**

5. ✅ Booking Edit (8h) - **HIGH**
6. ✅ Real Analytics Data (12h) - **HIGH**
7. ✅ Calendar Event Management (7h) - **HIGH**
8. ✅ Image Upload System (14h) - **HIGH**

### Phase 3: Medium Priority (Week 5-6)
**Total: ~30 hours**

9. Email Notification System (16h)
10. Bulk Operations (6h)
11. Search/Filter Improvements (8h)

---

## Implementation Strategy

### Option A: Copy & Adapt (Recommended)
1. Copy components from wavecampdashboard
2. Adapt to heiwa-page structure
3. Update API endpoints
4. Test thoroughly

**Pros**: Faster, proven code  
**Cons**: Need to adapt to different structure

### Option B: Rebuild from Scratch
1. Design new components
2. Build from ground up
3. Follow heiwa-page patterns

**Pros**: Better integration, cleaner code  
**Cons**: Slower, more risk

**Recommendation**: **Option A** - Copy and adapt, as wavecampdashboard code is proven and functional.

---

## Database Migrations Required

```sql
-- 1. Create surf_camp_enrollments table
-- 2. Add indexes for performance
-- 3. Create RLS policies
-- 4. Add foreign key constraints
-- 5. Create audit_logs table (for GDPR)
-- 6. Create communications table (for client history)
```

---

## Testing Checklist

After integration, test:

- [ ] Room assignments drag-and-drop works
- [ ] Can enroll clients in surf camps
- [ ] Can generate invoices from bookings
- [ ] Can track payments
- [ ] Can edit bookings
- [ ] Analytics show real data
- [ ] Can delete calendar events
- [ ] Can upload images
- [ ] All features work on mobile
- [ ] Real-time updates work
- [ ] Error handling works
- [ ] Loading states work

---

## Next Steps

1. **Review this plan** with team
2. **Prioritize features** based on business needs
3. **Set up development branch** for integration
4. **Start with Phase 1** (Critical fixes)
5. **Test each feature** before moving to next
6. **Deploy incrementally** (don't wait for all features)

---

## Estimated Total Effort

- **Phase 1 (Critical)**: ~60 hours (1.5 weeks)
- **Phase 2 (High)**: ~41 hours (1 week)
- **Phase 3 (Medium)**: ~30 hours (1 week)

**Total**: ~131 hours (~3.5 weeks of focused development)

---

*This plan is based on analysis of both codebases and the exhaustive shortcomings document.*


