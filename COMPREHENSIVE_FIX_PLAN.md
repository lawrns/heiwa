# Comprehensive Site-Wide Fix Plan

## 🔍 Root Cause Analysis

### 1. **Image URLs Pointing to Wrong Supabase Project**
- **Problem**: Images stored in `zejrhceuuujzgyukdwnb.supabase.co` but code uses `pguipwhrxdzzrndbluxb.supabase.co`
- **Evidence**: 400 errors on image URLs showing `zejrhceuuujzgyukdwnb` domain
- **Impact**: All room images broken in "Similar Rooms" section

### 2. **GoTrueClient Warning**
- **Problem**: Multiple Supabase clients using same storage key
- **Status**: Fixed in code but Netlify hasn't deployed yet
- **Impact**: Console warnings, potential auth issues

### 3. **API Errors (500/400)**
- **Activities API**: 500 error - table exists but may have RLS/permission issues
- **Invoices API**: 500 error - table exists but may have RLS/permission issues  
- **Payments API**: 500 error - table exists but may have RLS/permission issues
- **Surf Camps API**: 400 error - query issue (column name mismatch?)

### 4. **Missing Admin Routes**
- **Problem**: `/rooms/[id]/edit` routes return 404
- **Impact**: Cannot edit rooms from admin panel

### 5. **Netlify Deployment**
- **Problem**: Production still running old code
- **Impact**: All fixes not live yet

### 6. **Environment Variables**
- **Problem**: Netlify may not have correct Supabase URL/keys
- **Impact**: Wrong Supabase project being used

---

## 🎯 Comprehensive Fix Plan

### Phase 1: Database & Environment Fixes

#### 1.1 Determine Correct Supabase Project
- [ ] Check which Supabase project has the actual data
- [ ] Verify which project has room images
- [ ] Update code to use correct project URL

#### 1.2 Fix Image URLs
- [ ] Option A: Migrate images from old project to new project
- [ ] Option B: Update database to use correct Supabase URL
- [ ] Option C: Update code to handle both URLs with fallback

#### 1.3 Fix Database Tables
- [ ] Verify `payments` table exists and has correct schema
- [ ] Fix RLS policies for all tables (experiences, invoices, payments)
- [ ] Fix `surf_camps` query (check column names)

### Phase 2: Code Fixes

#### 2.1 Fix Image Loading
- [ ] Update `app/rooms/[id]/page.tsx` to handle image URL conversion
- [ ] Add fallback logic for broken image URLs
- [ ] Ensure proper error handling in ImageCarousel

#### 2.2 Create Missing Admin Routes
- [ ] Create `app/admin/rooms/[id]/edit/page.tsx`
- [ ] Implement room edit form
- [ ] Add proper navigation

#### 2.3 Fix API Routes
- [ ] Fix `/api/activities` error handling
- [ ] Fix `/api/invoices` error handling
- [ ] Fix `/api/payments` error handling
- [ ] Fix surf_camps query

### Phase 3: Environment & Deployment

#### 3.1 Netlify Environment Variables
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- [ ] Update if pointing to wrong project

#### 3.2 Deployment
- [ ] Ensure all fixes are committed to `innovation` branch
- [ ] Merge `innovation` into `main`
- [ ] Push to trigger Netlify deployment
- [ ] Verify deployment succeeds

### Phase 4: Testing Infrastructure

#### 4.1 Update Tests
- [ ] Fix tests for image loading
- [ ] Add tests for API error handling
- [ ] Add tests for admin routes
- [ ] Update E2E tests

#### 4.2 Verification
- [ ] Test all pages load correctly
- [ ] Test admin panel functionality
- [ ] Test booking flow
- [ ] Verify no console errors

---

## 🚀 Implementation Priority

### **CRITICAL (Do First)**
1. Fix Supabase URL mismatch (images)
2. Fix GoTrueClient warning (already in code, needs deploy)
3. Fix API 500 errors (database RLS/permissions)

### **HIGH PRIORITY**
4. Create missing admin routes
5. Fix image fallback handling
6. Update Netlify environment variables

### **MEDIUM PRIORITY**
7. Update testing infrastructure
8. Add comprehensive error handling
9. Improve logging

---

## 📋 Detailed Fix Steps

### Step 1: Fix Image URL Issue

**Problem**: Images stored in `zejrhceuuujzgyukdwnb` but code uses `pguipwhrxdzzrndbluxb`

**Solution Options**:

**Option A: Update Database URLs** (Recommended if images exist in old project)
```sql
-- Update all room image URLs to use correct Supabase project
UPDATE rooms 
SET images = array_replace(
  images::text[], 
  'zejrhceuuujzgyukdwnb.supabase.co',
  'pguipwhrxdzzrndbluxb.supabase.co'
)::text[]
WHERE images::text LIKE '%zejrhceuuujzgyukdwnb%';
```

**Option B: Update Code to Handle Both** (If both projects have data)
```typescript
// In lib/content.ts or image loading logic
function normalizeImageUrl(url: string): string {
  if (url.includes('zejrhceuuujzgyukdwnb')) {
    return url.replace('zejrhceuuujzgyukdwnb', 'pguipwhrxdzzrndbluxb');
  }
  return url;
}
```

**Option C: Migrate Images** (If old project is being phased out)
- Copy images from old bucket to new bucket
- Update database URLs

### Step 2: Fix API Errors

**For Activities API**:
```sql
-- Verify table exists
SELECT * FROM experiences LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'experiences';

-- Fix if needed (already done in migration, but verify)
```

**For Payments API**:
```sql
-- Create payments table if missing
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access to payments" ON payments
  FOR ALL USING (true);
```

**For Surf Camps API**:
- Check column names match query
- Verify `max_participants` vs `total_spots` naming

### Step 3: Create Admin Routes

Create `app/admin/rooms/[id]/edit/page.tsx`:
- Room edit form
- Image upload component
- Form validation
- Save functionality

### Step 4: Environment Variables

Check Netlify dashboard:
- Site Settings → Environment Variables
- Verify all Supabase variables are set
- Update if pointing to wrong project

---

## ✅ Success Criteria

1. ✅ All images load correctly (no 400 errors)
2. ✅ No GoTrueClient warnings in console
3. ✅ All APIs return 200 (no 500 errors)
4. ✅ Admin routes work (no 404 errors)
5. ✅ Booking flow works end-to-end
6. ✅ All tests pass
7. ✅ Production site matches innovation branch

---

## 📝 Next Steps

1. **Immediate**: Fix Supabase URL issue (choose Option A, B, or C)
2. **Immediate**: Fix database RLS policies for payments table
3. **Immediate**: Create missing admin routes
4. **Next**: Update Netlify environment variables
5. **Next**: Trigger deployment and verify
6. **Final**: Update testing infrastructure

